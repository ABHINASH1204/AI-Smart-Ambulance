import React, { useState } from "react";
import { EmergencyProvider, useEmergency } from "./context/EmergencyContext";
import Navbar from "./components/common/Navbar";
import UserPortal from "./pages/user/UserPortal";
import DriverPortal from "./pages/driver/DriverPortal";
import AdminPortal from "./pages/admin/AdminPortal";
import AmbulanceTracking from "./pages/tracking/AmbulanceTracking";
import DirectSosModal from "./components/emergency/DirectSosModal";
import { Siren } from "lucide-react";

function MainPortal() {
  const { currentRole } = useEmergency();

  return (
    <main className="main-content">
      {currentRole === "CITIZEN" && <UserPortal />}
      {currentRole === "TRACKING" && <AmbulanceTracking />}
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0f19",
          color: "#f8fafc",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif"
        }}>
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "16px",
            padding: "2rem",
            maxWidth: "600px",
            backdropFilter: "blur(12px)"
          }}>
            <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>⚠️ Emergency System View Notice</h2>
            <p style={{ color: "#94a3b8", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
              {this.state.error?.message || "An unexpected error occurred while rendering this component."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              🔄 Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <EmergencyProvider>
        <AppContent />
      </EmergencyProvider>
    </ErrorBoundary>
  );
}

export default App;
