import { Router } from 'express';
import { getMedicines, getExpiryDashboard, createOrder, getOrders, updateOrderStatus } from '../controllers/medicineController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getMedicines);
router.get('/expiry-dashboard', authenticate, getExpiryDashboard);
router.post('/orders', authenticate, createOrder);
router.get('/orders', authenticate, getOrders);
router.patch('/orders/:id/status', authenticate, updateOrderStatus);

export default router;
