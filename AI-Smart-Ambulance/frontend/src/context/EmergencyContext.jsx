import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiService } from "../services/api";
import { BHUBANESWAR_CENTER } from "../services/mockData";

const EmergencyContext = createContext(null);

export function EmergencyProvider({ children }) {
  const [currentRole, setCurrentRole] = useState("CITIZEN"); // Default to Citizen SOS portal so user can book immediately
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  // User location (defaults to Bhubaneswar, auto-patches to GPS anywhere)
  const [userLocation, setUserLocation] = useState({
    lat: BHUBANESWAR_CENTER.lat,
    lng: BHUBANESWAR_CENTER.lng,
    address: "Bhubaneswar, Odisha",
    isGpsDetected: false,
  });

  const [mapFocus, setMapFocus] = useState([BHUBANESWAR_CENTER.lat, BHUBANESWAR_CENTER.lng]);

  const [emergencies, setEmergencies] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [trips, setTrips] = useState([]);

  // Selected emergency for map focus or admin triage
  const [selectedEmergencyId, setSelectedEmergencyId] = useState(null);

  // Active citizen emergency request
  const [citizenEmergencyId, setCitizenEmergencyId] = useState(null);

  // Driver console state (assigned to vehicle 1 by default for demonstration)
  const [driverVehicleId, setDriverVehicleId] = useState(1);

  // Active route polyline for the map [ [lat, lng], ... ]
  const [activeRoute, setActiveRoute] = useState(null);

  const refreshAll = useCallback(async () => {
    try {
      const isOnline = await apiService.checkHealth();
      setBackendOnline(isOnline);

      const [emList, ambList, hospList, tripList] = await Promise.all([
        apiService.getEmergencies(),
        apiService.getAmbulances(),
        apiService.getHospitals(),
        apiService.getTrips(),
      ]);

      setEmergencies(emList || []);
      setAmbulances(ambList || []);
      setHospitals(hospList || []);
      setTrips(tripList || []);
    } catch (err) {
      console.error("Failed to refresh emergency context data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);

  // Update user location and dynamically regenerate local emergency infrastructure
  const setUserLocationAndCluster = useCallback(
    async (lat, lng, addressText = "Your Location", isGps = false) => {
      setUserLocation({
        lat,
        lng,
        address: addressText,
        isGpsDetected: isGps,
      });
      setMapFocus([lat, lng]);

      // Recluster local simulation nodes (nearest hospitals & ambulances) around this location
      apiService.setSimulationLocation(lat, lng, addressText);
      await refreshAll();
    },
    [refreshAll]
  );

  // Reverse geocode lat, lng to human-readable address
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "en", "User-Agent": "AISmartAmbulance/1.0" } }
      );
      if (res.ok) {
        const data = await res.json();
        const city =
          data.address?.city ||
          data.address?.town ||
          data.address?.suburb ||
          data.address?.neighbourhood ||
          data.address?.county;
        const state = data.address?.state;
        const road = data.address?.road || data.address?.amenity || data.address?.building;
        if (road && city) {
          return `${road}, ${city}${state ? `, ${state}` : ""}`;
        }
        if (city && state) {
          return `${city}, ${state}`;
        }
        return data.display_name?.split(",").slice(0, 3).join(",") || "Your Current Location";
      }
    } catch (_) {}
    return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  };

  // High-reliability multi-tier location detection (Browser GPS -> IP Geolocation Fallback)
  const fetchCurrentLocation = useCallback(
    async (showPrompt = false) => {
      setIsDetectingLocation(true);

      const applyCoords = async (lat, lng, label = null, isGps = false) => {
        const address = label || (await reverseGeocode(lat, lng));
        await setUserLocationAndCluster(lat, lng, address, isGps);
        setIsDetectingLocation(false);
        return { success: true, lat, lng, address, isGps };
      };

      // 1. Try Browser Geolocation first
      if ("geolocation" in navigator) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              () => {
                // Secondary low-accuracy attempt
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: false,
                  timeout: 4000,
                  maximumAge: 60000,
                });
              },
              { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
            );
          });

          if (pos && pos.coords) {
            const lat = parseFloat(pos.coords.latitude.toFixed(4));
            const lng = parseFloat(pos.coords.longitude.toFixed(4));
            return await applyCoords(lat, lng, null, true);
          }
        } catch (gpsErr) {
          console.warn("Browser GPS unavailable or timed out; trying IP network geolocation fallback:", gpsErr);
        }
      }

      // 2. IP Network Geolocation (Zero-permission instant fallback anywhere in India/World)
      try {
        const res = await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client");
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            const lat = parseFloat(Number(data.latitude).toFixed(4));
            const lng = parseFloat(Number(data.longitude).toFixed(4));
            const city = data.city || data.locality || "Bhubaneswar";
            const state = data.principalSubdivision || "Odisha";
            const label = `${city}, ${state}`;
            return await applyCoords(lat, lng, label, false);
          }
        }
      } catch (netErr) {
        console.warn("Network IP geolocation failed:", netErr);
      }

      // 3. Fallback to Bhubaneswar City Center
      const defaultLoc = await applyCoords(
        BHUBANESWAR_CENTER.lat,
        BHUBANESWAR_CENTER.lng,
        BHUBANESWAR_CENTER.name,
        false
      );
      setIsDetectingLocation(false);
      return defaultLoc;
    },
    [setUserLocationAndCluster]
  );

  // Auto-fetch current location on first load
  useEffect(() => {
    fetchCurrentLocation(false);
  }, [fetchCurrentLocation]);

  // Periodic poll
  useEffect(() => {
    const interval = setInterval(refreshAll, 6000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  // Citizen triggers an emergency & books ambulance
  const triggerCitizenEmergency = async (formData) => {
    const newEmergency = await apiService.createEmergency(formData);
    setCitizenEmergencyId(newEmergency.id);
    setSelectedEmergencyId(newEmergency.id);
    setMapFocus([formData.latitude, formData.longitude]);

    // Recommend nearest ambulance and hospital
    const recommendedAmb = await apiService.recommendAmbulance(
      formData.latitude,
      formData.longitude
    );
    const recommendedHosp = await apiService.recommendHospital(
      formData.latitude,
      formData.longitude,
      formData.severity === "CRITICAL",
      formData.severity === "CRITICAL"
    );

    let trip = null;
    let routePoints = null;

    if (recommendedAmb && recommendedHosp) {
      trip = await apiService.createTrip({
        emergency_id: newEmergency.id,
        ambulance_id: recommendedAmb.id,
        hospital_id: recommendedHosp.id,
      });

      const routeData = await apiService.getRoute(
        recommendedAmb.latitude,
        recommendedAmb.longitude,
        formData.latitude,
        formData.longitude
      );
      if (routeData && routeData.points) {
        routePoints = routeData.points;
        setActiveRoute(routeData.points);
      }
    }

    // Set active booking for live tracking
    setActiveBooking({
      emergency: newEmergency,
      ambulance: recommendedAmb,
      hospital: recommendedHosp,
      trip: trip,
      routePoints: routePoints,
      etaMinutes: 5,
      startTime: Date.now(),
      pickupLocation: {
        lat: formData.latitude,
        lng: formData.longitude,
        address: formData.address_hint || "Pickup Location",
        caller_name: formData.caller_name || "Citizen Patient",
        caller_phone: formData.caller_phone || "",
        emergency_type: formData.emergency_type || "Emergency Assistance",
        severity: formData.severity || "CRITICAL",
      },
    });

    // Automatically transition to Ambulance Tracking feature view
    setCurrentRole("TRACKING");

    await refreshAll();
    return newEmergency;
  };

  // Cancel citizen emergency
  const cancelCitizenEmergency = async () => {
    if (activeBooking?.trip?.id) {
      await apiService.updateTripStatus(activeBooking.trip.id, "CANCELLED");
    }
    if (citizenEmergencyId) {
      await apiService.updateEmergencyStatus(citizenEmergencyId, "CANCELLED");
    }
    setCitizenEmergencyId(null);
    setActiveBooking(null);
    setActiveRoute(null);
    setCurrentRole("CITIZEN");
    await refreshAll();
  };

  // Dispatch an ambulance from admin console
  const dispatchAmbulance = async (emergencyId, ambulanceId, hospitalId) => {
    const trip = await apiService.createTrip({
      emergency_id: emergencyId,
      ambulance_id: ambulanceId,
      hospital_id: hospitalId,
    });

    const targetEmerg = emergencies.find((e) => e.id === emergencyId);
    const targetAmb = ambulances.find((a) => a.id === ambulanceId);

    if (targetEmerg && targetAmb) {
      const routeData = await apiService.getRoute(
        targetAmb.latitude,
        targetAmb.longitude,
        targetEmerg.latitude,
        targetEmerg.longitude
      );
      if (routeData && routeData.points) {
        setActiveRoute(routeData.points);
      }
    }

    await refreshAll();
    return trip;
  };

  // Driver advances trip status
  const advanceTripStatus = async (tripId, newStatus) => {
    await apiService.updateTripStatus(tripId, newStatus);
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      await apiService.updateEmergencyStatus(trip.emergency_id, newStatus);
      if (newStatus === "COMPLETED") {
        await apiService.updateAmbulanceStatus(trip.ambulance_id, "AVAILABLE");
        setActiveRoute(null);
      } else {
        await apiService.updateAmbulanceStatus(trip.ambulance_id, "EN_ROUTE");
      }
    }
    await refreshAll();
  };

  // Selected emergency object
  const selectedEmergency =
    emergencies.find((e) => e.id === selectedEmergencyId) ||
    emergencies[0] ||
    null;

  // Active citizen emergency object
  const citizenEmergency =
    emergencies.find((e) => e.id === citizenEmergencyId) || null;

  // Find active trip for driver
  const driverAmbulance =
    ambulances.find((a) => a.id === driverVehicleId) || ambulances[0] || null;

  const driverActiveTrip =
    trips.find(
      (t) => t.ambulance_id === driverAmbulance?.id && t.status !== "COMPLETED"
    ) || null;

  const driverEmergency = driverActiveTrip
    ? emergencies.find((e) => e.id === driverActiveTrip.emergency_id)
    : null;

  const driverHospital = driverActiveTrip
    ? hospitals.find((h) => h.id === driverActiveTrip.hospital_id)
    : null;

  return (
    <EmergencyContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        backendOnline,
        loading,
        userLocation,
        setUserLocation,
        setUserLocationAndCluster,
        detectUserGps: fetchCurrentLocation,
        fetchCurrentLocation,
        isDetectingLocation,
        reverseGeocode,
        mapFocus,
        setMapFocus,
        emergencies,
        ambulances,
        hospitals,
        trips,
        selectedEmergency,
        selectedEmergencyId,
        setSelectedEmergencyId,
        citizenEmergency,
        citizenEmergencyId,
        triggerCitizenEmergency,
        cancelCitizenEmergency,
        activeBooking,
        setActiveBooking,
        driverVehicleId,
        setDriverVehicleId,
        driverAmbulance,
        driverActiveTrip,
        driverEmergency,
        driverHospital,
        dispatchAmbulance,
        advanceTripStatus,
        activeRoute,
        setActiveRoute,
        refreshAll,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error("useEmergency must be used within an EmergencyProvider");
  }
  return context;
}

