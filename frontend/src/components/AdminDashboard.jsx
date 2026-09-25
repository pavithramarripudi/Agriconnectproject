import React, { useState, useEffect, useCallback } from "react";
import api from "../api/config";

export function AdminDashboard({ user, t }) {
  const [stats, setStats] = useState({
    total_farmers: 0,
    total_buyers: 0,
    total_listings: 0,
    total_offers: 0,
    total_orders: 0,
  });

  const [activeTab, setActiveTab] = useState("stats");
  const [usersList, setUsersList] = useState([]);
  const [listingsList, setListingsList] = useState([]);
  const [pricesList, setPricesList] = useState([]);
  const [offersList, setOffersList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);

  const fetchAdminData = useCallback(async () => {
    try {
      const statsData = await api.getAdminStats();
      setStats(statsData);

      const usersData = await api.getAdminUsers();
      setUsersList(usersData);

      const listData = await api.getListings({});
      setListingsList(listData);

      const pricesData = await api.getMarketPrices("", "");
      setPricesList(pricesData.prices || []);

      const offersData = await api.getOffers({});
      setOffersList(offersData);

      const ordersData = await api.getOrders({});
      setOrdersList(ordersData);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  return (
    <div className="dashboard-container">
      <div className="welcome-banner admin-theme">
        <div className="welcome-text">
          <h1>🛡️ {t.adminDashboard}</h1>
          <p>System Administrator Control Panel</p>
        </div>
        <button onClick={fetchAdminData} className="refresh-btn">
          🔄 {t.refresh}
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="stats-grid shadow-sm margin-bottom">
        <div className="stat-card shadow-sm">
          <div className="stat-icon">👨‍🌾</div>
          <div className="stat-info">
            <h3>{stats.total_farmers}</h3>
            <p>{t.totalFarmers}</p>
          </div>
        </div>

        <div className="stat-card shadow-sm">
          <div className="stat-icon">🏪</div>
          <div className="stat-info">
            <h3>{stats.total_buyers}</h3>
            <p>{t.totalBuyers}</p>
          </div>
        </div>

        <div className="stat-card shadow-sm">
          <div className="stat-icon">🌱</div>
          <div className="stat-info">
            <h3>{stats.total_listings}</h3>
            <p>{t.totalListings}</p>
          </div>
        </div>

        <div className="stat-card shadow-sm">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <h3>{stats.total_offers}</h3>
            <p>{t.totalOffers}</p>
          </div>
        </div>

        <div className="stat-card shadow-sm">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats.total_orders}</h3>
            <p>{t.totalOrders}</p>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === "users" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("users")}
        >
          👥 {t.userManagement} ({usersList.length})
        </button>
        <button
          className={activeTab === "listings" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("listings")}
        >
          🌾 Crop Listings ({listingsList.length})
        </button>
        <button
          className={activeTab === "prices" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("prices")}
        >
          📊 Mandi Prices ({pricesList.length})
        </button>
        <button
          className={activeTab === "orders" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("orders")}
        >
          📦 Orders ({ordersList.length})
        </button>
      </div>

      {/* ADMIN TAB CONTENTS */}
      {activeTab === "users" && (
        <div className="tab-content card shadow">
          <h3>👥 Registered Platform Users</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.phone}</td>
                    <td><span className={`role-badge ${u.role}`}>{u.role.toUpperCase()}</span></td>
                    <td>{u.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "listings" && (
        <div className="tab-content card shadow">
          <h3>🌾 All Active Crop Listings</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Farmer</th>
                  <th>Crop</th>
                  <th>Quantity</th>
                  <th>Expected Price</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {listingsList.map((l) => (
                  <tr key={l.id}>
                    <td>#{l.id}</td>
                    <td>{l.farmer_name}</td>
                    <td><strong>{l.crop_name}</strong></td>
                    <td>{l.quantity} {l.unit}</td>
                    <td>₹{l.expected_price}/{l.unit}</td>
                    <td>{l.location}</td>
                    <td><span className={`status-badge ${l.status}`}>{l.status.toUpperCase()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "prices" && (
        <div className="tab-content card shadow">
          <h3>📊 Mandi Market Prices</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Mandi / Market</th>
                  <th>Location</th>
                  <th>Min Price</th>
                  <th>Max Price</th>
                  <th>Modal Price</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {pricesList.map((p, i) => (
                  <tr key={p.id || i}>
                    <td><strong>{p.crop_name}</strong></td>
                    <td>{p.market_name}</td>
                    <td>{p.location}</td>
                    <td>₹{p.min_price}</td>
                    <td>₹{p.max_price}</td>
                    <td className="highlight-text font-bold">₹{p.modal_price}</td>
                    <td>{p.price_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="tab-content card shadow">
          <h3>📦 Transactions & Orders</h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Crop</th>
                  <th>Farmer</th>
                  <th>Buyer</th>
                  <th>Quantity</th>
                  <th>Agreed Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ordersList.map((o) => (
                  <tr key={o.order_id}>
                    <td>#{o.order_id}</td>
                    <td><strong>{o.crop_name}</strong></td>
                    <td>{o.farmer_name}</td>
                    <td>{o.buyer_name}</td>
                    <td>{o.quantity} {o.unit}</td>
                    <td>₹{o.final_price}/{o.unit}</td>
                    <td><span className={`status-badge ${o.status.replace(/\s+/g, '-').toLowerCase()}`}>{o.status.toUpperCase()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
