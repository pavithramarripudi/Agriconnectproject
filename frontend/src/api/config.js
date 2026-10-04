// AgriConnect REST API Client
const API_BASE_URL = "http://localhost:5001";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP Error ${response.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  register: (name, phone, password, location, role) =>
    request("/api/register", {
      method: "POST",
      body: JSON.stringify({ name, phone, password, location, role }),
    }),

  login: (phone, password, role) =>
    request("/api/login", {
      method: "POST",
      body: JSON.stringify({ phone, password, role }),
    }),

  // Crops & Market Prices
  getCrops: () => request("/api/crops"),

  getMarketPrices: (crop = "", location = "") => {
    const params = new URLSearchParams();
    if (crop) params.append("crop", crop);
    if (location) params.append("location", location);
    return request(`/api/market-prices?${params.toString()}`);
  },

  // Crop Listings
  getListings: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.farmer_id) params.append("farmer_id", filters.farmer_id);
    if (filters.crop) params.append("crop", filters.crop);
    if (filters.location) params.append("location", filters.location);
    if (filters.status) params.append("status", filters.status);
    return request(`/api/listings?${params.toString()}`);
  },

  createListing: (farmer_id, crop_name, quantity, unit, expected_price, location) =>
    request("/api/listings", {
      method: "POST",
      body: JSON.stringify({
        farmer_id,
        crop_name,
        quantity,
        unit,
        expected_price,
        location,
      }),
    }),

  // Offers
  getOffers: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.farmer_id) params.append("farmer_id", filters.farmer_id);
    if (filters.buyer_id) params.append("buyer_id", filters.buyer_id);
    if (filters.listing_id) params.append("listing_id", filters.listing_id);
    return request(`/api/offers?${params.toString()}`);
  },

  createOffer: (listing_id, buyer_id, offer_price) =>
    request("/api/offers", {
      method: "POST",
      body: JSON.stringify({ listing_id, buyer_id, offer_price }),
    }),

  updateOffer: (offer_id, action) =>
    request(`/api/offers/${offer_id}`, {
      method: "PUT",
      body: JSON.stringify({ action }),
    }),

  // Orders
  getOrders: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.farmer_id) params.append("farmer_id", filters.farmer_id);
    if (filters.buyer_id) params.append("buyer_id", filters.buyer_id);
    if (filters.delivery_partner_id)
      params.append("delivery_partner_id", filters.delivery_partner_id);
    return request(`/api/orders?${params.toString()}`);
  },

  updateOrderStatus: (order_id, status, delivery_partner_id = null) =>
    request(`/api/orders/${order_id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, delivery_partner_id }),
    }),
  updatePayment: (order_id, payment_method, payment_status) =>
  request(`/api/orders/${order_id}/payment`, {
    method: "PUT",
    body: JSON.stringify({
      payment_method,
      payment_status,
    }),
  }),
  // Recommendation
  getRecommendations: (crop = "Tomato", location = "") => {
    const params = new URLSearchParams();
    if (crop) params.append("crop", crop);
    if (location) params.append("location", location);
    return request(`/api/recommendations?${params.toString()}`);
  },

  // Admin
  getAdminStats: () => request("/api/admin/stats"),
  getAdminUsers: () => request("/api/admin/users"),
};

export default api;
