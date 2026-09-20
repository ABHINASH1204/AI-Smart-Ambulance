# AI Smart Ambulance — Frontend & Maps Progress & Future Roadmap

**Project**: AI-Powered Smart Ambulance Emergency Response & Route Optimization System  
**Role**: Member 2 (Frontend + Maps)  
**Author**: Pradyumna (`pradyumna3437-Data`)  
**Date**: 21 September 2026  
**Repository**: [https://github.com/pradyumna3437-Data/AI-Smart-Ambulance](https://github.com/pradyumna3437-Data/AI-Smart-Ambulance)  

---

## 📌 Executive Summary

Today, we built and deployed the complete **Frontend & Maps foundation** for the AI Smart Ambulance project. The application serves as an intelligent command center and emergency dispatch portal designed to drastically cut ambulance response times through automated triage, live fleet visualization, and route optimization.

The frontend is fully functional, supports real-time map interactions via Leaflet and OpenStreetMap, and operates in a **resilient dual-mode** (connecting to the Python FastAPI backend when active, or falling back seamlessly to an interactive city simulation mode for standalone demonstrations).

---

## 🛠️ Work Done Today

### 1. Modern Command-Center Design System (`src/index.css`)
- **Theme**: High-contrast, dark-mode command center palette (`#060913` background, `#0c1222` surface).
- **Glassmorphism**: Translucent backdrop-filtered panels (`rgba(14, 22, 41, 0.72)` with blur) for telemetry data and control cards.
- **Accents & Triage Colors**:
  - `CRITICAL` / Emergency SOS: Crimson Red (`#ef4444`) with siren glow and pulsing ring animations.
  - `HIGH` / Caution / Assigned: Amber (`#f59e0b`).
  - `AVAILABLE` / Success: Emerald Green (`#10b981`).
  - Tech / Route / Medical: Cyan (`#06b6d4`) and Sky Blue (`#38bdf8`).
- **Typography & Polish**: Integrated Google Fonts (*Plus Jakarta Sans* for UI, *JetBrains Mono* for telemetry/timers).

### 2. Interactive Map Engine (`src/components/map/EmergencyMap.jsx`)
- Built on top of **Leaflet** and **OpenStreetMap** (100% open-source, no external API billing required).
- **Custom Vector DivIcons**:
  - 🚑 **Ambulance Units**: Color-coded by state (`AVAILABLE`, `ASSIGNED`, `EN_ROUTE` with animated siren pulse).
  - 🆘 **Emergency Pins**: Pulsing radar rings displaying caller name, triage category, and AI priority score.
  - 🏥 **Hospital Pins**: Medical cross markers indicating live bed availability, ICU readiness, and trauma capability.
- **Dynamic Route Rendering**: Glowing dual-layer polyline tracing optimal street paths between ambulances, patients, and destination hospitals.

### 3. Three Dedicated Role Portals

#### A. Citizen / Patient SOS Portal (`src/pages/user/UserPortal.jsx`)
- **One-Tap SOS Dispatch**: Large prominent emergency trigger button with ripple waves.
- **Triage Selector**: Emergency condition chips (Cardiac Arrest, Road Collision, Respiratory Distress, Major Trauma) and Severity ratings.
- **GPS Auto-Detection**: Pulls coordinates from device geolocation or simulates nearest metro pinpoints.
- **Live Rescue Tracker**: Appears after dispatch with an estimated arrival time (ETA) countdown, vehicle identification, driver contact, and destination hospital summary.

#### B. Ambulance Driver Console (`src/pages/driver/DriverPortal.jsx`)
- **Cockpit Header**: Displays unit identification (e.g., `KA-01-AMB-108`), ALS equipment profile, and an On/Off Duty toggle.
- **Incoming Mission Alert**: Visual and audible dispatch notification with instant 1-tap acceptance.
- **7-Step Mission Stepper**: Enables the driver to progress through the entire operational cycle:
  $$\text{Assigned} \longrightarrow \text{En Route} \longrightarrow \text{At Scene} \longrightarrow \text{Patient Onboard} \longrightarrow \text{En Route Hospital} \longrightarrow \text{At Hospital} \longrightarrow \text{Mission Completed}$$
- Updates fleet status across the system in real time.

#### C. Central Dispatcher Admin Command Center (`src/pages/admin/AdminPortal.jsx`)
- **Real-Time Telemetry Bar**: Monitors active incidents, critical cases, available fleet ratio, city hospital beds, and average AI response time.
- **Incident Queue**: Prioritized list of distress calls with live status and priority percentage.
- **AI Dispatch Recommendation Engine**: Automatically calculates the closest capable ambulance and recommends an optimal hospital equipped with ICU/trauma facilities based on the emergency condition.
- **Hospital & Fleet Radars**: Real-time capacity monitoring tabs.

### 4. Global State & API Service Layer
- **`src/services/api.js`**: Centralized REST client targeting FastAPI endpoints (`/emergencies/`, `/ambulances/`, `/hospitals/`, `/trips/`, `/routes/`).
- **`src/services/mockData.js`**: High-fidelity seed dataset providing realistic metropolitan coordinates, vehicle fleets, and route geometry.
- **`src/context/EmergencyContext.jsx`**: Reactive React context orchestrating active role switching, fleet synchronization, and route updates.
- **`src/components/common/Navbar.jsx`**: Global header with instant 1-click role switcher tabs and a test SOS injection button.

### 5. Verification, Build & GitHub Deployment
- Compiled production build with Vite in **2.74s** with 0 errors and 0 warnings.
- Verified standalone dev server on `http://localhost:5173/`.
- Configured Git author identity: `pradyumna3437-Data` (`pradyumna3437@gmail.com`).
- Pushed all work to:
  - Team repository: `https://github.com/ABHINASH1204/AI-Smart-Ambulance` (branches: `main` and `frontend`).
  - Personal repository: `https://github.com/pradyumna3437-Data/AI-Smart-Ambulance` (branches: `main` and `frontend`).

---

## 🔮 Future Roadmap (What to Do Next)

Here is the strategic plan for expanding the frontend and integrating with the rest of the team:

### Phase 1: Real-Time Telemetry & WebSockets
- [ ] **Live Moving Ambulance Markers**: Replace static coordinate updates with a WebSocket / SSE feed that smoothly animates ambulance icons along their route as they drive.
- [ ] **Sound Effects / Audio Sirens**: Add an optional emergency siren audio alert when a driver receives a new dispatch or when a critical incident is logged in the control room.

### Phase 2: Full Backend & Database Integration (With Member 1)
- [ ] **Authentication & JWT Session**: Wire the frontend login/register screens to `POST /api/auth/login` and store tokens securely.
- [ ] **Live MySQL Database Sync**: Connect the REST client to the MySQL database tables (`emergencies`, `ambulances`, `hospitals`, `trips`).
- [ ] **Driver Geo-Tracking API**: Implement a periodic background ping (`PATCH /api/ambulances/{id}/location`) to broadcast driver GPS coordinates.

### Phase 3: AI & Machine Learning Integration (With Member 3)
- [ ] **Priority Scoring Model**: Connect the citizen triage form to Person 3's trained ML model (`emergency_priority_model`) to predict severity and priority scores dynamically.
- [ ] **Traffic-Aware ETA Prediction**: Integrate traffic density metrics into the route calculation service to display traffic delays (e.g. Green/Yellow/Red traffic segments on the route line).

### Phase 4: Driver UX & Progressive Web App (PWA)
- [ ] **PWA Support**: Configure `manifest.json` and service workers so ambulance drivers can install the app on Android tablets or phones.
- [ ] **Turn-by-Turn Voice Navigation**: Integrate the Web Speech API to provide voice prompts for drivers during transit (e.g., *"Turn left in 200 meters towards Apex Emergency Institute"*).

### Phase 5: Notifications & Citizen Communications
- [ ] **SMS / WhatsApp Alerts (Twilio)**: Trigger automated SMS updates to the patient's family with a live tracking link when an ambulance is dispatched.
- [ ] **Digital Hospital Pre-Alert**: Send patient vitals and preliminary condition summary directly to the receiving hospital's emergency ward before the ambulance arrives.

### Phase 6: Analytics & Reporting Dashboards
- [ ] **Analytics View**: Embed or link the Streamlit / Power BI dashboard to review average dispatch times, response bottlenecks, and high-frequency incident hotspots across the city.

---

## 📂 Project Structure Overview

```text
AI-Smart-Ambulance/frontend/
├── index.html                   # Fonts, Leaflet CSS & base template
├── package.json                 # Dependencies (React 18, Leaflet, Lucide)
├── vite.config.js               # Vite bundler configuration
└── src/
    ├── App.jsx                  # Root portal coordinator
    ├── main.jsx                 # React DOM mount point
    ├── index.css                # Command-center design system & animations
    ├── components/
    │   ├── common/
    │   │   └── Navbar.jsx       # Header, role switcher, test SOS trigger
    │   └── map/
    │       └── EmergencyMap.jsx # Interactive Leaflet map with custom SVG pins
    ├── context/
    │   └── EmergencyContext.jsx # Reactive global state provider
    ├── pages/
    │   ├── user/
    │   │   └── UserPortal.jsx   # Citizen SOS form & live tracking
    │   ├── driver/
    │   │   └── DriverPortal.jsx # Driver mission cockpit & trip stepper
    │   └── admin/
    │       └── AdminPortal.jsx  # Dispatcher command center & AI engine
    └── services/
        ├── api.js               # Dual-mode REST service layer
        └── mockData.js          # Realistic metro simulation seed data
```
