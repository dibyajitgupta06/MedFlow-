import express from 'express';
import {
  getDoctors,
  getDoctorProfile,
  getDoctorDashboard,
  getAssignedPatients,
  getPatientMedicalHistory,
} from '../controllers/doctorController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getDoctors);

// Doctor Dashboard Stats
router.get('/dashboard/stats', protect, authorizeRoles('doctor'), getDoctorDashboard);
router.get('/dashboard/patients', protect, authorizeRoles('doctor'), getAssignedPatients);
router.get('/patients/:id/history', protect, authorizeRoles('doctor'), getPatientMedicalHistory);

// Specific Doctor profile by ID (availability)
router.get('/:id', getDoctorProfile);

export default router;
