import { Router } from 'express';
import { createTripRequest, getTrips, updateTripLocation } from '../controllers/tripController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getTrips);
router.post('/', authenticate, createTripRequest);
router.patch('/:id/location', authenticate, updateTripLocation);

export default router;
