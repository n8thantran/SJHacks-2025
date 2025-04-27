from fastapi import FastAPI, Response
import cv2
import numpy as np
from ultralytics import YOLO
from collections import defaultdict
import asyncio
import signal
import sys
import io
import json
import time
from datetime import datetime
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Mount the current directory as a static directory
app.mount("/static", StaticFiles(directory="."), name="static")

# Global variable to control video processing
stop_processing = False
current_frame = None

# Create a default black frame
default_frame = np.zeros((480, 640, 3), dtype=np.uint8)
cv2.putText(default_frame, "Waiting for video feed...", (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
current_frame = default_frame

def signal_handler(sig, frame):
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

@app.get("/")
async def root():
    return {"message": "Video Processing API is running"}

@app.get("/video-feed")
async def video_feed():
    global current_frame
    if current_frame is None:
        current_frame = default_frame
    
    # Convert frame to JPEG
    _, buffer = cv2.imencode('.jpg', current_frame)
    frame_bytes = buffer.tobytes()
    
    return Response(content=frame_bytes, media_type="image/jpeg")

@app.post("/process-video")
async def process_video():
    global stop_processing, current_frame
    stop_processing = False
    
    # Set up signal handler for Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Check if video file exists
        video_path = 'freeway.mp4'
        if not os.path.exists(video_path):
            return {
                "status": "error",
                "message": f"Video file not found at {video_path}. Please ensure the video file exists."
            }
        
        # Load YOLOv8 model
        try:
            model = YOLO('yolov8n.pt')
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to load YOLO model: {str(e)}"
            }
        
        while not stop_processing:
            try:
                cap = cv2.VideoCapture(video_path)
                
                if not cap.isOpened():
                    return {
                        "status": "error",
                        "message": "Could not open video file"
                    }
                
                # Get video properties
                original_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                original_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                
                # Use lower resolution (40% of original size)
                width = int(original_width * 0.4)
                height = int(original_height * 0.4)
                
                # Store object history for trajectory drawing
                object_history = defaultdict(list)
                
                # Define class names
                class_names = {
                    0: 'person',
                    2: 'car',
                    3: 'motorcycle',
                    5: 'bus',
                    7: 'truck'
                }
                
                # Define counting line (horizontal line at 60% of frame height)
                line_y = int(height * 0.6)
                mid_x = width // 2  # Middle of the frame
                
                # Initialize counts
                counts = {
                    'northbound': 0,
                    'southbound': 0,
                    'total': 0
                }
                
                crossing_status = {}  # Track if object has crossed the line
                
                # Tracking configuration
                tracking_config = {
                    'bytetrack': {
                        'tracker': 'bytetrack.yaml',
                        'conf': 0.2,
                        'classes': [0, 2, 3, 5, 7],
                        'persist': True,
                        'iou': 0.5,
                        'max_det': 300
                    }
                }
                
                # Initialize descriptions data
                descriptions_data = {
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "counts": {
                        "northbound": 0,
                        "southbound": 0,
                        "total": 0
                    }
                }
                
                # Update descriptions.json initially
                update_descriptions(descriptions_data)
                
                while cap.isOpened() and not stop_processing:
                    ret, frame = cap.read()
                    if not ret:
                        # Video ended, break inner loop to restart
                        break
                        
                    # Resize frame
                    frame = cv2.resize(frame, (width, height), interpolation=cv2.INTER_LINEAR)
                    
                    # Create a copy for AI processing
                    ai_frame = frame.copy()
                    
                    # Run YOLO detection with tracking
                    results = model.track(
                        ai_frame,
                        **tracking_config['bytetrack']
                    )
                    
                    if results and results[0].boxes:
                        boxes = results[0].boxes
                        
                        for box in boxes:
                            # Get box coordinates
                            x1, y1, x2, y2 = map(int, box.xyxy[0])
                            
                            # Get tracking ID
                            track_id = int(box.id[0]) if box.id is not None else None
                            
                            # Get class ID
                            class_id = int(box.cls[0])
                            
                            if track_id is not None:
                                # Draw bounding box
                                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                                
                                # Draw label
                                label = f"{class_names.get(class_id, 'unknown')} {track_id}"
                                cv2.putText(frame, label, (x1, y1 - 10),
                                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                                
                                # Store position
                                centroid = (int((x1 + x2)/2), int((y1 + y2)/2))
                                object_history[track_id].append(centroid)
                                if len(object_history[track_id]) > 30:
                                    object_history[track_id].pop(0)
                                
                                # Determine direction based on position
                                box_center_x = (x1 + x2) // 2
                                box_center_y = (y1 + y2) // 2
                                
                                direction = 'northbound' if box_center_y < line_y else 'southbound'
                                
                                # Check if object has crossed the line
                                if track_id not in crossing_status:
                                    crossing_status[track_id] = {'crossed': False}
                                
                                if not crossing_status[track_id]['crossed']:
                                    if (y1 <= line_y <= y2):
                                        crossing_status[track_id]['crossed'] = True
                                        counts[direction] += 1
                                        counts['total'] += 1
                                
                                # Draw trajectory
                                if len(object_history[track_id]) > 1:
                                    points = np.array(object_history[track_id], np.int32)
                                    cv2.polylines(frame, [points], False, (0, 0, 255), 2)
                
                    # Update descriptions data
                    descriptions_data["timestamp"] = datetime.utcnow().isoformat() + "Z"
                    descriptions_data["counts"] = counts
                    
                    # Update descriptions.json
                    update_descriptions(descriptions_data)
                    
                    # Add overlay elements
                    cv2.line(frame, (0, line_y), (width, line_y), (0, 255, 255), 2)
                    cv2.line(frame, (mid_x, 0), (mid_x, height), (255, 0, 0), 2)
                    
                    # Display counts
                    cv2.putText(frame, f"Northbound: {counts['northbound']}", (10, 30),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    cv2.putText(frame, f"Southbound: {counts['southbound']}", (10, 60),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    cv2.putText(frame, f"Total: {counts['total']}", (10, 90),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    
                    # Update current frame for streaming
                    current_frame = frame
                    
                    # Control frame rate (10fps = 0.1 seconds per frame)
                    await asyncio.sleep(0.1)  # 10fps
                    
                # Release resources for this loop iteration
                cap.release()
                
                # Reset counts for the next loop
                counts = {
                    'northbound': 0,
                    'southbound': 0,
                    'total': 0
                }
                crossing_status = {}
                object_history = defaultdict(list)
                
            except Exception as e:
                return {
                    "status": "error",
                    "message": str(e)
                }
            
        cv2.destroyAllWindows()
        
        return {
            "status": "success",
            "counts": counts
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        } 