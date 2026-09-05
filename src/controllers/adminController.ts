import { Response, NextFunction } from 'express';
import { db } from '../config/db';
import { ApiError } from '../utils/apiError';
import { AuthRequest } from '../middleware/auth';

export const getAdminStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
    const totalHospitals = (db.prepare('SELECT COUNT(*) as count FROM hospitals WHERE is_approved = 1').get() as any).count;
    const totalPharmacies = (db.prepare('SELECT COUNT(*) as count FROM pharmacies WHERE is_approved = 1').get() as any).count;
    const totalAppointments = (db.prepare('SELECT COUNT(*) as count FROM appointments').get() as any).count;
    const totalOrders = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as any).count;
    const activeTrips = (db.prepare('SELECT COUNT(*) as count FROM trips WHERE status != "Completed"').get() as any).count;
    const activeSOS = (db.prepare('SELECT COUNT(*) as count FROM sos_alerts WHERE status = "Active"').get() as any).count;

    const recentActivity = db.prepare(`
      SELECT 'appointment' as type, id, created_at, status FROM appointments
      UNION ALL
      SELECT 'order' as type, id, created_at, status FROM orders
      UNION ALL
      SELECT 'trip' as type, id, created_at, status FROM trips
      ORDER BY created_at DESC LIMIT 10
    `).all();

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalHospitals,
          totalPharmacies,
          totalAppointments,
          totalOrders,
          activeTrips,
          activeSOS,
        },
        recentActivity,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getApprovalsList = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hospitals = db.prepare('SELECT id, name, city, address, phone, rating, is_approved, "hospital" as entity_type FROM hospitals').all();
    const pharmacies = db.prepare('SELECT id, name, city, address, phone, is_approved, "pharmacy" as entity_type FROM pharmacies').all();
    const drivers = db.prepare('SELECT d.id, u.full_name as name, u.city, d.vehicle_number, d.vehicle_model, d.is_verified as is_approved, "driver" as entity_type FROM drivers d JOIN users u ON d.user_id = u.id').all();

    res.json({
      success: true,
      data: {
        hospitals,
        pharmacies,
        drivers,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateApprovalStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, id } = req.params;
    const { is_approved } = req.body;

    const approvalVal = is_approved ? 1 : 0;

    if (type === 'hospital') {
      db.prepare('UPDATE hospitals SET is_approved = ? WHERE id = ?').run(approvalVal, id);
    } else if (type === 'pharmacy') {
      db.prepare('UPDATE pharmacies SET is_approved = ? WHERE id = ?').run(approvalVal, id);
    } else if (type === 'driver') {
      db.prepare('UPDATE drivers SET is_verified = ? WHERE id = ?').run(approvalVal, id);
    } else {
      throw new ApiError(400, 'Invalid entity type');
    }

    res.json({
      success: true,
      message: `${type} approval status updated to ${is_approved ? 'Approved' : 'Rejected'}`,
    });
  } catch (error) {
    next(error);
  }
};
