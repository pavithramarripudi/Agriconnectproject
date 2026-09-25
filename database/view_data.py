import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "agriconnect.db"

connection = sqlite3.connect(db_path)
cursor = connection.cursor()

print("\n--- USERS ---")
cursor.execute("SELECT id, name, phone, role, location FROM users")
for row in cursor.fetchall():
    print(row)

print("\n--- CROPS ---")
cursor.execute("SELECT * FROM crops")
for row in cursor.fetchall():
    print(row)

print("\n--- MARKET PRICES ---")
cursor.execute("""
SELECT crop_name, market_name, location, min_price, max_price, modal_price
FROM market_prices
""")
for row in cursor.fetchall():
    print(row)

connection.close()