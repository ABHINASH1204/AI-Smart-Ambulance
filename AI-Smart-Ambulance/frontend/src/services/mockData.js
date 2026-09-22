// Mock Seed Data & Dynamic Infrastructure Generator for AI Smart Ambulance

// Default to Bhubaneswar, Odisha
export const BHUBANESWAR_CENTER = {
  lat: 20.2961,
  lng: 85.8245,
  zoom: 13,
  name: "Bhubaneswar, Odisha",
};

export const INITIAL_CITY_CENTER = BHUBANESWAR_CENTER;

// Real Hospitals in Bhubaneswar
export const BHUBANESWAR_HOSPITALS = [
  {
    id: 1,
    name: "AIIMS Hospital Bhubaneswar",
    address: "NH-16, Sijua, Patrapada, Bhubaneswar, Odisha 751019",
    latitude: 20.2312,
    longitude: 85.7758,
    emergency_available: true,
    icu_available: true,
    trauma_available: true,
    available_beds: 38,
    status: "ACTIVE",
    specialties: ["Level-1 Trauma", "Apex Cardiology", "Neurology & Stroke", "Emergency Ward"],
  },
  {
    id: 2,
    name: "KIMS Super Specialty Hospital",
    address: "KIIT Road, Patia, Bhubaneswar, Odisha 751024",
    latitude: 20.3541,
    longitude: 85.8188,
    emergency_available: true,
    icu_available: true,
    trauma_available: true,
    available_beds: 24,
    status: "ACTIVE",
    specialties: ["Cardiology", "Trauma Center", "Critical Care ICU", "Burn Unit"],
  },
  {
    id: 3,
    name: "Capital Hospital (Govt. Medical)",
    address: "Unit 6, Ganga Nagar, Bhubaneswar, Odisha 751001",
    latitude: 20.2688,
    longitude: 85.8236,
    emergency_available: true,
    icu_available: true,
    trauma_available: true,
    available_beds: 52,
    status: "ACTIVE",
    specialties: ["24/7 Casualty", "Govt Emergency", "Pediatrics", "General Trauma"],
  },
  {
    id: 4,
    name: "Apollo Hospitals Bhubaneswar",
    address: "Plot No. 251, Sainik School Rd, Unit 15, Bhubaneswar, Odisha 751005",
    latitude: 20.3015,
    longitude: 85.8295,
    emergency_available: true,
    icu_available: true,
    trauma_available: true,
    available_beds: 19,
    status: "ACTIVE",
    specialties: ["Cardiac Care", "Advanced ICU", "Trauma & Ortho"],
  },
  {
    id: 5,
    name: "SUM Ultimate Medicare",
    address: "K9A, Kalinga Nagar, Ghatikia, Bhubaneswar, Odisha 751003",
    latitude: 20.2815,
    longitude: 85.7530,
    emergency_available: true,
    icu_available: true,
    trauma_available: true,
    available_beds: 31,
    status: "ACTIVE",
    specialties: ["Emergency Medicine", "Neuro Trauma", "Level-2 Trauma"],
  },
];

