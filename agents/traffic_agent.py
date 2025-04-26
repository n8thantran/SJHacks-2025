from uagents import Agent, Context, Model, Protocol
from uagents.setup import fund_agent_if_low
from datetime import datetime
import time
import logging
import asyncio
from typing import Dict, List, Optional, Tuple, Any

from agents.models import TrafficState, EmergencyVehiclePriority, TrafficSignalConfig, NeighborState, Direction

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("traffic_agent")


class TrafficIntersectionAgent:
    """Agent representing a single traffic intersection in the decentralized system.
    
    Each agent is responsible for:
    1. Analyzing local traffic state from camera feeds
    2. Communicating with neighboring intersections
    3. Adjusting traffic signals based on local and neighbor information
    4. Prioritizing emergency vehicles
    """
    
    def __init__(
        self,
        intersection_id: str,
        name: str,
        seed_phrase: str,
        endpoint: str,
        port: int,
        neighbor_addresses: List[str] = None,
        default_signal_config: Optional[TrafficSignalConfig] = None
    ):
        """Initialize the traffic intersection agent.
        
        Args:
            intersection_id: Unique identifier for this intersection
            name: Human-readable name for this intersection
            seed_phrase: Unique seed phrase for agent identity
            endpoint: HTTP endpoint for this agent
            port: Port for this agent to listen on
            neighbor_addresses: List of neighbor agent addresses
            default_signal_config: Default traffic signal configuration
        """
        self.intersection_id = intersection_id
        self.name = name
        
        # Initialize agent with seed phrase
        self.agent = Agent(
            name=name,
            seed=seed_phrase,
            endpoint=[endpoint, port],
        )
        
        # Fund the agent if needed
        fund_agent_if_low(self.agent.wallet.address())
        
        # Store neighbor addresses
        self.neighbor_addresses = neighbor_addresses or []
        
        # Initialize state
        self.local_state = TrafficState(intersection_id=intersection_id)
        self.neighbor_states = NeighborState()
        self.signal_config = default_signal_config or TrafficSignalConfig(intersection_id=intersection_id)
        
        # Register protocols
        self._register_protocols()
    
    def _register_protocols(self):
        """Register all the message protocols for this agent."""
        # Protocol for receiving traffic state updates from neighbors
        traffic_protocol = Protocol("TrafficStateProtocol")
        
        @traffic_protocol.on_message(model=TrafficState)
        async def handle_traffic_state(ctx: Context, sender: str, msg: TrafficState):
            if sender not in self.neighbor_addresses:
                logger.warning(f"Received traffic state from unknown neighbor: {sender}")
                return
            
            logger.info(f"Received traffic state from {sender}: {msg}")
            
            # Update neighbor state
            self.neighbor_states.neighbors[msg.intersection_id] = msg
            self.neighbor_states.timestamp = time.time()
            
            # Check for emergency vehicles in neighbors
            if msg.emergency_detected:
                await self._handle_neighbor_emergency(ctx, msg)
            
            # Adjust traffic signal based on neighbor states
            await self._adjust_signals_based_on_traffic(ctx)
        
        # Protocol for emergency vehicle priority requests
        emergency_protocol = Protocol("EmergencyProtocol")
        
        @emergency_protocol.on_message(model=EmergencyVehiclePriority)
        async def handle_emergency_priority(ctx: Context, sender: str, msg: EmergencyVehiclePriority):
            if sender not in self.neighbor_addresses:
                logger.warning(f"Received emergency priority from unknown neighbor: {sender}")
                return
            
            logger.info(f"Received emergency priority from {sender}: {msg}")
            
            # Set emergency override for traffic signal
            self._set_emergency_override(msg.from_direction, msg.to_direction)
            
            # Propagate emergency vehicle priority to relevant neighbors
            await self._propagate_emergency_priority(ctx, msg)
        
        # Add protocols to agent
        self.agent.include(traffic_protocol)
        self.agent.include(emergency_protocol)
        
        # Register periodic task to broadcast state
        @self.agent.on_interval(period=5.0)  # Every 5 seconds
        async def broadcast_state(ctx: Context):
            await self._broadcast_traffic_state(ctx)
    
    async def _broadcast_traffic_state(self, ctx: Context):
        """Broadcast local traffic state to all neighbors."""
        # Update timestamp
        self.local_state.timestamp = time.time()
        
        # Send state to all neighbors
        for neighbor in self.neighbor_addresses:
            await ctx.send(neighbor, self.local_state)
            logger.debug(f"Sent traffic state to {neighbor}")
    
    async def _handle_neighbor_emergency(self, ctx: Context, neighbor_state: TrafficState):
        """Handle emergency vehicle detected in a neighboring intersection."""
        logger.info(f"Emergency vehicle detected at neighbor {neighbor_state.intersection_id}")
        
        # If we also have a local emergency, prioritize based on timestamp (older emergency has priority)
        if self.local_state.emergency_detected and self.local_state.timestamp < neighbor_state.timestamp:
            logger.info("Local emergency has priority over neighbor emergency")
            return
        
        # Calculate direction of neighbor relative to self
        neighbor_direction = self._calculate_neighbor_direction(neighbor_state.intersection_id)
        
        # Set appropriate signal override for emergency vehicle
        if neighbor_direction:
            # Determine emergency vehicle route and set appropriate signal
            opposite_direction = self._get_opposite_direction(neighbor_direction)
            self._set_emergency_override(neighbor_direction, opposite_direction)
    
    def _calculate_neighbor_direction(self, neighbor_id: str) -> Optional[Direction]:
        """Calculate the direction of a neighbor relative to this intersection.
        
        In a real implementation, this would use map data to determine the relative position.
        For this implementation, we'll use a simple mapping in config.
        """
        # This is a placeholder - in a real implementation, this would use a mapping
        # based on the intersection IDs or coordinates
        
        # Mock implementation for demo purposes
        # In reality, this would be based on a map or configuration
        neighbor_map = {
            "intersection_1": Direction.NORTH,
            "intersection_2": Direction.SOUTH,
            "intersection_3": Direction.EAST,
            "intersection_4": Direction.WEST,
        }
        return neighbor_map.get(neighbor_id, Direction.NONE)
    
    def _get_opposite_direction(self, direction: Direction) -> Direction:
        """Get the opposite direction."""
        opposites = {
            Direction.NORTH: Direction.SOUTH,
            Direction.SOUTH: Direction.NORTH,
            Direction.EAST: Direction.WEST,
            Direction.WEST: Direction.EAST,
            Direction.NONE: Direction.NONE,
        }
        return opposites.get(direction, Direction.NONE)
    
    def _set_emergency_override(self, from_direction: Direction, to_direction: Direction):
        """Set emergency override for traffic signals."""
        logger.info(f"Setting emergency override: from {from_direction} to {to_direction}")
        
        # Update signal config with override
        self.signal_config.override_active = True
        
        # Determine priority direction based on emergency vehicle's path
        if from_direction in [Direction.NORTH, Direction.SOUTH] and to_direction in [Direction.NORTH, Direction.SOUTH]:
            # North-South movement
            self.signal_config.override_direction = Direction.NORTH  # North-South direction
        elif from_direction in [Direction.EAST, Direction.WEST] and to_direction in [Direction.EAST, Direction.WEST]:
            # East-West movement
            self.signal_config.override_direction = Direction.EAST  # East-West direction
        else:
            # Turn movement - prioritize the 'from' direction
            self.signal_config.override_direction = from_direction
        
        self.signal_config.timestamp = time.time()
        
        # In a real implementation, this would interface with the traffic controller
        # to actually change the traffic lights
        logger.info(f"Emergency override set: {self.signal_config.override_direction}")
    
    async def _propagate_emergency_priority(self, ctx: Context, msg: EmergencyVehiclePriority):
        """Propagate emergency vehicle priority to relevant neighbors."""
        # Determine which neighbors should receive the emergency priority
        # In a real implementation, this would be based on the actual road network
        
        # For this implementation, we'll just propagate to all neighbors
        # except the one that sent us the message
        for neighbor in self.neighbor_addresses:
            if neighbor != ctx.sender:
                await ctx.send(neighbor, msg)
                logger.debug(f"Propagated emergency priority to {neighbor}")
    
    async def _adjust_signals_based_on_traffic(self, ctx: Context):
        """Adjust traffic signals based on local and neighbor traffic conditions."""
        # Skip if emergency override is active
        if self.signal_config.override_active:
            logger.debug("Emergency override active, skipping normal traffic adjustment")
            return
        
        # Calculate congestion in each direction
        north_south_congestion = self._calculate_direction_congestion(Direction.NORTH, Direction.SOUTH)
        east_west_congestion = self._calculate_direction_congestion(Direction.EAST, Direction.WEST)
        
        # Check if congestion exceeds threshold
        if max(north_south_congestion, east_west_congestion) > 7:  # Threshold of 7 on a 0-10 scale
            # Adjust signal timing based on congestion levels
            # Higher congestion gets longer green time
            if north_south_congestion > east_west_congestion:
                self.signal_config.north_south_green_time = min(60, self.signal_config.north_south_green_time + 5)
                self.signal_config.east_west_green_time = max(15, self.signal_config.east_west_green_time - 5)
            else:
                self.signal_config.east_west_green_time = min(60, self.signal_config.east_west_green_time + 5)
                self.signal_config.north_south_green_time = max(15, self.signal_config.north_south_green_time - 5)
            
            self.signal_config.timestamp = time.time()
            logger.info(f"Adjusted signal timing: NS={self.signal_config.north_south_green_time}s, EW={self.signal_config.east_west_green_time}s")
    
    def _calculate_direction_congestion(self, *directions: Direction) -> float:
        """Calculate average congestion level in specified directions."""
        # Start with local congestion if the priority direction matches
        congestion_values = []
        if self.local_state.direction_priority in directions:
            congestion_values.append(self.local_state.congestion_level)
        
        # Add neighbor congestion values where direction matches
        for neighbor_id, neighbor_state in self.neighbor_states.neighbors.items():
            neighbor_direction = self._calculate_neighbor_direction(neighbor_id)
            if neighbor_direction in directions:
                congestion_values.append(neighbor_state.congestion_level)
        
        # Return average congestion, or 0 if no data
        return sum(congestion_values) / len(congestion_values) if congestion_values else 0
    
    def update_local_traffic_state(
        self,
        vehicle_count: int,
        emergency_detected: bool,
        primary_flow_direction: Direction
    ):
        """Update local traffic state based on camera detection.
        
        Args:
            vehicle_count: Number of vehicles detected
            emergency_detected: Whether an emergency vehicle was detected
            primary_flow_direction: Primary direction of traffic flow
        """
        # Calculate congestion level based on vehicle count
        # This is a simple linear mapping - in a real system, this would be more sophisticated
        # and take into account road capacity, vehicle speed, etc.
        congestion_level = min(10, max(0, int(vehicle_count / 5)))  # Convert to 0-10 scale
        
        # Update local state
        self.local_state.congestion_level = congestion_level
        self.local_state.emergency_detected = emergency_detected
        self.local_state.direction_priority = primary_flow_direction
        self.local_state.timestamp = time.time()
        
        # If emergency vehicle detected, initiate emergency protocol
        if emergency_detected and not self.signal_config.override_active:
            self._set_emergency_override(primary_flow_direction, self._get_opposite_direction(primary_flow_direction))
        
        logger.info(f"Updated local traffic state: congestion={congestion_level}, emergency={emergency_detected}, direction={primary_flow_direction}")
    
    def get_signal_config(self) -> TrafficSignalConfig:
        """Get the current traffic signal configuration."""
        return self.signal_config
    
    def reset_emergency_override(self):
        """Reset any emergency override."""
        if self.signal_config.override_active:
            self.signal_config.override_active = False
            self.signal_config.override_direction = Direction.NONE
            self.signal_config.timestamp = time.time()
            logger.info("Reset emergency override")
    
    def add_neighbor(self, neighbor_address: str):
        """Add a new neighboring intersection."""
        if neighbor_address not in self.neighbor_addresses:
            self.neighbor_addresses.append(neighbor_address)
            logger.info(f"Added neighbor: {neighbor_address}")
    
    def remove_neighbor(self, neighbor_address: str):
        """Remove a neighboring intersection."""
        if neighbor_address in self.neighbor_addresses:
            self.neighbor_addresses.remove(neighbor_address)
            # Also remove from neighbor states if present
            for neighbor_id in list(self.neighbor_states.neighbors.keys()):
                if neighbor_id == neighbor_address:
                    del self.neighbor_states.neighbors[neighbor_id]
            logger.info(f"Removed neighbor: {neighbor_address}")
    
    def run(self):
        """Run the agent."""
        logger.info(f"Starting traffic intersection agent: {self.name} ({self.intersection_id})")
        self.agent.run()
