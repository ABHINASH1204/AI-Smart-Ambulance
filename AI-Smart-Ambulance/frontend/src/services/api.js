import {
  MOCK_AMBULANCES,
  MOCK_EMERGENCIES,
  MOCK_HOSPITALS,
  calculateDistanceKm,
  generateRoutePoints,
} from "./mockData";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const TIMEOUT_MS = 2500;

// Local in-memory state for simulation mode
let simEmergencies = [...MOCK_EMERGENCIES];
let simAmbulances = [...MOCK_AMBULANCES];
let simHospitals = [...MOCK_HOSPITALS];
let simTrips = [
  {
    id: 501,
    emergency_id: 101,
    ambulance_id: 3,
    hospital_id: 1,
    status: "EN_ROUTE",
    start_time: new Date(Date.now() - 5 * 60000).toISOString(),
    distance: 3.4,
    estimated_time: 7.5,
  },
];

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const apiService = {
  // Check whether backend is online
  async checkHealth() {
    try {
      const res = await fetchWithTimeout("http://localhost:8000/health");
      return res.ok;
    } catch {
      return false;
    }
  },

  // Emergencies
  async getEmergencies() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/emergencies/`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return simEmergencies;
  },

  async createEmergency(data) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/emergencies/`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    // Simulation fallback
    const priorityScore =
      data.severity === "CRITICAL"
        ? 0.95
        : data.severity === "HIGH"
        ? 0.78
        : data.severity === "MEDIUM"
        ? 0.5
        : 0.25;

    const newEmerg = {
      id: Date.now(),
      user_id: data.user_id || 1,
      caller_name: data.caller_name || "Citizen (You)",
      caller_phone: data.caller_phone || "+91 99887 76655",
      emergency_type: data.emergency_type,
      severity: data.severity,
      latitude: data.latitude,
      longitude: data.longitude,
      status: "REQUESTED",
      priority_score: priorityScore,
      assigned_ambulance_id: null,
      recommended_hospital_id: null,
      created_at: new Date().toISOString(),
    };
    simEmergencies = [newEmerg, ...simEmergencies];
    return newEmerg;
  },

  async updateEmergencyStatus(id, status) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/emergencies/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    simEmergencies = simEmergencies.map((e) =>
      e.id === id ? { ...e, status } : e
    );
    return simEmergencies.find((e) => e.id === id);
  },

  // Ambulances
  async getAmbulances() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/ambulances/`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return simAmbulances;
  },

  async updateAmbulanceStatus(id, status) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/ambulances/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    simAmbulances = simAmbulances.map((a) =>
      a.id === id ? { ...a, status } : a
    );
    return simAmbulances.find((a) => a.id === id);
  },

  async recommendAmbulance(lat, lng) {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE}/ambulances/recommend?latitude=${lat}&longitude=${lng}`
      );
      if (res.ok) return await res.json();
    } catch (_) {}

    // Simulation nearest calculation
    const avail = simAmbulances.filter((a) => a.status === "AVAILABLE");
    if (avail.length === 0) return simAmbulances[0] || null;

    let nearest = avail[0];
    let minD = calculateDistanceKm(lat, lng, nearest.latitude, nearest.longitude);
    for (const amb of avail) {
      const dist = calculateDistanceKm(lat, lng, amb.latitude, amb.longitude);
      if (dist < minD) {
        minD = dist;
        nearest = amb;
      }
    }
    return nearest;
  },

  // Hospitals
  async getHospitals() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/hospitals/`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return simHospitals;
  },

  async recommendHospital(lat, lng, needsIcu = false, needsTrauma = false) {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE}/hospitals/recommend?latitude=${lat}&longitude=${lng}&needs_icu=${needsIcu}&needs_trauma=${needsTrauma}`
      );
      if (res.ok) return await res.json();
    } catch (_) {}

    let candidates = simHospitals.filter(
      (h) =>
        (!needsIcu || h.icu_available) &&
        (!needsTrauma || h.trauma_available) &&
        h.available_beds > 0
    );
    if (candidates.length === 0) candidates = simHospitals;

    let nearest = candidates[0];
    let minD = calculateDistanceKm(lat, lng, nearest.latitude, nearest.longitude);
    for (const h of candidates) {
      const dist = calculateDistanceKm(lat, lng, h.latitude, h.longitude);
      if (dist < minD) {
        minD = dist;
        nearest = h;
      }
    }
    return nearest;
  },

  // Trips
  async getTrips() {
    return simTrips;
  },

  async createTrip(payload) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/trips/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const newTrip = {
      id: Date.now(),
      emergency_id: payload.emergency_id,
      ambulance_id: payload.ambulance_id,
      hospital_id: payload.hospital_id,
      status: "ASSIGNED",
      start_time: new Date().toISOString(),
      distance: 4.2,
      estimated_time: 9.0,
    };
    simTrips = [newTrip, ...simTrips];

    // Mark ambulance as assigned
    this.updateAmbulanceStatus(payload.ambulance_id, "ASSIGNED");
    // Mark emergency as assigned
    this.updateEmergencyStatus(payload.emergency_id, "ASSIGNED");

    return newTrip;
  },

  async updateTripStatus(tripId, status) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/trips/${tripId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    simTrips = simTrips.map((t) => (t.id === tripId ? { ...t, status } : t));
    return simTrips.find((t) => t.id === tripId);
  },

  // Routes
  async getRoute(originLat, originLng, destLat, destLng) {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE}/routes/?origin_lat=${originLat}&origin_lng=${originLng}&dest_lat=${destLat}&dest_lng=${destLng}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.geometry && data.geometry.coordinates) {
          // GeoJSON is [lng, lat], Leaflet polyline wants [lat, lng]
          const coords = data.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          return {
            distance_km: data.distance_km,
            duration_min: data.duration_min,
            points: coords,
            source: data.source,
          };
        }
      }
    } catch (_) {}

    const dist = calculateDistanceKm(originLat, originLng, destLat, destLng);
    return {
      distance_km: dist,
      duration_min: Math.round((dist / 40) * 60 + 2),
      points: generateRoutePoints(originLat, originLng, destLat, destLng),
      source: "simulation_interpolated",
    };
  },
};
