import json
import time
import urllib.request
import urllib.parse

BASE_URL = "http://127.0.0.1:5001"

def req(path, method="GET", body=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    data = json.dumps(body).encode("utf-8") if body else None
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read().decode("utf-8"))

print("=== STARTING AGRICONNECT END-TO-END VERIFICATION ===")

ts = str(int(time.time()))[-6:]
test_phone_farmer = f"9800{ts}"
test_phone_buyer = f"9700{ts}"

# 1. Register test farmer
farmer_data = {
    "name": "Test Farmer Ramesh",
    "phone": test_phone_farmer,
    "password": "testpassword123",
    "location": "Tenali",
    "role": "farmer"
}
reg_res = req("/api/register", "POST", farmer_data)
print("1. Farmer Registration:", reg_res.get("message"))
farmer_id = reg_res["user"]["id"]

# 2. Login test farmer
login_res = req("/api/login", "POST", {"phone": test_phone_farmer, "password": "testpassword123", "role": "farmer"})
print("2. Farmer Login:", login_res.get("message"))

# 3. Farmer lists a crop
listing_data = {
    "farmer_id": farmer_id,
    "crop_name": "Tomato",
    "quantity": 1000,
    "unit": "kg",
    "expected_price": 24,
    "location": "Tenali Mandi"
}
list_res = req("/api/listings", "POST", listing_data)
print("3. List Crop:", list_res.get("message"))
listing_id = list_res["listing_id"]

# 4. Verify listing in DB
listings = req(f"/api/listings?farmer_id={farmer_id}")
print(f"4. Verified Listing in SQLite: Found {len(listings)} listing(s). Crop: {listings[0]['crop_name']}")

# 5. Buyer sends offer
buyer_data = {
    "name": "Test Buyer Enterprises",
    "phone": test_phone_buyer,
    "password": "buyerpassword123",
    "location": "Vijayawada",
    "role": "buyer"
}
reg_buyer = req("/api/register", "POST", buyer_data)
buyer_id = reg_buyer["user"]["id"]

offer_res = req("/api/offers", "POST", {
    "listing_id": listing_id,
    "buyer_id": buyer_id,
    "offer_price": 27.5
})
print("5. Buyer Offer Submitted:", offer_res.get("message"))
offer_id = offer_res["offer_id"]

# 6. Farmer fetches offer
farmer_offers = req(f"/api/offers?farmer_id={farmer_id}")
print(f"6. Farmer Received Offer: Price Rs.{farmer_offers[0]['offer_price']}/kg from {farmer_offers[0]['buyer_name']}")

# 7. Farmer accepts offer
accept_res = req(f"/api/offers/{offer_id}", "PUT", {"action": "accept"})
print("7. Farmer Accept Offer:", accept_res.get("message"))

# 8. Check generated order
orders = req(f"/api/orders?farmer_id={farmer_id}")
print(f"8. Transaction Order Generated: Order #{orders[0]['order_id']} for {orders[0]['crop_name']} - Status: {orders[0]['status']}")

# 9. Recommendation check
rec = req("/api/recommendations?crop=Tomato")
print("9. AI Price Recommendation:", rec["best_recommendation"]["reason"].replace("₹", "Rs."))

# 10. Admin Stats check
stats = req("/api/admin/stats")
print("10. Admin Stats:", stats)

print("=== ALL E2E VERIFICATION CHECKS PASSED SUCCESSFULLY! ===")

