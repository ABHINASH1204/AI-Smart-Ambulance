import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { INITIAL_CITY_CENTER } from "../../services/mockData";
import { useEmergency } from "../../context/EmergencyContext";
import { Layers, MapPin } from "lucide-react";

// Recenter component to dynamically pan when active incident or location changes
function MapRecenter({ center, zoom = 14 }) {
  const map = useMap();
  const lastCenterRef = React.useRef(null);

  useEffect(() => {
    if (
      Array.isArray(center) &&
      center.length >= 2 &&
      typeof center[0] === "number" &&
      typeof center[1] === "number" &&
      !isNaN(center[0]) &&
      !isNaN(center[1])
    ) {
      const lat = center[0];
      const lng = center[1];
      const prev = lastCenterRef.current;
      if (!prev || Math.abs(prev[0] - lat) > 0.0001 || Math.abs(prev[1] - lng) > 0.0001) {
        lastCenterRef.current = [lat, lng];
        try {
          map.panTo([lat, lng], { animate: true, duration: 0.6 });
        } catch (_) {}
      }
    }
  }, [center, zoom, map]);
  return null;
}

// Click-anywhere handler to auto-patch/set emergency pickup location
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect && e.latlng) {
        const lat = parseFloat(e.latlng.lat.toFixed(4));
        const lng = parseFloat(e.latlng.lng.toFixed(4));
        if (!isNaN(lat) && !isNaN(lng)) {
          onLocationSelect(lat, lng);
        }
      }
    },
  });
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

const createPatientPickupIcon = () => {
  const html = `
    <div class="custom-pin-patient-pickup">
      <div class="patient-pickup-pulse"></div>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
      </svg>
    </div>
  `;

  return L.divIcon({
    className: "custom-div-icon",
    html,
    iconSize: [40, 40],
    iconAnchor: [20, 38],
    popupAnchor: [0, -38],
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

const createLiveUserIcon = () => {
  const html = `
    <div class="custom-pin-user-live" title="Your Current Location">
      <div class="user-live-radar"></div>
      <div class="user-live-center"></div>
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

function InvalidateSizeEffect() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (_) {}
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function EmergencyMap({
  focusCenter,
  customHeight = "100%",
  showRoute = true,
  onEmergencyClick,
  onLocationSelect,
  patientLocation,
}) {
  const { emergencies, ambulances, hospitals, activeRoute, userLocation } = useEmergency();
  const [mapTheme, setMapTheme] = useState("dark"); // 'dark' | 'street'

  const isValidCoord = (n) => typeof n === "number" && !isNaN(n);
  const isValidCenter = (c) =>
    Array.isArray(c) && c.length >= 2 && isValidCoord(c[0]) && isValidCoord(c[1]);

  const defaultCenter = isValidCenter(focusCenter)
    ? focusCenter
    : [INITIAL_CITY_CENTER.lat, INITIAL_CITY_CENTER.lng];

  return (
    <div className={`map-wrapper map-theme-${mapTheme}`} style={{ height: customHeight, position: "relative" }}>
      {/* Floating Map Controls */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 1000,
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        {onLocationSelect && (
          <div
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              backdropFilter: "blur(8px)",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "0.74rem",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}
          >
            <MapPin size={13} color="#ef4444" />
            <span>Click map to set pickup</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMapTheme((t) => (t === "dark" ? "street" : "dark"))}
          style={{
            background: "rgba(15, 23, 42, 0.9)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#f8fafc",
            borderRadius: "20px",
            padding: "5px 10px",
            fontSize: "0.75rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
          title="Toggle between Tactical Dark and Natural Street view"
        >
          <Layers size={13} color="#38bdf8" />
          <span>{mapTheme === "dark" ? "🌙 Tactical Dark" : "🗺️ Street View"}</span>
        </button>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={INITIAL_CITY_CENTER.zoom}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        {/* OpenStreetMap Standard Tiles: 100% FREE, NO API KEY REQUIRED, NO WATERMARK */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <InvalidateSizeEffect />
        <MapRecenter center={focusCenter} />
        <MapClickHandler onLocationSelect={onLocationSelect} />

        {/* Dedicated Live User Current Location Radar Pin */}
        {userLocation &&
          isValidCoord(userLocation.lat) &&
          isValidCoord(userLocation.lng) &&
          (!patientLocation ||
            Math.abs(userLocation.lat - patientLocation.lat) > 0.0005 ||
            Math.abs(userLocation.lng - patientLocation.lng) > 0.0005) && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createLiveUserIcon()}
              zIndexOffset={900}
            >
              <Popup>
                <div style={{ padding: "0.25rem" }}>
                  <strong style={{ color: "#06b6d4", fontSize: "0.95rem" }}>
                    📍 Your Live Current Location
                  </strong>
                  <p style={{ margin: "4px 0", color: "#cbd5e1", fontSize: "0.8rem" }}>
                    {userLocation.address || "Live Location"}
                  </p>
                  <div style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: "600", marginTop: "3px" }}>
                    {userLocation.isGpsDetected ? "● High Precision GPS Active" : "● Network Geolocation"}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

        {/* Dedicated Patient / Caller Selected Location Pin */}
        {patientLocation &&
          isValidCoord(patientLocation.lat) &&
          isValidCoord(patientLocation.lng) && (
            <Marker
              position={[patientLocation.lat, patientLocation.lng]}
              icon={createPatientPickupIcon()}
            >
              <Popup>
                <div style={{ padding: "0.2rem" }}>
                  <strong style={{ color: "#ef4444", fontSize: "0.95rem" }}>
                    📍 Your Selected Pickup Location
                  </strong>
                  <p style={{ margin: "4px 0", color: "#cbd5e1", fontSize: "0.8rem" }}>
                    {patientLocation.address || "Patient Location Pinpoint"}
                  </p>
                  <div style={{ fontSize: "0.75rem", color: "#38bdf8", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                    {patientLocation.lat.toFixed(4)}, {patientLocation.lng.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

        {/* Dynamic Route Polyline */}
        {showRoute &&
          Array.isArray(activeRoute) &&
          activeRoute.length > 1 &&
          activeRoute.every(
            (p) => Array.isArray(p) && p.length >= 2 && isValidCoord(p[0]) && isValidCoord(p[1])
          ) && (
            <>
              {/* Outer glowing path */}
              <Polyline
                positions={activeRoute}
                pathOptions={{
                  color: "#06b6d4",
                  weight: 8,
                  opacity: 0.55,
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
                  dashArray: "2, 8",
                }}
              />
            </>
          )}

        {/* Hospital Markers */}
        {(hospitals || [])
          .filter((h) => h && isValidCoord(h.latitude) && isValidCoord(h.longitude))
          .map((hosp) => (
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
        {(ambulances || [])
          .filter((a) => a && isValidCoord(a.latitude) && isValidCoord(a.longitude))
          .map((amb) => (
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
                    <div>Phone: {amb.driver_phone || "+91 94370 12345"}</div>
                    {amb.base_location && <div>Stand: {amb.base_location}</div>}
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
        {(emergencies || [])
          .filter((e) => e && isValidCoord(e.latitude) && isValidCoord(e.longitude))
          .map((emerg) => (
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
                    {emerg.address_hint && <div>Location: {emerg.address_hint}</div>}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}


