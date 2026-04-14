import express from 'express';
import {
  createCategoryController,
  deleteCategoryController,
  getCategoriesController,
  getCategoryByIdController,
  updateCategoryController
} from '../controllers/categoryController.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategoriesController);
router.get('/:id', getCategoryByIdController);

router.post('/', authenticate, authorizeAdmin, createCategoryController);
router.patch('/:id', authenticate, authorizeAdmin, updateCategoryController);
router.delete('/:id', authenticate, authorizeAdmin, deleteCategoryController);

export default router;

