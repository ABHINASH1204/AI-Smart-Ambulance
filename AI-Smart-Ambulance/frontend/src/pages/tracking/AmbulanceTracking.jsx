import React, { useState, useEffect, useRef } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import EmergencyMap from "../../components/map/EmergencyMap";
import {
  Ambulance,
  Phone,
  Building2,
  Clock,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Share2,
  XCircle,
  Volume2,
  VolumeX,
  HeartPulse,
  MapPin,
  Flame,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function AmbulanceTracking() {
  const {
    activeBooking,
    citizenEmergency,
    ambulances,
    hospitals,
    userLocation,
    cancelCitizenEmergency,
    advanceTripStatus,
    setCurrentRole,
  } = useEmergency();

  // Find booking context
  const emergency = activeBooking?.emergency || citizenEmergency || {
    id: 101,
    caller_name: "Citizen Patient",
    caller_phone: "+91 94370 12345",
    emergency_type: "Cardiac Distress / Acute Chest Pain",
    severity: "CRITICAL",
    status: "EN_ROUTE",
    latitude: userLocation?.lat || 20.2961,
    longitude: userLocation?.lng || 85.8245,
    address_hint: userLocation?.address || "Bhubaneswar, Odisha",
  };

  const assignedAmbulance =
    activeBooking?.ambulance ||
    ambulances.find((a) => a.id === emergency.assigned_ambulance_id) ||
    ambulances[0] || {
      vehicle_number: "OD-02-AMB-108",
      driver_name: "Ramesh Chandra Sahoo",
      driver_phone: "+91 94370 12345",
      ambulance_type: "ICU",
      status: "EN_ROUTE",
      equipment: ["Ventilator", "Defibrillator", "Oxygen", "Multipara Monitor"],
    };

  const destinationHospital =
    activeBooking?.hospital ||
    hospitals.find((h) => h.id === emergency.recommended_hospital_id) ||
    hospitals[0] || {
      name: "AIIMS Hospital Bhubaneswar",
      address: "NH-16, Sijua, Patrapada, Bhubaneswar, Odisha 751019",
      available_beds: 38,
      icu_available: true,
    };

  // Tracking Simulation State
  const [secondsRemaining, setSecondsRemaining] = useState(240); // 4 minutes
  const [distanceKm, setDistanceKm] = useState(2.3);
  const [speedKmh, setSpeedKmh] = useState(54);
  const [tripStage, setTripStage] = useState(1); // 0: Requested, 1: Dispatched/En Route, 2: Arrived, 3: In Transit, 4: Admitted
  const [isCopied, setIsCopied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Live countdown timer & distance decrease
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setTripStage(2); // Arrived
          return 0;
        }
        return prev - 1;
      });

      setDistanceKm((prev) => {
        if (prev <= 0.1) return 0;
        return parseFloat((prev - 0.01).toFixed(2));
      });

      // Realistic speed fluctuation
      setSpeedKmh(Math.floor(48 + Math.random() * 12));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const stages = [
    { label: "Dispatch Confirmed", desc: "AI matched nearest vehicle" },
    { label: "Ambulance En Route", desc: "Priority Green Wave active" },
    { label: "Arrived at Patient", desc: "Paramedic team on site" },
    { label: "Transit to Hospital", desc: "Telemetry stream to ER" },
    { label: "Admitted at Hospital", desc: "Care handed to trauma team" },
  ];

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSimulateNextStage = () => {
    if (tripStage < stages.length - 1) {
      setTripStage((s) => s + 1);
      if (tripStage === 0) setSecondsRemaining(180);
      if (tripStage === 1) setSecondsRemaining(30);
      if (tripStage === 2) setSecondsRemaining(300);
    }
  };

  return (
    <div className="tracking-container" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 65px)", padding: "0.75rem 1.25rem", gap: "0.75rem" }}>
      {/* Top Banner: Emergency Status & Fast Actions */}
      <div
        className="glass-panel"
        style={{
          padding: "0.75rem 1.25rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          background: "linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.9) 60%)",
          borderLeft: "5px solid #ef4444",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(239, 68, 68, 0.7)",
            }}
          >
            <Ambulance size={24} color="#fff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: "800", color: "#f8fafc", letterSpacing: "0.5px" }}>
                AMBULANCE LIVE TRACKING
              </span>
              <span className="badge badge-critical" style={{ fontSize: "0.72rem" }}>
                <span className="pulse-dot" style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#fff", marginRight: "5px" }}></span>
                {tripStage === 2 ? "AMBULANCE ARRIVED" : "EN ROUTE • PRIORITY ONE"}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "var(--font-mono)" }}>
                #EMG-{emergency.id || 101}
              </span>
            </div>
            <div style={{ fontSize: "0.82rem", color: "#cbd5e1", marginTop: "2px" }}>
              Pickup Location: <strong style={{ color: "#38bdf8" }}>{emergency.address_hint || "Bhubaneswar, Odisha"}</strong>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <button
            onClick={handleCopyLink}
            className="btn btn-outline"
            style={{ fontSize: "0.75rem", padding: "0.45rem 0.8rem" }}
            title="Share Live Tracking Link"
          >
            <Share2 size={14} />
            <span>{isCopied ? "Link Copied!" : "Share Tracker"}</span>
          </button>

          <button
            onClick={handleSimulateNextStage}
            className="btn btn-outline"
            style={{ fontSize: "0.75rem", padding: "0.45rem 0.8rem", borderColor: "rgba(56, 189, 248, 0.4)", color: "#38bdf8" }}
            title="Simulate Next Dispatch Step"
          >
            <ChevronRight size={14} />
            <span>Step: {stages[Math.min(tripStage + 1, stages.length - 1)].label}</span>
          </button>

          <button
            onClick={() => setShowCancelModal(true)}
            className="btn btn-outline"
            style={{ fontSize: "0.75rem", padding: "0.45rem 0.8rem", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)" }}
            title="Cancel this emergency request"
          >
            <XCircle size={14} />
            <span>Cancel Request</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Split Live Map & Telemetry Dashboard */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "0.75rem", flex: 1, minHeight: 0 }}>
        {/* Left Column: Interactive Map with Route & Live Moving Ambulance */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", padding: "0.5rem", overflow: "hidden", position: "relative" }}>
          {/* Overlay Map Badge */}
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: "14px",
              zIndex: 1000,
              background: "rgba(15, 23, 42, 0.88)",
              backdropFilter: "blur(10px)",
              padding: "6px 12px",
              borderRadius: "20px",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
            }}
          >
            <Radio size={14} color="#10b981" className="pulse-dot" />
            <span style={{ fontSize: "0.75rem", color: "#f8fafc", fontWeight: "600" }}>
              Live GPS Feed: <span style={{ color: "#38bdf8" }}>{assignedAmbulance.vehicle_number}</span>
            </span>
          </div>

          <div style={{ flex: 1, borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <EmergencyMap
              focusCenter={[emergency.latitude, emergency.longitude]}
              customHeight="100%"
              showRoute={true}
              patientLocation={{
                lat: emergency.latitude,
                lng: emergency.longitude,
                address: emergency.address_hint,
              }}
            />
          </div>
        </div>

        {/* Right Column: Tracking Telemetry, ETA Countdown, Driver & ER Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto", paddingRight: "4px" }}>
          {/* Live ETA Card */}
          <div
            className="glass-panel"
            style={{
              background: "linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(15, 23, 42, 0.95))",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              padding: "1rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  ESTIMATED ARRIVAL TIME (ETA)
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "900",
                    color: tripStage === 2 ? "#10b981" : "#38bdf8",
                    fontFamily: "var(--font-mono)",
                    lineHeight: 1.1,
                    margin: "4px 0",
                  }}
                >
                  {tripStage === 2 ? "ARRIVED" : formatTime(secondsRemaining)}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#cbd5e1" }}>
                  {tripStage === 2 ? "Paramedic team is at your location" : `Approximately ${distanceKm} km away from your location`}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(15, 23, 42, 0.7)",
                  borderRadius: "12px",
                  padding: "0.6rem 0.8rem",
                  border: "1px solid var(--border-subtle)",
                  textAlign: "right",
                }}
              >
                <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>CURRENT SPEED</div>
                <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#10b981", fontFamily: "var(--font-mono)" }}>
                  {speedKmh} <span style={{ fontSize: "0.7rem" }}>KM/H</span>
                </div>
                <div style={{ fontSize: "0.65rem", color: "#38bdf8" }}>Priority Green Corridor</div>
              </div>
            </div>

            {/* Stepper Progress */}
            <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                {stages.map((st, idx) => {
                  const isDone = idx < tripStage;
                  const isCurrent = idx === tripStage;
                  return (
                    <div
                      key={st.label}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flex: 1,
                        position: "relative",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: isDone ? "#10b981" : isCurrent ? "#38bdf8" : "#334155",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          boxShadow: isCurrent ? "0 0 10px #38bdf8" : "none",
                          zIndex: 2,
                        }}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <div
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: isCurrent ? "700" : "500",
                          color: isDone ? "#10b981" : isCurrent ? "#f8fafc" : "#64748b",
                          marginTop: "4px",
                          lineHeight: 1.2,
                        }}
                      >
                        {st.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Emergency Driver Contact Card */}
          <div className="glass-panel" style={{ padding: "0.9rem" }}>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              DISPATCHED PARAMEDIC & AMBULANCE UNIT
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#10b981",
                  }}
                >
                  <Ambulance size={22} />
                </div>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: "700", color: "#f8fafc" }}>
                    {assignedAmbulance.vehicle_number}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#cbd5e1" }}>
                    Driver: <strong>{assignedAmbulance.driver_name || "Emergency Pilot"}</strong>
                  </div>
                </div>
              </div>
              <span className="badge badge-high">{assignedAmbulance.ambulance_type} ALS</span>
            </div>

            {/* Direct Call Button */}
            <div style={{ marginTop: "0.75rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <a
                href={`tel:${assignedAmbulance.driver_phone || "+919437012345"}`}
                className="btn btn-primary"
                style={{ justifyContent: "center", fontSize: "0.8rem", padding: "0.5rem", textDecoration: "none" }}
              >
                <Phone size={15} />
                <span>Call Driver</span>
              </a>
              <a
                href="tel:108"
                className="btn btn-outline"
                style={{ justifyContent: "center", fontSize: "0.8rem", padding: "0.5rem", borderColor: "rgba(239, 68, 68, 0.4)", color: "#ef4444", textDecoration: "none" }}
              >
                <AlertTriangle size={15} />
                <span>Call 108 Control</span>
              </a>
            </div>

            {/* Onboard Medical Equipment */}
            <div style={{ marginTop: "0.6rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {(assignedAmbulance.equipment || ["Ventilator", "Defibrillator", "Oxygen"]).map((eq) => (
                <span
                  key={eq}
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "0.68rem",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    color: "#94a3b8",
                  }}
                >
                  ✓ {eq}
                </span>
              ))}
            </div>
          </div>

          {/* Destination Hospital Card */}
          <div className="glass-panel" style={{ padding: "0.9rem" }}>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              RESERVED EMERGENCY HOSPITAL
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(56, 189, 248, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#38bdf8",
                  flexShrink: 0,
                }}
              >
                <Building2 size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#38bdf8" }}>
                  {destinationHospital.name}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "2px" }}>
                  {destinationHospital.address}
                </div>
                <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
                  <span className="badge badge-medium" style={{ fontSize: "0.68rem" }}>
                    🛏️ {destinationHospital.available_beds || 24} Emergency Beds Free
                  </span>
                  <span className="badge badge-critical" style={{ fontSize: "0.68rem" }}>
                    Trauma Ward Alerted
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* First-Aid Immediate Advice */}
          <div
            className="glass-panel"
            style={{
              padding: "0.85rem",
              background: "rgba(6, 182, 212, 0.06)",
              border: "1px solid rgba(6, 182, 212, 0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#38bdf8", fontWeight: "700", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
              <HeartPulse size={16} />
              <span>While Waiting For Paramedics:</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.78rem", color: "#cbd5e1", lineHeight: "1.4" }}>
              <li>Keep patient calm and lying down in a comfortable position.</li>
              <li>Ensure clear airway; do not offer water, food, or oral medication.</li>
              <li>Have someone wave at the main street/junction when the siren is heard.</li>
              <li>Keep the patient's identity proof and medical history documents handy.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Cancelling Emergency */}
      {showCancelModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: "420px",
              width: "100%",
              padding: "1.5rem",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <AlertTriangle size={28} color="#ef4444" />
              <h3 style={{ color: "#f8fafc", margin: 0, fontSize: "1.15rem" }}>
                Cancel Emergency Request?
              </h3>
            </div>
            <p style={{ color: "#cbd5e1", fontSize: "0.85rem", lineHeight: "1.5", marginBottom: "1.5rem" }}>
              Are you sure you want to cancel? Ambulance <strong>{assignedAmbulance.vehicle_number}</strong> is already en route to your location.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="btn btn-outline"
                style={{ fontSize: "0.85rem" }}
              >
                No, Keep Tracking
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowCancelModal(false);
                  await cancelCitizenEmergency();
                }}
                className="btn btn-primary"
                style={{ background: "#ef4444", fontSize: "0.85rem" }}
              >
                Yes, Cancel Emergency
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
