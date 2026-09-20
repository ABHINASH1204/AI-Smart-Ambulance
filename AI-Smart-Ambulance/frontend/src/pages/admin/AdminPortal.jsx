import React, { useState } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import EmergencyMap from "../../components/map/EmergencyMap";
import {
  Activity,
  Ambulance,
  Building2,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Send,
  Bed,
  MapPin,
  ChevronRight,
  Filter,
} from "lucide-react";
import { calculateDistanceKm } from "../../services/mockData";

export default function AdminPortal() {
  const {
    emergencies,
    ambulances,
    hospitals,
    selectedEmergency,
    setSelectedEmergencyId,
    dispatchAmbulance,
    advanceTripStatus,
    trips,
  } = useEmergency();

  const [activeTab, setActiveTab] = useState("DISPATCH"); // 'DISPATCH' | 'HOSPITALS' | 'FLEET'
  const [isDispatching, setIsDispatching] = useState(false);

  // Selected ambulance & hospital for manual or AI override
  const [selectedAmbId, setSelectedAmbId] = useState(null);
  const [selectedHospId, setSelectedHospId] = useState(null);

  // Metrics
  const activeEmergCount = emergencies.filter((e) => e.status !== "COMPLETED").length;
  const criticalCount = emergencies.filter((e) => e.severity === "CRITICAL" && e.status !== "COMPLETED").length;
  const availableAmbs = ambulances.filter((a) => a.status === "AVAILABLE").length;
  const totalBeds = hospitals.reduce((acc, h) => acc + (h.available_beds || 0), 0);

  // Find nearest ambulance to selected incident
  const availableFleet = ambulances.filter((a) => a.status === "AVAILABLE");
  let recommendedAmbulance = null;
  let recommendedHospital = null;

  if (selectedEmergency) {
    if (availableFleet.length > 0) {
      recommendedAmbulance = availableFleet.reduce((closest, amb) => {
        const d1 = calculateDistanceKm(
          selectedEmergency.latitude,
          selectedEmergency.longitude,
          amb.latitude,
          amb.longitude
        );
        const d2 = calculateDistanceKm(
          selectedEmergency.latitude,
          selectedEmergency.longitude,
          closest.latitude,
          closest.longitude
        );
        return d1 < d2 ? amb : closest;
      }, availableFleet[0]);
    } else {
      recommendedAmbulance = ambulances[0];
    }

    // Recommended hospital based on condition
    const isCritical = selectedEmergency.severity === "CRITICAL";
    const suitableHospitals = hospitals.filter(
      (h) => (!isCritical || h.icu_available) && h.available_beds > 0
    );
    recommendedHospital =
      suitableHospitals.length > 0 ? suitableHospitals[0] : hospitals[0];
  }

  const handleExecuteDispatch = async () => {
    if (!selectedEmergency) return;
    setIsDispatching(true);
    const ambId = selectedAmbId || recommendedAmbulance?.id || ambulances[0]?.id;
    const hospId = selectedHospId || recommendedHospital?.id || hospitals[0]?.id;

    try {
      await dispatchAmbulance(selectedEmergency.id, ambId, hospId);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 110px)", gap: "1rem" }}>
      {/* Top Telemetry Strip */}
      <div className="stats-strip">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-value">{activeEmergCount}</div>
            <div className="stat-label">
              Active Incidents {criticalCount > 0 && <span style={{ color: "#ef4444" }}>({criticalCount} Critical)</span>}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            <Ambulance size={24} />
          </div>
          <div>
            <div className="stat-value">
              {availableAmbs} / {ambulances.length}
            </div>
            <div className="stat-label">Fleet Readiness</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(2, 132, 199, 0.15)", color: "#38bdf8" }}>
            <Bed size={24} />
          </div>
          <div>
            <div className="stat-value">{totalBeds}</div>
            <div className="stat-label">City Hospital Beds Ready</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#a855f7" }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">4.8 <span style={{ fontSize: "0.9rem" }}>MINS</span></div>
            <div className="stat-label">AI Avg Response Time</div>
          </div>
        </div>
      </div>

      {/* Main Split View: City Command Map + Operations Panel */}
      <div className="admin-grid" style={{ flex: 1, minHeight: 0 }}>
        {/* City Map */}
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <EmergencyMap
            focusCenter={
              selectedEmergency
                ? [selectedEmergency.latitude, selectedEmergency.longitude]
                : null
            }
            onEmergencyClick={(emerg) => setSelectedEmergencyId(emerg.id)}
            showRoute={true}
          />
        </div>

        {/* Right Operations Console */}
        <div
          className="glass-panel"
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: "1rem",
          }}
        >
          {/* Subtabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: "0.6rem",
              marginBottom: "1rem",
              gap: "0.5rem",
            }}
          >
            <button
              className={`btn ${activeTab === "DISPATCH" ? "btn-primary" : "btn-outline"}`}
              style={{ flex: 1, padding: "0.4rem 0.6rem", fontSize: "0.78rem" }}
              onClick={() => setActiveTab("DISPATCH")}
            >
              Incident Queue
            </button>
            <button
              className={`btn ${activeTab === "HOSPITALS" ? "btn-primary" : "btn-outline"}`}
              style={{ flex: 1, padding: "0.4rem 0.6rem", fontSize: "0.78rem" }}
              onClick={() => setActiveTab("HOSPITALS")}
            >
              Hospital Beds
            </button>
            <button
              className={`btn ${activeTab === "FLEET" ? "btn-primary" : "btn-outline"}`}
              style={{ flex: 1, padding: "0.4rem 0.6rem", fontSize: "0.78rem" }}
              onClick={() => setActiveTab("FLEET")}
            >
              Fleet Radar
            </button>
          </div>

          {/* TAB 1: Dispatch Queue & AI Recommender */}
          {activeTab === "DISPATCH" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1, overflowY: "auto" }}>
              {/* Incident List */}
              <div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600", marginBottom: "0.5rem" }}>
                  INCOMING EMERGENCY QUEUE ({emergencies.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {emergencies.map((emerg) => {
                    const isSelected = selectedEmergency?.id === emerg.id;
                    const isCrit = emerg.severity === "CRITICAL";
                    return (
                      <div
                        key={emerg.id}
                        onClick={() => setSelectedEmergencyId(emerg.id)}
                        style={{
                          padding: "0.75rem",
                          borderRadius: "var(--radius-md)",
                          background: isSelected
                            ? "rgba(6, 182, 212, 0.15)"
                            : "rgba(0, 0, 0, 0.35)",
                          border: isSelected
                            ? "1px solid #06b6d4"
                            : "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span
                            className={`badge ${isCrit ? "badge-critical" : "badge-high"}`}
                            style={{ fontSize: "0.68rem" }}
                          >
                            {emerg.severity}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>
                            Priority: {Math.round((emerg.priority_score || 0.75) * 100)}%
                          </span>
                        </div>
                        <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "#f8fafc", margin: "4px 0" }}>
                          {emerg.emergency_type}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8" }}>
                          <span>Status: <strong style={{ color: "#38bdf8" }}>{emerg.status}</strong></span>
                          <span>#{emerg.id}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Dispatch Decision Box */}
              {selectedEmergency && (
                <div
                  style={{
                    marginTop: "auto",
                    padding: "0.9rem",
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(139, 92, 246, 0.12))",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#38bdf8", marginBottom: "0.6rem" }}>
                    <Sparkles size={16} />
                    <strong style={{ fontSize: "0.85rem", letterSpacing: "0.04em" }}>
                      AI DISPATCH RECOMMENDATION
                    </strong>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#cbd5e1", marginBottom: "0.8rem", lineHeight: 1.4 }}>
                    <div>
                      Optimal Ambulance:{" "}
                      <strong style={{ color: "#34d399" }}>
                        {recommendedAmbulance?.vehicle_number} ({recommendedAmbulance?.ambulance_type})
                      </strong>
                    </div>
                    <div>
                      Target Hospital:{" "}
                      <strong style={{ color: "#38bdf8" }}>
                        {recommendedHospital?.name} ({recommendedHospital?.available_beds} beds free)
                      </strong>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      fontSize: "0.85rem",
                      background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
                      boxShadow: "0 0 16px rgba(14, 165, 233, 0.4)",
                    }}
                    onClick={handleExecuteDispatch}
                    disabled={isDispatching}
                  >
                    <Send size={15} />
                    <span>{isDispatching ? "TRANSMITTING TO DRIVER..." : "CONFIRM AI DISPATCH & ROUTE"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Hospital Bed Radar */}
          {activeTab === "HOSPITALS" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto" }}>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600" }}>
                NETWORK HOSPITAL CAPACITY
              </div>
              {hospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  style={{
                    padding: "0.85rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.9rem", color: "#38bdf8" }}>{hosp.name}</strong>
                    <span className="badge badge-available">🛏️ {hosp.available_beds} Free</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "3px" }}>
                    {hosp.address}
                  </div>
                  <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
                    {hosp.icu_available && (
                      <span className="badge badge-critical" style={{ fontSize: "0.68rem" }}>ICU Operational</span>
                    )}
                    {hosp.trauma_available && (
                      <span className="badge badge-high" style={{ fontSize: "0.68rem" }}>Trauma Ready</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Fleet Radar */}
          {activeTab === "FLEET" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto" }}>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600" }}>
                AMBULANCE FLEET STATUS ({ambulances.length})
              </div>
              {ambulances.map((amb) => (
                <div
                  key={amb.id}
                  style={{
                    padding: "0.85rem",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>
                      🚑 {amb.vehicle_number}
                    </strong>
                    <span
                      className={`badge ${
                        amb.status === "AVAILABLE"
                          ? "badge-available"
                          : amb.status === "ASSIGNED"
                          ? "badge-assigned"
                          : "badge-en-route"
                      }`}
                    >
                      {amb.status}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>
                    <div>Type: <strong>{amb.ambulance_type} Life Support</strong></div>
                    <div>Pilot: {amb.driver_name || "Active Crew"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
