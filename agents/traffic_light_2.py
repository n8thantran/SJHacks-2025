from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low
import json
from pathlib import Path

class ControllerMessage(Model):
    text: str
    color: str
    turn_color: str = "red"  # Default to red for left turn

async def update_light_color(ctx: Context, color: str, turn_color: str):
    state = {
        "straight": color,
        "left_turn": turn_color
    }
    with open("light2.json", "w") as f:
        json.dump(state, f)
    if ctx is not None:
        ctx.logger.info(f"Updated traffic light state - Straight: {color}, Left Turn: {turn_color}")

traffic_light = Agent(
    name="traffic_light_2",
    seed="traffic light 2 recovery phrase",
    port=5051,
    endpoint=['http://localhost:5051/submit']
)

@traffic_light.on_message(ControllerMessage)
async def handle_controller_message(ctx: Context, sender: str, msg: ControllerMessage):
    ctx.logger.info(f"Traffic Light 2 (EAST - straight and left turn) received command - Straight: {msg.color}, Turn: {msg.turn_color}")
    
    # Validate colors
    color = msg.color.lower()
    turn_color = msg.turn_color.lower()
    
    if color not in ["red", "green"]:
        ctx.logger.warning(f"Invalid straight color command: {color}, defaulting to red")
        color = "red"
    
    if turn_color not in ["red", "green"]:
        ctx.logger.warning(f"Invalid turn color command: {turn_color}, defaulting to red")
        turn_color = "red"
    
    await update_light_color(ctx, color, turn_color)

if __name__ == "__main__":
    # Initialize the JSON file if it doesn't exist
    if not Path("light2.json").exists():
        update_light_color(ctx=None, color="red", turn_color="red")
    
    traffic_light.run()
