# TrafficO: Smart Traffic Management System

TrafficO is an AI-powered traffic management system that makes streets smarter. Our solution uses cameras at intersections to detect vehicles and traffic patterns, then automatically adjusts traffic lights to improve flow and prioritize emergency vehicles.

## Features

- **Smart Traffic Detection**: Uses computer vision with existing traffic cameras to count vehicles and identify emergency vehicles
- **Adaptive Signal Control**: AI adjusts traffic light timing based on real-time conditions
- **Emergency Vehicle Priority**: Automatically turns lights green along emergency vehicle routes
- **Connected Intersections**: Traffic lights communicate to coordinate timing for smoother traffic flow
- **Real-time Dashboard**: View current conditions and system performance through an intuitive interface

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Mapping**: Leaflet & React-Leaflet
- **Charts & Data Visualization**: Recharts
- **Icons & UI Components**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/traffico.git
cd traffico
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/src/components/dashboard`: Dashboard components and layout
- `/src/components/map`: Map visualization components
- `/src/components/alerts`: Alert system components
- `/src/components/ui`: Reusable UI components

## Dashboard Features

- **Traffic Map**: Interactive map showing intersections and emergency vehicles
- **Alerts Panel**: Real-time notifications about traffic conditions
- **Statistics Dashboard**: Traffic volume and wait time metrics
- **Intersection Control**: Manual override capability for traffic signals

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

If you have any questions or feedback, please reach out to us at info@traffico.example.com
