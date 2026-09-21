import React, { useState } from "react";
import { EmergencyProvider, useEmergency } from "./context/EmergencyContext";
import Navbar from "./components/common/Navbar";
import UserPortal from "./pages/user/UserPortal";
import DriverPortal from "./pages/driver/DriverPortal";
import AdminPortal from "./pages/admin/AdminPortal";
import DirectSosModal from "./components/emergency/DirectSosModal";
import { Siren } from "lucide-react";

function MainPortal() {
  const { currentRole } = useEmergency();

  return (
    <main className="main-content">
      {currentRole === "CITIZEN" && <UserPortal />}
      {currentRole === "DRIVER" && <DriverPortal />}
      {currentRole === "ADMIN" && <AdminPortal />}
    </main>
  );
}

function AppContent() {
  const [isDirectSosOpen, setIsDirectSosOpen] = useState(false);

  return (
    <div className="app-container">
      <Navbar onOpenDirectSos={() => setIsDirectSosOpen(true)} />
      <MainPortal />

      {/* Floating Action Button (FAB) for Direct SOS available on all screens */}
      <button
        className="floating-sos-fab"
        onClick={() => setIsDirectSosOpen(true)}
        title="Immediate 1-Tap Direct SOS"
        aria-label="Direct Emergency SOS Button"
        id="global-floating-sos-fab"
      >
        <span className="fab-pulse-ring"></span>
        <span className="fab-pulse-ring delay"></span>
        <Siren size={26} color="#ffffff" className="siren-shake-anim" />
        <span className="fab-label">DIRECT SOS</span>
      </button>

      {/* Direct SOS Modal */}
      <DirectSosModal
        isOpen={isDirectSosOpen}
        onClose={() => setIsDirectSosOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <EmergencyProvider>
      <AppContent />
    </EmergencyProvider>
  );
}

export default App;
