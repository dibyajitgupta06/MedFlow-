import express from 'express';
import { body } from 'express-validator';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateFields } from '../middleware/validateMiddleware.js';

const router = express.Router();

const departmentValidation = [
  body('name').notEmpty().withMessage('Department name is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('icon').notEmpty().withMessage('Icon class/identifier is required').trim(),
  validateFields,
];

router.get('/', getDepartments);

// Admin-only write operations
router.post('/', protect, authorizeRoles('admin'), departmentValidation, createDepartment);
router.put('/:id', protect, authorizeRoles('admin'), departmentValidation, updateDepartment);
router.delete('/:id', protect, authorizeRoles('admin'), deleteDepartment);

export default router;
