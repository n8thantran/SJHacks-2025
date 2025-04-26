import sys
import os

# Add the current directory to the path so we can import the agents module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import and run the main module
from agents.main import main

if __name__ == "__main__":
    main()
