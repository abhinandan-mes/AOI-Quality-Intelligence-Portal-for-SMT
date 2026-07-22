import express from 'express';
import { getDefectPareto, getYieldTrend } from '../controllers/reportController';

const router = express.Router();

router.get('/pareto', getDefectPareto);
router.get('/yield', getYieldTrend);

export default router;
