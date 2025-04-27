from uagents import Agent, Context, Model
from uagents.setup import fund_agent_if_low
import json
from pathlib import Path

class ControllerMessage(Model):
    text: str
    color: str
    turn_color: str = "red"  # Default to red for left turn, needed for schema compatibility

async def update_light_color(ctx: Context, color: str):
    state = {"color": color}
    with open("light1.json", "w") as f:
        json.dump(state, f)
    ctx.logger.info(f"Updated traffic light state to: {color}")

traffic_light = Agent(
    name="traffic_light_1",
    seed="traffic light 1 recovery phrase",
    port=5050,
    endpoint=['http://localhost:5050/submit']
)

@traffic_light.on_message(ControllerMessage)
async def handle_controller_message(ctx: Context, sender: str, msg: ControllerMessage):
    ctx.logger.info(f"Traffic Light 1 (NORTH) received command: {msg.color}")
    
    # Validate color
    color = msg.color.lower()
    if color not in ["red", "green"]:
        ctx.logger.warning(f"Invalid color command: {color}, defaulting to red")
        color = "red"
    
    await update_light_color(ctx, color)

if __name__ == "__main__":
    # Initialize the JSON file if it doesn't exist
    if not Path("light1.json").exists():
        update_light_color(ctx=None, color="red")
    
    traffic_light.run()
