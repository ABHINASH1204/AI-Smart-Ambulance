import React, { useState, useEffect } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import EmergencyMap from "../../components/map/EmergencyMap";
import AmbulanceTracking from "../tracking/AmbulanceTracking";
import {
  AlertTriangle,
  MapPin,
  Phone,
  User,
  HeartPulse,
  Flame,
  Wind,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Ambulance,
  Building2,
  XCircle,
  Crosshair,
  Sparkles,
} from "lucide-react";

export default function UserPortal() {
  const {
    citizenEmergency,
    activeBooking,
    triggerCitizenEmergency,
    ambulances,
    hospitals,
    trips,
    advanceTripStatus,
    userLocation,
    setUserLocationAndCluster,
    fetchCurrentLocation,
    isDetectingLocation,
    reverseGeocode,
  } = useEmergency();

  // If citizen has an active emergency or booking, show the dedicated Ambulance Tracking feature!
  if (citizenEmergency || activeBooking) {
    return <AmbulanceTracking />;
  }

  const [formData, setFormData] = useState({
    caller_name: "Rahul Mohanty",
    caller_phone: "+91 94370 12345",
    emergency_type: "Cardiac Distress / Chest Pain",
    severity: "CRITICAL",
    latitude: userLocation?.lat || 20.2961,
    longitude: userLocation?.lng || 85.8245,
    address_hint: userLocation?.address || "Bhubaneswar, Odisha",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync formData when global userLocation changes (e.g. from GPS auto-patch)
  useEffect(() => {
    if (!citizenEmergency && userLocation) {
      setFormData((prev) => ({
        ...prev,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        address_hint: userLocation.address,
      }));
    }
  }, [userLocation, citizenEmergency]);

  // Quick emergency types
  const categories = [
    { label: "Cardiac Distress", icon: HeartPulse, type: "Cardiac Arrest / Severe Chest Pain" },
    { label: "Road Accident", icon: AlertTriangle, type: "Severe Road Traffic Accident" },
    { label: "Breathing Issue", icon: Wind, type: "Acute Respiratory Distress" },
    { label: "Trauma / Bleeding", icon: Flame, type: "Major Trauma & Hemorrhage" },
  ];

  // Bhubaneswar & Regional Quick Preset Spots
  const quickLocations = [
    { label: "Master Canteen, BBSR", lat: 20.2675, lng: 85.842, address: "Master Canteen Square, Station Rd, Bhubaneswar" },
    { label: "Patia / KIIT, BBSR", lat: 20.3541, lng: 85.8188, address: "KIIT Square, Patia, Bhubaneswar" },
    { label: "AIIMS Sijua, BBSR", lat: 20.2312, lng: 85.7758, address: "AIIMS Hospital, Sijua, Bhubaneswar" },
    { label: "Khandagiri, BBSR", lat: 20.259, lng: 85.786, address: "Khandagiri Intersection, NH-16, Bhubaneswar" },
  ];

  const handleSelectQuickLocation = async (loc) => {
    setFormData((prev) => ({
      ...prev,
      latitude: loc.lat,
      longitude: loc.lng,
      address_hint: loc.address,
    }));
    await setUserLocationAndCluster(loc.lat, loc.lng, loc.address, false);
  };

  const handleDetectLocation = async () => {
    const res = await fetchCurrentLocation(true);
    if (res && res.success) {
      setFormData((prev) => ({
        ...prev,
        latitude: res.lat,
        longitude: res.lng,
        address_hint: res.address,
      }));
    }
  };

  const handleMapClick = async (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address_hint: "Fetching street address...",
    }));

    const addr = await reverseGeocode(lat, lng);
    setFormData((prev) => ({
      ...prev,
      address_hint: addr,
    }));

    // Update fleet cluster around newly clicked location
    await setUserLocationAndCluster(lat, lng, addr, false);
  };

  const handleSosSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    try {
      await triggerCitizenEmergency({
        caller_name: formData.caller_name,
        caller_phone: formData.caller_phone,
        emergency_type: formData.emergency_type,
        severity: formData.severity,
        latitude: formData.latitude,
        longitude: formData.longitude,
        address_hint: formData.address_hint,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find assigned ambulance & hospital details if this citizen has an active emergency
  const assignedTrip = citizenEmergency
    ? trips.find(
        (t) => t.emergency_id === citizenEmergency.id && t.status !== "COMPLETED"
      )
    : null;

  const assignedAmbulance = assignedTrip
    ? ambulances.find((a) => a.id === assignedTrip.ambulance_id)
    : ambulances.find((a) => a.id === citizenEmergency?.assigned_ambulance_id);

  const recommendedHospital = assignedTrip
    ? hospitals.find((h) => h.id === assignedTrip.hospital_id)
    : hospitals[0];


  return (
    <div className="user-grid">
      {/* Left Column: Request Form OR Active Rescue Tracker */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto" }}>
        {!citizenEmergency ? (
          /* SOS Request Form */
          <div className="glass-panel">
            <div className="glass-panel-header">
              <div className="panel-title">
                <AlertTriangle size={20} color="#ef4444" />
                Emergency Medical Dispatch
              </div>
              <span className="badge badge-critical">CITIZEN PORTAL</span>
            </div>

            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Press the SOS button below to trigger automated AI fleet dispatch.
              The nearest emergency unit will be rerouted instantly.
            </p>

            <form onSubmit={handleSosSubmit}>
              {/* Giant SOS Button */}
              <div style={{ marginBottom: "1.5rem" }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-sos-huge"
                  id="citizen-sos-trigger-btn"
                >
                  <span className="pulse-ring"></span>
                  <HeartPulse size={30} />
                  <span>{isSubmitting ? "DISPATCHING AMBULANCE..." : "DISPATCH EMERGENCY AMBULANCE"}</span>
                </button>
              </div>

              {/* Emergency Category Chips */}
              <div className="form-group">
                <label className="form-label">SELECT EMERGENCY TYPE</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = formData.emergency_type === cat.type;
                    return (
                      <button
                        type="button"
                        key={cat.label}
                        onClick={() =>
                          setFormData({ ...formData, emergency_type: cat.type })
                        }
                        className={`btn ${isSelected ? "btn-primary" : "btn-outline"}`}
                        style={{
                          padding: "0.6rem 0.5rem",
                          fontSize: "0.78rem",
                          justifyContent: "flex-start",
                        }}
                      >
                        <Icon size={16} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Severity Level */}
              <div className="form-group">
                <label className="form-label">TRIAGE SEVERITY</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {["CRITICAL", "HIGH", "MEDIUM"].map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setFormData({ ...formData, severity: lvl })}
                      className={`btn ${
                        formData.severity === lvl
                          ? lvl === "CRITICAL"
                            ? "btn-danger"
                            : "btn-primary"
                          : "btn-outline"
                      }`}
                      style={{ flex: 1, padding: "0.5rem", fontSize: "0.75rem" }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Input with GPS Button */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="form-label">PATIENT LOCATION (COORDINATES)</label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    className="btn btn-outline"
                    style={{
                      padding: "0.22rem 0.65rem",
                      fontSize: "0.72rem",
                      borderColor: "rgba(6, 182, 212, 0.4)",
                      color: "#38bdf8",
                    }}
                    title="Fetch and auto-detect your real live location"
                  >
                    <Crosshair size={12} color="#06b6d4" className={isDetectingLocation ? "spin-anim" : ""} />
                    <span>{isDetectingLocation ? "Detecting Live Location..." : "📍 Fetch Live Location"}</span>
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <input
                    type="number"
                    step="0.0001"
                    className="form-input"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: parseFloat(e.target.value) })
                    }
                    placeholder="Latitude"
                    required
                  />
                  <input
                    type="number"
                    step="0.0001"
                    className="form-input"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: parseFloat(e.target.value) })
                    }
                    placeholder="Longitude"
                    required
                  />
                </div>
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: "0.4rem" }}
                  value={formData.address_hint}
                  onChange={(e) =>
                    setFormData({ ...formData, address_hint: e.target.value })
                  }
                  placeholder="Street / Landmark description (e.g., Near Ram Mandir, Master Canteen)"
                />

                {/* Quick Bhubaneswar / Regional Spot Selector */}
                <div style={{ marginTop: "0.6rem" }}>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: "0.35rem" }}>
                    QUICK BHUBANESWAR HUBS (OR CLICK ANYWHERE ON MAP):
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {quickLocations.map((loc) => (
                      <button
                        type="button"
                        key={loc.label}
                        onClick={() => handleSelectQuickLocation(loc)}
                        className="btn btn-outline"
                        style={{
                          padding: "0.25rem 0.55rem",
                          fontSize: "0.7rem",
                          borderRadius: "14px",
                          borderColor:
                            Math.abs(formData.latitude - loc.lat) < 0.005 &&
                            Math.abs(formData.longitude - loc.lng) < 0.005
                              ? "#06b6d4"
                              : "var(--border-subtle)",
                          color:
                            Math.abs(formData.latitude - loc.lat) < 0.005 &&
                            Math.abs(formData.longitude - loc.lng) < 0.005
                              ? "#38bdf8"
                              : "#94a3b8",
                        }}
                      >
                        📍 {loc.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div className="form-group">
                  <label className="form-label">CALLER NAME</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.caller_name}
                    onChange={(e) =>
                      setFormData({ ...formData, caller_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CONTACT PHONE</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.caller_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, caller_phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Active Emergency Tracking Card */
          <div className="glass-panel" style={{ border: "1px solid rgba(239, 68, 68, 0.4)" }}>
            <div className="glass-panel-header">
              <div className="panel-title">
                <HeartPulse size={22} color="#ef4444" />
                <span>ACTIVE RESCUE IN PROGRESS</span>
              </div>
              <span className="badge badge-critical">
                {citizenEmergency.status}
              </span>
            </div>

            {/* ETA Countdown Alert Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(6, 182, 212, 0.15))",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 15px rgba(239, 68, 68, 0.6)",
                }}
              >
                <Ambulance size={26} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#cbd5e1", textTransform: "uppercase" }}>
                  ESTIMATED ARRIVAL TIME
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
                  ~ 4 - 6 MINS
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  Fastest route calculated via AI Route Optimization
                </div>
              </div>
            </div>

            {/* Assigned Ambulance Card */}
            {assignedAmbulance ? (
              <div
                style={{
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.9rem",
                  marginBottom: "1rem",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.4rem" }}>
                  ASSIGNED AMBULANCE UNIT
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "1.1rem", color: "#f8fafc" }}>
                    🚑 {assignedAmbulance.vehicle_number}
                  </strong>
                  <span className="badge badge-high">{assignedAmbulance.ambulance_type} LIFE SUPPORT</span>
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#cbd5e1" }}>
                  <div>Driver: <strong>{assignedAmbulance.driver_name || "Emergency Pilot"}</strong></div>
                  <div>Direct Line: <strong>{assignedAmbulance.driver_phone || "+91 98000 12345"}</strong></div>
                </div>
              </div>
            ) : (
              <div style={{ padding: "0.8rem", color: "#fbbf24", fontSize: "0.85rem" }}>
                ⏳ Allocating optimal emergency vehicle...
              </div>
            )}

            {/* Recommended Hospital Card */}
            {recommendedHospital && (
              <div
                style={{
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.9rem",
                  marginBottom: "1.25rem",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.4rem" }}>
                  TARGET DESTINATION HOSPITAL
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Building2 size={18} color="#38bdf8" />
                  <strong style={{ color: "#38bdf8", fontSize: "0.95rem" }}>
                    {recommendedHospital.name}
                  </strong>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>
                  {recommendedHospital.address}
                </div>
                <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
                  <span className="badge badge-medium">🛏️ {recommendedHospital.available_beds} Beds Ready</span>
                  {recommendedHospital.icu_available && (
                    <span className="badge badge-critical" style={{ fontSize: "0.68rem" }}>ICU Confirmed</span>
                  )}
                </div>
              </div>
            )}

            {/* Quick First-Aid Guidance */}
            <div
              style={{
                padding: "0.8rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(6, 182, 212, 0.08)",
                border: "1px solid rgba(6, 182, 212, 0.2)",
                fontSize: "0.82rem",
                color: "#cbd5e1",
                marginBottom: "1rem",
              }}
            >
              <strong style={{ color: "#38bdf8", display: "block", marginBottom: "4px" }}>
                💡 While Waiting For The Ambulance:
              </strong>
              • Keep the patient calm and in a seated or recovery position.<br/>
              • Do not give solid foods or water if unconscious.<br/>
              • Ensure someone is at the entrance to guide the ambulance crew.
            </div>

            <button
              className="btn btn-outline"
              style={{ width: "100%", color: "#94a3b8" }}
              onClick={() => window.location.reload()}
            >
              Submit New Request / Reset
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Live Interactive Map */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <EmergencyMap
          focusCenter={
            citizenEmergency
              ? [citizenEmergency.latitude, citizenEmergency.longitude]
              : [formData.latitude, formData.longitude]
          }
          showRoute={true}
          onLocationSelect={handleMapClick}
          patientLocation={{
            lat: formData.latitude,
            lng: formData.longitude,
            address: formData.address_hint,
          }}
        />
      </div>
    </div>
  );
}
