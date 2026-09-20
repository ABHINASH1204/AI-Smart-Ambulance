import React from "react";
import { EmergencyProvider, useEmergency } from "./context/EmergencyContext";
import Navbar from "./components/common/Navbar";
import UserPortal from "./pages/user/UserPortal";
import DriverPortal from "./pages/driver/DriverPortal";
import AdminPortal from "./pages/admin/AdminPortal";

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

function App() {
  return (
    <EmergencyProvider>
      <div className="app-container">
        <Navbar />
        <MainPortal />
      </div>
    </EmergencyProvider>
  );
}

export default App;
