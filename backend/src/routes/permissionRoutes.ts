import { Router } from 'express';
import { getPermissions, updatePermission } from '../controllers/permissionController';

const router = Router();

router.get('/', getPermissions);
router.put('/:role', updatePermission);

export default router;