// Real Emergency Ambulances in Bhubaneswar (OD RTO Series)
export const BHUBANESWAR_AMBULANCES = [
  {
    id: 1,
    vehicle_number: "OD-02-AMB-108",
    driver_name: "Ramesh Chandra Sahoo",
    driver_phone: "+91 94370 12345",
    ambulance_type: "ICU",
    status: "AVAILABLE",
    latitude: 20.2675,
    longitude: 85.8420, // Near Master Canteen / Railway Station
    equipment: ["Ventilator", "Defibrillator", "Oxygen", "Multipara Monitor"],
    base_location: "Master Canteen Station Hub, Bhubaneswar",
  },
  {
    id: 2,
    vehicle_number: "OD-02-AMB-102",
    driver_name: "Biswajit Mohanty",
    driver_phone: "+91 94370 56789",
    ambulance_type: "ADVANCED",
    status: "AVAILABLE",
    latitude: 20.3010,
    longitude: 85.8200, // Near Jaydev Vihar / Nayapalli
    equipment: ["ECG Monitor", "Oxygen Support", "Suction Unit", "Emergency ALS Kit"],
    base_location: "Jaydev Vihar Rapid Response Point",
  },
  {
    id: 3,
    vehicle_number: "OD-02-AMB-501",
    driver_name: "Debasish Rout",
    driver_phone: "+91 94370 99887",
    ambulance_type: "BASIC",
    status: "ASSIGNED",
    latitude: 20.3520,
    longitude: 85.8170, // Patia / KIIT Square
    equipment: ["First Aid", "Stretcher", "Basic O2", "Splints"],
    base_location: "Patia Infocity Stand, Bhubaneswar",
  },
  {
    id: 4,
    vehicle_number: "OD-02-AMB-704",
    driver_name: "Soumya Ranjan Nayak",
    driver_phone: "+91 94370 44332",
    ambulance_type: "ICU",
    status: "AVAILABLE",
    latitude: 20.2590,
    longitude: 85.7860, // Khandagiri / Baramunda
    equipment: ["Advanced Life Support", "Ventilator", "Infusion Pumps", "Portable Ultrasound"],
    base_location: "Baramunda Highway Intersection, Bhubaneswar",
  },
];

export const BHUBANESWAR_EMERGENCIES = [
  {
    id: 101,
    user_id: 1,
    caller_name: "Priyabrata Mishra",
    caller_phone: "+91 94371 88990",
    emergency_type: "Cardiac Distress / Acute Chest Pain",
    severity: "CRITICAL",
    latitude: 20.2980,
    longitude: 85.8330,
    status: "EN_ROUTE",
    priority_score: 0.96,
    assigned_ambulance_id: 3,
    recommended_hospital_id: 4,
    created_at: new Date(Date.now() - 4 * 60000).toISOString(),
    address_hint: "Janpath Road, Near Ram Mandir, Bhubaneswar",
  },
  {
    id: 102,
    user_id: 2,
    caller_name: "Ananya Patnaik",
    caller_phone: "+91 94372 44556",
    emergency_type: "Traffic Collision at KIIT Square",
    severity: "HIGH",
    latitude: 20.3535,
    longitude: 85.8195,
    status: "REQUESTED",
    priority_score: 0.84,
    assigned_ambulance_id: null,
    recommended_hospital_id: 2,
    created_at: new Date(Date.now() - 2 * 60000).toISOString(),
    address_hint: "KIIT Square, Patia, Bhubaneswar",
  },
];

// Default exports for backward compatibility
export const MOCK_HOSPITALS = BHUBANESWAR_HOSPITALS;
export const MOCK_AMBULANCES = BHUBANESWAR_AMBULANCES;
export const MOCK_EMERGENCIES = BHUBANESWAR_EMERGENCIES;

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
export function generateRoutePoints(startLat, startLng, endLat, endLng, points = 14) {
  const route = [];
  for (let i = 0; i <= points; i++) {
    const fraction = i / points;
    // Add realistic urban street jitter
    const jitter = Math.sin(fraction * Math.PI) * 0.0025;
    route.push([
      startLat + (endLat - startLat) * fraction + jitter,
      startLng + (endLng - startLng) * fraction - jitter * 0.7,
    ]);
  }
  return route;
}

