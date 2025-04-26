from uagents import Model
from typing import List, Dict, Optional
from enum import Enum
import time


class Direction(str, Enum):
    NORTH = "north"
    SOUTH = "south"
    EAST = "east"
    WEST = "west"
    NONE = "none"


class TrafficState(Model):
    """Model for representing the traffic state at an intersection.
    
    This model is used for agent-to-agent communication in the decentralized
    traffic coordination system.
    """
    intersection_id: str
    congestion_level: int  # 0-10 scale, where 0 is no congestion and 10 is maximum congestion
    emergency_detected: bool
    direction_priority: Direction
    timestamp: float
    
    def __init__(
        self,
        intersection_id: str,
        congestion_level: int = 0,
        emergency_detected: bool = False,
        direction_priority: Direction = Direction.NONE,
        timestamp: Optional[float] = None
    ):
        super().__init__(
            intersection_id=intersection_id,
            congestion_level=congestion_level,
            emergency_detected=emergency_detected,
            direction_priority=direction_priority,
            timestamp=timestamp or time.time()
        )


class EmergencyVehiclePriority(Model):
    """Model for emergency vehicle priority requests between intersections."""
    intersection_id: str
    emergency_vehicle_id: str
    from_direction: Direction
    to_direction: Direction
    priority_level: int  # Higher values indicate higher priority
    timestamp: float
    
    def __init__(
        self,
        intersection_id: str,
        emergency_vehicle_id: str,
        from_direction: Direction,
        to_direction: Direction,
        priority_level: int = 10,
        timestamp: Optional[float] = None
    ):
        super().__init__(
            intersection_id=intersection_id,
            emergency_vehicle_id=emergency_vehicle_id,
            from_direction=from_direction,
            to_direction=to_direction,
            priority_level=priority_level,
            timestamp=timestamp or time.time()
        )


class TrafficSignalConfig(Model):
    """Model for representing traffic signal configurations."""
    intersection_id: str
    north_south_green_time: int  # in seconds
    east_west_green_time: int    # in seconds
    yellow_time: int             # in seconds
    current_state: str           # e.g., "north_south_green", "east_west_green", "north_south_yellow", etc.
    override_active: bool
    override_direction: Direction
    timestamp: float
    
    def __init__(
        self,
        intersection_id: str,
        north_south_green_time: int = 30,
        east_west_green_time: int = 30,
        yellow_time: int = 5,
        current_state: str = "north_south_green",
        override_active: bool = False,
        override_direction: Direction = Direction.NONE,
        timestamp: Optional[float] = None
    ):
        super().__init__(
            intersection_id=intersection_id,
            north_south_green_time=north_south_green_time,
            east_west_green_time=east_west_green_time,
            yellow_time=yellow_time,
            current_state=current_state,
            override_active=override_active,
            override_direction=override_direction,
            timestamp=timestamp or time.time()
        )


class NeighborState(Model):
    """Model for storing the state of neighboring intersections."""
    neighbors: Dict[str, TrafficState]  # intersection_id -> TrafficState
    timestamp: float
    
    def __init__(
        self,
        neighbors: Dict[str, TrafficState] = None,
        timestamp: Optional[float] = None
    ):
        super().__init__(
            neighbors=neighbors or {},
            timestamp=timestamp or time.time()
        )
