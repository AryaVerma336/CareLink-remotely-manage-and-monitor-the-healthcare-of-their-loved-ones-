import { Response, NextFunction } from 'express';
import { db } from '../config/db';
import { ApiError } from '../utils/apiError';
import { AuthRequest } from '../middleware/auth';

export const getMedicines = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, category, pharmacy_id } = req.query;
    let query = `
      SELECT m.*, p.name as pharmacy_name, p.city as pharmacy_city
      FROM medicines m
      JOIN pharmacies p ON m.pharmacy_id = p.id
      WHERE p.is_approved = 1
    `;
    const params: any[] = [];

    if (search) {
      query += ' AND (LOWER(m.name) LIKE LOWER(?) OR LOWER(m.generic_name) LIKE LOWER(?))';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      query += ' AND LOWER(m.category) = LOWER(?)';
      params.push(category);
    }
    if (pharmacy_id) {
      query += ' AND m.pharmacy_id = ?';
      params.push(pharmacy_id);
    }

    query += ' ORDER BY m.name ASC';
    const medicines = db.prepare(query).all(...params);

    res.json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpiryDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');

    let pharmacyId = null;
    if (req.user.role === 'pharmacist') {
      const ph = db.prepare('SELECT id FROM pharmacies WHERE user_id = ?').get(req.user.id) as any;
      if (ph) pharmacyId = ph.id;
    }

    let query = `
      SELECT m.*, p.name as pharmacy_name,
        CASE
          WHEN julianday(m.expiry_date) - julianday('now') <= 30 THEN '30_days'
          WHEN julianday(m.expiry_date) - julianday('now') <= 60 THEN '60_days'
          WHEN julianday(m.expiry_date) - julianday('now') <= 90 THEN '90_days'
          ELSE 'safe'
        END as expiry_risk
      FROM medicines m
      JOIN pharmacies p ON m.pharmacy_id = p.id
    `;
    const params: any[] = [];
    if (pharmacyId) {
      query += ' WHERE m.pharmacy_id = ?';
      params.push(pharmacyId);
    }

    const items = db.prepare(query).all(...params) as any[];

    const stats = {
      within30Days: items.filter(i => i.expiry_risk === '30_days'),
      within60Days: items.filter(i => i.expiry_risk === '60_days'),
      within90Days: items.filter(i => i.expiry_risk === '90_days'),
      totalLowStock: items.filter(i => i.stock_quantity < 20),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');

    const { pharmacy_id, delivery_address, items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Order items are required');
    }

    let totalAmount = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const med = db.prepare('SELECT * FROM medicines WHERE id = ?').get(item.medicine_id) as any;
      if (!med) throw new ApiError(404, `Medicine ID ${item.medicine_id} not found`);
      if (med.stock_quantity < item.quantity) {
        throw new ApiError(400, `Insufficient stock for medicine: ${med.name}`);
      }

      totalAmount += med.price * item.quantity;
      validatedItems.push({
        medicine_id: med.id,
        quantity: item.quantity,
        unit_price: med.price,
      });
    }

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const patient_id = req.user.role === 'patient' ? req.user.id : req.body.patient_id || req.user.id;
    const relative_id = req.user.role === 'relative' ? req.user.id : null;

    db.transaction(() => {
      db.prepare(`
        INSERT INTO orders (id, patient_id, relative_id, pharmacy_id, total_amount, delivery_address, status)
        VALUES (?, ?, ?, ?, ?, ?, 'Pending')
      `).run(orderId, patient_id, relative_id, pharmacy_id, totalAmount, delivery_address);

      for (const item of validatedItems) {
        const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        db.prepare(`
          INSERT INTO order_items (id, order_id, medicine_id, quantity, unit_price)
          VALUES (?, ?, ?, ?, ?)
        `).run(itemId, orderId, item.medicine_id, item.quantity, item.unit_price);

        // Deduct inventory stock
        db.prepare('UPDATE medicines SET stock_quantity = stock_quantity - ? WHERE id = ?')
          .run(item.quantity, item.medicine_id);
      }
    })();

    res.status(201).json({
      success: true,
      message: 'Medicine order placed successfully',
      data: {
        order_id: orderId,
        total_amount: totalAmount,
        status: 'Pending',
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError(401, 'Unauthorized');

    let query = `
      SELECT o.*, p.name as pharmacy_name, u.full_name as patient_name, u.phone as patient_phone
      FROM orders o
      JOIN pharmacies p ON o.pharmacy_id = p.id
      LEFT JOIN users u ON o.patient_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (req.user.role === 'relative') {
      query += ' AND (o.relative_id = ? OR o.patient_id = ?)';
      params.push(req.user.id, req.user.id);
    } else if (req.user.role === 'patient') {
      query += ' AND o.patient_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'pharmacist') {
      const ph = db.prepare('SELECT id FROM pharmacies WHERE user_id = ?').get(req.user.id) as any;
      if (ph) {
        query += ' AND o.pharmacy_id = ?';
        params.push(ph.id);
      }
    }

    query += ' ORDER BY o.created_at DESC';
    const orders = db.prepare(query).all(...params) as any[];

    // Attach items for each order
    for (const order of orders) {
      order.items = db.prepare(`
        SELECT oi.*, m.name as medicine_name, m.generic_name
        FROM order_items oi
        JOIN medicines m ON oi.medicine_id = m.id
        WHERE oi.order_id = ?
      `).all(order.id);
    }

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'].includes(status)) {
      throw new ApiError(400, 'Invalid status value');
    }

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};
