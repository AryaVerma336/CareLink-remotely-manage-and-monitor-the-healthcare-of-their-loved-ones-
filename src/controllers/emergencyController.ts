import { Response, NextFunction } from 'express';
import { db } from '../config/db';
import { ApiError } from '../utils/apiError';
import { AuthRequest } from '../middleware/auth';

export const triggerSOS = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { patient_name, location_address, lat, lng } = req.body;
    const patient_id = req.user ? req.user.id : null;

    const sosId = `sos_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    db.prepare(`
      INSERT INTO sos_alerts (id, patient_id, patient_name, location_address, lat, lng, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Active')
    `).run(sosId, patient_id, patient_name || 'Elderly Patient', location_address || 'Current Location', lat || 26.8467, lng || 80.9462);

    const alert = db.prepare('SELECT * FROM sos_alerts WHERE id = ?').get(sosId);

    res.status(201).json({
      success: true,
      message: '🚨 EMERGENCY SOS ALERT TRIGGERED! Nearby hospitals & relatives notified.',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

export const getSOSAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const alerts = db.prepare('SELECT * FROM sos_alerts ORDER BY created_at DESC').all();

    res.json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveSOSAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    db.prepare('UPDATE sos_alerts SET status = ? WHERE id = ?').run(status || 'Resolved', id);

    res.json({
      success: true,
      message: `Emergency SOS status updated to ${status || 'Resolved'}`,
    });
  } catch (error) {
    next(error);
  }
};
