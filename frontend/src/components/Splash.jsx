import React, { useEffect } from "react";

export function Splash({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen">
      <div className="logo-circle">
        <span>🌿</span>
      </div>

      <h1 className="brand-name">AgriConnect</h1>

      <p className="tagline">
        Better Markets • Fair Prices
        <br />
        Stronger Farmers
      </p>

      <div className="farm-scene">
        <div className="sun">☀️</div>
        <div className="fields">🌱 🌱 🌱 🌱 🌱</div>
      </div>

      <div className="loading-bar">
        <div className="loading-progress"></div>
      </div>
    </div>
  );
}

export default Splash;
