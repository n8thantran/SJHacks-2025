from fastapi import FastAPI, Response
import cv2
import numpy as np
from ultralytics import YOLO
from collections import defaultdict
import asyncio
import signal
import sys
import io

app = FastAPI()

# Global variable to control video processing
stop_processing = False
current_frame = None

def signal_handler(sig, frame):
    global stop_processing
    print("\nStopping video processing...")
    stop_processing = True
    sys.exit(0)

@app.get("/")
async def root():
    return {"message": "Video Processing API is running"}

@app.get("/video-feed")
async def video_feed():
    global current_frame
    if current_frame is None:
        return Response(content="No video feed available", media_type="text/plain")
    
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
        # Load YOLOv8 model
        model = YOLO('yolov8n.pt')
        
        # Open video file
        video_path = 'freeway.mp4'
        cap = cv2.VideoCapture(video_path)
        
        # Get video properties
        original_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        original_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
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
        
        # Store vehicle counts for each side
        vehicle_counts = {
            'left': 0,  # Northbound count
            'right': 0  # Southbound count
        }
        
        # Store people counts for each side
        people_counts = {
            'left': 0,  # Northbound count
            'right': 0  # Southbound count
        }
        
        crossing_status = {}  # Track if object has crossed the line
        
        # Tracking configuration
        tracking_config = {
            'bytetrack': {
                'tracker': 'bytetrack.yaml',
                'conf': 0.2,
                'classes': [0, 2, 3, 5, 7],  # Added class 0 for people
                'persist': True,
                'iou': 0.5,
                'max_det': 300
            }
        }
        
        while cap.isOpened() and not stop_processing:
            ret, frame = cap.read()
            if not ret:
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
                        if len(object_history[track_id]) > 30:  # Keep last 30 positions
                            object_history[track_id].pop(0)
                        
                        # Determine which side the object is on
                        box_center_x = (x1 + x2) // 2
                        side = 'left' if box_center_x < mid_x else 'right'
                        
                        # Check if object has crossed the line
                        if track_id not in crossing_status:
                            crossing_status[track_id] = {'crossed': False}
                        
                        if not crossing_status[track_id]['crossed']:
                            if (y1 <= line_y <= y2):
                                crossing_status[track_id]['crossed'] = True
                                if class_id == 0:  # Person
                                    people_counts[side] += 1
                                else:  # Vehicle
                                    vehicle_counts[side] += 1
                        
                        # Draw trajectory
                        if len(object_history[track_id]) > 1:
                            points = np.array(object_history[track_id], np.int32)
                            cv2.polylines(frame, [points], False, (0, 0, 255), 2)
            
            # Add overlay elements
            # Draw counting line
            cv2.line(frame, (0, line_y), (width, line_y), (0, 255, 255), 2)
            
            # Draw vertical dividing line
            cv2.line(frame, (mid_x, 0), (mid_x, height), (255, 0, 0), 2)
            
            # Display vehicle and people counts
            cv2.putText(frame, "Left Side", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Northbound Vehicles: {vehicle_counts['left']}", (10, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Northbound People: {people_counts['left']}", (10, 90),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            cv2.putText(frame, "Right Side", (width - 200, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Southbound Vehicles: {vehicle_counts['right']}", (width - 200, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, f"Southbound People: {people_counts['right']}", (width - 200, 90),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Update current frame for streaming
            current_frame = frame
            
            # Add a small delay to control frame rate
            await asyncio.sleep(0.03)  # ~30 FPS
        
        # Release resources
        cap.release()
        
        # Return the results
        return {
            "status": "success",
            "counts": {
                "northbound_vehicles": vehicle_counts['left'],
                "southbound_vehicles": vehicle_counts['right'],
                "northbound_people": people_counts['left'],
                "southbound_people": people_counts['right']
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        } 