import React, { useState, useEffect, useCallback } from "react";
import api from "../api/config";

export function BuyerDashboard({ user, t }) {
  const [activeTab, setActiveTab] = useState("browse"); // browse, offers, orders
  
  const [listings, setListings] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  
  // Filters
  const [cropFilter, setCropFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // Modal / Form state for submitting offer
  const [selectedListing, setSelectedListing] = useState(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerSuccess, setOfferSuccess] = useState("");
  const [offerError, setOfferError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const listData = await api.getListings({
        crop: cropFilter,
        location: locationFilter,
        status: "available",
      });
      setListings(listData);

      const offerData = await api.getOffers({ buyer_id: user.id });
      setMyOffers(offerData);

      const orderData = await api.getOrders({ buyer_id: user.id });
      setMyOrders(orderData);
    } catch (err) {
      console.error("Error fetching buyer data:", err);
    }
  }, [user.id, cropFilter, locationFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenOfferModal = (listing) => {
    setSelectedListing(listing);
    setOfferPrice(listing.expected_price);
    setOfferSuccess("");
    setOfferError("");
  };

  const handleSendOffer = async (e) => {
    e.preventDefault();
    if (!offerPrice || !selectedListing) return;

    setLoading(true);
    setOfferSuccess("");
    setOfferError("");

    try {
      await api.createOffer(selectedListing.id, user.id, offerPrice);
      setOfferSuccess(t.offerSubmittedSuccess || "Offer submitted successfully!");
      setTimeout(() => {
        setSelectedListing(null);
        fetchData();
      }, 1500);
    } catch (err) {
      setOfferError(err.message || "Failed to submit offer.");
    } finally {
      setLoading(false);
    }
  };
const handlePayment = async (orderId) => {
  try {
    setLoading(true);

    await api.updatePayment(orderId, "ONLINE", "PAID");

    alert("Demo Payment Successful!");

    await fetchData();
  } catch (err) {
    alert(err.message || "Payment failed.");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner buyer-theme">
        <div className="welcome-text">
          <h1>🏪 {t.welcome}, {user.name}!</h1>
          <p>📍 {user.location || "Guntur"} • {t.buyerDashboard}</p>
        </div>
        <button onClick={fetchData} className="refresh-btn">
          🔄 {t.refresh}
        </button>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === "browse" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("browse")}
        >
          🔍 {t.browseCrops}
        </button>

        <button
          className={activeTab === "offers" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("offers")}
        >
          🏷️ {t.buyerMyOffers} ({myOffers.length})
        </button>

        <button
          className={activeTab === "orders" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("orders")}
        >
          📦 {t.myOrders} ({myOrders.length})
        </button>
      </div>

      {/* TAB 1: BROWSE FARMER LISTINGS */}
      {activeTab === "browse" && (
        <div className="tab-content">
          <div className="card shadow">
            <h2>🌾 {t.availableListings}</h2>

            <div className="filters-row margin-bottom">
              <select
                value={cropFilter}
                onChange={(e) => setCropFilter(e.target.value)}
              >
                <option value="">{t.allCrops}</option>
                {["Tomato", "Onion", "Rice", "Chilli", "Maize"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder={t.location}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="text-input"
              />
            </div>

            {listings.length === 0 ? (
              <p className="muted">{t.noData}</p>
            ) : (
              <div className="listings-grid">
                {listings.map((item) => (
                  <div key={item.id} className="listing-card shadow-sm">
                    <div className="listing-header">
                      <h3>{item.crop_name}</h3>
                      <span className="status-badge available">AVAILABLE</span>
                    </div>
                    <p>👨‍🌾 <strong>Farmer:</strong> {item.farmer_name}</p>
                    <p>📍 <strong>Location:</strong> {item.location}</p>
                    <p>📦 <strong>Lot Quantity:</strong> {item.quantity} {item.unit}</p>
                    <p className="expected-price">
                      💰 <strong>{t.expectedPriceLabel}:</strong> <span className="price-big">₹{item.expected_price}/{item.unit}</span>
                    </p>

                    <button
                      onClick={() => handleOpenOfferModal(item)}
                      className="primary-btn full-width margin-top"
                    >
                      🤝 {t.makeOffer}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY OFFERS SENT */}
      {activeTab === "offers" && (
        <div className="tab-content">
          <div className="card shadow">
            <h2>🏷️ {t.buyerMyOffers}</h2>

            {myOffers.length === 0 ? (
              <p className="muted">{t.noData}</p>
            ) : (
              <div className="offers-grid">
                {myOffers.map((off) => (
                  <div key={off.id} className="offer-card shadow-sm">
                    <div className="offer-header">
                      <h3>{off.crop_name} (Lot #{off.listing_id})</h3>
                      <span className={`status-badge ${off.status}`}>
                        {off.status.toUpperCase()}
                      </span>
                    </div>
                    <p>👨‍🌾 <strong>Farmer:</strong> {off.farmer_name}</p>
                    <p>📍 <strong>Farmer Location:</strong> {off.listing_location}</p>
                    <p>📦 <strong>Quantity:</strong> {off.quantity} {off.unit}</p>
                    <p>💵 <strong>My Offered Price:</strong> ₹{off.offer_price}/{off.unit}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MY ORDERS */}
      {activeTab === "orders" && (
        <div className="tab-content">
          <div className="card shadow">
            <h2>📦 {t.myOrders}</h2>

            {myOrders.length === 0 ? (
              <p className="muted">{t.noData}</p>
            ) : (
              <div className="orders-grid">
                {myOrders.map((ord) => (
                  <div key={ord.order_id} className="order-card shadow-sm">
                    <div className="order-header">
                      <h3>Order #{ord.order_id} - {ord.crop_name}</h3>
                      <span className={`status-badge ${ord.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {ord.status.toUpperCase()}
                      </span>
                    </div>
                    <p>👨‍🌾 <strong>Farmer:</strong> {ord.farmer_name} ({ord.farmer_phone})</p>
                    <p>📦 <strong>Quantity:</strong> {ord.quantity} {ord.unit}</p>
                    <p>💰 <strong>Agreed Price:</strong> ₹{ord.final_price}/{ord.unit}</p>
                    <p>💳 <strong>Payment Method:</strong> {ord.payment_method || "COD"}</p>
                    <p>💰 <strong>Payment Status:</strong> {ord.payment_status || "PENDING"}</p>
                    <p>🚚 <strong>Carrier:</strong> {ord.delivery_partner_name || "Assigning carrier..."}</p>
                    {(ord.payment_status || "PENDING").toUpperCase() !== "PAID" && (
  <button
    className="primary-btn"
    onClick={() => handlePayment(ord.order_id)}
    disabled={loading}
  >
    {loading ? "Processing..." : "Pay Now (Demo)"}
  </button>
)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAKE OFFER MODAL */}
      {selectedListing && (
        <div className="modal-backdrop">
          <div className="modal-content card shadow-lg">
            <h3>🤝 {t.makeOffer} for {selectedListing.crop_name}</h3>
            <p>Farmer: {selectedListing.farmer_name} | Location: {selectedListing.location}</p>
            <p>Lot Size: <strong>{selectedListing.quantity} {selectedListing.unit}</strong></p>
            <p>Expected Price: <strong>₹{selectedListing.expected_price}/{selectedListing.unit}</strong></p>

            {offerSuccess && <div className="alert-box success">{offerSuccess}</div>}
            {offerError && <div className="alert-box error">{offerError}</div>}

            <form onSubmit={handleSendOffer} className="modal-form">
              <div className="form-group">
                <label>{t.enterOfferPrice}</label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="e.g. 26"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="primary-btn submit-btn"
                  disabled={loading}
                >
                  {loading ? t.loading : `🚀 ${t.submitOfferBtn}`}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  className="cancel-btn"
                >
                  ❌ {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerDashboard;
