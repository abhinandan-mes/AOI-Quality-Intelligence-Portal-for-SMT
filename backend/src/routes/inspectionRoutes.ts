import { Router } from 'express';
import { searchInspections } from '../controllers/inspectionController';

const router = Router();

router.get('/', searchInspections);

export default router;
