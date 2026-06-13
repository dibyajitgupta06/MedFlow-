import express from 'express';
import { body } from 'express-validator';
import {
  bookAppointment,
  getAppointments,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateFields } from '../middleware/validateMiddleware.js';

const router = express.Router();

const appointmentValidation = [
  body('doctorId').notEmpty().withMessage('Doctor ID is required'),
  body('departmentId').notEmpty().withMessage('Department ID is required'),
  body('date').notEmpty().withMessage('Date is required').isISO8601().withMessage('Invalid date format'),
  body('timeSlot').notEmpty().withMessage('Time slot is required').trim(),
  validateFields,
];

// All routes require login
router.use(protect);

router.post('/', authorizeRoles('patient'), appointmentValidation, bookAppointment);
router.get('/', getAppointments);
router.put('/:id/status', updateAppointmentStatus);

export default router;
