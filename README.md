# MedFlow - Healthcare Management System (MERN Stack)

MedFlow is a modern, production-ready SaaS Healthcare Management System designed for Patients, Doctors, and Administrators. It integrates AI-driven symptom checking (Google Gemini API), automated Nodemailer notifications (with developer-friendly Ethereal test inbox mapping), server-side PDF prescription generation, and interactive charts analytics (Recharts).

---

## Technical Stack

- **Frontend:** React.js, Tailwind CSS (v4), Vite, React Router, Axios, React Hook Form, Recharts, Lucide Icons, React Hot Toast.
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT Authentication, bcryptjs, PDFKit, Nodemailer, Express Rate Limit, Helmet, Multer.
- **Monorepo Architecture:** npm workspaces (frontend and backend run concurrently from a single root).

---

## Directory Structure

```
MedFlow/
├── package.json (Root Workspace Config)
├── backend/
│   ├── config/ (DB Connections)
│   ├── controllers/ (Auth, Admin, Doctor, Patient, Appointment, Rx, Symptoms)
│   ├── models/ (Mongoose Schema files)
│   ├── middleware/ (RBAC, JWT, Validations, Errors)
│   ├── routes/ (API Routers mapping)
│   ├── services/ (Nodemailer, PDFKit, Gemini AI Service wrappers)
│   ├── utils/ (seed.js Database Seeder)
│   └── server.js (Server entrypoint)
└── frontend/
    ├── src/
    │   ├── context/ (Global Auth Context)
    │   ├── layouts/ (Dashboard split layout)
    │   ├── pages/ (Login/Register, Patient, Doctor, Admin portals)
    │   ├── services/ (Axios configurations)
    │   ├── index.css (Tailwind Directives)
    │   └── App.jsx (Routes mapping router)
    └── vite.config.js (Vite + Tailwind v4 Compiler)
```

---

## Installation & Setup Guide

### 1. Prerequisite
Ensure you have **Node.js** and **MongoDB** (local or Atlas cluster) installed.

### 2. Clone and Bootstrap
Run the bootstrap command at the root of the project. This will install dependencies for both the frontend and backend workspaces:
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file inside the `backend/` folder (or copy from `.env.example`):
```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/medflow
JWT_SECRET=medflow_secret_key_development_only

# Optional: Add Google Gemini Key for AI Symptom Checker (falls back to local diagnosis if blank)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Nodemailer custom SMTP credentials (falls back to Ethereal developer test inbox if blank)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### 4. Seed Database
Run the seeder script at the root to clear the database and populate default departments, admin credentials, doctors, patients, and past consultations:
```bash
npm run seed
```

---

## Running the Application

Start both the frontend and backend development servers concurrently with a single command from the root folder:
```bash
npm run dev
```
- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **Backend URL:** [http://localhost:5001](http://localhost:5001)

### Demo Credentials for Quick Evaluation
Single-click quick login buttons are provided on the login page, but the default seeded credentials are:
- **Admin:** `admin@medflow.com` / `admin123`
- **Doctor:** `alice.smith@medflow.com` / `doctor123`
- **Patient:** `john.doe@gmail.com` / `patient123`

---

## Core Features Implementation Details

1. **AI Symptom Checker (Google Gemini API):** Patients enter symptoms, and the backend communicates with Google Gemini to return a structured JSON response of estimated matches, recommended specialists, and a checkbox list of next steps.
2. **Conflict-Free Scheduling:** The booking calendar fetches active appointments on the selected date for a doctor and filters out unavailable slots, preventing overlapping bookings.
3. **Prescription PDF Downloader:** Doctors fill out digital Rx forms, which write to the database and trigger automatic appointment completion. Patients can click download, which streams a PDF generated on-the-fly using `pdfkit`.
4. **Nodemailer Alerts:** Mailers send email updates (using HTML styling templates) for appointment bookings, status modifications, and new prescriptions. Ethereal Email prints links to the server console log for instant inspection.
5. **Real-time Notifications:** Patients, doctors, and admins have in-app notifications in the header to track clinic activity.

---

## Deployment Configuration

### Frontend (Vercel)
- The frontend is fully structured for Vercel deployment.
- A `vercel.json` file is configured inside the `frontend/` directory to prevent page-reload routing 404 errors.
- Build command: `npm run build`
- Output directory: `dist`

### Backend (Render)
- Deploy the `backend` workspace on Render as a Web Service.
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Ensure you set up environment variables on the Render Dashboard.
