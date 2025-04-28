from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import cv2
import numpy as np
# from ultralytics import YOLO # Removed YOLO
import requests # Added requests
import base64 # Added base64
from collections import defaultdict
import asyncio
import signal
import sys
import json
import time
from datetime import datetime
import os
from dotenv import load_dotenv # Added dotenv
import uvicorn

# Load environment variables from .env file
load_dotenv()

# Configuration
CONFIG = {
    'video_path': 'street.mp4',
    # 'model_path': 'yolov8n.pt', # Removed YOLO model path
    'output_path': 'output.mp4',
    'frame_scale': 0.4,  # Scale down frames to 40% of original size
    'counting_line_position': 0.6,  # Counting line at 60% of frame height - MAYBE NOT NEEDED if workflow handles counting
    # 'tracker_config': { ... }, # Removed YOLO tracker config
    # 'class_names': { ... } # Removed YOLO class names
    'roboflow': {
        'workflow_url': "https://serverless.roboflow.com/infer/workflows/sjhacks/detect-count-and-visualize-2", # Specific workflow URL
        'api_key': os.getenv("ROBOFLOW_API_KEY"), # Use environment variable
        # 'workspace_name': "sjhacks", # Not needed for direct URL call
        # 'workflow_id': "detect-count-and-visualize-2" # Not needed for direct URL call
    }
}

# Validate Roboflow API key
if not CONFIG['roboflow']['api_key']:
    raise ValueError("ROBOFLOW_API_KEY environment variable not set.")

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
# model = None # Removed YOLO model instance
# client = None # Removed Roboflow client instance
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
    # Use requests.Session for potential connection reuse
    session = requests.Session()
    global stop_processing, current_frame, traffic_counts
    
    try:
        # # Initialize Roboflow client # Removed
        # client = InferenceHTTPClient(
        #     api_url=CONFIG['roboflow']['api_url'],
        #     api_key=CONFIG['roboflow']['api_key']
        # )
        # print("Roboflow client initialized.")

        # Open video file
        cap = cv2.VideoCapture(CONFIG['video_path'])
        
        if not cap.isOpened():
            print("Error: Could not open video file")
            return
        
        # Get video properties
        original_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        original_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        # Calculate scaled dimensions (optional, workflow might handle resizing)
        width = int(original_width * CONFIG['frame_scale'])
        height = int(original_height * CONFIG['frame_scale'])
        
        # Create video writer for output
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(CONFIG['output_path'], fourcc, fps, (width, height)) # Adjust size if workflow provides visualization
        
        # Initialize tracking variables (MAYBE NOT NEEDED if workflow handles counting/tracking)
        # object_history = defaultdict(list)
        # crossing_status = {}
        
        # Reset traffic counts (workflow might overwrite this)
        traffic_counts = {
            'northbound': 0,
            'southbound': 0,
            'total': 0
        }
        
        # Calculate counting line position (MAYBE NOT NEEDED)
        # line_y = int(height * CONFIG['counting_line_position'])
        # mid_x = width // 2
        
        while cap.isOpened() and not stop_processing:
            ret, frame = cap.read()
            if not ret:
                # Video ended, loop back to the beginning
                print("Video ended. Looping...")
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                await asyncio.sleep(0.1) # Brief pause before restarting
                continue # Continue to the next loop iteration to read the first frame
            
            # Resize frame (optional, can be done by Roboflow)
            frame_resized = cv2.resize(frame, (width, height), interpolation=cv2.INTER_LINEAR)
            
            # --- Run Roboflow Workflow via HTTP POST ---
            try:
                # Encode frame to JPEG -> Base64
                _, buffer = cv2.imencode('.jpg', frame_resized)
                base64_image = base64.b64encode(buffer).decode('utf-8')

                payload = {
                    "api_key": CONFIG['roboflow']['api_key'],
                    "inputs": {
                        "image": {"type": "base64", "value": base64_image}
                    }
                    # Add other workflow inputs here if needed
                }

                start_time = time.time()
                response = session.post(CONFIG['roboflow']['workflow_url'], json=payload)
                end_time = time.time()
                # print(f"Roboflow API response received in {end_time - start_time:.2f}s")

                response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
                result = response.json()
                # print("Workflow result:", result) # Debug: Print the result

                # Process the result from direct API call
                if result:
                    # Update counts if available (adjust key names if needed)
                    if 'count_objects' in result and 'value' in result['count_objects'] and isinstance(result['count_objects']['value'], dict):
                         counts_data = result['count_objects']['value']
                         traffic_counts = {
                             'northbound': counts_data.get('northbound', traffic_counts['northbound']),
                             'southbound': counts_data.get('southbound', traffic_counts['southbound']),
                             'total': counts_data.get('total', traffic_counts['total'])
                         }
                         # print("Updated traffic counts:", traffic_counts) # Debug
                    else:
                        print("Warning: 'count_objects.value' not found or not a dict in response.")

                    # Use visualization if available (adjust key names if needed)
                    # Assuming visualization is a base64 encoded image string
                    if 'annotated_image' in result and 'value' in result['annotated_image']:
                        vis_base64 = result['annotated_image']['value']
                        try:
                            vis_bytes = base64.b64decode(vis_base64)
                            vis_np = np.frombuffer(vis_bytes, dtype=np.uint8)
                            processed_frame = cv2.imdecode(vis_np, cv2.IMREAD_COLOR)
                            # Ensure dimensions match output writer
                            if processed_frame.shape[0] != height or processed_frame.shape[1] != width:
                                processed_frame = cv2.resize(processed_frame, (width, height))
                        except Exception as decode_error:
                            print(f"Warning: Error decoding visualization image: {decode_error}. Using original resized frame.")
                            processed_frame = frame_resized # Fallback
                    else:
                        # print("No visualization in result. Using original resized frame.") # Debug
                        processed_frame = frame_resized # Fallback if no visualization
                else:
                    print("Warning: Empty workflow result from API.")
                    processed_frame = frame_resized # Fallback

            except requests.exceptions.RequestException as http_error:
                print(f"HTTP Error calling Roboflow workflow: {http_error}")
                processed_frame = frame_resized # Use original frame on error
            except Exception as rf_error:
                print(f"Error processing Roboflow workflow response: {rf_error}")
                processed_frame = frame_resized # Use original frame on error

            # Update current frame for the feed and write to output file
            current_frame = processed_frame
            if current_frame is not None:
                 out.write(current_frame)
            else:
                 print("Warning: current_frame is None, cannot write to output.")
                 current_frame = frame_resized # Ensure current_frame is not None for the feed

            # Control frame rate (yield control to event loop)
            await asyncio.sleep(0) # Yield control to event loop
            
    except Exception as e:
        print(f"Error in video processing loop: {e}")
    finally:
        if 'cap' in locals() and cap.isOpened():
            cap.release()
            print("Video capture released.")
        if 'out' in locals():
            out.release()
            print("Video writer released.")
        # client = None # Clear client? Or keep for subsequent runs?

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
    global processing_task, stop_processing
    stop_processing = False
    if processing_task is None or processing_task.done():
        print("Starting video processing task...")
        processing_task = asyncio.create_task(process_video())
    else:
        print("Video processing task already running.")

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