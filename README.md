# TrafficO: Smart Traffic Management System

## Inspiration

San Jose’s notorious traffic congestion doesn’t just waste time and fuel — it can cost lives when emergency vehicles are delayed. We set out to build a practical, AI-powered system that transforms ordinary intersections into smart, responsive nodes in a citywide network, all without requiring expensive new hardware or disruptive infrastructure changes.

---

## What it does

**TrafficO** is a next-generation traffic management platform that brings real-time intelligence to city streets. Our live dashboard visualizes traffic flow, congestion, and emergency vehicle movement on an interactive map of downtown San Jose. Using advanced AI, TrafficO detects vehicles—including ambulances and fire trucks—directly from camera feeds, tracks their movement, and dynamically adapts traffic signals to clear the way for first responders.

**Key Features:**
- **Live Map Dashboard:** Real-time, interactive map showing street segments, congestion levels, and the precise location of emergency vehicles.
- **AI-Powered Vehicle Detection:** Intersection cameras use state-of-the-art computer vision (RF-DETR-Base + ByteTrack) to detect, classify, and track vehicles—including emergency vehicles—in real time.
- **Emergency Vehicle Priority:** When an ambulance is detected, TrafficO automatically coordinates traffic signals along its route, turning lights green to create a clear corridor.
- **Traffic Camera Integration:** Clickable camera icons display live video feeds and AI-detected vehicle overlays.
- **Street Status Popups:** Instantly view congestion, status, and incident alerts for any street segment.

---

## How we built it

### Frontend

- **React + Next.js:** Modern, high-performance web app for the operator dashboard.
- **Mapbox GL:** Interactive map with custom layers for streets, vehicles, and cameras, supporting smooth real-time updates and animations.
- **Live Vehicle Animation:** Emergency vehicles are tracked and animated along real routes, with speed and position updated using accurate geospatial calculations.
- **Session Persistence:** Vehicle positions, routes, and UI state persist across reloads for seamless operator experience.
- **Camera & AI Integration:** Camera markers trigger live video feeds, with overlays showing AI-detected vehicles and emergency alerts.
- **Operator-Centric Design:** High-contrast, data-rich interface with popups and alerts created for clarity and speed under pressure.

### Backend

- **FastAPI:** High-performance backend serving live video feeds, handling AI inference requests, and managing traffic signal logic.
- **Real AI Detection:** Integrated YoloV8 for robust vehicle detection and multi-object tracking, enabling accurate, real-time identification of all vehicles—including emergency responders—even in challenging conditions.
- **Agent-Based Signal Control:** Each intersection acts as an AI agent, communicating with adjacent nodes to coordinate signal timing and optimize traffic flow citywide.
- **Scalable Architecture:** Modular design allows easy expansion to more intersections, additional camera feeds, and new AI models.

---

## How it actually works

- **End-to-End AI Pipeline:** Live camera feeds are processed by our AI models to detect and track vehicles, with results visualized instantly on the dashboard.
- **Dynamic Signal Control:** When an emergency vehicle is detected, the system automatically preempts signals along its route, ensuring rapid, unobstructed passage.
- **Operator in the Loop:** Human operators can monitor, override, or confirm AI-driven actions at any time, ensuring safety and accountability.
- **Agent-Based Communication:** Traffic signals share information with neighboring intersections, enabling coordinated, citywide traffic management.

---

## Challenges we overcame

- **Real-Time AI Integration:** Achieving low-latency, high-accuracy vehicle detection and tracking from live video feeds.
- **Mapbox & UI Sync:** Ensuring smooth, real-time animation and state synchronization between the AI backend and the interactive map.
- **Scalability:** Designing a modular, agent-based architecture ready for city-scale deployment.
- **Camera Quality:** Sourcing usable intersection footage; we borrowed high-quality video from another city due to local camera limitations.

---

## Accomplishments we’re proud of

- **Fully Functional AI Demo:** End-to-end system with live AI detection, tracking, and map visualization.
- **Operator-Ready Dashboard:** Clean, intuitive interface modeled after real-world dispatch centers.
- **Agent-Based, Expandable Design:** Ready for real-world deployment and easy scaling to more intersections and cities.

---

## What’s next

- **Citywide Rollout:** Expand to more intersections and integrate with real San Jose camera feeds as they become available.
- **Advanced Analytics:** Add historical and predictive analytics for city planners and emergency services.
- **Mobile & Multi-Operator Support:** Enable access from tablets and multi-screen dispatch centers.

---

## Try it out

- **Frontend:** React/Next.js, Mapbox, TypeScript
- **Backend:** FastAPI, RF-DETR-Base, ByteTrack
- **How to run:** `npm run dev` (frontend), `uvicorn main:app` (backend)

---

## Links

- [GitHub Repo](https://github.com/n8thantran/SJHacks-2025)
- [Demo Video](#)
- [Demo Slides](https://docs.google.com/presentation/d/1cesmYvw1MQ_Zr_5Ol6HrijHAw-WvadYTsXphrBEbOHc/edit?usp=sharing)

---

## Team

- Nathan Tran 
- Mizan Rupan-Tompkins
- Jason Huynh
- Hunter Nguyen

> *Note: Due to limited access to high-quality San Jose intersection cameras, we used footage from another city for our demo. The system is fully ready for local deployment as soon as suitable feeds are available.*
