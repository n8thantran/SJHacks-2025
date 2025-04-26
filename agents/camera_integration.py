import logging
import time
from typing import Dict, List, Optional, Tuple, Any
from agents.models import Direction, TrafficState
from agents.traffic_agent import TrafficIntersectionAgent

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("camera_integration")


class CameraProcessor:
    """Integrates camera detection with the traffic agent system.
    
    This class processes the YOLOv8 + ByteTrack detection results and updates
    the traffic agent with relevant information.
    """
    
    def __init__(self, traffic_agent: TrafficIntersectionAgent):
        """Initialize camera processor.
        
        Args:
            traffic_agent: The traffic agent to update with detection results
        """
        self.traffic_agent = traffic_agent
        self.last_update_time = 0
        self.update_interval = 3  # Update agent every 3 seconds
        
        # Store detection stats for processing
        self.vehicle_counts = {'car': 0, 'truck': 0, 'bus': 0, 'motorcycle': 0}
        self.vehicle_tracks = {}  # track_id -> vehicle_info
        self.emergency_vehicles = []  # List of emergency vehicle track IDs
        self.flow_directions = {Direction.NORTH: 0, Direction.SOUTH: 0, Direction.EAST: 0, Direction.WEST: 0}
    
    def process_detection(self, detection_results: Dict[str, Any]):
        """Process detection results from YOLOv8 + ByteTrack.
        
        Args:
            detection_results: Detection results from the camera system
            
        Expected format of detection_results:
        {
            'detections': [
                {'class_id': 2, 'class_name': 'car', 'bbox': [x1, y1, x2, y2], 'confidence': 0.92, 'track_id': 1},
                ...
            ],
            'frame_info': {
                'timestamp': 1619855432.123,
                'frame_id': 1234,
                'camera_id': 'cam1'
            }
        }
        """
        # Extract detection information
        detections = detection_results.get('detections', [])
        frame_info = detection_results.get('frame_info', {})
        
        # Reset counts for this frame
        self.vehicle_counts = {'car': 0, 'truck': 0, 'bus': 0, 'motorcycle': 0}
        self.emergency_vehicles = []
        
        # Process each detection
        for detection in detections:
            class_name = detection.get('class_name', '').lower()
            track_id = detection.get('track_id')
            bbox = detection.get('bbox', [0, 0, 0, 0])
            
            # Count vehicles by type
            if class_name in self.vehicle_counts:
                self.vehicle_counts[class_name] += 1
            
            # Check for emergency vehicles (ambulance, fire truck, police car)
            if class_name in ['ambulance', 'fire_truck', 'police_car', 'emergency']:
                self.emergency_vehicles.append(track_id)
            
            # Update vehicle tracks
            if track_id is not None:
                if track_id not in self.vehicle_tracks:
                    self.vehicle_tracks[track_id] = {
                        'class_name': class_name,
                        'positions': [],
                        'first_seen': time.time(),
                        'last_seen': time.time()
                    }
                
                # Update track info
                self.vehicle_tracks[track_id]['positions'].append(bbox)
                self.vehicle_tracks[track_id]['last_seen'] = time.time()
        
        # Clean up old tracks
        self._clean_old_tracks()
        
        # Calculate flow direction based on tracks
        self._calculate_flow_directions()
        
        # Update traffic agent if enough time has passed
        current_time = time.time()
        if current_time - self.last_update_time >= self.update_interval:
            self._update_traffic_agent()
            self.last_update_time = current_time
    
    def _clean_old_tracks(self, max_age_seconds: float = 5.0):
        """Remove tracks that haven't been seen recently."""
        current_time = time.time()
        track_ids_to_remove = []
        
        for track_id, track_info in self.vehicle_tracks.items():
            if current_time - track_info['last_seen'] > max_age_seconds:
                track_ids_to_remove.append(track_id)
        
        for track_id in track_ids_to_remove:
            del self.vehicle_tracks[track_id]
    
    def _calculate_flow_directions(self):
        """Calculate traffic flow directions based on vehicle movements."""
        # Reset direction counts
        self.flow_directions = {Direction.NORTH: 0, Direction.SOUTH: 0, Direction.EAST: 0, Direction.WEST: 0}
        
        # Analyze each track with at least 2 positions to determine movement direction
        for track_id, track_info in self.vehicle_tracks.items():
            positions = track_info['positions']
            if len(positions) < 2:
                continue
            
            # Get first and last position
            first_pos = positions[0]  # [x1, y1, x2, y2]
            last_pos = positions[-1]  # [x1, y1, x2, y2]
            
            # Calculate center points
            first_center_x = (first_pos[0] + first_pos[2]) / 2
            first_center_y = (first_pos[1] + first_pos[3]) / 2
            last_center_x = (last_pos[0] + last_pos[2]) / 2
            last_center_y = (last_pos[1] + last_pos[3]) / 2
            
            # Determine primary direction of movement
            dx = last_center_x - first_center_x
            dy = last_center_y - first_center_y
            
            # Simplistic direction determination - in a real system this would be more sophisticated
            # and would account for camera perspective, road layout, etc.
            if abs(dx) > abs(dy):  # Horizontal movement is dominant
                if dx > 0:
                    self.flow_directions[Direction.EAST] += 1
                else:
                    self.flow_directions[Direction.WEST] += 1
            else:  # Vertical movement is dominant
                if dy > 0:
                    self.flow_directions[Direction.SOUTH] += 1  # Y increases downward in image coordinates
                else:
                    self.flow_directions[Direction.NORTH] += 1
    
    def _update_traffic_agent(self):
        """Update the traffic agent with the latest detection information."""
        # Calculate total vehicle count
        total_vehicles = sum(self.vehicle_counts.values())
        
        # Determine if emergency vehicle is present
        emergency_detected = len(self.emergency_vehicles) > 0
        
        # Determine primary flow direction
        primary_direction = max(self.flow_directions, key=self.flow_directions.get)
        if self.flow_directions[primary_direction] == 0:
            primary_direction = Direction.NONE  # No vehicles moving
        
        # Update traffic agent
        self.traffic_agent.update_local_traffic_state(
            vehicle_count=total_vehicles,
            emergency_detected=emergency_detected,
            primary_flow_direction=primary_direction
        )
        
        logger.info(f"Updated traffic agent: vehicles={total_vehicles}, emergency={emergency_detected}, flow={primary_direction}")
