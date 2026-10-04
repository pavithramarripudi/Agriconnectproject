import sys
import sqlite3
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

# Ensure project root is in sys.path to import ai modules
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(PROJECT_ROOT))

from ai.recommendation import get_crop_recommendation

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

DB_PATH = PROJECT_ROOT / "database" / "agriconnect.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "AgriConnect Backend API is running successfully!", "version": "1.0.0"})

# ----------------- AUTHENTICATION -----------------

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    password = data.get("password", "").strip()
    role = data.get("role", "").strip().lower()
    location = data.get("location", "").strip()

    if not name or not phone or not password or not role:
        return jsonify({"error": "Name, phone number, password, and role are required."}), 400

    if len(phone) < 10 or not phone.isdigit():
        return jsonify({"error": "Please enter a valid 10-digit phone number."}), 400

    hashed_pw = generate_password_hash(password)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO users (name, phone, password, role, location)
            VALUES (?, ?, ?, ?, ?)
        """, (name, phone, hashed_pw, role, location))
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()

        return jsonify({
            "message": "User registered successfully!",
            "user": {
                "id": user_id,
                "name": name,
                "phone": phone,
                "role": role,
                "location": location
            }
        }), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "A user with this phone number already exists."}), 409
    except Exception as e:
        conn.close()
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    phone = data.get("phone", "").strip()
    password = data.get("password", "").strip()
    selected_role = data.get("role", "").strip().lower()

    if not phone or not password:
        return jsonify({"error": "Phone number and password are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, phone, password, role, location FROM users WHERE phone = ?", (phone,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "User not found with this phone number."}), 404

    # Verify password (support plain text demo check fallback if needed, but primary is check_password_hash)
    stored_password = user["password"]
    is_valid = False
    if stored_password.startswith("pbkdf2:") or stored_password.startswith("scrypt:"):
        is_valid = check_password_hash(stored_password, password)
    else:
        is_valid = (stored_password == password)

    if not is_valid:
        return jsonify({"error": "Invalid phone number or password."}), 401

    user_role = user["role"].lower()
    if selected_role and selected_role != user_role:
        return jsonify({"error": f"This account is registered as a {user_role.capitalize()}, not a {selected_role.capitalize()}."}), 403

    return jsonify({
        "message": "Login successful!",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "phone": user["phone"],
            "role": user["role"],
            "location": user["location"]
        }
    }), 200

# ----------------- CROPS & MARKET PRICES -----------------

@app.route("/api/crops", methods=["GET"])
def get_crops():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, crop_name FROM crops ORDER BY crop_name")
    crops = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(crops), 200

@app.route("/api/market-prices", methods=["GET"])
def get_market_prices():
    crop_filter = request.args.get("crop", "").strip()
    location_filter = request.args.get("location", "").strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT id, crop_name, market_name, location, min_price, max_price, modal_price, price_date FROM market_prices WHERE 1=1"
    params = []

    if crop_filter:
        query += " AND LOWER(crop_name) = LOWER(?)"
        params.append(crop_filter)
    if location_filter:
        query += " AND LOWER(location) LIKE LOWER(?)"
        params.append(f"%{location_filter}%")

    query += " ORDER BY price_date DESC, modal_price DESC"
    cursor.execute(query, params)
    prices = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({
        "disclaimer": "Sample market data for prototype demonstration",
        "prices": prices
    }), 200

# ----------------- CROP LISTINGS -----------------

@app.route("/api/listings", methods=["GET"])
def get_listings():
    farmer_id = request.args.get("farmer_id")
    crop_filter = request.args.get("crop", "").strip()
    location_filter = request.args.get("location", "").strip()
    status_filter = request.args.get("status", "").strip()

    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT l.id, l.farmer_id, u.name as farmer_name, u.phone as farmer_phone,
               l.crop_name, l.quantity, l.unit, l.expected_price, l.location, l.status, l.created_at
        FROM crop_listings l
        JOIN users u ON l.farmer_id = u.id
        WHERE 1=1
    """
    params = []

    if farmer_id:
        query += " AND l.farmer_id = ?"
        params.append(farmer_id)
    if crop_filter:
        query += " AND LOWER(l.crop_name) = LOWER(?)"
        params.append(crop_filter)
    if location_filter:
        query += " AND LOWER(l.location) LIKE LOWER(?)"
        params.append(f"%{location_filter}%")
    if status_filter:
        query += " AND LOWER(l.status) = LOWER(?)"
        params.append(status_filter)

    query += " ORDER BY l.id DESC"
    cursor.execute(query, params)
    listings = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(listings), 200

