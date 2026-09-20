import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { INITIAL_CITY_CENTER } from "../../services/mockData";
import { useEmergency } from "../../context/EmergencyContext";

// Recenter component to dynamically fly/pan when active incident changes
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.panTo(center, { animate: true, duration: 1 });
    }
  }, [center, map]);
  return null;
}

// Custom DivIcons for crisp SVG vector rendering
const createAmbulanceIcon = (status, vehicleNumber) => {
  const statusClass =
    status === "AVAILABLE"
      ? "available"
      : status === "ASSIGNED"
      ? "assigned"
      : "en-route";

  const html = `
    <div class="custom-pin-ambulance ${statusClass}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v9c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <path d="M9 17h6"/>
        <circle cx="17" cy="17" r="2"/>
        <path d="M8 8v4"/>
        <path d="M6 10h4"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    className: "custom-div-icon",
    html,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  });
};

const createEmergencyIcon = (severity) => {
  const isCritical = severity === "CRITICAL";
  const html = `
    <div class="custom-pin-emergency ${isCritical ? "critical" : ""}">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    className: "custom-div-icon",
    html,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -24],
  });
};

const createHospitalIcon = (availableBeds) => {
  const html = `
    <div class="custom-pin-hospital">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 6v12"/>
        <path d="M6 12h12"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    className: "custom-div-icon",
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

export default function EmergencyMap({
  focusCenter,
  customHeight = "100%",
  showRoute = true,
  onEmergencyClick,
}) {
  const { emergencies, ambulances, hospitals, activeRoute } = useEmergency();

  const defaultCenter = focusCenter || [
    INITIAL_CITY_CENTER.lat,
    INITIAL_CITY_CENTER.lng,
  ];

  return (
    <div className="map-wrapper" style={{ height: customHeight }}>
      <MapContainer
        center={defaultCenter}
        zoom={INITIAL_CITY_CENTER.zoom}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        {/* CartoDB Dark Matter tiles for ultra-modern emergency command aesthetic */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapRecenter center={focusCenter} />

        {/* Dynamic Route Polyline */}
        {showRoute && activeRoute && activeRoute.length > 0 && (
          <>
            {/* Outer glowing path */}
            <Polyline
              positions={activeRoute}
              pathOptions={{
                color: "#06b6d4",
                weight: 8,
                opacity: 0.45,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Inner focused path */}
            <Polyline
              positions={activeRoute}
              pathOptions={{
                color: "#38bdf8",
                weight: 4,
                opacity: 0.95,
                dashArray: "1, 8",
              }}
            />
          </>
        )}

        {/* Hospital Markers */}
        {hospitals.map((hosp) => (
          <Marker
            key={`hosp-${hosp.id}`}
            position={[hosp.latitude, hosp.longitude]}
            icon={createHospitalIcon(hosp.available_beds)}
          >
            <Popup>
              <div style={{ padding: "0.2rem" }}>
                <strong style={{ fontSize: "0.95rem", color: "#38bdf8" }}>
                  {hosp.name}
                </strong>
                <p style={{ margin: "4px 0", color: "#94a3b8", fontSize: "0.8rem" }}>
                  {hosp.address}
                </p>
                <div style={{ marginTop: "6px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <span className="badge badge-medium">
                    🛏️ {hosp.available_beds} Beds Available
                  </span>
                  {hosp.icu_available && (
                    <span className="badge badge-critical" style={{ fontSize: "0.68rem" }}>
                      ICU Ready
                    </span>
                  )}
                  {hosp.trauma_available && (
                    <span className="badge badge-high" style={{ fontSize: "0.68rem" }}>
                      Trauma Center
                    </span>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Ambulance Markers */}
        {ambulances.map((amb) => (
          <Marker
            key={`amb-${amb.id}`}
            position={[amb.latitude, amb.longitude]}
            icon={createAmbulanceIcon(amb.status, amb.vehicle_number)}
          >
            <Popup>
              <div>
                <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>
                  🚑 {amb.vehicle_number}
                </strong>
                <div style={{ marginTop: "4px", fontSize: "0.8rem", color: "#94a3b8" }}>
                  <div>Type: <strong>{amb.ambulance_type} Life Support</strong></div>
                  <div>Driver: {amb.driver_name || "Assigned Driver"}</div>
                  <div>Phone: {amb.driver_phone || "+91 98000 12345"}</div>
                </div>
                <div style={{ marginTop: "6px" }}>
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
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Emergency Distress Markers */}
        {emergencies.map((emerg) => (
          <Marker
            key={`emerg-${emerg.id}`}
            position={[emerg.latitude, emerg.longitude]}
            icon={createEmergencyIcon(emerg.severity)}
            eventHandlers={{
              click: () => onEmergencyClick && onEmergencyClick(emerg),
            }}
          >
            <Popup>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span className="badge badge-critical">SOS INCIDENT #{emerg.id}</span>
                  <span className="badge badge-high">Priority: {Math.round((emerg.priority_score || 0.5) * 100)}%</span>
                </div>
                <strong style={{ color: "#ef4444", fontSize: "0.9rem" }}>
                  {emerg.emergency_type}
                </strong>
                <div style={{ marginTop: "4px", fontSize: "0.8rem", color: "#94a3b8" }}>
                  <div>Caller: {emerg.caller_name || "Anonymous / Citizen"}</div>
                  <div>Status: <strong>{emerg.status}</strong></div>
                  <div>Severity: <strong style={{ color: emerg.severity === "CRITICAL" ? "#ef4444" : "#f59e0b" }}>{emerg.severity}</strong></div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
