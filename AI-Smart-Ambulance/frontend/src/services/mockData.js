// Mock Seed Data for AI Smart Ambulance Simulation Mode

export const INITIAL_CITY_CENTER = {
  lat: 12.9716,
  lng: 77.5946,
  zoom: 13,
};

export const MOCK_HOSPITALS = [
  {
    id: 1,
    name: "Apex Emergency & Trauma Institute",
    address: "104 Healthcare Boulevard, Central District",
    latitude: 12.9792,
    longitude: 77.5912,
    emergency_available: true,
    icu_available: true,
    trauma_available: true,
    available_beds: 18,
    status: "ACTIVE",
    specialties: ["Level-1 Trauma", "Cardiology", "Stroke Unit"],
  },
  {
    id: 2,
    name: "Metro Super Specialty Hospital",
    address: "42 Ring Road, South Sector",
    latitude: 12.9555,
    longitude: 77.6085,
    emergency_available: true,
    icu_available: true,
    trauma_available: false,
    available_beds: 7,
    status: "ACTIVE",
    specialties: ["Cardiology", "Pediatrics", "Burn Care"],
  },
  {
    id: 3,
    name: "St. Jude Community Hospital",
    address: "88 Westside Avenue, Sector 4",
    latitude: 12.9868,
    longitude: 77.5721,
    emergency_available: true,
    icu_available: false,
    trauma_available: true,
    available_beds: 24,
    status: "ACTIVE",
    specialties: ["General Trauma", "Orthopedics"],
  },
];

export const MOCK_AMBULANCES = [
  {
    id: 1,
    vehicle_number: "KA-01-AMB-108",
    driver_name: "Rajesh Kumar",
    driver_phone: "+91 98765 43210",
    ambulance_type: "ICU",
    status: "AVAILABLE",
    latitude: 12.9735,
    longitude: 77.5855,
    equipment: ["Ventilator", "Defibrillator", "Oxygen", "Multipara Monitor"],
  },
  {
    id: 2,
    vehicle_number: "KA-01-AMB-204",
    driver_name: "Amit Sharma",
    driver_phone: "+91 98765 11223",
    ambulance_type: "ADVANCED",
    status: "AVAILABLE",
    latitude: 12.9615,
    longitude: 77.6015,
    equipment: ["ECG Monitor", "Oxygen Support", "Suction Unit"],
  },
  {
    id: 3,
    vehicle_number: "KA-01-AMB-309",
    driver_name: "Vikram Singh",
    driver_phone: "+91 98765 88990",
    ambulance_type: "BASIC",
    status: "ASSIGNED",
    latitude: 12.9822,
    longitude: 77.6105,
    equipment: ["First Aid", "Stretcher", "Basic O2"],
  },
  {
    id: 4,
    vehicle_number: "KA-01-AMB-412",
    driver_name: "Deepak Verma",
    driver_phone: "+91 98765 55443",
    ambulance_type: "ICU",
    status: "AVAILABLE",
    latitude: 12.9912,
    longitude: 77.5685,
    equipment: ["Advanced Life Support", "Ventilator", "Infusion Pumps"],
  },
];

export const MOCK_EMERGENCIES = [
  {
    id: 101,
    user_id: 1,
    caller_name: "Sunil Verma",
    caller_phone: "+91 98112 33445",
    emergency_type: "Cardiac Arrest / Severe Chest Pain",
    severity: "CRITICAL",
    latitude: 12.9680,
    longitude: 77.5980,
    status: "EN_ROUTE",
    priority_score: 0.96,
    assigned_ambulance_id: 3,
    recommended_hospital_id: 1,
    created_at: new Date(Date.now() - 6 * 60000).toISOString(),
  },
  {
    id: 102,
    user_id: 2,
    caller_name: "Pooja Hegde",
    caller_phone: "+91 98223 44556",
    emergency_type: "Two-Wheeler Traffic Collision",
    severity: "HIGH",
    latitude: 12.9845,
    longitude: 77.5810,
    status: "REQUESTED",
    priority_score: 0.82,
    assigned_ambulance_id: null,
    recommended_hospital_id: 3,
    created_at: new Date(Date.now() - 2 * 60000).toISOString(),
  },
];

// Helper to compute haversine distance in km
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Generate realistic intermediate coordinates for route visualization
export function generateRoutePoints(startLat, startLng, endLat, endLng, points = 10) {
  const route = [];
  for (let i = 0; i <= points; i++) {
    const fraction = i / points;
    // Add small realistic curvature so it looks like city streets rather than laser straight lines
    const jitter = Math.sin(fraction * Math.PI) * 0.0025;
    route.push([
      startLat + (endLat - startLat) * fraction + jitter,
      startLng + (endLng - startLng) * fraction - jitter * 0.8,
    ]);
  }
  return route;
}
