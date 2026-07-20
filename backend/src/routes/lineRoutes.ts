import { Router } from 'express';
import { getLines, createLine, updateLine, deleteLine } from '../controllers/lineController';

const router = Router();

router.get('/', getLines);
router.post('/', createLine);
router.put('/:id', updateLine);
router.delete('/:id', deleteLine);

export default router;
