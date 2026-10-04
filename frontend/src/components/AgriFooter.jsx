import React from "react";

export function Footer() {
  return (
    <footer className="agri-footer">
      <div className="footer-container">

        <div className="footer-section footer-about">
          <h2>🌾 AgriConnect</h2>
          <p>
            A digital agricultural market-linkage platform connecting
            farmers with buyers for better price discovery and transparent trade.
          </p>
        </div>

        <div className="footer-section">
          <h3>Platform</h3>
          <p>👨‍🌾 Farmers</p>
          <p>🛒 Buyers</p>
          <p>🚚 Delivery Partners</p>
          <p>🛡️ Admin</p>
        </div>

        <div className="footer-section">
          <h3>Key Features</h3>
          <p>📊 Market Price Discovery</p>
          <p>🌾 Crop Listings</p>
          <p>🤝 Buyer Offers</p>
          <p>📦 Order & Delivery</p>
          <p>💳 Demo Payment</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 AgriConnect | Team Future Forge</p>
      </div>
    </footer>
  );
}

export default Footer;