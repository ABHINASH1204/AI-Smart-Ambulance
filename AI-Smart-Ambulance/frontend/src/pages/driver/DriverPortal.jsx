import React, { useState } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import EmergencyMap from "../../components/map/EmergencyMap";
import {
  Navigation,
  CheckCircle,
  Phone,
  MapPin,
  Building2,
  AlertCircle,
  Shield,
  Activity,
  ArrowRight,
  Flame,
} from "lucide-react";

export default function DriverPortal() {
  const {
    driverAmbulance,
    driverActiveTrip,
    driverEmergency,
    driverHospital,
    advanceTripStatus,
    ambulances,
    setDriverVehicleId,
    dispatchAmbulance,
    emergencies,
    hospitals,
  } = useEmergency();

  const [isOnDuty, setIsOnDuty] = useState(true);

  // Stepper definition
  const STEPS = [
    { key: "ASSIGNED", label: "Assigned" },
    { key: "EN_ROUTE", label: "En Route to Patient" },
    { key: "ARRIVED_AT_PATIENT", label: "At Scene" },
    { key: "PATIENT_PICKED_UP", label: "Patient Onboard" },
    { key: "EN_ROUTE_TO_HOSPITAL", label: "En Route Hospital" },
    { key: "ARRIVED_AT_HOSPITAL", label: "At Hospital" },
    { key: "COMPLETED", label: "Mission Completed" },
  ];

  const currentStatusIndex = driverActiveTrip
    ? STEPS.findIndex((s) => s.key === driverActiveTrip.status)
    : -1;

  const handleNextStep = async () => {
    if (!driverActiveTrip) return;
    const nextIndex = currentStatusIndex + 1;
    if (nextIndex < STEPS.length) {
      const nextStatus = STEPS[nextIndex].key;
      await advanceTripStatus(driverActiveTrip.id, nextStatus);
    }
  };

  const getActionBtnText = () => {
    switch (driverActiveTrip?.status) {
      case "ASSIGNED":
        return "🚨 ACCEPT MISSION & ROLL OUT (EN ROUTE)";
      case "EN_ROUTE":
        return "📍 MARK ARRIVED AT PATIENT LOCATION";
      case "ARRIVED_AT_PATIENT":
        return "🚑 PATIENT STABILIZED & SECURED ONBOARD";
      case "PATIENT_PICKED_UP":
        return "🏥 COMMENCE TRANSIT TO HOSPITAL";
      case "EN_ROUTE_TO_HOSPITAL":
        return "🏁 MARK ARRIVED AT HOSPITAL ER";
      case "ARRIVED_AT_HOSPITAL":
        return "✅ PATIENT HANDOVER COMPLETE (END TRIP)";
      default:
        return "ADVANCE TRIP";
    }
  };

  // If driver doesn't have an active trip, find the first pending emergency to accept for demo
  const pendingEmergency = emergencies.find(
    (e) => e.status === "REQUESTED" || !e.assigned_ambulance_id
  );

  const handleAcceptPendingDemo = async () => {
    if (pendingEmergency && driverAmbulance) {
      await dispatchAmbulance(
        pendingEmergency.id,
        driverAmbulance.id,
        hospitals[0]?.id || 1
      );
    }
  };

  return (
    <div className="driver-grid">
      {/* Left Column: Driver Control Panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto" }}>
        {/* Unit Identity & Duty Status */}
        <div className="glass-panel">
          <div className="glass-panel-header">
            <div className="panel-title">
              <Navigation size={20} color="#fbbf24" />
              <span>AMBULANCE PILOT COCKPIT</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <select
                className="form-select"
                style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                value={driverAmbulance?.id || 1}
                onChange={(e) => setDriverVehicleId(Number(e.target.value))}
              >
                {ambulances.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.vehicle_number} ({a.ambulance_type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc" }}>
                {driverAmbulance?.vehicle_number}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                Pilot: <strong>{driverAmbulance?.driver_name || "Assigned Driver"}</strong> • {driverAmbulance?.ambulance_type} ALS
              </div>
            </div>

            <button
              className={`btn ${isOnDuty ? "btn-primary" : "btn-outline"}`}
              style={{
                padding: "0.4rem 0.9rem",
                fontSize: "0.75rem",
                borderRadius: "var(--radius-full)",
              }}
              onClick={() => setIsOnDuty(!isOnDuty)}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isOnDuty ? "#10b981" : "#64748b",
                  display: "inline-block",
                }}
              ></span>
              {isOnDuty ? "ON DUTY (ACTIVE)" : "OFF DUTY"}
            </button>
          </div>
        </div>

        {/* Mission Status / Trip Stepper */}
        {driverActiveTrip && driverEmergency ? (
          <div className="glass-panel" style={{ border: "1px solid rgba(245, 158, 11, 0.4)" }}>
            <div className="glass-panel-header">
              <div className="panel-title" style={{ color: "#fbbf24" }}>
                <Flame size={20} color="#f59e0b" />
                ACTIVE DISPATCH MISSION #{driverActiveTrip.id}
              </div>
              <span className="badge badge-high">{driverActiveTrip.status}</span>
            </div>

            {/* Patient & Incident Overview */}
            <div
              style={{
                background: "rgba(0, 0, 0, 0.35)",
                padding: "0.9rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1rem",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span className="badge badge-critical" style={{ fontSize: "0.7rem" }}>
                  {driverEmergency.severity} SEVERITY
                </span>
                <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                  Priority: {Math.round((driverEmergency.priority_score || 0.8) * 100)}%
                </span>
              </div>

              <div style={{ fontSize: "1rem", fontWeight: "700", color: "#f87171" }}>
                {driverEmergency.emergency_type}
              </div>

              <div style={{ marginTop: "0.5rem", fontSize: "0.82rem", color: "#cbd5e1" }}>
                <div>Patient / Caller: <strong>{driverEmergency.caller_name || "Citizen"}</strong></div>
                <div>Contact: <strong>{driverEmergency.caller_phone || "+91 98000 00000"}</strong></div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "4px" }}>
                  <MapPin size={14} color="#06b6d4" />
                  <span>Lat: {driverEmergency.latitude}, Lng: {driverEmergency.longitude}</span>
                </div>
              </div>
            </div>

            {/* Target Destination Hospital */}
            {driverHospital && (
              <div
                style={{
                  background: "rgba(2, 132, 199, 0.1)",
                  padding: "0.85rem",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "1.25rem",
                  border: "1px solid rgba(2, 132, 199, 0.25)",
                }}
              >
                <div style={{ fontSize: "0.72rem", color: "#38bdf8", textTransform: "uppercase" }}>
                  Destination Hospital
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc" }}>
                  🏥 {driverHospital.name}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                  {driverHospital.address}
                </div>
              </div>
            )}

            {/* Stepper Progress Visualizer */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.6rem" }}>
                MISSION PROGRESSION (STEP {Math.max(1, currentStatusIndex + 1)} / {STEPS.length - 1})
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                {STEPS.slice(0, 6).map((step, idx) => (
                  <div
                    key={step.key}
                    style={{
                      flex: 1,
                      height: "6px",
                      borderRadius: "3px",
                      background:
                        idx <= currentStatusIndex ? "#10b981" : "rgba(255,255,255,0.12)",
                      boxShadow: idx <= currentStatusIndex ? "0 0 8px rgba(16, 185, 129, 0.6)" : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Big Action Button to Advance Step */}
            <button
              onClick={handleNextStep}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "0.95rem",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)",
                color: "#030712",
                fontWeight: "800",
              }}
            >
              {getActionBtnText()}
            </button>
          </div>
        ) : (
          /* Idle Duty State */
          <div className="glass-panel" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              <CheckCircle size={30} color="#10b981" />
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc" }}>
              Ambulance Is Available & Patrolling
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.5rem" }}>
              Telemetry is broadcasting location to dispatch center. Standing by for incoming 108 emergency alerts.
            </p>

            {pendingEmergency && (
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "var(--radius-md)",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                  <AlertCircle size={16} color="#ef4444" />
                  <strong style={{ color: "#ef4444", fontSize: "0.85rem" }}>
                    INCOMING DISPATCH OPPORTUNITY
                  </strong>
                </div>
                <div style={{ fontSize: "0.9rem", color: "#f8fafc", fontWeight: "600" }}>
                  {pendingEmergency.emergency_type}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8", margin: "4px 0 10px" }}>
                  Severity: {pendingEmergency.severity} • Caller: {pendingEmergency.caller_name || "Citizen"}
                </div>
                <button
                  className="btn btn-danger"
                  style={{ width: "100%", padding: "0.6rem" }}
                  onClick={handleAcceptPendingDemo}
                >
                  Accept Dispatch Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Live Turn-by-Turn Navigation Map */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <EmergencyMap
          focusCenter={
            driverEmergency
              ? [driverEmergency.latitude, driverEmergency.longitude]
              : driverAmbulance
              ? [driverAmbulance.latitude, driverAmbulance.longitude]
              : null
          }
          showRoute={true}
        />
      </div>
    </div>
  );
}
