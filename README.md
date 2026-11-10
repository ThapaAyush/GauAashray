# GauAashray (गौआश्रय)
### Every Cow Deserves Care, Shelter & Love.

GauAashray is a centralized digital network connecting citizens who find injured, sick, or abandoned street cows with nearby registered Gaushalas, veterinary doctors, and permanent cow shelters.

---

## 🌟 Key Features

1. **Street Cow Rescue**:
   - Geolocation-based incident reporting with cow photograph and condition selector (`Injured`, `Sick`, `Accident case`, `Abandoned`, `Wandering`).
   - Automated 2dsphere geospatial matching engine that locates, ranks, and dispatches requests to the nearest verified Gaushala branch.
   - Live public tracking with unique Tracking IDs (e.g. `RSC-2026-7842`), progress steppers, and privacy safeguards (masked contact details).

2. **Veterinary Doctor Requests**:
   - Connect cow owners directly with registered veterinary doctors.
   - Clinical appointments scheduling and confidential Medical Records logging (clinical diagnosis, treatments, and multi-medicine prescriptions).

3. **Cow Surrender**:
   - Digital surrender application with ownership confirmation and reason declaration.
   - Manual verification workflow (capacity inspection, transportation dispatch, and shelter intake).

4. **Multi-Gaushala & Multi-Branch Architecture**:
   - One organization owner can operate multiple independent branch locations.
   - Branch-level cow intake limits, rescue teams, ambulances, and doctor rosters.
   - Strict database-level multi-tenant isolation.

5. **Super Admin Platform Console**:
   - Verification queue for new Gaushala registrations (Approve, Reject with reasons, Request Changes, Suspend).
   - Nationwide interactive Network Map showing active branches and emergency incidents.
   - Citizen complaint investigation and redressal.
   - Platform analytics and city-level intelligence.

---

## 🎨 Brand Identity

- **Logo**: GauAashray Cow and Calf emblem located at `frontend/public/logo.png`.
- **Primary Brown**: `#80501D`
- **Dark Brown**: `#593713`
- **Golden**: `#D6A23A`
- **Cream**: `#FAF6ED`
- **Natural Green**: `#557B42`
- **Light Background**: `#F8F7F3`

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router DOM v6, Tailwind CSS, Axios, Lucide React icons, Socket.IO Client.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Mongoose, Socket.IO, Multer, Cloudinary, Helmet, Rate Limiter.
- **Database**: MongoDB (Atlas & Local with 2dsphere geospatial indexes).

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24)
- **MongoDB** (Local instance on `127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Install Dependencies
```bash
# Install root, backend and frontend dependencies
npm run install:all
```

### 3. Seed Database with Initial Data
```bash
npm run seed
```

### 4. Run Both Frontend and Backend Concurrently
```bash
npm run dev
```

The application will be accessible at:
- **Frontend Portal**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🔑 Pre-Seeded Test Accounts

| Role | Login Identifier | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@gauaashray.org` (or `9876543210`) | `Admin@GauAashray2026` | Full Network & Applications Admin |
| **Approved Gaushala Owner** | `9811122233` (or `ramesh.sharma@gaushala.org`) | `Owner@GauAashray2026` | Shri Krishna Gaushala (Rohini & Narela) |
| **Pending Gaushala Owner** | `9833344455` (or `mahesh.gupta@nandi.org`) | `Owner@GauAashray2026` | Application Status Verification Screen |
| **Public User** | `9899900011` (or `rahul.sharma@example.com`) | `User@GauAashray2026` | Reporting, Tracking & Doctor Requests |

---

## 🧪 Running Automated QA Workflow Tests

Execute the end-to-end integration test suite verifying all 6 core workflows:

```bash
npm run test:workflow
```

Tests include:
- Public user registration & cow rescue reporting
- Gaushala registration & Super Admin approval
- Geospatial 2dsphere distance ranking
- Veterinary doctor dispatch & medical record logging
- Surrender review & digital cow intake
- Strict tenant security isolation & RBAC

---

## 📁 Project Structure

```
GauAashray/
├── backend/
│   ├── config/         # MongoDB and Socket.IO configuration
│   ├── controllers/    # Auth, Gaushala, Rescue, Medical, Cow, Admin, etc.
│   ├── middleware/     # JWT authentication, role authorization, upload
│   ├── models/         # 17 Mongoose schemas with 2dsphere indexes
│   ├── routes/         # REST API route endpoints
│   ├── services/       # Geospatial matching engine, notification dispatcher
│   ├── tests/          # End-to-end QA workflow suite
│   ├── utils/          # Database seeder & geo utilities
│   ├── uploads/        # Local media storage fallback
│   ├── server.js       # Main Express server
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── logo.png    # GauAashray Cow and Calf brand logo
│   ├── src/
│   │   ├── components/ # Navbar, Footer, ImageUpload, LocationPicker, Stepper
│   │   ├── context/    # Auth, Socket.IO, and Notification contexts
│   │   ├── layouts/    # Public, Gaushala Console, and Admin layouts
│   │   ├── pages/      # Home, Login, Signup, ReportCow, Dashboards
│   │   ├── routes/     # AppRoutes and ProtectedRoute
│   │   ├── services/   # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── README.md
└── package.json
```

---

## 🛡️ License & Ethics

GauAashray is designed for non-commercial animal protection, compassionate veterinary intervention, and lawful Gaushala shelter administration.

