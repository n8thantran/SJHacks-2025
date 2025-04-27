import requests
import subprocess
import time
import sys

def start_server_and_processing():
    # Start the FastAPI server
    server_process = subprocess.Popen(['uvicorn', 'main:app', '--reload'])
    
    # Wait for server to start
    time.sleep(3)
    
    try:
        # Start video processing
        response = requests.post('http://localhost:8000/process-video')
        if response.status_code == 200:
            print("Video processing started successfully!")
            print("Press 'q' in the video window to quit")
        else:
            print("Failed to start video processing")
            server_process.terminate()
            sys.exit(1)
            
        # Keep the script running
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nStopping server and video processing...")
            server_process.terminate()
            sys.exit(0)
            
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        server_process.terminate()
        sys.exit(1)

if __name__ == "__main__":
    start_server_and_processing() 