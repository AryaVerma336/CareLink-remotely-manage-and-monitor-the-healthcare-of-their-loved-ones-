import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from './env';
import { logger } from '../utils/logger';

// Ensure data directory exists
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db: DatabaseType = new Database(config.dbPath);

// Enable WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  logger.info('Initializing SQLite Database schema...');

  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('relative', 'patient', 'hospital', 'pharmacist', 'driver', 'admin')),
      phone TEXT,
      city TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Hospitals table
    CREATE TABLE IF NOT EXISTS hospitals (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      rating REAL DEFAULT 4.8,
      total_doctors INTEGER DEFAULT 0,
      is_approved INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Doctors table
    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      hospital_id TEXT REFERENCES hospitals(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      specialization TEXT NOT NULL,
      experience_years INTEGER NOT NULL,
      fee INTEGER NOT NULL,
      rating REAL DEFAULT 4.9,
      availability_json TEXT DEFAULT '["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Appointments table
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      relative_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      doctor_id TEXT REFERENCES doctors(id) ON DELETE CASCADE,
      hospital_id TEXT REFERENCES hospitals(id) ON DELETE CASCADE,
      appointment_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Upcoming' CHECK(status IN ('Upcoming', 'Completed', 'Cancelled')),
      notes TEXT,
      needs_pickup INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Pharmacies table
    CREATE TABLE IF NOT EXISTS pharmacies (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      is_approved INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Medicines table
    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      pharmacy_id TEXT REFERENCES pharmacies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      generic_name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      stock_quantity INTEGER NOT NULL,
      batch_number TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      requires_prescription INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Orders table
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      relative_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      pharmacy_id TEXT REFERENCES pharmacies(id) ON DELETE CASCADE,
      total_amount REAL NOT NULL,
      delivery_address TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled')),
      payment_status TEXT NOT NULL DEFAULT 'Paid',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Order items table
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
      medicine_id TEXT REFERENCES medicines(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL
    );

    -- Drivers table
    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      vehicle_number TEXT NOT NULL,
      vehicle_model TEXT NOT NULL,
      current_lat REAL DEFAULT 26.8467,
      current_lng REAL DEFAULT 80.9462,
      is_available INTEGER DEFAULT 1,
      is_verified INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Trips table
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      relative_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      driver_id TEXT REFERENCES drivers(id) ON DELETE SET NULL,
      appointment_id TEXT REFERENCES appointments(id) ON DELETE SET NULL,
      pickup_address TEXT NOT NULL,
      drop_address TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Assigned' CHECK(status IN ('Assigned', 'In Transit', 'Completed', 'Cancelled')),
      driver_lat REAL DEFAULT 26.8467,
      driver_lng REAL DEFAULT 80.9462,
      scheduled_time TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Prescriptions table
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      doctor_id TEXT REFERENCES doctors(id) ON DELETE CASCADE,
      hospital_id TEXT REFERENCES hospitals(id) ON DELETE CASCADE,
      diagnosis TEXT NOT NULL,
      medicines_json TEXT NOT NULL,
      file_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Emergency SOS alerts table
    CREATE TABLE IF NOT EXISTS sos_alerts (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      patient_name TEXT NOT NULL,
      location_address TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Responded', 'Resolved')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  logger.info('Database tables verified and ready.');
}
