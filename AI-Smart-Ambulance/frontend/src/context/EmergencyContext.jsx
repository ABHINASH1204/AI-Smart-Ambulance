import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiService } from "../services/api";

const EmergencyContext = createContext(null);

export function EmergencyProvider({ children }) {
  const [currentRole, setCurrentRole] = useState("ADMIN"); // 'CITIZEN' | 'DRIVER' | 'ADMIN'
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 6000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  // Citizen triggers an emergency
  const triggerCitizenEmergency = async (formData) => {
    const newEmergency = await apiService.createEmergency(formData);
    setCitizenEmergencyId(newEmergency.id);
    setSelectedEmergencyId(newEmergency.id);

    // Auto find & recommend nearest ambulance and hospital
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

    if (recommendedAmb && recommendedHosp) {
      // Auto dispatch in simulation to delight the user
      const trip = await apiService.createTrip({
        emergency_id: newEmergency.id,
        ambulance_id: recommendedAmb.id,
        hospital_id: recommendedHosp.id,
      });

      // Calculate route from ambulance to citizen
      const routeData = await apiService.getRoute(
        recommendedAmb.latitude,
        recommendedAmb.longitude,
        formData.latitude,
        formData.longitude
      );
      if (routeData && routeData.points) {
        setActiveRoute(routeData.points);
      }
    }

    await refreshAll();
    return newEmergency;
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
