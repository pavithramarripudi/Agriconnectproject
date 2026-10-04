import sqlite3
from pathlib import Path

database_folder = Path(__file__).parent
db_path = database_folder / "agriconnect.db"
schema_path = database_folder / "schema.sql"

connection = sqlite3.connect(db_path)

with open(schema_path, "r", encoding="utf-8") as file:
    schema = file.read()

connection.executescript(schema)
connection.commit()
connection.close()

print("AgriConnect database initialized successfully!")