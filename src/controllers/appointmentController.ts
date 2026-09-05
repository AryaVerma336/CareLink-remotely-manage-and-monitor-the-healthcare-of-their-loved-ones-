import { Response, NextFunction } from 'express';
import { db } from '../config/db';
import { ApiError } from '../utils/apiError';
import { AuthRequest } from '../middleware/auth';

export const getHospitals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const city = req.query.city as string;
    let query = 'SELECT * FROM hospitals WHERE is_approved = 1';
    const params: any[] = [];

    if (city) {
      query += ' AND LOWER(city) = LOWER(?)';
      params.push(city);
    }

    query += ' ORDER BY rating DESC';
    const hospitals = db.prepare(query).all(...params);

    res.json({
      success: true,
      count: hospitals.length,
      data: hospitals,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctors = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { hospital_id, specialization } = req.query;
    let query = `
      SELECT d.*, h.name as hospital_name, h.city as hospital_city
      FROM doctors d
      JOIN hospitals h ON d.hospital_id = h.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (hospital_id) {
      query += ' AND d.hospital_id = ?';
      params.push(hospital_id);
    }
    if (specialization) {
      query += ' AND LOWER(d.specialization) LIKE LOWER(?)';
      params.push(`%${specialization}%`);
    }

    query += ' ORDER BY d.rating DESC';
    const doctors = db.prepare(query).all(...params).map((doc: any) => ({
      ...doc,
      availability_slots: JSON.parse(doc.availability_json || '[]')
    }));

    res.json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');

    const { doctor_id, hospital_id, patient_id, appointment_date, time_slot, notes, needs_pickup } = req.body;

    const doctor = db.prepare('SELECT id FROM doctors WHERE id = ?').get(doctor_id);
    if (!doctor) throw new ApiError(404, 'Doctor not found');

    const id = `apt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Relative or patient creating appointment
    const relative_id = req.user.role === 'relative' ? req.user.id : null;
    const p_id = patient_id || (req.user.role === 'patient' ? req.user.id : req.user.id);

    db.prepare(`
      INSERT INTO appointments (id, patient_id, relative_id, doctor_id, hospital_id, appointment_date, time_slot, notes, needs_pickup)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, p_id, relative_id, doctor_id, hospital_id, appointment_date, time_slot, notes || null, needs_pickup ? 1 : 0);

    const created = db.prepare(`
      SELECT a.*, d.name as doctor_name, d.specialization, h.name as hospital_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN hospitals h ON a.hospital_id = h.id
      WHERE a.id = ?
    `).get(id);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');

    let query = `
      SELECT a.*, 
             d.name as doctor_name, d.specialization, d.fee,
             h.name as hospital_name, h.address as hospital_address,
             p.full_name as patient_name, r.full_name as relative_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN hospitals h ON a.hospital_id = h.id
      LEFT JOIN users p ON a.patient_id = p.id
      LEFT JOIN users r ON a.relative_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (req.user.role === 'relative') {
      query += ' AND (a.relative_id = ? OR a.patient_id IN (SELECT id FROM users WHERE role = "patient"))';
      params.push(req.user.id);
    } else if (req.user.role === 'patient') {
      query += ' AND a.patient_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'hospital') {
      const hospital = db.prepare('SELECT id FROM hospitals WHERE user_id = ?').get(req.user.id) as any;
      if (hospital) {
        query += ' AND a.hospital_id = ?';
        params.push(hospital.id);
      }
    }

    query += ' ORDER BY a.appointment_date DESC, a.created_at DESC';
    const appointments = db.prepare(query).all(...params);

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Upcoming', 'Completed', 'Cancelled'].includes(status)) {
      throw new ApiError(400, 'Invalid status value');
    }

    const appointment = db.prepare('SELECT id FROM appointments WHERE id = ?').get(id);
    if (!appointment) throw new ApiError(404, 'Appointment not found');

    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, id);

    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};
