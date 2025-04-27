@echo off
REM Kill any existing Python processes running traffic lights
taskkill /F /IM python.exe /FI "WINDOWTITLE eq traffic*" 2>nul

REM Wait a moment for processes to close
timeout /t 2 /nobreak >nul

REM Start each traffic light in a new window with a title
start "traffic-light-1" cmd /c "poetry run python traffic_light_1.py"
start "traffic-light-2" cmd /c "poetry run python traffic_light_2.py"
start "traffic-light-3" cmd /c "poetry run python traffic_light_3.py"

REM Wait for traffic lights to initialize
timeout /t 2 /nobreak >nul

REM Start the controller in a new window
start "traffic-controller" cmd /c "poetry run python controller_agent.py"

echo Traffic Light System Started
echo Use these endpoints to interact:
echo   - Set lights: curl -X POST http://localhost:5052/lights -H "Content-Type: application/json" -d "{\"text\": \"YOUR TRAFFIC SITUATION\"}"
echo   - Check north: curl http://localhost:5052/north
echo   - Check east:  curl http://localhost:5052/east
echo   - Check west:  curl http://localhost:5052/west
echo.
echo To stop the system, run: stop.bat