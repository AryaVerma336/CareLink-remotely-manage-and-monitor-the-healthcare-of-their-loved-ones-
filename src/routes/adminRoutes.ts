import { Router } from 'express';
import { getAdminStats, getApprovalsList, updateApprovalStatus } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Protect all admin routes
router.use(authenticate, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/approvals', getApprovalsList);
router.patch('/approvals/:type/:id', updateApprovalStatus);

export default router;
