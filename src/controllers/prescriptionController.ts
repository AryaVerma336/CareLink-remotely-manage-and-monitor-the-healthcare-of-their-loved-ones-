import { Response, NextFunction } from 'express';
import { db } from '../config/db';
import { ApiError } from '../utils/apiError';
import { AuthRequest } from '../middleware/auth';

export const createPrescription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');

    const { patient_id, doctor_id, hospital_id, diagnosis, medicines, file_url } = req.body;

    const id = `rx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const medicines_json = typeof medicines === 'string' ? medicines : JSON.stringify(medicines);

    db.prepare(`
      INSERT INTO prescriptions (id, patient_id, doctor_id, hospital_id, diagnosis, medicines_json, file_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, patient_id, doctor_id, hospital_id, diagnosis, medicines_json, file_url || null);

    res.status(201).json({
      success: true,
      message: 'Prescription uploaded successfully',
      data: { id, patient_id, diagnosis },
    });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');

    let query = `
      SELECT rx.*, d.name as doctor_name, d.specialization, h.name as hospital_name, u.full_name as patient_name
      FROM prescriptions rx
      JOIN doctors d ON rx.doctor_id = d.id
      JOIN hospitals h ON rx.hospital_id = h.id
      LEFT JOIN users u ON rx.patient_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (req.user.role === 'patient') {
      query += ' AND rx.patient_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'relative') {
      query += ' AND rx.patient_id IN (SELECT id FROM users WHERE role = "patient")';
    }

    query += ' ORDER BY rx.created_at DESC';
    const items = db.prepare(query).all(...params).map((rx: any) => ({
      ...rx,
      medicines: JSON.parse(rx.medicines_json || '[]'),
    }));

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};
