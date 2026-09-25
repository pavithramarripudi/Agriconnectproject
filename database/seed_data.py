import sqlite3
from pathlib import Path
from werkzeug.security import generate_password_hash

db_path = Path(__file__).parent / "agriconnect.db"

connection = sqlite3.connect(db_path)
cursor = connection.cursor()

# Enable FKs
cursor.execute("PRAGMA foreign_keys = ON;")

# Sample users with hashed passwords
users = [
    ("Ravi Kumar", "9876543210", generate_password_hash("demo123"), "farmer", "Vijayawada"),
    ("Suresh Traders", "9876501234", generate_password_hash("demo123"), "buyer", "Guntur"),
    ("Ramesh Logistics", "9876599999", generate_password_hash("demo123"), "delivery", "Vijayawada"),
    ("Admin User", "9999999999", generate_password_hash("admin123"), "admin", "Vijayawada")
]

for u in users:
    cursor.execute("""
    INSERT INTO users (name, phone, password, role, location)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(phone) DO UPDATE SET
      name=excluded.name,
      password=excluded.password,
      role=excluded.role,
      location=excluded.location;
    """, u)

# Crops
crops = [
    ("Tomato",),
    ("Onion",),
    ("Rice",),
    ("Chilli",),
    ("Maize",)
]

cursor.executemany("""
INSERT OR IGNORE INTO crops (crop_name)
VALUES (?)
""", crops)

# Clear old sample market prices and re-insert fresh sample data
cursor.execute("DELETE FROM market_prices;")
prices = [
    ("Tomato", "Guntur Market", "Guntur", 1900, 2500, 2200, "2026-09-24"),
    ("Tomato", "Vijayawada Market", "Vijayawada", 1800, 2400, 2100, "2026-09-24"),
    ("Tomato", "Tenali Mandi", "Tenali", 1750, 2300, 2050, "2026-09-24"),
    ("Onion", "Vijayawada Market", "Vijayawada", 2200, 2800, 2500, "2026-09-24"),
    ("Onion", "Kurnool Mandi", "Kurnool", 2100, 2700, 2400, "2026-09-24"),
    ("Rice", "Guntur Market", "Guntur", 2600, 3200, 2900, "2026-09-24"),
    ("Chilli", "Guntur Market", "Guntur", 7000, 9000, 8200, "2026-09-24"),
    ("Maize", "Eluru Mandi", "Eluru", 1800, 2200, 2000, "2026-09-24")
]

cursor.executemany("""
INSERT INTO market_prices
(crop_name, market_name, location, min_price, max_price, modal_price, price_date)
VALUES (?, ?, ?, ?, ?, ?, ?)
""", prices)

# Get Ravi Kumar (farmer) and Suresh Traders (buyer) IDs
cursor.execute("SELECT id FROM users WHERE phone = '9876543210'")
farmer = cursor.fetchone()
cursor.execute("SELECT id FROM users WHERE phone = '9876501234'")
buyer = cursor.fetchone()

if farmer and buyer:
    farmer_id = farmer[0]
    buyer_id = buyer[0]

    # Sample listing
    cursor.execute("SELECT COUNT(*) FROM crop_listings")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO crop_listings (farmer_id, crop_name, quantity, unit, expected_price, location, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (farmer_id, "Tomato", 500, "kg", 25, "Vijayawada", "available"))
        listing_id = cursor.lastrowid

        cursor.execute("""
        INSERT INTO crop_listings (farmer_id, crop_name, quantity, unit, expected_price, location, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (farmer_id, "Chilli", 200, "kg", 85, "Vijayawada", "available"))

        # Sample offer
        cursor.execute("""
        INSERT INTO offers (listing_id, buyer_id, offer_price, status)
        VALUES (?, ?, ?, ?)
        """, (listing_id, buyer_id, 26, "pending"))

connection.commit()
connection.close()

print("Sample data seeded successfully with Werkzeug password hashes!")