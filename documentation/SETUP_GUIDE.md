# SMART LOST & FOUND PLATFORM - Local Setup & Execution Guide

This guide provides step-by-step instructions to run the application on Windows.

---

## Prerequisites

1. **Python**: Python 3.10+ (Tested on Python 3.14)
2. **Node.js**: Node 18+ (Tested on Node.js v24.19 / npm 11.17)
3. **MySQL**: MySQL Server 8.0+ (Tested on MySQL 8.4 Server)

---

## 1. Database Setup (MySQL)

Ensure your MySQL server is running. You can check the service in PowerShell:
```powershell
Get-Service -Name MySQL84
```

Log in to MySQL and create the database:
```sql
CREATE DATABASE IF NOT EXISTS lost_found_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 2. Backend Setup (Django & REST Framework)

1. Open PowerShell and navigate to the backend folder:
   ```powershell
   cd "backend"
   ```

2. (Optional) Create and activate a virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Install required Python dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Configure your environment variables if needed in `backend/.env` or rely on the defaults in `config/settings.py`:
   - `DB_NAME=lost_found_db`
   - `DB_USER=root`
   - `DB_PASSWORD=your_mysql_password`
   - `DB_HOST=127.0.0.1`
   - `DB_PORT=3306`

5. Apply database migrations:
   ```powershell
   python manage.py migrate
   ```

6. Seed initial demo users, sample items, and generate AI matches:
   ```powershell
   python manage.py seed_demo_data
   ```

   **Default Seeded Accounts:**
   - **Administrator**: `admin` / `Admin@123`
   - **General User**: `alice` / `Alice@123`
   - **Item Finder**: `bob` / `Bob@123`

7. Run backend tests to verify system integrity:
   ```powershell
   python manage.py test accounts.tests items.tests
   ```

8. Start the Django development server:
   ```powershell
   python manage.py runserver 127.0.0.1:8000
   ```

The backend API will be live at `http://127.0.0.1:8000/api/` and the Django Admin panel at `http://127.0.0.1:8000/admin/`.

---

## 3. Frontend Setup (React & Vite)

1. Open a new PowerShell terminal and navigate to the frontend folder:
   ```powershell
   cd "frontend"
   ```

2. Install npm dependencies:
   ```powershell
   npm install
   ```

3. Build for production (verifies all components compile without errors):
   ```powershell
   npm run build
   ```

4. Start the Vite React development server:
   ```powershell
   npm run dev
   ```

The frontend application will be live at `http://localhost:5173/`.

---

## 4. End-to-End Workflow Verification

1. Open your browser and navigate to `http://localhost:5173/`.
2. Click **Log In** and choose **Alice (User)** via the Quick Demo login bar.
3. Check the **Dashboard** to see active lost reports and matches.
4. Click **AI Matches** to see side-by-side visual comparisons, 97%+ similarity scores, and multi-component breakdowns.
5. Click **Nearby Map** to explore OpenStreetMap pins for items in Hyderabad.
6. Click **Claims** or use **Claim This Item** to submit confidential verification details.
7. Log out and log in as **Admin** to access the **Admin Control Center** (`/admin-dashboard`) to review global KPIs, audit users, and review pending claims.
