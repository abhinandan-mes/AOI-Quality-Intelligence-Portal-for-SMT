import express from 'express';
import { getSummary, getDashboardData } from '../controllers/dashboardController';

const router = express.Router();

router.get('/summary', getSummary);
router.get('/data', getDashboardData);

export default router;
