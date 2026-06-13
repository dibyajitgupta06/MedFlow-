# MedFlow API Documentation

All API requests should be sent to the base URL: `http://localhost:5001/api`

---

## Authentication

MedFlow uses JSON Web Tokens (JWT) for authentication. Protect routes require passing a bearer token in the `Authorization` header.

**Header Format:**
```
Authorization: Bearer <your_jwt_token_here>
```

### 1. Register Patient
- **Endpoint:** `POST /auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "john.doe@gmail.com",
    "password": "patient123",
    "name": "John Doe",
    "phone": "+1 555-0201",
    "gender": "male",
    "dob": "1990-05-15",
    "bloodGroup": "O+",
    "address": "123 Main Street, New York, NY"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "_id": "60d5ecb8b392f035e07661b1",
    "email": "john.doe@gmail.com",
    "role": "patient",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "profile": {
      "_id": "60d5ecb8b392f035e07661b2",
      "user": "60d5ecb8b392f035e07661b1",
      "name": "John Doe",
      "phone": "+1 555-0201",
      "gender": "male",
      "dob": "1990-05-15T00:00:00.000Z",
      "bloodGroup": "O+",
      "address": "123 Main Street, New York, NY",
      "medicalHistory": [],
      "reports": []
    }
  }
  ```

### 2. Login User (Admin, Doctor, Patient)
- **Endpoint:** `POST /auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@medflow.com",
    "password": "admin123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "_id": "60d5ecb8b392f035e07661a0",
    "email": "admin@medflow.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "profile": null
  }
  ```

### 3. Get Current User Details
- **Endpoint:** `GET /auth/me`
- **Access:** Private
- **Response (200 OK):**
  ```json
  {
    "_id": "60d5ecb8b392f035e07661b1",
    "email": "john.doe@gmail.com",
    "role": "patient",
    "profile": {
      "_id": "60d5ecb8b392f035e07661b2",
      "name": "John Doe",
      "phone": "+1 555-0201",
      "gender": "male"
    }
  }
  ```

---

## Appointments Module

### 1. Book Appointment
- **Endpoint:** `POST /appointments`
- **Access:** Private / Patient
- **Request Body:**
  ```json
  {
    "doctorId": "60d5ecb8b392f035e07661c1",
    "departmentId": "60d5ecb8b392f035e0766100",
    "date": "2026-06-15",
    "timeSlot": "10:00 AM - 10:30 AM",
    "symptoms": "Mild shortness of breath",
    "reason": "Cardiology Checkup"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "_id": "60d5ecb8b392f035e07662d5",
    "patient": "60d5ecb8b392f035e07661b2",
    "doctor": "60d5ecb8b392f035e07661c1",
    "department": "60d5ecb8b392f035e0766100",
    "date": "2026-06-15T00:00:00.000Z",
    "timeSlot": "10:00 AM - 10:30 AM",
    "status": "pending",
    "symptoms": "Mild shortness of breath",
    "reason": "Cardiology Checkup",
    "notes": ""
  }
  ```

### 2. Update Appointment Status
- **Endpoint:** `PUT /appointments/:id/status`
- **Access:** Private / Patient, Doctor, Admin
- **Request Body:**
  ```json
  {
    "status": "approved",
    "notes": "Patient approved for consultation on Monday."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "_id": "60d5ecb8b392f035e07662d5",
    "status": "approved",
    "notes": "Patient approved for consultation on Monday."
  }
  ```

---

## AI Symptom Checker

### 1. Check Symptoms
- **Endpoint:** `POST /symptoms/check`
- **Access:** Private / Patient
- **Request Body:**
  ```json
  {
    "symptoms": "Chest pain radiating to my left arm, palpitations, sweating"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "conditions": [
      {
        "name": "Angina / Suspected Myocardial Infarction",
        "probability": "High",
        "description": "Possible oxygen deprivation to the heart muscle. Requires immediate examination."
      }
    ],
    "specialist": "Cardiologist",
    "nextSteps": [
      "IMPORTANT: Go to the nearest emergency room if you experience sudden, severe chest pain.",
      "Avoid any physical activities or exertion.",
      "Monitor blood pressure and pulse."
    ]
  }
  ```

---

## Prescriptions Module

### 1. Create Prescription
- **Endpoint:** `POST /prescriptions`
- **Access:** Private / Doctor
- **Request Body:**
  ```json
  {
    "appointmentId": "60d5ecb8b392f035e07662d5",
    "patientId": "60d5ecb8b392f035e07661b2",
    "diagnosis": "Mild Hypertension",
    "medicines": [
      {
        "name": "Amlodipine",
        "dosage": "5mg",
        "frequency": "Once daily (Morning)",
        "duration": "30 days"
      }
    ],
    "notes": "Check blood pressure twice weekly. Limit sodium intake."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "_id": "60d5ecb8b392f035e0766300",
    "appointment": "60d5ecb8b392f035e07662d5",
    "patient": "60d5ecb8b392f035e07661b2",
    "doctor": "60d5ecb8b392f035e07661c1",
    "diagnosis": "Mild Hypertension",
    "medicines": [
      {
        "name": "Amlodipine",
        "dosage": "5mg",
        "frequency": "Once daily (Morning)",
        "duration": "30 days"
      }
    ],
    "notes": "Check blood pressure twice weekly. Limit sodium intake.",
    "date": "2026-06-13T18:44:52.000Z"
  }
  ```

### 2. Download Prescription PDF
- **Endpoint:** `GET /prescriptions/:id/pdf`
- **Access:** Private / Patient, Doctor, Admin
- **Response:** File attachment stream (`Content-Type: application/pdf`)
