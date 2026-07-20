import { Router } from 'express';
import { getSummary, getHourlyProduction } from '../controllers/dashboardController';

const router = Router();

router.get('/summary', getSummary);
router.get('/hourly', getHourlyProduction);

export default router;
