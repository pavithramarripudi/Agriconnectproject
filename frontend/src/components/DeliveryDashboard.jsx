import React, { useState, useEffect, useCallback } from "react";
import api from "../api/config";

export function DeliveryDashboard({ user, t }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.getOrders({ delivery_partner_id: user.id });
      setOrders(data);
    } catch (err) {
      console.error("Error fetching delivery orders:", err);
    }
  }, [user.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      await api.updateOrderStatus(orderId, newStatus, user.id);
      fetchOrders();
    } catch (err) {
      alert(err.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-banner delivery-theme">
        <div className="welcome-text">
          <h1>🚚 {t.welcome}, {user.name}!</h1>
          <p>📍 {user.location || "Vijayawada"} • {t.deliveryDashboard}</p>
        </div>
        <button onClick={fetchOrders} className="refresh-btn">
          🔄 {t.refresh}
        </button>
      </div>

      <div className="card shadow">
        <h2>📦 {t.ordersTitle}</h2>

        {orders.length === 0 ? (
          <p className="muted">{t.noData}</p>
        ) : (
          <div className="orders-grid">
            {orders.map((ord) => (
              <div key={ord.order_id} className="order-card shadow-sm">
                <div className="order-header">
                  <h3>Order #{ord.order_id} - {ord.crop_name}</h3>
                  <span className={`status-badge ${ord.status.replace(/\s+/g, '-').toLowerCase()}`}>
                    {ord.status.toUpperCase()}
                  </span>
                </div>

                <div className="delivery-details">
                  <p>📍 <strong>Pickup (Farmer):</strong> {ord.farmer_name} ({ord.farmer_location}) - 📞 {ord.farmer_phone}</p>
                  <p>🎯 <strong>Delivery (Buyer):</strong> {ord.buyer_name} ({ord.buyer_location}) - 📞 {ord.buyer_phone}</p>
                  <p>📦 <strong>Quantity:</strong> {ord.quantity} {ord.unit}</p>
                  <p>💰 <strong>Freight/Price:</strong> ₹{ord.final_price}</p>
                </div>

                <div className="status-update-actions margin-top">
                  {ord.status === "confirmed" && (
                    <button
                      onClick={() => handleUpdateStatus(ord.order_id, "In Transit")}
                      className="action-btn accept-btn full-width"
                      disabled={loading}
                    >
                      🚚 Start Transit ({t.inTransit})
                    </button>
                  )}

                  {ord.status === "In Transit" && (
                    <button
                      onClick={() => handleUpdateStatus(ord.order_id, "Delivered")}
                      className="action-btn accept-btn full-width"
                      disabled={loading}
                    >
                      ✅ Mark Delivered ({t.delivered})
                    </button>
                  )}

                  {ord.status === "Delivered" && (
                    <div className="alert-box success text-center font-bold">
                      🎉 Delivery Completed Successfully!
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryDashboard;
