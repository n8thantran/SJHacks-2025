#!/bin/zsh

# Function to handle process termination
cleanup() {
    echo "Stopping all agents..."
    kill $(jobs -p)
    exit 0
}

# Set up signal handling
trap cleanup SIGTERM SIGINT SIGQUIT

# Kill any existing Python processes running our agents
echo "Killing any existing agents..."
pkill -f "python traffic_light_1.py"
pkill -f "python traffic_light_2.py"
pkill -f "python traffic_light_3.py"
pkill -f "python controller_agent.py"

# Wait a moment for processes to clear
sleep 1

# Function to run an agent
run_agent() {
    echo "Starting $1..."
    poetry run python "$1" &
}

# Start all agents
run_agent "traffic_light_1.py"
run_agent "traffic_light_2.py"
run_agent "traffic_light_3.py"
run_agent "controller_agent.py"

echo "All agents started. Press Ctrl+C to stop all agents..."

# Wait for all background processes
wait