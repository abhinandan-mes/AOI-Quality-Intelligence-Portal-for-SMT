import { Router } from 'express';
import { getSpcData } from '../controllers/spcController';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', verifyToken, getSpcData);

export default router;
