import React, { useState } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { BHUBANESWAR_CENTER } from "../../services/mockData";
import {
  Siren,
  PhoneCall,
  Navigation,
  Activity,
  RefreshCw,
  Cpu,
  MapPin,
  Crosshair,
} from "lucide-react";

export default function Navbar({ onOpenDirectSos }) {
  const {
    currentRole,
    setCurrentRole,
    backendOnline,
    refreshAll,
    loading,
    triggerCitizenEmergency,
    userLocation,
    setUserLocationAndCluster,
    fetchCurrentLocation,
    isDetectingLocation,
    activeBooking,
    citizenEmergency,
  } = useEmergency();

  const handleSimulateRandomEmergency = () => {
    // Generate a quick random incident in city radius
    const randomOffsetLat = (Math.random() - 0.5) * 0.02;
    const randomOffsetLng = (Math.random() - 0.5) * 0.02;
    const types = [
      "Acute Cardiac Distress",
      "Road Collision on NH-16",
      "Severe Respiratory Failure",
      "Pedestrian Injury near Market",
      "Emergency Trauma Triage",
    ];
    const severities = ["CRITICAL", "HIGH", "CRITICAL"];

    const baseLat = userLocation?.lat || 20.2961;
    const baseLng = userLocation?.lng || 85.8245;

    triggerCitizenEmergency({
      emergency_type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      latitude: parseFloat((baseLat + randomOffsetLat).toFixed(4)),
      longitude: parseFloat((baseLng + randomOffsetLng).toFixed(4)),
      caller_name: "Simulated Dispatch Alert",
      caller_phone: "+91 94370 99999",
      address_hint: userLocation?.address || "Bhubaneswar Local Stand",
    });
  };

  const handleAutoPatchLocation = async () => {
    await fetchCurrentLocation(true);
  };

  const handleResetToBhubaneswar = async () => {
    await setUserLocationAndCluster(
      BHUBANESWAR_CENTER.lat,
      BHUBANESWAR_CENTER.lng,
      BHUBANESWAR_CENTER.name,
      false
    );
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
            <span className="brand-badge">ODISHA 108</span>
          </div>
          <div className="brand-subtitle">
            Emergency Response & Route Optimization
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

        {/* Dedicated Ambulance Tracking Feature */}
        <button
          className={`role-tab-btn tracking ${currentRole === "TRACKING" ? "active" : ""}`}
          onClick={() => setCurrentRole("TRACKING")}
          title="Track Dispatched Ambulance in Real-Time"
          style={{
            background:
              currentRole === "TRACKING"
                ? "rgba(239, 68, 68, 0.25)"
                : (activeBooking || citizenEmergency)
                ? "rgba(239, 68, 68, 0.12)"
                : undefined,
            borderColor:
              currentRole === "TRACKING" || activeBooking || citizenEmergency
                ? "rgba(239, 68, 68, 0.45)"
                : undefined,
            color:
              currentRole === "TRACKING" || activeBooking || citizenEmergency
                ? "#ef4444"
                : undefined,
            position: "relative",
          }}
        >
          <Navigation size={16} color="#ef4444" />
          <span>Ambulance Tracking</span>
          {(activeBooking || citizenEmergency) && (
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#ef4444",
                boxShadow: "0 0 8px #ef4444",
                display: "inline-block",
                marginLeft: "4px",
              }}
            ></span>
          )}
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

      {/* Connectivity, Location & Quick Tools */}
      <div className="nav-actions">
        {/* Active City / GPS Auto-Patch Badge */}
        <div
          className="location-pill"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "rgba(15, 23, 42, 0.75)",
            border: "1px solid rgba(6, 182, 212, 0.3)",
            padding: "0.3rem 0.6rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.74rem",
          }}
        >
          <MapPin size={13} color="#06b6d4" />
          <span
            style={{
              maxWidth: "140px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "#f8fafc",
              fontWeight: "600",
            }}
            title={userLocation?.address || "Bhubaneswar, Odisha"}
          >
            {userLocation?.address?.split(",")[0] || "Bhubaneswar"}
          </span>

          {/* Quick 1-tap Auto-patch GPS */}
          <button
            type="button"
            onClick={handleAutoPatchLocation}
            disabled={isDetectingLocation}
            className="btn btn-outline"
            style={{
              padding: "0.15rem 0.45rem",
              fontSize: "0.68rem",
              borderRadius: "10px",
              background: userLocation?.isGpsDetected ? "rgba(16, 185, 129, 0.2)" : "rgba(6, 182, 212, 0.15)",
              color: userLocation?.isGpsDetected ? "#34d399" : "#38bdf8",
              borderColor: userLocation?.isGpsDetected ? "rgba(16, 185, 129, 0.4)" : "rgba(6, 182, 212, 0.3)",
            }}
            title="Fetch and Auto-Patch Live Current Location"
          >
            <Crosshair size={11} className={isDetectingLocation ? "spin-anim" : ""} />
            <span>{isDetectingLocation ? "Fetching..." : userLocation?.isGpsDetected ? "Live GPS" : "Fetch GPS"}</span>
          </button>

          {userLocation?.isGpsDetected && (
            <button
              type="button"
              onClick={handleResetToBhubaneswar}
              className="btn btn-outline"
              style={{
                padding: "0.15rem 0.45rem",
                fontSize: "0.68rem",
                borderRadius: "10px",
                color: "#cbd5e1",
              }}
              title="Reset to Bhubaneswar, Odisha default"
            >
              BBSR
            </button>
          )}
        </div>

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

