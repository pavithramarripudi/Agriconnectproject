import React, { useState } from "react";
import api from "../api/config";

export function AuthScreen({ role, onLoginSuccess, onBack, t }) {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getRoleTitle = (r) => {
    switch (r) {
      case "farmer":
        return t.farmer;
      case "buyer":
        return t.buyer;
      case "delivery":
        return t.delivery;
      case "admin":
        return t.admin;
      default:
        return r;
    }
  };

  // Quick fill helper for demo convenience
  const fillDemoUser = () => {
    if (role === "farmer") {
      setPhone("9876543210");
      setPassword("demo123");
    } else if (role === "buyer") {
      setPhone("9876501234");
      setPassword("demo123");
    } else if (role === "delivery") {
      setPhone("9876599999");
      setPassword("demo123");
    } else if (role === "admin") {
      setPhone("9999999999");
      setPassword("admin123");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        if (!name || !phone || !password || !location) {
          setError("All fields are required.");
          setLoading(false);
          return;
        }
        const res = await api.register(name, phone, password, location, role);
        onLoginSuccess(res.user);
      } else {
        if (!phone || !password) {
          setError("Phone number and password are required.");
          setLoading(false);
          return;
        }
        const res = await api.login(phone, password, role);
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card auth-card shadow-lg">
        <button className="back-btn" onClick={onBack} title={t.back}>
          ← {t.back}
        </button>

        <div className="small-logo">🌿</div>

        <h2>
          {getRoleTitle(role)} {isRegister ? t.register : t.login}
        </h2>
        <p className="subtitle">
          {isRegister ? t.createAccount : `AgriConnect ${getRoleTitle(role)} Portal`}
        </p>

        {error && <div className="alert-box error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label>{t.fullName}</label>
              <input
                type="text"
                placeholder={t.enterName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>{t.phoneNumber}</label>
            <input
              type="tel"
              placeholder={t.enterPhone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>{t.password}</label>
            <input
              type="password"
              placeholder={t.enterPassword}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>{t.location}</label>
              <input
                type="text"
                placeholder={t.enterLocation}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="primary-btn submit-btn" disabled={loading}>
            {loading ? t.loading : isRegister ? t.register : t.login}
          </button>
        </form>

        <div className="auth-toggle">
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
          >
            {isRegister ? t.alreadyHaveAccount : t.createAccount}
          </button>
        </div>

        {/* Demo Credentials Quick Fill Box */}
        <div className="demo-credentials-box">
          <span className="demo-badge">💡 Prototype Demo</span>
          <button type="button" onClick={fillDemoUser} className="demo-fill-btn">
            Auto-fill {getRoleTitle(role)} Demo Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;
