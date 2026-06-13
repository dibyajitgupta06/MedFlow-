import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getPatientProfile, updatePatientProfile, uploadReport } from '../controllers/patientController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDFs and Image files (.jpg, .jpeg, .png) are allowed'));
    }
  },
});

router.get('/profile', protect, authorizeRoles('patient'), getPatientProfile);
router.put('/profile', protect, authorizeRoles('patient'), updatePatientProfile);
router.post('/reports', protect, authorizeRoles('patient'), upload.single('report'), uploadReport);

export default router;
