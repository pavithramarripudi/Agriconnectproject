import React, { useState, useEffect, useCallback } from "react";
import api from "../api/config";

export function FarmerDashboard({ user, t, language }) {
  const [activeTab, setActiveTab] = useState("overview"); // overview, sell, market, buyers, offers, orders
  
  // Data states
  const [crops, setCrops] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  
  // Filter states
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [selectedLocation, setSelectedLocation] = useState("");

  // Sell Form state
  const [formCrop, setFormCrop] = useState("Tomato");
  const [formQty, setFormQty] = useState("");
  const [formUnit, setFormUnit] = useState("kg");
  const [formPrice, setFormPrice] = useState("");
  const [formLocation, setFormLocation] = useState(user?.location || "Vijayawada");
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const cropsData = await api.getCrops();
      setCrops(cropsData.crops || cropsData);

      const mpData = await api.getMarketPrices(selectedCrop, selectedLocation);
      setMarketPrices(mpData.prices || []);

      const listData = await api.getListings({ farmer_id: user.id });
      setMyListings(listData);

      const offerData = await api.getOffers({ farmer_id: user.id });
      setOffers(offerData);

      const orderData = await api.getOrders({ farmer_id: user.id });
      setOrders(orderData);

      const recData = await api.getRecommendations(selectedCrop, user?.location);
      setRecommendation(recData);
    } catch (err) {
      console.error("Error fetching farmer dashboard data:", err);
    }
  }, [user.id, user.location, selectedCrop, selectedLocation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
// ================= MULTILINGUAL VOICE AGENT =================

const voiceConfig = {
  English: {
    code: "en-IN",
    listening: "I am listening",
    market: "Opening market prices",
    sell: "Opening sell crop",
    offers: "Opening buyer offers",
    orders: "Opening your orders",
    dashboard: "Opening farmer dashboard",
    unknown: "Sorry, I did not understand that command",
  },

  Telugu: {
    code: "te-IN",
    listening: "నేను వింటున్నాను",
    market: "మార్కెట్ ధరలు తెరుస్తున్నాను",
    sell: "పంట అమ్మే పేజీ తెరుస్తున్నాను",
    offers: "కొనుగోలుదారుల ఆఫర్లు తెరుస్తున్నాను",
    orders: "మీ ఆర్డర్లు తెరుస్తున్నాను",
    dashboard: "రైతు డాష్‌బోర్డ్ తెరుస్తున్నాను",
    unknown: "క్షమించండి, మీ మాట నాకు అర్థం కాలేదు",
  },

  Hindi: {
    code: "hi-IN",
    listening: "मैं सुन रही हूँ",
    market: "बाजार भाव खोल रही हूँ",
    sell: "फसल बेचने का पेज खोल रही हूँ",
    offers: "खरीदारों के ऑफर खोल रही हूँ",
    orders: "आपके ऑर्डर खोल रही हूँ",
    dashboard: "किसान डैशबोर्ड खोल रही हूँ",
    unknown: "माफ कीजिए, मैं आपकी बात समझ नहीं पाई",
  },
};

const getVoiceConfig = () => {
  return voiceConfig[language] || voiceConfig.English;
};

const speak = (message) => {
  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(message);
  speech.lang = getVoiceConfig().code;

  window.speechSynthesis.speak(speech);
};

const startVoiceAssistant = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert(
      "Voice recognition is not supported in this browser. Please use Google Chrome."
    );
    return;
  }

  const config = getVoiceConfig();

  const recognition = new SpeechRecognition();

  recognition.lang = config.code;
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    speak(config.listening);
  };

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();

    console.log("Voice language:", language);
    console.log("Voice command:", command);

    // ---------- ENGLISH ----------
    if (language === "English") {
      if (
        command.includes("market") ||
        command.includes("price")
      ) {
        setActiveTab("market");
        speak(config.market);
      }

      else if (
        command.includes("sell") ||
        command.includes("crop")
      ) {
        setActiveTab("sell");
        speak(config.sell);
      }

      else if (command.includes("offer")) {
        setActiveTab("offers");
        speak(config.offers);
      }

      else if (command.includes("order")) {
        setActiveTab("orders");
        speak(config.orders);
      }

      else if (
        command.includes("home") ||
        command.includes("dashboard")
      ) {
        setActiveTab("overview");
        speak(config.dashboard);
      }

      else {
        speak(config.unknown);
      }
    }

    // ---------- TELUGU ----------
    else if (language === "Telugu") {
      if (
        command.includes("మార్కెట్") ||
        command.includes("ధర") ||
        command.includes("ధరలు")
      ) {
        setActiveTab("market");
        speak(config.market);
      }

      else if (
        command.includes("అమ్మ") ||
        command.includes("పంట అమ్మ")
      ) {
        setActiveTab("sell");
        speak(config.sell);
      }

      else if (
        command.includes("ఆఫర్") ||
        command.includes("ఆఫర్లు")
      ) {
        setActiveTab("offers");
        speak(config.offers);
      }

      else if (
        command.includes("ఆర్డర్") ||
        command.includes("ఆర్డర్లు")
      ) {
        setActiveTab("orders");
        speak(config.orders);
      }

      else if (
        command.includes("హోమ్") ||
        command.includes("డాష్‌బోర్డ్")
      ) {
        setActiveTab("overview");
        speak(config.dashboard);
      }

      else {
        speak(config.unknown);
      }
    }

    // ---------- HINDI ----------
    else if (language === "Hindi") {
      if (
        command.includes("बाजार") ||
        command.includes("भाव") ||
        command.includes("कीमत")
      ) {
        setActiveTab("market");
        speak(config.market);
      }

      else if (
        command.includes("बेच") ||
        command.includes("फसल")
      ) {
        setActiveTab("sell");
        speak(config.sell);
      }

      else if (
        command.includes("ऑफर") ||
        command.includes("प्रस्ताव")
      ) {
        setActiveTab("offers");
        speak(config.offers);
      }

      else if (
        command.includes("ऑर्डर") ||
        command.includes("आर्डर")
      ) {
        setActiveTab("orders");
        speak(config.orders);
      }

      else if (
        command.includes("होम") ||
        command.includes("डैशबोर्ड")
      ) {
        setActiveTab("overview");
        speak(config.dashboard);
      }

      else {
        speak(config.unknown);
      }
    }
  };

  recognition.onerror = (event) => {
    console.error("Voice recognition error:", event.error);
  };

  recognition.start();
};
  // Handle Sell Crop Submission
  const handleListCrop = async (e) => {
    e.preventDefault();
    setFormSuccess("");
    setFormError("");

    if (!formQty || !formPrice || !formLocation) {
      setFormError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.createListing(
        user.id,
        formCrop,
        formQty,
        formUnit,
        formPrice,
        formLocation
      );
      setFormSuccess(t.cropListedSuccess || "Crop listed successfully.");
      setFormQty("");
      setFormPrice("");
      fetchData();
    } catch (err) {
      setFormError(err.message || "Failed to list crop.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Accept Offer
  const handleAcceptOffer = async (offerId) => {
    try {
      const res = await api.updateOffer(offerId, "accept");
      alert(t.offerAcceptedMsg || "Offer accepted successfully!");
      fetchData();
    } catch (err) {
      alert(err.message || "Failed to accept offer.");
    }
  };

  // Handle Reject Offer
  const handleRejectOffer = async (offerId) => {
    try {
      await api.updateOffer(offerId, "reject");
      alert(t.offerRejectedMsg || "Offer rejected.");
      fetchData();
    } catch (err) {
      alert(err.message || "Failed to reject offer.");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>👨‍🌾 {t.welcome}, {user.name}!</h1>
          <p>📍 {user.location || "Vijayawada"} • {t.farmerDashboard}</p>
        </div>
        <button onClick={fetchData} className="refresh-btn">
          🔄 {t.refresh}
        </button>
       <button
  onClick={startVoiceAssistant}
  className="voice-agent-btn"
  title="AgriConnect Voice Agent"
>
  🎙️
</button>
      </div>

      {/* Navigation Buttons Grid */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === "overview" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("overview")}
        >
          🌟 {t.todaysBestPrice}
        </button>

        <button
          className={activeTab === "sell" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("sell")}
        >
          ➕ {t.sellCrop}
        </button>

        <button
          className={activeTab === "market" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("market")}
        >
          📊 {t.marketPrices}
        </button>

        <button
          className={activeTab === "offers" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("offers")}
        >
          🏷️ {t.myOffers} ({offers.filter(o => o.status === "pending").length})
        </button>

        <button
          className={activeTab === "orders" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("orders")}
        >
          📦 {t.myOrders} ({orders.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & AI RECOMMENDATION */}
      {activeTab === "overview" && (
        <div className="tab-content">
          {/* Best Price Recommendation Card */}
          <div className="card recommendation-card shadow-lg">
            <div className="rec-header">
              <span className="rec-badge">🤖 Smart Price Discovery</span>
              <h2>{t.todaysBestPrice} for {selectedCrop}</h2>
            </div>

            <div className="crop-selector-row">
              <label>Select Crop: </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="select-input"
              >
                {["Tomato", "Onion", "Rice", "Chilli", "Maize"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {recommendation && recommendation.best_recommendation ? (
              <div className="recommendation-box highlight">
                <div className="rec-price-badge">
                  {t.bestAvailablePrice}: <strong>{recommendation.best_recommendation.price}</strong>
                </div>
                <h3>📍 {recommendation.best_recommendation.name}</h3>
                <p className="location-tag">Location: {recommendation.best_recommendation.location}</p>
                <div className="rec-reason font-bold">
                  💡 {t.recommendationReason}: {recommendation.best_recommendation.reason}
                </div>
              </div>
            ) : (
              <p className="muted">{t.loading}</p>
            )}
          </div>

          {/* Price Comparison Card */}
          <div className="card shadow">
            <h3>📊 {t.priceComparisonTitle} ({selectedCrop})</h3>

            <div className="comparison-grid">
              {marketPrices
                .filter((p) => p.crop_name.toLowerCase() === selectedCrop.toLowerCase())
                .map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`comparison-card ${idx === 0 ? "highest-price" : ""}`}
                  >
                    {idx === 0 && <span className="top-badge">🏆 Highest Price</span>}
                    <h4>{m.market_name}</h4>
                    <p className="location font-muted">📍 {m.location}</p>
                    <div className="modal-price">₹{m.modal_price} <small>/ qtl</small></div>
                    <div className="price-range">Range: ₹{m.min_price} - ₹{m.max_price}</div>
                  </div>
                ))}
            </div>

            <div className="disclaimer-text">ℹ️ {t.sampleDataNote}</div>
          </div>
        </div>
      )}

      {/* TAB 2: SELL CROP FORM */}
      {activeTab === "sell" && (
        <div className="tab-content">
          <div className="card form-card shadow-lg">
            <h2>🌱 {t.listCropTitle}</h2>

            {formSuccess && <div className="alert-box success">{formSuccess}</div>}
            {formError && <div className="alert-box error">{formError}</div>}

            <form onSubmit={handleListCrop} className="grid-form">
              <div className="form-group">
                <label>{t.cropName}</label>
                <select
                  value={formCrop}
                  onChange={(e) => setFormCrop(e.target.value)}
                >
                  {["Tomato", "Onion", "Rice", "Chilli", "Maize"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t.quantity}</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={formQty}
                  onChange={(e) => setFormQty(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t.unit}</label>
                <select
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                >
                  <option value="kg">kg (Kilograms)</option>
                  <option value="quintal">quintal (100 kg)</option>
                  <option value="ton">ton (1000 kg)</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t.expectedPrice}</label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>{t.location}</label>
                <input
                  type="text"
                  placeholder="e.g. Vijayawada Mandi"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="primary-btn submit-btn full-width"
                disabled={loading}
              >
                {loading ? t.loading : `🚀 ${t.listCropBtn}`}
              </button>
            </form>
          </div>

          {/* Active Listings */}
          <div className="card shadow margin-top">
            <h3>📦 {t.activeListings}</h3>
            {myListings.length === 0 ? (
              <p className="muted">{t.noData}</p>
            ) : (
              <div className="listings-grid">
                {myListings.map((item) => (
                  <div key={item.id} className="listing-card">
                    <div className="listing-header">
                      <h4>{item.crop_name}</h4>
                      <span className={`status-badge ${item.status}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <p>📦 <strong>{item.quantity} {item.unit}</strong></p>
                    <p>💰 <strong>₹{item.expected_price}/{item.unit}</strong></p>
                    <p>📍 {item.location}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MARKET PRICES */}
      {activeTab === "market" && (
        <div className="tab-content">
          <div className="card shadow">
            <h2>📈 {t.priceDiscoveryTitle}</h2>
            <p className="disclaimer-text">ℹ️ {t.sampleDataNote}</p>

            <div className="filters-row">
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
              >
                <option value="">{t.allCrops}</option>
                {["Tomato", "Onion", "Rice", "Chilli", "Maize"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t.cropName}</th>
                    <th>{t.marketMandi}</th>
                    <th>{t.location}</th>
                    <th>{t.minPrice} (₹/qtl)</th>
                    <th>{t.maxPrice} (₹/qtl)</th>
                    <th>{t.modalPrice} (₹/qtl)</th>
                    <th>{t.priceDate}</th>
                  </tr>
                </thead>
                <tbody>
                  {marketPrices.map((mp, i) => (
                    <tr key={mp.id || i}>
                      <td><strong>{mp.crop_name}</strong></td>
                      <td>{mp.market_name}</td>
                      <td>{mp.location}</td>
                      <td>₹{mp.min_price}</td>
                      <td>₹{mp.max_price}</td>
                      <td className="font-bold highlight-text">₹{mp.modal_price}</td>
                      <td>{mp.price_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OFFERS FROM BUYERS */}
      {activeTab === "offers" && (
        <div className="tab-content">
          <div className="card shadow">
            <h2>🏷️ {t.buyerOffersTitle}</h2>
            {offers.length === 0 ? (
              <p className="muted">{t.noData}</p>
            ) : (
              <div className="offers-grid">
                {offers.map((off) => (
                  <div key={off.id} className="offer-card shadow-sm">
                    <div className="offer-header">
                      <h3>{off.crop_name} (Lot #{off.listing_id})</h3>
                      <span className={`status-badge ${off.status}`}>
                        {off.status.toUpperCase()}
                      </span>
                    </div>
                    <p>👤 <strong>{t.buyerName}:</strong> {off.buyer_name} ({off.buyer_phone})</p>
                    <p>📍 <strong>Location:</strong> {off.buyer_location}</p>
                    <p>📦 <strong>Lot Size:</strong> {off.quantity} {off.unit}</p>
                    <p>💰 <strong>Expected Price:</strong> ₹{off.expected_price}/{off.unit}</p>
                    <p className="offered-price">
                      💵 <strong>{t.offeredPrice}:</strong> <span className="price-big">₹{off.offer_price}/{off.unit}</span>
                    </p>

                    {off.status === "pending" && (
                      <div className="action-buttons">
                        <button
                          onClick={() => handleAcceptOffer(off.id)}
                          className="action-btn accept-btn"
                        >
                          ✅ {t.acceptOffer}
                        </button>
                        <button
                          onClick={() => handleRejectOffer(off.id)}
                          className="action-btn reject-btn"
                        >
                          ❌ {t.rejectOffer}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: MY ORDERS */}
      {activeTab === "orders" && (
        <div className="tab-content">
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
                    <p>👤 <strong>{t.buyerName}:</strong> {ord.buyer_name} ({ord.buyer_phone})</p>
                    <p>📦 <strong>Quantity:</strong> {ord.quantity} {ord.unit}</p>
                    <p>💰 <strong>Agreed Price:</strong> ₹{ord.final_price}/{ord.unit}</p>
                    <p>
  💵 <strong>Total Amount:</strong> ₹
  {(Number(ord.quantity) * Number(ord.final_price)).toLocaleString("en-IN")}
</p>

<p>
  💳 <strong>Payment Status:</strong>{" "}
  {(ord.payment_status || "PENDING").toUpperCase()}
</p>

{(ord.payment_status || "PENDING").toUpperCase() === "PAID" ? (
  <p>
    ✅ <strong>Amount Received:</strong> ₹
    {(Number(ord.quantity) * Number(ord.final_price)).toLocaleString("en-IN")}
  </p>
) : (
  <p>⏳ <strong>Awaiting Buyer Payment</strong></p>
)}
                    <p>🚚 <strong>Delivery Partner:</strong> {ord.delivery_partner_name || "Assigning carrier..."}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmerDashboard;
