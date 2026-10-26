import { useState } from "react";
import { useAuth } from "./AuthContext.jsx";

import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Booking from "./pages/Booking.jsx";
import Stations from "./pages/Stations.jsx";
import Sessions from "./pages/Sessions.jsx";
import Chargers from "./pages/Chargers.jsx";
import Transactions from "./pages/Transactions.jsx";
import Users from "./pages/Users.jsx";
import Reports from "./pages/Reports.jsx";
import Alerts from "./pages/Alerts.jsx";
import Settings from "./pages/Settings.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

function App() {
  const { isLoggedIn } = useAuth();
  const [authPage, setAuthPage] = useState("login");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedStation, setSelectedStation] = useState(null);

  if (!isLoggedIn) {
    return authPage === "login"
      ? <Login onSwitchToSignup={() => setAuthPage("signup")} />
      : <Signup onSwitchToLogin={() => setAuthPage("login")} />;
  }

  return (
    <div className="min-h-screen bg-[#020b13] text-white">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div className="lg:pl-[225px]">
        <Header
          setMobileOpen={setMobileOpen}
          setCurrentPage={(page, station) => {
            if (station) setSelectedStation(station);
            setCurrentPage(page);
          }}
        />

        {currentPage === "dashboard" && <Dashboard />}

        {currentPage === "stations" && (
          <Stations
            setCurrentPage={setCurrentPage}
            setSelectedStation={setSelectedStation}
          />
        )}

        {currentPage === "booking" && (
          <Booking selectedStation={selectedStation} />
        )}

        {currentPage === "sessions" && <Sessions />}
        {currentPage === "chargers" && <Chargers />}
        {currentPage === "transactions" && <Transactions />}
        {currentPage === "users" && <Users />}
        {currentPage === "reports" && <Reports />}
        {currentPage === "alerts" && <Alerts />}
        {currentPage === "settings" && <Settings />}
      </div>
    </div>
  );
}

export default App;
