import { Router } from 'express';
import { getSpcData } from '../controllers/spcController';

const router = Router();

router.get('/', getSpcData);

export default router;
