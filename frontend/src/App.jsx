import React, { useState, useEffect } from "react";
import "./App.css";

import { translations } from "./translations";
import Navbar from "./components/Navbar";
import Splash from "./components/Splash";
import LanguageSelection from "./components/LanguageSelection";
import RoleSelection from "./components/RoleSelection";
import AuthScreen from "./components/AuthScreen";
import FarmerDashboard from "./components/FarmerDashboard";
import BuyerDashboard from "./components/BuyerDashboard";
import DeliveryDashboard from "./components/DeliveryDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Footer from "./components/AgriFooter";

function App() {
  const [screen, setScreen] = useState("splash"); // splash, language, role, auth, dashboard
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("agri_lang") || "English";
  });
  const [role, setRole] = useState("");
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("agri_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Active translation dictionary
  const t = translations[language] || translations.English;

  // Persist language selection
  useEffect(() => {
    localStorage.setItem("agri_lang", language);
  }, [language]);

  // Persist user session if logged in
  useEffect(() => {
    if (user) {
      localStorage.setItem("agri_user", JSON.stringify(user));
      setScreen("dashboard");
    } else {
      localStorage.removeItem("agri_user");
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setRole("");
    setScreen("role");
  };

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    setScreen("auth");
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setScreen("dashboard");
  };

  return (
    <div className="app-main-layout">
      {/* Navbar rendered on all screens except splash */}
      {screen !== "splash" && (
        <Navbar
          language={language}
          setLanguage={setLanguage}
          user={user}
          onLogout={handleLogout}
          t={t}
        />
      )}

      <main className="app-body">
        {screen === "splash" && (
          <Splash onFinish={() => setScreen(user ? "dashboard" : "language")} />
        )}

        {screen === "language" && (
          <LanguageSelection
            language={language}
            setLanguage={setLanguage}
            onContinue={() => setScreen("role")}
            t={t}
          />
        )}

        {screen === "role" && (
          <RoleSelection
            onSelectRole={handleSelectRole}
            onBack={() => setScreen("language")}
            t={t}
          />
        )}

        {screen === "auth" && (
          <AuthScreen
            role={role}
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setScreen("role")}
            t={t}
          />
        )}

        {screen === "dashboard" && user && (
          <>
            {user.role === "farmer" && (
              <FarmerDashboard
                user={user}
                t={t}
                language={language}
             />
            )}
            
            {user.role === "buyer" && <BuyerDashboard user={user} t={t} />}
            {user.role === "delivery" && <DeliveryDashboard user={user} t={t} />}
            {user.role === "admin" && <AdminDashboard user={user} t={t} />}
          </>
        )}
            </main>

      {screen !== "splash" && <Footer />}

    </div>
  );
}

export default App;