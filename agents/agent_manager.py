import asyncio
import logging
from typing import Dict, List, Optional, Tuple, Any
import json
from pathlib import Path
import time
from concurrent.futures import ThreadPoolExecutor

from agents.traffic_agent import TrafficIntersectionAgent
from agents.models import TrafficState, Direction, TrafficSignalConfig

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("agent_manager")


class IntersectionAgentManager:
    """Manages multiple traffic intersection agents.
    
    This class handles the creation, initialization, and coordination of
    multiple traffic intersection agents in the system.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize the intersection agent manager.
        
        Args:
            config_path: Path to the configuration file for intersections
        """
        self.agents: Dict[str, TrafficIntersectionAgent] = {}
        self.config_path = config_path
        self.running = False
        self.thread_executor = ThreadPoolExecutor(max_workers=10)
    
    def load_config(self, config_path: Optional[str] = None):
        """Load intersection configurations from a JSON config file.
        
        Args:
            config_path: Path to the configuration file, overrides the one specified in the constructor
        """
        config_path = config_path or self.config_path
        if not config_path:
            logger.error("No configuration file specified")
            return
        
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
            
            # Process intersection configurations
            intersections_config = config.get('intersections', [])
            for intersection_config in intersections_config:
                self.create_agent_from_config(intersection_config)
            
            # Set up neighbor relationships
            for intersection_id, neighbor_ids in config.get('neighbors', {}).items():
                if intersection_id in self.agents:
                    for neighbor_id in neighbor_ids:
                        if neighbor_id in self.agents:
                            neighbor_agent = self.agents[neighbor_id]
                            self.agents[intersection_id].add_neighbor(neighbor_agent.agent.address)
            
            logger.info(f"Loaded {len(self.agents)} intersection agents from configuration")
            
        except (json.JSONDecodeError, FileNotFoundError) as e:
            logger.error(f"Error loading configuration: {e}")
    
    def create_agent_from_config(self, config: Dict[str, Any]) -> Optional[TrafficIntersectionAgent]:
        """Create a new traffic intersection agent from configuration.
        
        Args:
            config: Configuration dictionary for the intersection
            
        Returns:
            The created agent, or None if creation failed
        """
        try:
            intersection_id = config.get('id')
            name = config.get('name', f"Intersection {intersection_id}")
            seed_phrase = config.get('seed_phrase', f"traffic_intersection_{intersection_id}_seed")
            endpoint = config.get('endpoint', 'http://127.0.0.1')
            port = config.get('port', 8000 + len(self.agents))
            
            # Create default signal config
            signal_config = TrafficSignalConfig(
                intersection_id=intersection_id,
                north_south_green_time=config.get('north_south_green_time', 30),
                east_west_green_time=config.get('east_west_green_time', 30),
                yellow_time=config.get('yellow_time', 5)
            )
            
            # Create the agent
            agent = TrafficIntersectionAgent(
                intersection_id=intersection_id,
                name=name,
                seed_phrase=seed_phrase,
                endpoint=endpoint,
                port=port,
                default_signal_config=signal_config
            )
            
            # Store the agent
            self.agents[intersection_id] = agent
            logger.info(f"Created agent for intersection {intersection_id}")
            return agent
            
        except Exception as e:
            logger.error(f"Error creating agent: {e}")
            return None
    
    def create_agent(self,
                    intersection_id: str,
                    name: str,
                    endpoint: str = 'http://127.0.0.1',
                    port: Optional[int] = None,
                    seed_phrase: Optional[str] = None,
                    neighbor_ids: List[str] = None) -> Optional[TrafficIntersectionAgent]:
        """Create a new traffic intersection agent.
        
        Args:
            intersection_id: Unique identifier for the intersection
            name: Human-readable name for the intersection
            endpoint: HTTP endpoint for the agent
            port: Port for the agent to listen on, defaults to 8000 + current agent count
            seed_phrase: Seed phrase for agent identity, defaults to a generated value
            neighbor_ids: List of neighbor intersection IDs
            
        Returns:
            The created agent, or None if creation failed
        """
        try:
            # Set default port if not specified
            if port is None:
                port = 8000 + len(self.agents)
            
            # Set default seed phrase if not specified
            if seed_phrase is None:
                seed_phrase = f"traffic_intersection_{intersection_id}_seed_{int(time.time())}"
            
            # Create the agent
            agent = TrafficIntersectionAgent(
                intersection_id=intersection_id,
                name=name,
                seed_phrase=seed_phrase,
                endpoint=endpoint,
                port=port
            )
            
            # Store the agent
            self.agents[intersection_id] = agent
            
            # Add neighbors if specified
            if neighbor_ids:
                for neighbor_id in neighbor_ids:
                    if neighbor_id in self.agents:
                        neighbor_agent = self.agents[neighbor_id]
                        agent.add_neighbor(neighbor_agent.agent.address)
                        neighbor_agent.add_neighbor(agent.agent.address)
            
            logger.info(f"Created agent for intersection {intersection_id}")
            return agent
            
        except Exception as e:
            logger.error(f"Error creating agent: {e}")
            return None
    
    def remove_agent(self, intersection_id: str):
        """Remove an intersection agent.
        
        Args:
            intersection_id: Identifier of the agent to remove
        """
        if intersection_id in self.agents:
            # Remove this agent from all neighbor lists
            agent_to_remove = self.agents[intersection_id]
            for other_id, other_agent in self.agents.items():
                if other_id != intersection_id:
                    other_agent.remove_neighbor(agent_to_remove.agent.address)
            
            # Remove the agent
            del self.agents[intersection_id]
            logger.info(f"Removed agent for intersection {intersection_id}")
    
    def start_all_agents(self):
        """Start all intersection agents in separate threads."""
        if self.running:
            logger.warning("Agents are already running")
            return
        
        self.running = True
        
        # Start each agent in a separate thread
        for intersection_id, agent in self.agents.items():
            self.thread_executor.submit(agent.run)
            logger.info(f"Started agent for intersection {intersection_id}")
    
    def stop_all_agents(self):
        """Stop all intersection agents."""
        if not self.running:
            logger.warning("Agents are not running")
            return
        
        self.running = False
        # In a real implementation, we would need a way to stop the agents gracefully
        # For now, we'll just shut down the thread executor
        self.thread_executor.shutdown(wait=False)
        logger.info("Stopped all agents")
    
    def get_all_agent_states(self) -> Dict[str, Dict[str, Any]]:
        """Get the current state of all agents.
        
        Returns:
            Dictionary mapping intersection IDs to their current states
        """
        states = {}
        for intersection_id, agent in self.agents.items():
            signal_config = agent.get_signal_config()
            states[intersection_id] = {
                'id': intersection_id,
                'name': agent.name,
                'congestion_level': agent.local_state.congestion_level,
                'emergency_detected': agent.local_state.emergency_detected,
                'direction_priority': agent.local_state.direction_priority,
                'signal_config': {
                    'north_south_green_time': signal_config.north_south_green_time,
                    'east_west_green_time': signal_config.east_west_green_time,
                    'yellow_time': signal_config.yellow_time,
                    'current_state': signal_config.current_state,
                    'override_active': signal_config.override_active,
                    'override_direction': signal_config.override_direction
                },
                'timestamp': agent.local_state.timestamp
            }
        return states
    
    def save_config(self, config_path: Optional[str] = None):
        """Save the current intersection configurations to a JSON file.
        
        Args:
            config_path: Path to save the configuration file, overrides the one specified in the constructor
        """
        config_path = config_path or self.config_path
        if not config_path:
            logger.error("No configuration file specified")
            return
        
        try:
            # Build configuration dictionary
            config = {
                'intersections': [],
                'neighbors': {}
            }
            
            # Add intersection configurations
            for intersection_id, agent in self.agents.items():
                intersection_config = {
                    'id': intersection_id,
                    'name': agent.name,
                    'seed_phrase': agent.agent.wallet.seed_phrase,  # Note: In a real system, you would want to encrypt this
                    'endpoint': agent.agent.endpoint[0] if agent.agent.endpoint else 'http://127.0.0.1',
                    'port': agent.agent.endpoint[1] if agent.agent.endpoint and len(agent.agent.endpoint) > 1 else 8000,
                    'north_south_green_time': agent.signal_config.north_south_green_time,
                    'east_west_green_time': agent.signal_config.east_west_green_time,
                    'yellow_time': agent.signal_config.yellow_time
                }
                config['intersections'].append(intersection_config)
                
                # Add neighbor relationships
                config['neighbors'][intersection_id] = agent.neighbor_addresses
            
            # Save to file
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=2)
            
            logger.info(f"Saved configuration to {config_path}")
            
        except Exception as e:
            logger.error(f"Error saving configuration: {e}")