@app.route("/api/listings", methods=["POST"])
def create_listing():
    data = request.get_json() or {}
    farmer_id = data.get("farmer_id")
    crop_name = data.get("crop_name", "").strip()
    quantity = data.get("quantity")
    unit = data.get("unit", "kg").strip()
    expected_price = data.get("expected_price")
    location = data.get("location", "").strip()

    if not farmer_id or not crop_name or quantity is None or expected_price is None or not location:
        return jsonify({"error": "Farmer ID, crop name, quantity, expected price, and location are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO crop_listings (farmer_id, crop_name, quantity, unit, expected_price, location, status)
        VALUES (?, ?, ?, ?, ?, ?, 'available')
    """, (farmer_id, crop_name, float(quantity), unit, float(expected_price), location))
    conn.commit()
    listing_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "message": "Crop listed successfully.",
        "listing_id": listing_id
    }), 201

# ----------------- BUYER OFFERS -----------------

@app.route("/api/offers", methods=["GET"])
def get_offers():
    farmer_id = request.args.get("farmer_id")
    buyer_id = request.args.get("buyer_id")
    listing_id = request.args.get("listing_id")

    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT o.id, o.listing_id, o.buyer_id, u_buyer.name as buyer_name, u_buyer.phone as buyer_phone,
               u_buyer.location as buyer_location, o.offer_price, o.status, o.created_at,
               l.crop_name, l.quantity, l.unit, l.expected_price, l.location as listing_location,
               l.farmer_id, u_farmer.name as farmer_name
        FROM offers o
        JOIN crop_listings l ON o.listing_id = l.id
        JOIN users u_buyer ON o.buyer_id = u_buyer.id
        JOIN users u_farmer ON l.farmer_id = u_farmer.id
        WHERE 1=1
    """
    params = []

    if farmer_id:
        query += " AND l.farmer_id = ?"
        params.append(farmer_id)
    if buyer_id:
        query += " AND o.buyer_id = ?"
        params.append(buyer_id)
    if listing_id:
        query += " AND o.listing_id = ?"
        params.append(listing_id)

    query += " ORDER BY o.id DESC"
    cursor.execute(query, params)
    offers = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(offers), 200

@app.route("/api/offers", methods=["POST"])
def create_offer():
    data = request.get_json() or {}
    listing_id = data.get("listing_id")
    buyer_id = data.get("buyer_id")
    offer_price = data.get("offer_price")

    if not listing_id or not buyer_id or offer_price is None:
        return jsonify({"error": "Listing ID, buyer ID, and offer price are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Verify listing exists and is available
    cursor.execute("SELECT id, farmer_id, crop_name, quantity, expected_price, status FROM crop_listings WHERE id = ?", (listing_id,))
    listing = cursor.fetchone()
    if not listing:
        conn.close()
        return jsonify({"error": "Crop listing not found."}), 404

    cursor.execute("""
        INSERT INTO offers (listing_id, buyer_id, offer_price, status)
        VALUES (?, ?, ?, 'pending')
    """, (listing_id, buyer_id, float(offer_price)))
    conn.commit()
    offer_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "message": "Offer submitted successfully!",
        "offer_id": offer_id
    }), 201

@app.route("/api/offers/<int:offer_id>", methods=["PUT"])
def update_offer(offer_id):
    data = request.get_json() or {}
    action = data.get("action") or data.get("status")

    if not action or action.lower() not in ["accept", "accepted", "reject", "rejected"]:
        return jsonify({"error": "Action must be 'accept' or 'reject'."}), 400

    new_status = "accepted" if action.lower() in ["accept", "accepted"] else "rejected"

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT o.id, o.listing_id, o.buyer_id, o.offer_price, o.status,
               l.farmer_id, l.crop_name, l.quantity, l.unit
        FROM offers o
        JOIN crop_listings l ON o.listing_id = l.id
        WHERE o.id = ?
    """, (offer_id,))
    offer = cursor.fetchone()

    if not offer:
        conn.close()
        return jsonify({"error": "Offer not found."}), 404

    if new_status == "accepted":
        # Check if already accepted
        if offer["status"] == "accepted":
            conn.close()
            return jsonify({"message": "Offer is already accepted.", "offer_id": offer_id}), 200

        # Update offer status
        cursor.execute("UPDATE offers SET status = 'accepted' WHERE id = ?", (offer_id,))

        # Update other pending offers for this listing to rejected
        cursor.execute("UPDATE offers SET status = 'rejected' WHERE listing_id = ? AND id != ?", (offer["listing_id"], offer_id))

        # Update listing status to booked
        cursor.execute("UPDATE crop_listings SET status = 'booked' WHERE id = ?", (offer["listing_id"],))

        # Create Order
        cursor.execute("""
            INSERT INTO orders (listing_id, farmer_id, buyer_id, quantity, final_price, status)
            VALUES (?, ?, ?, ?, ?, 'confirmed')
        """, (offer["listing_id"], offer["farmer_id"], offer["buyer_id"], offer["quantity"], offer["offer_price"]))
        conn.commit()
        conn.close()

        return jsonify({"message": "Offer accepted successfully and order created!", "status": "accepted"}), 200

    else:
        cursor.execute("UPDATE offers SET status = 'rejected' WHERE id = ?", (offer_id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Offer rejected.", "status": "rejected"}), 200

# ----------------- ORDERS -----------------

@app.route("/api/orders", methods=["GET"])
def get_orders():
    farmer_id = request.args.get("farmer_id")
    buyer_id = request.args.get("buyer_id")
    delivery_partner_id = request.args.get("delivery_partner_id")

    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT o.id as order_id, o.listing_id, o.farmer_id, o.buyer_id, o.quantity,
       o.final_price, o.status, o.delivery_partner_id, o.created_at,
       o.payment_method, o.payment_status,
               l.crop_name, l.unit, l.location as listing_location,
               u_farmer.name as farmer_name, u_farmer.phone as farmer_phone, u_farmer.location as farmer_location,
               u_buyer.name as buyer_name, u_buyer.phone as buyer_phone, u_buyer.location as buyer_location,
               u_deliv.name as delivery_partner_name, u_deliv.phone as delivery_partner_phone
        FROM orders o
        JOIN crop_listings l ON o.listing_id = l.id
        JOIN users u_farmer ON o.farmer_id = u_farmer.id
        JOIN users u_buyer ON o.buyer_id = u_buyer.id
        LEFT JOIN users u_deliv ON o.delivery_partner_id = u_deliv.id
        WHERE 1=1
    """
    params = []

    if farmer_id:
        query += " AND o.farmer_id = ?"
        params.append(farmer_id)
    if buyer_id:
        query += " AND o.buyer_id = ?"
        params.append(buyer_id)
    if delivery_partner_id:
        query += " AND (o.delivery_partner_id = ? OR o.delivery_partner_id IS NULL)"
        params.append(delivery_partner_id)

    query += " ORDER BY o.id DESC"
    cursor.execute(query, params)
    orders = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(orders), 200

@app.route("/api/orders/<int:order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    data = request.get_json() or {}
    new_status = data.get("status")
    delivery_partner_id = data.get("delivery_partner_id")

    if not new_status:
        return jsonify({"error": "Status is required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    if delivery_partner_id:
        cursor.execute("""
            UPDATE orders SET status = ?, delivery_partner_id = ? WHERE id = ?
        """, (new_status, delivery_partner_id, order_id))
    else:
        cursor.execute("""
            UPDATE orders SET status = ? WHERE id = ?
        """, (new_status, order_id))

    conn.commit()
    conn.close()

    return jsonify({"message": f"Order #{order_id} status updated to {new_status}."}), 200
@app.route("/api/orders/<int:order_id>/payment", methods=["PUT"])
def update_payment(order_id):
    data = request.get_json() or {}

    payment_method = data.get("payment_method", "").strip().upper()
    payment_status = data.get("payment_status", "").strip().upper()

    allowed_methods = ["COD", "ONLINE"]
    allowed_statuses = ["PENDING", "PAID"]

    if payment_method not in allowed_methods:
        return jsonify({"error": "Payment method must be COD or ONLINE."}), 400

    if payment_status not in allowed_statuses:
        return jsonify({"error": "Payment status must be PENDING or PAID."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM orders WHERE id = ?", (order_id,))
    order = cursor.fetchone()

    if not order:
        conn.close()
        return jsonify({"error": "Order not found."}), 404

    cursor.execute(
        """
        UPDATE orders
        SET payment_method = ?, payment_status = ?
        WHERE id = ?
        """,
        (payment_method, payment_status, order_id)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Demo payment updated successfully.",
        "order_id": order_id,
        "payment_method": payment_method,
        "payment_status": payment_status
    }), 200
# ----------------- AI RECOMMENDATION -----------------

@app.route("/api/recommendations", methods=["GET"])
def get_recommendation():
    crop_name = request.args.get("crop", "Tomato").strip()
    farmer_location = request.args.get("location", "").strip()

    conn = get_db_connection()
    res = get_crop_recommendation(conn, crop_name, farmer_location)
    conn.close()

    return jsonify(res), 200

# ----------------- ADMIN DASHBOARD STATS -----------------

@app.route("/api/admin/stats", methods=["GET"])
def get_admin_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'farmer'")
    total_farmers = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'buyer'")
    total_buyers = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM crop_listings")
    total_listings = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM offers")
    total_offers = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM orders")
    total_orders = cursor.fetchone()[0]

    conn.close()

    return jsonify({
        "total_farmers": total_farmers,
        "total_buyers": total_buyers,
        "total_listings": total_listings,
        "total_offers": total_offers,
        "total_orders": total_orders
    }), 200

@app.route("/api/admin/users", methods=["GET"])
def get_all_users():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, phone, role, location FROM users ORDER BY id DESC")
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(users), 200

if __name__ == "__main__":
    print("Starting AgriConnect Backend on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)


