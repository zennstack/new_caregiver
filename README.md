# SmartGuide — IoT-Based Smart Cane System (Caregiver Dashboard & REST API)

SmartGuide is an IoT-based smart cane system designed to assist visually impaired individuals and provide caregivers with real-time monitoring, emergency alerts, and GPS location tracking.

This repository contains the initial full-stack web application, featuring a **Django REST Framework** backend and a **React (Vite)** caregiver dashboard.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                     REACT FRONTEND                      │
│                                                         │
│   /login  •  /register  •  /dashboard  •  /devices     │
│   /locations  •  /alerts  •  /profile                   │
└────────────────────────────┬────────────────────────────┘
                             │ REST API + Simple JWT
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 DJANGO REST FRAMEWORK API               │
│                                                         │
│   /api/auth/     • Custom User Model (Caregiver / User) │
│   /api/devices/  • Device Management & Authorization    │
│   /api/locations/• GPS Telemetry Logs                   │
│   /api/alerts/   • SOS, Fall, and Battery Notifications │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                POSTGRESQL / SQLITE DATABASE             │
└─────────────────────────────────────────────────────────┘
```

> **Future Integrations (Phase 2):** Raspberry Pi Hardware, MPU6050 Accelerometer/Gyroscope, Neo-6M GPS, TF-Luna LiDAR, YOLOv8 Object Detection, and Firebase Cloud Messaging (FCM).

---

## 🛠️ Technology Stack

- **Backend:** Python 3.14+, Django 5.1+, Django REST Framework, Simple JWT (`djangorestframework-simplejwt`), `django-cors-headers`, PostgreSQL / SQLite, `python-dotenv`.
- **Frontend:** React 18+, Vite 6+, JavaScript (ES6+), React Router DOM v6, Axios, Lucide React, Modern Responsive CSS.

---

## 📁 Project Structure

```text
SmartGuide/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── .env
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── accounts/          # Custom User model, authentication, seed command, tests
│   ├── devices/           # SmartGuide device management API & tests
│   ├── locations/         # GPS location tracking records API & tests
│   └── alerts/            # SOS & Fall safety alerts API & tests
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .env.example
│   ├── .env
│   └── src/
│       ├── components/    # Header, Sidebar, Layout, ProtectedRoute, MapPlaceholder, Modal
│       ├── context/       # AuthContext provider
│       ├── pages/         # Login, Register, Dashboard, Devices, Locations, Alerts, Profile
│       ├── services/      # Centralized Axios API service with JWT interceptors
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+ installed
- Node.js v18+ and npm installed
- PostgreSQL (Optional for production; SQLite is configured as an instant zero-config fallback for local development)

---

### 📦 1. Backend Setup (Django REST Framework)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**

   - **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration:**
   Copy `.env.example` to `.env`:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   # Linux / macOS
   cp .env.example .env
   ```
   *Note:* By default, `USE_SQLITE=True` in `.env` allows running without PostgreSQL setup. To connect to PostgreSQL, set `USE_SQLITE=False` and fill in your PostgreSQL credentials (`DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT`).

5. **Run Database Migrations:**
   ```bash
   python manage.py makemigrations accounts devices locations alerts
   python manage.py migrate
   ```

6. **Seed Initial Development Test Data:**
   Run the custom management command to automatically populate a test Caregiver, SmartGuide User, Device, Location logs, and Emergency Alerts:
   ```bash
   python manage.py seed_data
   ```

7. **Create a Superuser (Optional):**
   ```bash
   python manage.py createsuperuser
   ```

8. **Start Django Development Server:**
   ```bash
   python manage.py runserver 8000
   ```
   The backend API will be live at `http://127.0.0.1:8000/api/`.

---

### 💻 2. Frontend Setup (React + Vite)

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Copy `.env.example` to `.env`:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   # Linux / macOS
   cp .env.example .env
   ```
   Ensure `VITE_API_URL=http://127.0.0.1:8000/api` points to your Django server.

4. **Start the Vite Development Server:**
   ```bash
   npm run dev
   ```
   The React Caregiver Dashboard will run on `http://localhost:5173`.

---

## 🔑 Default Credentials for Testing

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Caregiver** | `caregiver1` | `password123` | Caregiver monitoring access |
| **SmartGuide User** | `user1` | `password123` | Visually impaired cane user |

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth/`)
- `POST /api/auth/register/` — Register a new Caregiver or User account.
- `POST /api/auth/login/` — Authenticate and receive JWT access & refresh tokens.
- `POST /api/auth/refresh/` — Obtain a new access token using a refresh token.
- `GET /api/auth/me/` — Fetch authenticated user profile details (Requires Bearer token).

### Devices (`/api/devices/`)
- `GET /api/devices/` — List all authorized SmartGuide devices.
- `POST /api/devices/` — Register a new SmartGuide cane device.
- `GET /api/devices/{id}/` — Retrieve specific device details.
- `PUT /api/devices/{id}/` — Update device status or name.
- `DELETE /api/devices/{id}/` — Unlink/delete a device.

### Locations (`/api/locations/`)
- `GET /api/locations/` — Retrieve GPS location history logs.
- `POST /api/locations/` — Submit new GPS coordinate payload (`device`, `latitude`, `longitude`).
- `GET /api/locations/{id}/` — Retrieve a specific location entry.

### Alerts (`/api/alerts/`)
- `GET /api/alerts/` — List all safety alerts (SOS, FALL, LOW_BATTERY).
- `POST /api/alerts/` — Trigger a new safety alert.
- `GET /api/alerts/{id}/` — View details of a specific alert.
- `PATCH /api/alerts/{id}/` — Mark alert as resolved (`{"is_resolved": true}`).

---

## 🧪 Testing

### Backend Unit Tests
To run the automated Django REST API test suite:
```bash
cd backend
python manage.py test
```

### Manual E2E Workflow Verification
1. Open `http://localhost:5173/login`.
2. Sign in with `caregiver1` / `password123`.
3. Verify that the **Caregiver Overview** dashboard displays metric stats, recent safety alerts, and the Google Maps live location radar placeholder.
4. Go to **Devices** page: Add, edit, or toggle device active status.
5. Go to **Locations** page: Click "Simulate GPS Telemetry" to submit coordinates (`8.4542, 124.6319`).
6. Go to **Alerts** page: Filter by SOS/Fall alerts, click **Mark Resolved** to resolve active alerts.
7. Go to **Profile** page: View member details and system authentication information.
8. Click **Logout** to test route protection (navigating back to `/dashboard` redirects to `/login`).
