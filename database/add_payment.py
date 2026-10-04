import sqlite3

conn = sqlite3.connect("database/agriconnect.db")
cursor = conn.cursor()

cursor.execute("""
ALTER TABLE orders
ADD COLUMN payment_method TEXT DEFAULT 'COD'
""")

cursor.execute("""
ALTER TABLE orders
ADD COLUMN payment_status TEXT DEFAULT 'PENDING'
""")

conn.commit()
conn.close()

print("Payment columns added successfully!")