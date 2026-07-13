import express from 'express';
import { analyzeCompany } from '../controllers/analyzeController.js';

/**
 * Analyze Routes
 * 
 * Purpose:
 * Binds company analysis routes to the Express router.
 */

const router = express.Router();

// Define route path: GET /api/analyze/:symbol
router.get('/:symbol', analyzeCompany);

export default router;