// Dynamic Emergency Infrastructure Generator for ANY location on Earth
// If user is anywhere (e.g. Bhubaneswar, Cuttack, Mumbai, or arbitrary GPS coordinates),
// this dynamically creates nearby realistic hospital nodes and ambulances within 1-5 km.
export function generateLocalEmergencyInfrastructure(centerLat, centerLng, placeName = "Your Area") {
  // Check if close to Bhubaneswar (~40km)
  const distToBhubaneswar = calculateDistanceKm(centerLat, centerLng, BHUBANESWAR_CENTER.lat, BHUBANESWAR_CENTER.lng);
  if (distToBhubaneswar <= 35) {
    return {
      center: { lat: centerLat, lng: centerLng, zoom: 13, name: "Bhubaneswar Metropolitan Region" },
      hospitals: BHUBANESWAR_HOSPITALS,
      ambulances: BHUBANESWAR_AMBULANCES,
      emergencies: BHUBANESWAR_EMERGENCIES,
    };
  }

  // Generate dynamic hospitals within 2 - 5 km of target location
  const offsets = [
    { dLat: 0.018, dLng: -0.012, name: `${placeName} Apex Emergency Hospital`, beds: 35, icu: true, trauma: true },
    { dLat: -0.015, dLng: 0.022, name: `${placeName} Metro Trauma Institute`, beds: 22, icu: true, trauma: true },
    { dLat: 0.024, dLng: 0.016, name: `${placeName} City Community Hospital`, beds: 48, icu: false, trauma: true },
    { dLat: -0.022, dLng: -0.018, name: `${placeName} Life Care Medical Center`, beds: 16, icu: true, trauma: false },
  ];

  const hospitals = offsets.map((off, idx) => ({
    id: 10 + idx,
    name: off.name,
    address: `Emergency Block, Near Sector ${idx + 1}, ${placeName}`,
    latitude: parseFloat((centerLat + off.dLat).toFixed(4)),
    longitude: parseFloat((centerLng + off.dLng).toFixed(4)),
    emergency_available: true,
    icu_available: off.icu,
    trauma_available: off.trauma,
    available_beds: off.beds,
    status: "ACTIVE",
    specialties: off.icu ? ["Level-1 Trauma", "Critical ICU", "Cardiology"] : ["24/7 Casualty", "General Emergency"],
  }));

  // Generate dynamic ambulances within 1 - 3 km
  const ambOffsets = [
    { dLat: 0.008, dLng: 0.006, type: "ICU", status: "AVAILABLE", driver: "Rajesh Mohapatra", phone: "+91 94370 11223" },
    { dLat: -0.011, dLng: -0.008, type: "ADVANCED", status: "AVAILABLE", driver: "Sanjay Behera", phone: "+91 94370 33445" },
    { dLat: 0.014, dLng: -0.012, type: "BASIC", status: "ASSIGNED", driver: "Prakash Pradhan", phone: "+91 94370 55667" },
    { dLat: -0.007, dLng: 0.015, type: "ICU", status: "AVAILABLE", driver: "Ashok Jena", phone: "+91 94370 77889" },
  ];

  const ambulances = ambOffsets.map((amb, idx) => ({
    id: 20 + idx,
    vehicle_number: `EMERGENCY-AMB-${100 + idx * 2}`,
    driver_name: amb.driver,
    driver_phone: amb.phone,
    ambulance_type: amb.type,
    status: amb.status,
    latitude: parseFloat((centerLat + amb.dLat).toFixed(4)),
    longitude: parseFloat((centerLng + amb.dLng).toFixed(4)),
    equipment: amb.type === "ICU" ? ["Ventilator", "Defibrillator", "Oxygen", "Multipara"] : ["First Aid", "Oxygen", "Stretcher"],
    base_location: `Sector ${idx + 1} Stand, ${placeName}`,
  }));

  const emergencies = [
    {
      id: 201,
      user_id: 1,
      caller_name: "Local Citizen Alert",
      caller_phone: "+91 98000 11222",
      emergency_type: "Acute Medical Distress",
      severity: "CRITICAL",
      latitude: parseFloat((centerLat + 0.005).toFixed(4)),
      longitude: parseFloat((centerLng - 0.004).toFixed(4)),
      status: "REQUESTED",
      priority_score: 0.92,
      assigned_ambulance_id: null,
      recommended_hospital_id: hospitals[0].id,
      created_at: new Date(Date.now() - 3 * 60000).toISOString(),
      address_hint: `Central Junction, ${placeName}`,
    },
  ];

  return {
    center: { lat: centerLat, lng: centerLng, zoom: 13, name: placeName },
    hospitals,
    ambulances,
    emergencies,
  };
}

