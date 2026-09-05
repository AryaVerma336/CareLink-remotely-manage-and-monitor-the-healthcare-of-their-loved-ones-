import { Response, NextFunction } from 'express';
import { db } from '../config/db';
import { ApiError } from '../utils/apiError';
import { AuthRequest } from '../middleware/auth';

export const createTripRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');

    const { patient_id, appointment_id, pickup_address, drop_address, scheduled_time } = req.body;

    const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const relative_id = req.user.role === 'relative' ? req.user.id : null;
    const p_id = patient_id || req.user.id;

    // Find available driver automatically
    const availableDriver = db.prepare('SELECT id FROM drivers WHERE is_available = 1 AND is_verified = 1 LIMIT 1').get() as any;

    db.prepare(`
      INSERT INTO trips (id, patient_id, relative_id, driver_id, appointment_id, pickup_address, drop_address, status, scheduled_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Assigned', ?)
    `).run(tripId, p_id, relative_id, availableDriver ? availableDriver.id : null, appointment_id || null, pickup_address, drop_address, scheduled_time || 'Immediate');

    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);

    res.status(201).json({
      success: true,
      message: 'Pickup request created successfully',
      data: trip,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrips = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');

    let query = `
      SELECT t.*, 
             u.full_name as patient_name, u.phone as patient_phone,
             d_usr.full_name as driver_name, d_usr.phone as driver_phone,
             d.vehicle_number, d.vehicle_model
      FROM trips t
      LEFT JOIN users u ON t.patient_id = u.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      LEFT JOIN users d_usr ON d.user_id = d_usr.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (req.user.role === 'relative') {
      query += ' AND (t.relative_id = ? OR t.patient_id = ?)';
      params.push(req.user.id, req.user.id);
    } else if (req.user.role === 'patient') {
      query += ' AND t.patient_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'driver') {
      const drv = db.prepare('SELECT id FROM drivers WHERE user_id = ?').get(req.user.id) as any;
      if (drv) {
        query += ' AND t.driver_id = ?';
        params.push(drv.id);
      }
    }

    query += ' ORDER BY t.created_at DESC';
    const trips = db.prepare(query).all(...params);

    res.json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTripLocation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { driver_lat, driver_lng, status } = req.body;

    let query = 'UPDATE trips SET driver_lat = ?, driver_lng = ?';
    const params: any[] = [driver_lat, driver_lng];

    if (status) {
      query += ', status = ?';
      params.push(status);
    }
    query += ' WHERE id = ?';
    params.push(id);

    db.prepare(query).run(...params);

    // Also update driver's global coordinates
    const trip = db.prepare('SELECT driver_id FROM trips WHERE id = ?').get(id) as any;
    if (trip && trip.driver_id) {
      db.prepare('UPDATE drivers SET current_lat = ?, current_lng = ? WHERE id = ?')
        .run(driver_lat, driver_lng, trip.driver_id);
    }

    res.json({
      success: true,
      message: 'Trip location updated',
      data: { id, driver_lat, driver_lng, status },
    });
  } catch (error) {
    next(error);
  }
};
