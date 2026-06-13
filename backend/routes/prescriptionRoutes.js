import express from 'express';
import { body } from 'express-validator';
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionDetails,
  downloadPrescriptionPDF,
} from '../controllers/prescriptionController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateFields } from '../middleware/validateMiddleware.js';

const router = express.Router();

const prescriptionValidation = [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('diagnosis').notEmpty().withMessage('Diagnosis notes are required').trim(),
  body('medicines').isArray({ min: 1 }).withMessage('At least one medicine is required'),
  body('medicines.*.name').notEmpty().withMessage('Medicine name is required').trim(),
  body('medicines.*.dosage').notEmpty().withMessage('Dosage is required').trim(),
  body('medicines.*.frequency').notEmpty().withMessage('Frequency is required').trim(),
  body('medicines.*.duration').notEmpty().withMessage('Duration is required').trim(),
  validateFields,
];

// All routes require login
router.use(protect);

router.post('/', authorizeRoles('doctor'), prescriptionValidation, createPrescription);
router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionDetails);
router.get('/:id/pdf', downloadPrescriptionPDF);

export default router;
