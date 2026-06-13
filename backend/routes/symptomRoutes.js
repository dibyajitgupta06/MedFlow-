import express from 'express';
import { checkSymptoms } from '../controllers/symptomController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/check', protect, authorizeRoles('patient'), checkSymptoms);

export default router;
