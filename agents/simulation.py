import asyncio
import logging
import random
import time
import json
from pathlib import Path
import sys
from typing import Dict, List, Optional, Any

from agents.agent_manager import IntersectionAgentManager
from agents.camera_integration import CameraProcessor
from agents.models import Direction

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("simulation")


class TrafficSimulation:
    """Simulates traffic conditions for testing the decentralized agent system.
    
    This class generates simulated traffic data for each intersection and
    feeds it to the respective camera processors and traffic agents.
    """
    
    def __init__(self, config_path: str):
        """Initialize the traffic simulation.
        
        Args:
            config_path: Path to the intersection configuration file
        """
        self.config_path = config_path
        self.agent_manager = IntersectionAgentManager(config_path)
        self.camera_processors: Dict[str, CameraProcessor] = {}
        self.running = False
        
        # Load intersection configurations
        self.agent_manager.load_config()
        
        # Create camera processors for each intersection
        for intersection_id, agent in self.agent_manager.agents.items():
            self.camera_processors[intersection_id] = CameraProcessor(agent)
    
    def start(self):
        """Start the simulation."""
        if self.running:
            logger.warning("Simulation is already running")
            return
        
        self.running = True
        
        # Start all agents
        self.agent_manager.start_all_agents()
        
        # Start simulation loop in a separate thread
        import threading
        self.simulation_thread = threading.Thread(target=self._simulation_loop)
        self.simulation_thread.daemon = True
        self.simulation_thread.start()
        
        logger.info("Simulation started")
    
    def stop(self):
        """Stop the simulation."""
        if not self.running:
            logger.warning("Simulation is not running")
            return
        
        self.running = False
        self.agent_manager.stop_all_agents()
        logger.info("Simulation stopped")
    
    def _simulation_loop(self):
        """Main simulation loop that generates traffic data."""
        try:
            while self.running:
                # Generate random traffic data for each intersection
                for intersection_id, camera_processor in self.camera_processors.items():
                    # Generate random traffic conditions
                    detection_results = self._generate_traffic_data(intersection_id)
                    
                    # Process the detection results
                    camera_processor.process_detection(detection_results)
                
                # Wait before next update
                time.sleep(1.0)  # 1 second between updates
        except Exception as e:
            logger.error(f"Error in simulation loop: {e}")
            self.running = False
    
    def _generate_traffic_data(self, intersection_id: str) -> Dict[str, Any]:
        """Generate random traffic data for an intersection.
        
        Args:
            intersection_id: ID of the intersection to generate data for
            
        Returns:
            Dictionary with simulated detection results
        """
        # Base number of vehicles
        num_vehicles = random.randint(5, 30)
        
        # Random chance for emergency vehicle
        emergency_chance = 0.05  # 5% chance per update
        has_emergency = random.random() < emergency_chance
        
        # Vehicle distribution by type
        vehicle_types = ['car'] * 80 + ['truck'] * 15 + ['bus'] * 5
        
        # Add emergency vehicles if needed
        emergency_vehicle_types = ['ambulance', 'police_car', 'fire_truck']
        
        # Generate detections
        detections = []
        track_id = 1
        emergency_track_id = None
        
        # Add an emergency vehicle if applicable
        if has_emergency:
            emergency_type = random.choice(emergency_vehicle_types)
            emergency_track_id = 0
            
            # Random position and size for emergency vehicle
            x1 = random.randint(50, 400)
            y1 = random.randint(50, 400)
            width = random.randint(80, 120)
            height = random.randint(80, 120)
            
            detections.append({
                'class_id': 0,
                'class_name': emergency_type,
                'bbox': [x1, y1, x1 + width, y1 + height],
                'confidence': random.uniform(0.85, 0.99),
                'track_id': emergency_track_id
            })
        
        # Add regular vehicles
        for _ in range(num_vehicles):
            vehicle_type = random.choice(vehicle_types)
            
            # Random position and size for vehicle
            x1 = random.randint(0, 800)
            y1 = random.randint(0, 600)
            width = random.randint(40, 100)
            height = random.randint(40, 100)
            
            detections.append({
                'class_id': 1 + track_id % 3,  # Just a placeholder class ID
                'class_name': vehicle_type,
                'bbox': [x1, y1, x1 + width, y1 + height],
                'confidence': random.uniform(0.7, 0.95),
                'track_id': track_id
            })
            track_id += 1
        
        # Generate frame info
        frame_info = {
            'timestamp': time.time(),
            'frame_id': int(time.time() * 1000) % 1000000,
            'camera_id': f"cam_{intersection_id}"
        }
        
        return {
            'detections': detections,
            'frame_info': frame_info
        }
    
    def get_simulation_state(self) -> Dict[str, Any]:
        """Get the current state of the simulation.
        
        Returns:
            Dictionary with the current state of all intersections
        """
        return {
            'running': self.running,
            'intersections': self.agent_manager.get_all_agent_states(),
            'timestamp': time.time()
        }
    
    def inject_emergency_vehicle(self, intersection_id: str, from_direction: Direction, to_direction: Direction):
        """Inject an emergency vehicle at a specific intersection.
        
        Args:
            intersection_id: ID of the intersection to inject the emergency vehicle at
            from_direction: Direction the emergency vehicle is coming from
            to_direction: Direction the emergency vehicle is going to
        """
        if intersection_id in self.agent_manager.agents:
            agent = self.agent_manager.agents[intersection_id]
            
            # Update local state to indicate emergency vehicle
            agent.update_local_traffic_state(
                vehicle_count=random.randint(5, 30),
                emergency_detected=True,
                primary_flow_direction=from_direction
            )
            
            logger.info(f"Injected emergency vehicle at {intersection_id} from {from_direction} to {to_direction}")
