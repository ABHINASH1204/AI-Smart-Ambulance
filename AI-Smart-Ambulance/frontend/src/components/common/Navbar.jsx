import React from "react";
import { useEmergency } from "../../context/EmergencyContext";
import {
  Siren,
  PhoneCall,
  Navigation,
  Activity,
  RefreshCw,
  Cpu,
  Layers,
} from "lucide-react";

export default function Navbar({ onOpenDirectSos }) {
  const {
    currentRole,
    setCurrentRole,
    backendOnline,
    refreshAll,
    loading,
    triggerCitizenEmergency,
  } = useEmergency();

  const handleSimulateRandomEmergency = () => {
    // Generate a quick random incident in city radius
    const randomOffsetLat = (Math.random() - 0.5) * 0.03;
    const randomOffsetLng = (Math.random() - 0.5) * 0.03;
    const types = [
      "Acute Cardiac Distress",
      "Highway Vehicle Rollover",
      "Severe Respiratory Failure",
      "Pedestrian Hit-and-Run",
      "Industrial Hazard Injury",
    ];
    const severities = ["CRITICAL", "HIGH", "CRITICAL"];

    triggerCitizenEmergency({
      emergency_type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      latitude: 12.9716 + randomOffsetLat,
      longitude: 77.5946 + randomOffsetLng,
      caller_name: "Simulated Dispatch Alert",
      caller_phone: "+91 91234 56789",
    });
  };

  return (
    <header className="navbar">
      {/* Brand */}
      <div className="nav-brand">
        <div className="brand-icon-wrap">
          <Siren size={22} color="#ffffff" />
        </div>
        <div>
          <div className="brand-title">
            AI SMART AMBULANCE
            <span className="brand-badge">AI DISPATCH</span>
          </div>
          <div className="brand-subtitle">
            Next-Gen Emergency Response & Route Optimization
          </div>
        </div>
      </div>

      {/* Role Navigation Switcher */}
      <nav className="role-tabs" aria-label="Portal Navigation">
        <button
          className={`role-tab-btn citizen ${currentRole === "CITIZEN" ? "active" : ""}`}
          onClick={() => setCurrentRole("CITIZEN")}
          title="Switch to Citizen Emergency Request view"
        >
          <PhoneCall size={16} />
          Citizen SOS
        </button>

        <button
          className={`role-tab-btn driver ${currentRole === "DRIVER" ? "active" : ""}`}
          onClick={() => setCurrentRole("DRIVER")}
          title="Switch to Ambulance Driver console"
        >
          <Navigation size={16} />
          Driver Console
        </button>

        <button
          className={`role-tab-btn admin ${currentRole === "ADMIN" ? "active" : ""}`}
          onClick={() => setCurrentRole("ADMIN")}
          title="Switch to Central Dispatcher Command view"
        >
          <Activity size={16} />
          Dispatcher Admin
        </button>
      </nav>

      {/* Connectivity & Quick Tools */}
      <div className="nav-actions">
        <button
          className="btn btn-danger nav-direct-sos-btn"
          onClick={onOpenDirectSos}
          style={{
            padding: "0.42rem 0.95rem",
            fontSize: "0.82rem",
            fontWeight: "800",
            letterSpacing: "0.03em",
          }}
          title="Instant 1-Tap Direct Emergency Dispatch"
          id="nav-direct-sos-trigger"
        >
          <Siren size={16} className="siren-pulse-anim" />
          <span>DIRECT SOS</span>
        </button>

        <button
          className="btn btn-outline"
          onClick={handleSimulateRandomEmergency}
          style={{ padding: "0.4rem 0.8rem", fontSize: "0.78rem" }}
          title="Add a test emergency call to the queue"
        >
          <Cpu size={14} color="#06b6d4" />
          Test SOS
        </button>

        <button
          className="btn btn-outline"
          onClick={refreshAll}
          style={{ padding: "0.4rem 0.6rem" }}
          title="Refresh fleet data"
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "spin-anim" : ""} />
        </button>

        <div
          className={`status-indicator-pill ${backendOnline ? "" : "sim"}`}
          title={
            backendOnline
              ? "Connected to FastAPI Backend (http://localhost:8000)"
              : "Backend offline — Interactive Simulation Mode Active"
          }
        >
          <span className="status-dot"></span>
          <span>{backendOnline ? "API Live" : "Sim Mode"}</span>
        </div>
      </div>
    </header>
  );
}
