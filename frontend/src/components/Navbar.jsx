import React from "react";

export function Navbar({ language, setLanguage, user, onLogout, t }) {
  const languages = [
    { name: "English", native: "English" },
    { name: "Telugu", native: "తెలుగు" },
    { name: "Hindi", native: "हिंदी" },
  ];

  return (
    <header className="app-navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="brand-logo">🌿</span>
          <span className="brand-title">{t.brandName}</span>
        </div>

        <div className="nav-controls">
          {/* Language Selector Dropdown */}
          <div className="lang-switcher">
            <span className="lang-icon">🌐</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="lang-select"
            >
              {languages.map((l) => (
                <option key={l.name} value={l.name}>
                  {l.native}
                </option>
              ))}
            </select>
          </div>

          {/* User & Logout Badge */}
          {user && (
            <div className="user-badge-container">
              <span className="user-info">
                👤 <strong>{user.name}</strong> ({user.role.toUpperCase()})
              </span>
              <button onClick={onLogout} className="logout-btn">
                🚪 {t.logout}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
