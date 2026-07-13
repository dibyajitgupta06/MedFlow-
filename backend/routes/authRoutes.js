import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateFields } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Input Validations for Registration
const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters long'),
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('phone').notEmpty().withMessage('Phone number is required').trim(),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender selection'),
  body('dob').notEmpty().withMessage('Date of birth is required').isISO8601().withMessage('Invalid date format'),
  validateFields,
];

// Input Validations for Login
const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validateFields,
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);

export default router;
