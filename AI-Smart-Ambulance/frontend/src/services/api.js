import {
  MOCK_AMBULANCES,
  MOCK_EMERGENCIES,
  MOCK_HOSPITALS,
  calculateDistanceKm,
  generateRoutePoints,
  generateLocalEmergencyInfrastructure,
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
    hospital_id: 4,
    status: "EN_ROUTE",
    start_time: new Date(Date.now() - 5 * 60000).toISOString(),
    distance: 3.4,
    estimated_time: 6.5,
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

let backendOnlineCached = false;
let lastHealthCheckTime = 0;

export const apiService = {
  // Check whether backend is online
  async checkHealth() {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1000);
      const res = await fetch("http://localhost:8000/health", { signal: controller.signal });
      clearTimeout(id);
      backendOnlineCached = res.ok;
      lastHealthCheckTime = Date.now();
      return res.ok;
    } catch {
      backendOnlineCached = false;
      lastHealthCheckTime = Date.now();
      return false;
    }
  },

  // Set active location & cluster dynamic emergency infrastructure
  setSimulationLocation(lat, lng, placeName) {
    const infra = generateLocalEmergencyInfrastructure(lat, lng, placeName);
    simHospitals = [...infra.hospitals];
    simAmbulances = [...infra.ambulances];
    simEmergencies = [...infra.emergencies];
    simTrips = [];
    return infra;
  },

  // Emergencies
  async getEmergencies() {
    if (backendOnlineCached) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/emergencies/`);
        if (res.ok) return await res.json();
      } catch (_) {
        backendOnlineCached = false;
      }
    }
    return simEmergencies;
  },

  async createEmergency(data) {
    if (backendOnlineCached) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/emergencies/`, {
          method: "POST",
          body: JSON.stringify(data),
        });
        if (res.ok) return await res.json();
      } catch (_) {
        backendOnlineCached = false;
      }
    }

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
      caller_phone: data.caller_phone || "+91 94370 12345",
      emergency_type: data.emergency_type,
      severity: data.severity,
      latitude: data.latitude,
      longitude: data.longitude,
      status: "REQUESTED",
      priority_score: priorityScore,
      assigned_ambulance_id: null,
      recommended_hospital_id: null,
      address_hint: data.address_hint || "Location Pinpoint",
      created_at: new Date().toISOString(),
    };
    simEmergencies = [newEmerg, ...simEmergencies];
    return newEmerg;
  },

  async updateEmergencyStatus(id, status) {
    if (backendOnlineCached) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/emergencies/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
        if (res.ok) return await res.json();
      } catch (_) {
        backendOnlineCached = false;
      }
    }

    simEmergencies = simEmergencies.map((e) =>
      e.id === id ? { ...e, status } : e
    );
    return simEmergencies.find((e) => e.id === id);
  },

  // Ambulances
  async getAmbulances() {
    if (backendOnlineCached) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/ambulances/`);
        if (res.ok) return await res.json();
      } catch (_) {
        backendOnlineCached = false;
      }
    }
    return simAmbulances;
  },

  async updateAmbulanceStatus(id, status) {
    if (backendOnlineCached) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/ambulances/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
        if (res.ok) return await res.json();
      } catch (_) {
        backendOnlineCached = false;
      }
    }

    simAmbulances = simAmbulances.map((a) =>
      a.id === id ? { ...a, status } : a
    );
    return simAmbulances.find((a) => a.id === id);
  },

  async recommendAmbulance(lat, lng) {
    if (backendOnlineCached) {
      try {
        const res = await fetchWithTimeout(
          `${API_BASE}/ambulances/recommend?latitude=${lat}&longitude=${lng}`
        );
        if (res.ok) return await res.json();
      } catch (_) {
        backendOnlineCached = false;
      }
    }

    // Simulation nearest calculation
    const avail = simAmbulances.filter((a) => a.status === "AVAILABLE");
    const candidates = avail.length > 0 ? avail : simAmbulances;
    if (candidates.length === 0) return null;

    let nearest = candidates[0];
    let minD = calculateDistanceKm(lat, lng, nearest.latitude, nearest.longitude);
    for (const amb of candidates) {
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
    if (backendOnlineCached) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/hospitals/`);
        if (res.ok) return await res.json();
      } catch (_) {
        backendOnlineCached = false;
      }
    }
    return simHospitals;
  },

  async recommendHospital(lat, lng, needsIcu = false, needsTrauma = false) {
    if (backendOnlineCached) {
      try {
        const res = await fetchWithTimeout(
          `${API_BASE}/hospitals/recommend?latitude=${lat}&longitude=${lng}&needs_icu=${needsIcu}&needs_trauma=${needsTrauma}`
        );
        if (res.ok) return await res.json();
      } catch (_) {
        backendOnlineCached = false;
      }
    }

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
    if (backendOnlineCached) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/trips/`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (res.ok) return await res.json();
      } catch (_) {
        backendOnlineCached = false;
      }
    }

    const newTrip = {
      id: Date.now(),
      emergency_id: payload.emergency_id,
      ambulance_id: payload.ambulance_id,
      hospital_id: payload.hospital_id,
      status: "ASSIGNED",
      start_time: new Date().toISOString(),
      distance: 3.8,
      estimated_time: 7.0,
    };
    simTrips = [newTrip, ...simTrips];

    // Mark ambulance as assigned
    this.updateAmbulanceStatus(payload.ambulance_id, "ASSIGNED");
    // Mark emergency as assigned
    this.updateEmergencyStatus(payload.emergency_id, "ASSIGNED");

    return newTrip;
  },

  async updateTripStatus(tripId, status) {
    if (backendOnlineCached) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/trips/${tripId}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
        if (res.ok) return await res.json();
      } catch (_) {
        backendOnlineCached = false;
      }
    }

    simTrips = simTrips.map((t) => (t.id === tripId ? { ...t, status } : t));
    return simTrips.find((t) => t.id === tripId);
  },

  // Routes: Real turn-by-turn with OpenStreetMap OSRM fallback
  async getRoute(originLat, originLng, destLat, destLng) {
    // 1. Try local backend first
    try {
      const res = await fetchWithTimeout(
        `${API_BASE}/routes/?origin_lat=${originLat}&origin_lng=${originLng}&dest_lat=${destLat}&dest_lng=${destLng}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.geometry && data.geometry.coordinates) {
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

    // 2. Direct public OSRM OpenStreetMap routing (real city street polylines)
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
      const osrmRes = await fetchWithTimeout(osrmUrl);
      if (osrmRes.ok) {
        const osrmData = await osrmRes.json();
        if (osrmData.routes && osrmData.routes.length > 0) {
          const r = osrmData.routes[0];
          const coords = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          return {
            distance_km: parseFloat((r.distance / 1000).toFixed(2)),
            duration_min: Math.max(3, Math.round(r.duration / 60)),
            points: coords,
            source: "osrm_real_streets",
          };
        }
      }
    } catch (_) {}

    // 3. Realistic curve interpolation fallback
    const dist = calculateDistanceKm(originLat, originLng, destLat, destLng);
    return {
      distance_km: dist,
      duration_min: Math.max(3, Math.round((dist / 35) * 60 + 2)),
      points: generateRoutePoints(originLat, originLng, destLat, destLng),
      source: "simulation_interpolated",
    };
  },
};

