# 🌿 AgriConnect - Smart India Hackathon 2026

**Problem Statement:** Strengthening Market Linkages and Price Discovery for Farmers  
**Tagline:** *Better Markets. Better Prices. Better Farming.*

AgriConnect is an integrated market linkage, price discovery, direct-buyer matching, and logistics management platform for Indian agriculture.

---

## 🏗️ Project Architecture & Tech Stack

```
agriconnect-project/
├── frontend/               # React.js + Vite UI (Multi-language, Mobile-Responsive)
├── backend/                # Python + Flask REST APIs
├── database/               # SQLite database & setup scripts (agriconnect.db)
├── ai/                     # Simple explainable price recommendation module
└── README.md
```

- **Frontend:** React.js, Vite, HTML5, CSS3, JavaScript (ES6+), Multi-language Support (English, Telugu, Hindi)
- **Backend:** Python 3, Flask REST APIs, Flask-CORS, Werkzeug (Password Hashing)
- **Database:** SQLite 3 (`database/agriconnect.db`)
- **AI / Recommendation:** Rule-based explainable price comparison and buyer matching engine (`ai/recommendation.py`)

---

## ⚡ Quick Setup & Startup Instructions

### 1. Requirements
- Python 3.9+
- Node.js 18+ and npm
- Dependencies: `flask`, `flask-cors`, `werkzeug`, `sqlite3`

### 2. Database Setup
To initialize or re-seed the SQLite database with sample Mandi market prices and prototype users:

**Windows (PowerShell):**
```powershell
python database/init_db.py; python database/seed_data.py
```
**Linux / macOS:**
```bash
python3 database/init_db.py && python3 database/seed_data.py
```

### 3. Backend Startup (Flask Server)
Start the Flask REST API server (runs on `http://localhost:5001` or `http://localhost:5000`):

**Windows:**
```powershell
python backend/app.py
```
**Linux / macOS:**
```bash
python3 backend/app.py
```

### 4. Frontend Startup (Vite React UI)
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Access the application in your browser at: `http://localhost:5173` (or `http://localhost:5174`)

---

## 👥 Demo User Credentials

For easy presentation during hackathon evaluation:

| Role | Phone | Password | Location |
| :--- | :--- | :--- | :--- |
| **Farmer** | `9876543210` | `demo123` | Vijayawada |
| **Buyer** | `9876501234` | `demo123` | Guntur |
| **Delivery Partner** | `9876599999` | `demo123` | Vijayawada |
| **Admin** | `9999999999` | `admin123` | Head Office |

*(Note: Click the **"Auto-fill Demo Login"** button on the login screen for instant 1-click testing!)*

---

## 🚀 Key Prototype Demo Flow

### 1. Farmer Flow (Highest Priority):
1. Launch app -> Select Language (English / Telugu / Hindi) -> Select **Farmer**.
2. Log in using `9876543210` / `demo123`.
3. View **Today's Best Price Recommendation** powered by AI (e.g. comparing Mandi rates vs direct buyer offers).
4. Click **Sell Crop** -> Fill in crop details (e.g. Tomato, 500 kg, ₹25/kg) -> Submit.
5. Click **Market Prices** to view Mandi prices & location comparison.
6. Click **My Offers** -> See offers submitted by buyers -> Click **Accept Offer**.
7. Click **My Orders** -> View generated confirmed order and delivery status.

### 2. Buyer Flow:
1. Log in as **Buyer** using `9876501234` / `demo123`.
2. Browse active farmer listings with crop & location filters.
3. Select a listing -> Click **Make Offer** -> Enter offer price -> Submit.
4. View offer status under **Offers Sent**.
