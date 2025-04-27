from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import cv2
import numpy as np
from ultralytics import YOLO
from collections import defaultdict
import asyncio
import signal
import sys
import json
import time
from datetime import datetime
import os
import uvicorn

# Configuration
CONFIG = {
    'video_path': 'street.mp4',
    'model_path': 'yolov8n.pt',
    'output_path': 'output.mp4',
    'frame_scale': 0.4,  # Scale down frames to 40% of original size
    'counting_line_position': 0.6,  # Counting line at 60% of frame height
    'tracker_config': {
        'tracker': 'bytetrack.yaml',
        'conf': 0.2,
        'classes': [0, 2, 3, 5, 7],  # person, car, motorcycle, bus, truck
        'persist': True,
        'iou': 0.5,
        'max_det': 300
    },
    'class_names': {
        0: 'person',
        2: 'car',
        3: 'motorcycle',
        5: 'bus',
        7: 'truck'
    }
}

# Initialize FastAPI app
app = FastAPI(title="TrafficO - Video Processing API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="."), name="static")

# Global variables
stop_processing = False
current_frame = None
processing_task = None
model = None
traffic_counts = {
    'northbound': 0,
    'southbound': 0,
    'total': 0
}

# Create a default black frame
default_frame = np.zeros((480, 640, 3), dtype=np.uint8)
cv2.putText(default_frame, "Waiting for video feed...", (50, 240), 
           cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
current_frame = default_frame

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    global stop_processing
    print("\nStopping video processing...")
    stop_processing = True
    sys.exit(0)

def update_descriptions(data):
    """Update the descriptions.json file with new data"""
    try:
        with open('descriptions.json', 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error updating descriptions.json: {e}")

@app.get("/traffic-data")
async def get_traffic_data():
    """API endpoint to get current traffic counts"""
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "counts": traffic_counts
    }

async def process_video():
    """Main video processing function"""
    global stop_processing, current_frame, model, traffic_counts
    
    try:
        # Load YOLOv8 model
        model = YOLO(CONFIG['model_path'])
        
        # Open video file
        cap = cv2.VideoCapture(CONFIG['video_path'])
        
        if not cap.isOpened():
            print("Error: Could not open video file")
            return
        
        # Get video properties
        original_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        original_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        # Calculate scaled dimensions
        width = int(original_width * CONFIG['frame_scale'])
        height = int(original_height * CONFIG['frame_scale'])
        
        # Create video writer for output
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(CONFIG['output_path'], fourcc, fps, (width, height))
        
        # Initialize tracking variables
        object_history = defaultdict(list)
        crossing_status = {}
        
        # Reset traffic counts
        traffic_counts = {
            'northbound': 0,
            'southbound': 0,
            'total': 0
        }
        
        # Calculate counting line position
        line_y = int(height * CONFIG['counting_line_position'])
        mid_x = width // 2
        
        while cap.isOpened() and not stop_processing:
            ret, frame = cap.read()
            if not ret:
                # Video ended, loop back to the beginning
                print("Video ended. Looping...")
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                await asyncio.sleep(0.1) # Brief pause before restarting
                continue # Continue to the next loop iteration to read the first frame
            
            # Resize frame
            frame = cv2.resize(frame, (width, height), interpolation=cv2.INTER_LINEAR)
            
            # Run YOLO detection with tracking
            results = model.track(frame, **CONFIG['tracker_config'])
            
            if results and results[0].boxes:
                boxes = results[0].boxes
                
                for box in boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    track_id = int(box.id[0]) if box.id is not None else None
                    class_id = int(box.cls[0])
                    
                    if track_id is not None:
                        # Draw bounding box and label
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                        label = f"{CONFIG['class_names'].get(class_id, 'unknown')} {track_id}"
                        cv2.putText(frame, label, (x1, y1 - 10),
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                        
                        # Track object position
                        centroid = (int((x1 + x2)/2), int((y1 + y2)/2))
                        object_history[track_id].append(centroid)
                        if len(object_history[track_id]) > 30:
                            object_history[track_id].pop(0)
                        
                        # Determine direction and count
                        box_center_y = (y1 + y2) // 2
                        direction = 'northbound' if box_center_y < line_y else 'southbound'
                        
                        if track_id not in crossing_status:
                            crossing_status[track_id] = {'crossed': False}
                        
                        if not crossing_status[track_id]['crossed']:
                            if (y1 <= line_y <= y2):
                                crossing_status[track_id]['crossed'] = True
                                traffic_counts[direction] += 1
                                traffic_counts['total'] += 1
                        
                        # Draw trajectory
                        if len(object_history[track_id]) > 1:
                            points = np.array(object_history[track_id], np.int32)
                            cv2.polylines(frame, [points], False, (0, 0, 255), 2)
            
            # Add overlay elements
            cv2.line(frame, (0, line_y), (width, line_y), (0, 255, 255), 2)
            cv2.line(frame, (mid_x, 0), (mid_x, height), (255, 0, 0), 2)
            
            
            # Update current frame and write to output
            current_frame = frame
            out.write(frame)
            
            # Control frame rate (yield control to event loop)
            await asyncio.sleep(0)
            
    except Exception as e:
        print(f"Error in video processing: {e}")
    finally:
        if 'cap' in locals():
            cap.release()
        if 'out' in locals():
            out.release()

@app.get("/")
async def root():
    return {"message": "TrafficO - Video Processing API is running"}

@app.get("/video-feed")
async def video_feed():
    global current_frame
    if current_frame is None:
        current_frame = default_frame
    
    # Convert BGR to RGB (OpenCV uses BGR, web uses RGB)
    rgb_frame = cv2.cvtColor(current_frame, cv2.COLOR_BGR2RGB)
    
    # Encode the frame as JPEG
    _, buffer = cv2.imencode('.jpg', rgb_frame, [cv2.IMWRITE_JPEG_QUALITY, 90])
    frame_bytes = buffer.tobytes()
    
    headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'image/jpeg'
    }
    
    return Response(
        content=frame_bytes,
        media_type="image/jpeg",
        headers=headers
    )

@app.post("/start")
async def start_processing():
    global processing_task, stop_processing
    stop_processing = False
    processing_task = asyncio.create_task(process_video())
    return {"message": "Video processing started"}

@app.post("/stop")
async def stop_processing():
    global stop_processing
    stop_processing = True
    return {"message": "Video processing stopped"}

async def start_video_processing():
    """Start the video processing task"""
    global processing_task
    processing_task = asyncio.create_task(process_video())

def run_server():
    """Run the FastAPI server with video processing"""
    # Set up signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    
    # Create event loop and start video processing
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(start_video_processing())
    
    # Start the server
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    run_server() 