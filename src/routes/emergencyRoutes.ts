import { Router } from 'express';
import { triggerSOS, getSOSAlerts, resolveSOSAlert } from '../controllers/emergencyController';

const router = Router();

router.post('/sos', triggerSOS);
router.get('/alerts', getSOSAlerts);
router.patch('/alerts/:id', resolveSOSAlert);

export default router;
