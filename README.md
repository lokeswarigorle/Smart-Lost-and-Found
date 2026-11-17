# SMART LOST & FOUND PLATFORM

A full-stack, enterprise-grade web application designed to connect people who have lost items with people who have found them. Powered by **Django REST Framework**, **MySQL 8.4**, **React 19**, **Multimodal AI Image Feature Extraction**, and **OpenStreetMap Geolocation**.

---

## 🚀 Key Features

1. **User Authentication & RBAC**:
   - JWT authentication (`access` and `refresh` tokens with automatic frontend interceptor refresh).
   - Roles: *General User*, *Item Finder*, and *Administrator*.
   - Protected routes and profile management.

2. **Lost & Found Reporting**:
   - Comprehensive multi-attribute reporting (Category, title, description, colors, date, location landmarks, city, GPS coordinates, safe storage custody).
   - Full photograph uploads with validation and gallery support.

3. **Multimodal AI-Based Image Matching Engine**:
   - Pretrained multimodal feature extraction and 512-dimensional normalized visual embeddings.
   - Cosine visual similarity calculation (60% weight).
   - Multi-factor weighted ranking: Category match (15%), Color similarity (10%), Text description & keyword overlap (10%), Location proximity (5%).
   - High, Medium, and Low confidence classifications.

4. **Location & Interactive Map Discovery**:
   - Real-time radius proximity search using the **Haversine distance formula**.
   - Interactive **Leaflet & OpenStreetMap** map with distinct markers for Lost and Found items.
   - Privacy protection: Sanitized coordinates preventing personal address exposure.

5. **Confidential Ownership Claims**:
   - Protected verification submission: Secret identifying marks, serial numbers/IMEI, and purchase invoices.
   - Finder and Admin decision workflow: *Pending*, *Under Review*, *Approved*, *Rejected*, *Resolved*.

6. **In-App & Email Notifications**:
   - Automated alerts for AI match identification, claim submissions, and status changes.
   - Live unread notification counter badge in the navigation bar.

7. **Executive Admin Dashboard**:
   - Real-time KPI statistics: Registered users, lost items, found items, possible matches, pending/approved/rejected claims, and resolved recoveries.
   - User table auditing and category distribution analytics.

---

## 🛠 Technology Stack

- **Frontend**: React.js 19, JavaScript (ES6+), React Router 7, Axios, Lucide React, Leaflet, React-Leaflet, Vite.
- **Backend**: Python 3.14 / 3.11, Django 6 / 5, Django REST Framework, SimpleJWT, PyMySQL, Cryptography, Pillow, NumPy, Torch, Transformers.
- **Database**: MySQL Server 8.4.
- **Mapping**: Leaflet + OpenStreetMap TileLayer.

---

## 📁 Project Architecture

```
antigravity_project/
├── backend/
│   ├── manage.py
│   ├── config/             # Django root settings, wsgi, urls
│   ├── accounts/           # User authentication, profiles, JWT, roles
│   ├── items/              # LostItem, FoundItem, ItemImage models & CRUD APIs
│   ├── matching/           # AI feature extraction, cosine similarity, MatchRecord
│   ├── locations/          # Haversine distance, OpenStreetMap proximity APIs
│   ├── notifications/      # In-app alerts, email notifications
│   ├── claims/             # Confidential ownership verification & approval workflow
│   ├── dashboard/          # User & Admin KPI aggregation APIs
│   ├── media/              # Uploaded photographs & gallery
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Footer, ItemCard, FilterBar, ProtectedRoute
│   │   ├── pages/          # 15 React view pages (Home, Dashboard, Map, Matches, etc.)
│   │   ├── context/        # AuthContext for session management
│   │   ├── services/       # Axios API client with JWT interceptors
│   │   ├── styles/         # Global design system CSS
│   │   ├── App.jsx         # React Router route registry
│   │   └── main.jsx        # Entry point
│   └── package.json
├── documentation/
│   ├── ER_DIAGRAM.md       # Mermaid ER diagram & MySQL schema documentation
│   ├── API_DOCUMENTATION.md# Complete REST API reference
│   └── SETUP_GUIDE.md      # Step-by-step local execution instructions
├── README.md
└── .gitignore
```

---

## ⚡ Quick Start

### 1. Backend

```powershell
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver 127.0.0.1:8000
```

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser.

**Demo Credentials**:
- **Admin**: `admin` / `Admin@123`
- **User**: `alice` / `Alice@123`
- **Finder**: `bob` / `Bob@123`

---

## 🧪 Testing

Run backend tests:
```powershell
cd backend
python manage.py test accounts.tests items.tests
```

Build frontend for production:
```powershell
cd frontend
npm run build
```
