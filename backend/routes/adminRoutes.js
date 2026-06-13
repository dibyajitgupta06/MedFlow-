import express from 'express';
import { body } from 'express-validator';
import {
  getAdminDashboard,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getPatients,
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateFields } from '../middleware/validateMiddleware.js';

const router = express.Router();

const doctorValidation = [
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Doctor name is required').trim(),
  body('phone').notEmpty().withMessage('Phone number is required').trim(),
  body('specialization').notEmpty().withMessage('Specialization is required').trim(),
  body('department').notEmpty().withMessage('Department ID is required'),
  body('experience').isNumeric().withMessage('Experience must be a number'),
  body('fees').isNumeric().withMessage('Fees must be a number'),
  validateFields,
];

// All routes are admin-only
router.use(protect, authorizeRoles('admin'));

router.get('/dashboard/stats', getAdminDashboard);
router.post('/doctors', doctorValidation, createDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);
router.get('/patients', getPatients);

export default router;
