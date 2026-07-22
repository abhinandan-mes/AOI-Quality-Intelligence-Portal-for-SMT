import express from 'express';
import { searchDefects } from '../controllers/defectController';

const router = express.Router();

router.get('/', searchDefects);

export default router;
