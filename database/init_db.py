import sqlite3
from pathlib import Path

database_folder = Path(__file__).parent

db_path = database_folder / "agriconnect.db"
schema_path = database_folder / "schema.sql"

connection = sqlite3.connect(db_path)
cursor = connection.cursor()

# Drop existing tables to ensure schema modifications are applied cleanly
cursor.execute("PRAGMA foreign_keys = OFF;")
cursor.execute("DROP TABLE IF EXISTS orders;")
cursor.execute("DROP TABLE IF EXISTS offers;")
cursor.execute("DROP TABLE IF EXISTS crop_listings;")
cursor.execute("DROP TABLE IF EXISTS market_prices;")
cursor.execute("DROP TABLE IF EXISTS crops;")
cursor.execute("DROP TABLE IF EXISTS users;")
cursor.execute("PRAGMA foreign_keys = ON;")

with open(schema_path, "r", encoding="utf-8") as file:
    schema = file.read()

connection.executescript(schema)
connection.commit()
connection.close()

print("AgriConnect database created and tables updated successfully!")