from uagents import Agent, Context, Model
import time
from typing import Any, Dict
import google.generativeai as genai
import json
from dotenv import load_dotenv
import os

# Load environment variables and configure Gemini
load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-pro')

# Define models
class Request(Model):
    text: str

class Response(Model):
    message: str

class ControllerMessage(Model):
    text: str
    color: str
    turn_color: str = "red"  # Default to red for left turn

class LightStatus(Model):
    color: str
    turn_color: str = None

# Create the controller agent
controller = Agent(
    name="controller",
    port=5052,  
    endpoint=["http://localhost:5052/submit"],
    seed="controller recovery phrase"
)

# Define the addresses of all traffic lights
TRAFFIC_LIGHT_1_ADDRESS = "test-agent://agent1qdf25x66ck46vnu3lmra9q706ppvcz6g5pmwj58r98uzrsfcwkyw2xnjk9r"  # Northbound traffic
TRAFFIC_LIGHT_2_ADDRESS = "test-agent://agent1qgqmfvwl4prsnhs53vfkyrnsvrhzys0ms5sz5vl0wvkzzvhhz4dhxhgr005"  # Eastbound traffic (can go straight or turn left)
TRAFFIC_LIGHT_3_ADDRESS = "test-agent://agent1qtqwnanhgjjdezulfl27rlf3nnjs7a53nlgqwa7tjn4lmltyfkzkkgru0at"  # Westbound traffic (can only go straight)

async def determine_traffic_light_states(situation: str) -> dict:
    """
    Use Gemini to determine traffic light states based on the traffic situation.
    Returns a dictionary with traffic light states.
    """
    prompt = f"""You are controlling a complex intersection with three traffic lights.
    Determine which lights should be green or red based on the traffic situation.

    The intersection has:
    1. Northbound traffic (can only go straight)
    2. Eastbound traffic (can go straight AND turn left)
    3. Westbound traffic (can only go straight)

    Traffic Management Rules:
    1. If traffic is congested in one specific direction, prioritize that direction
    2. If traffic is congested in multiple directions:
       - If eastbound is one of them, prioritize it since it can handle more cars (straight + turn)
       - Otherwise, pick the most congested direction
    3. If traffic is congested in all directions:
       - Cycle through directions, starting with eastbound
    4. For emergency vehicles, always prioritize their direction
    5. Only one direction can have green lights at a time
    6. For eastbound traffic:
       - Can set straight and turn signals independently
       - If traffic is heavy in both straight and turn lanes, allow both
       - If only one is congested, prioritize that one

    Traffic situation: {situation}

    Respond with ONLY these exact words in this exact format (no other text):
    north: red
    east_straight: red
    east_turn: red
    west: red

    Replace 'red' with 'green' where appropriate based on the traffic situation."""
    
    try:
        # Get Gemini's response
        response = model.generate_content(prompt.format(situation=situation))
        response_text = response.text.strip()
        
        # Parse the response into a dictionary
        states = {}
        for line in response_text.split('\n'):
            key, value = line.split(': ')
            states[key.strip()] = value.strip()
        
        # Validate the response format
        required_keys = ["north", "east_straight", "east_turn", "west"]
        if not all(key in states for key in required_keys):
            raise ValueError(f"Missing required keys in response. Got: {states.keys()}")
        
        # Validate each state
        for key, value in states.items():
            value = value.lower()
            if value not in ["red", "green"]:
                states[key] = "red"  # Default to red for safety
            else:
                states[key] = value
        
        return states
        
    except Exception as e:
        print(f"Error processing traffic lights: {str(e)}")
        # If any error occurs, return all red for safety
        return {
            "north": "red",
            "east_straight": "red",
            "east_turn": "red",
            "west": "red"
        }

@controller.on_rest_post("/lights", Request, Response)
async def handle_traffic_message(ctx: Context, req: Request) -> Response:
    # Get traffic light states from Gemini
    states = await determine_traffic_light_states(req.text)
    
    # Send commands to each traffic light
    await ctx.send(TRAFFIC_LIGHT_1_ADDRESS, ControllerMessage(
        text="Direct command",
        color=states["north"],
        turn_color="red"  # Not used but needed for schema compatibility
    ))
    await ctx.send(TRAFFIC_LIGHT_2_ADDRESS, ControllerMessage(
        text="Direct command",
        color=states["east_straight"],
        turn_color=states["east_turn"]
    ))
    await ctx.send(TRAFFIC_LIGHT_3_ADDRESS, ControllerMessage(
        text="Direct command",
        color=states["west"],
        turn_color="red"  # Not used but needed for schema compatibility
    ))
    
    ctx.logger.info(f"Traffic situation: {req.text}")
    ctx.logger.info(f"""Set traffic light states:
        North: {states['north']}
        East Straight: {states['east_straight']}
        East Left Turn: {states['east_turn']}
        West: {states['west']}""")
    
    return Response(message="Traffic light states updated")

@controller.on_rest_get("/north", response=LightStatus)
async def get_north_status(ctx: Context) -> LightStatus:
    try:
        with open("light1.json", "r") as f:
            state = json.load(f)
        return LightStatus(color=state["color"])
    except Exception as e:
        ctx.logger.error(f"Error reading north light status: {str(e)}")
        return LightStatus(color="red")  # Default to red for safety

@controller.on_rest_get("/east", response=LightStatus)
async def get_east_status(ctx: Context) -> LightStatus:
    try:
        with open("light2.json", "r") as f:
            state = json.load(f)
        return LightStatus(color=state["straight"], turn_color=state["left_turn"])
    except Exception as e:
        ctx.logger.error(f"Error reading east light status: {str(e)}")
        return LightStatus(color="red", turn_color="red")  # Default to red for safety

@controller.on_rest_get("/west", response=LightStatus)
async def get_west_status(ctx: Context) -> LightStatus:
    try:
        with open("light3.json", "r") as f:
            state = json.load(f)
        return LightStatus(color=state["color"])
    except Exception as e:
        ctx.logger.error(f"Error reading west light status: {str(e)}")
        return LightStatus(color="red")  # Default to red for safety

if __name__ == "__main__":
    controller.run()