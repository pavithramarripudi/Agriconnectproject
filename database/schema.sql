CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT
);

CREATE TABLE IF NOT EXISTS crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crop_name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS market_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crop_name TEXT NOT NULL,
    market_name TEXT NOT NULL,
    location TEXT,
    min_price REAL,
    max_price REAL,
    modal_price REAL,
    price_date TEXT
);

CREATE TABLE IF NOT EXISTS crop_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id INTEGER NOT NULL,
    crop_name TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT DEFAULT 'kg',
    expected_price REAL,
    location TEXT,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    offer_price REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES crop_listings(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    farmer_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    final_price REAL NOT NULL,
    status TEXT DEFAULT 'confirmed',
    delivery_partner_id INTEGER,
    payment_method TEXT DEFAULT 'COD',
    payment_status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES crop_listings(id),
    FOREIGN KEY (farmer_id) REFERENCES users(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (delivery_partner_id) REFERENCES users(id)
);