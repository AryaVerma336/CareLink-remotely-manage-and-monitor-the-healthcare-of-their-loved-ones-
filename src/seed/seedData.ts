import bcrypt from 'bcryptjs';
import { db, initDb } from '../config/db';
import { logger } from '../utils/logger';

export async function seed() {
  initDb();
  logger.info('Seeding database with realistic CareLink healthcare data...');

  const passwordHash = await bcrypt.hash('CareLink#2026', 10);

  // Clear existing tables
  db.exec(`
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM medicines;
    DELETE FROM pharmacies;
    DELETE FROM trips;
    DELETE FROM drivers;
    DELETE FROM appointments;
    DELETE FROM prescriptions;
    DELETE FROM doctors;
    DELETE FROM hospitals;
    DELETE FROM sos_alerts;
    DELETE FROM users;
  `);

  // Seed Users across roles
  const users = [
    { id: 'usr_rel_1', email: 'arjun@carelink.health', full_name: 'Arjun Sharma', role: 'relative', phone: '+91 98765 43210', city: 'Chennai', address: 'B-402, Anna Nagar' },
    { id: 'usr_pat_1', email: 'ramesh@carelink.health', full_name: 'Ramesh Sharma', role: 'patient', phone: '+91 98123 45678', city: 'Lucknow', address: '12/45 Gomti Nagar' },
    { id: 'usr_hosp_1', email: 'admin@kghospital.in', full_name: 'King George Hospital Admin', role: 'hospital', phone: '+91 522 2257540', city: 'Lucknow', address: 'Chowk, Lucknow' },
    { id: 'usr_pharm_1', email: 'orders@medplus.in', full_name: 'MedPlus Pharmacy Manager', role: 'pharmacist', phone: '+91 522 4001234', city: 'Lucknow', address: 'Hazratganj, Lucknow' },
    { id: 'usr_drv_1', email: 'suresh.driver@carelink.health', full_name: 'Suresh Kumar', role: 'driver', phone: '+91 94500 11223', city: 'Lucknow', address: 'Alambagh, Lucknow' },
    { id: 'usr_adm_1', email: 'admin@carelink.health', full_name: 'System SuperAdmin', role: 'admin', phone: '+91 11 2345 6789', city: 'New Delhi', address: 'Connaught Place' },
  ];

  const userInsert = db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role, phone, city, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of users) {
    userInsert.run(u.id, u.email, passwordHash, u.full_name, u.role, u.phone, u.city, u.address);
  }

  // Seed Hospitals
  const hospitals = [
    { id: 'hosp_1', user_id: 'usr_hosp_1', name: 'King George Hospital & Medical University', city: 'Lucknow', address: 'Shah Mina Rd, Chowk, Lucknow', phone: '0522-2257540', rating: 4.9, total_doctors: 45 },
    { id: 'hosp_2', user_id: null, name: 'Apollo Multispecialty Hospital', city: 'Chennai', address: 'Greams Road, Thousand Lights, Chennai', phone: '044-28290200', rating: 4.8, total_doctors: 60 },
    { id: 'hosp_3', user_id: null, name: 'Fortis Healthcare Center', city: 'Lucknow', address: 'Sector 7, Gomti Nagar, Lucknow', phone: '0522-4911222', rating: 4.7, total_doctors: 30 },
  ];

  const hospInsert = db.prepare(`
    INSERT INTO hospitals (id, user_id, name, city, address, phone, rating, total_doctors, is_approved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  for (const h of hospitals) {
    hospInsert.run(h.id, h.user_id, h.name, h.city, h.address, h.phone, h.rating, h.total_doctors);
  }

  // Seed Doctors
  const doctors = [
    { id: 'doc_1', hospital_id: 'hosp_1', name: 'Dr. V. K. Verma', specialization: 'Cardiology', experience_years: 18, fee: 800, rating: 4.9, slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:30 PM'] },
    { id: 'doc_2', hospital_id: 'hosp_1', name: 'Dr. Sunita Mehta', specialization: 'Orthopedics', experience_years: 14, fee: 700, rating: 4.8, slots: ['10:00 AM', '12:30 PM', '03:00 PM', '05:00 PM'] },
    { id: 'doc_3', hospital_id: 'hosp_2', name: 'Dr. R. K. Singh', specialization: 'Neurology', experience_years: 22, fee: 1200, rating: 4.95, slots: ['10:30 AM', '01:00 PM', '04:00 PM'] },
    { id: 'doc_4', hospital_id: 'hosp_3', name: 'Dr. Ananya Roy', specialization: 'General Medicine', experience_years: 10, fee: 500, rating: 4.75, slots: ['09:30 AM', '11:30 AM', '02:30 PM', '06:00 PM'] },
  ];

  const docInsert = db.prepare(`
    INSERT INTO doctors (id, hospital_id, name, specialization, experience_years, fee, rating, availability_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const d of doctors) {
    docInsert.run(d.id, d.hospital_id, d.name, d.specialization, d.experience_years, d.fee, d.rating, JSON.stringify(d.slots));
  }

  // Seed Pharmacies
  const pharmacies = [
    { id: 'pharm_1', user_id: 'usr_pharm_1', name: 'MedPlus Pharmacy & Healthcare', city: 'Lucknow', address: 'Shop 14, Main Market, Hazratganj, Lucknow', phone: '0522-4001234' },
    { id: 'pharm_2', user_id: null, name: 'Apollo Pharmacy 24/7', city: 'Lucknow', address: 'Gomti Nagar Extension, Lucknow', phone: '0522-4567890' },
  ];

  const pharmInsert = db.prepare(`
    INSERT INTO pharmacies (id, user_id, name, city, address, phone, is_approved)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);
  for (const p of pharmacies) {
    pharmInsert.run(p.id, p.user_id, p.name, p.city, p.address, p.phone);
  }

  // Seed Medicines with batch numbers & expiry dates for testing expiry tracker
  const today = new Date();
  const dateInDays = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const medicines = [
    { id: 'med_1', pharmacy_id: 'pharm_1', name: 'Amlodipine 5mg (Amlosafe)', generic_name: 'Amlodipine Besylate', category: 'Hypertension', price: 65.0, stock_quantity: 140, batch_number: 'B24091', expiry_date: dateInDays(240), requires_prescription: 1 },
    { id: 'med_2', pharmacy_id: 'pharm_1', name: 'Metformin 500mg ER (Glycomet)', generic_name: 'Metformin HCl', category: 'Diabetes', price: 42.5, stock_quantity: 85, batch_number: 'B24018', expiry_date: dateInDays(18), requires_prescription: 1 },
    { id: 'med_3', pharmacy_id: 'pharm_1', name: 'Atorvastatin 10mg (Lipivas)', generic_name: 'Atorvastatin Calcium', category: 'Cholesterol', price: 110.0, stock_quantity: 12, batch_number: 'B24045', expiry_date: dateInDays(45), requires_prescription: 1 },
    { id: 'med_4', pharmacy_id: 'pharm_1', name: 'Telmisartan 40mg (Telma)', generic_name: 'Telmisartan', category: 'Cardiovascular', price: 98.0, stock_quantity: 70, batch_number: 'B24075', expiry_date: dateInDays(75), requires_prescription: 1 },
    { id: 'med_5', pharmacy_id: 'pharm_2', name: 'Pantoprazole 40mg (Pan40)', generic_name: 'Pantoprazole Sodium', category: 'Gastroenterology', price: 88.0, stock_quantity: 200, batch_number: 'B24360', expiry_date: dateInDays(365), requires_prescription: 0 },
    { id: 'med_6', pharmacy_id: 'pharm_2', name: 'Paracetamol 650mg (Dolo 650)', generic_name: 'Paracetamol', category: 'Analgesic', price: 32.0, stock_quantity: 500, batch_number: 'B24400', expiry_date: dateInDays(400), requires_prescription: 0 },
  ];

  const medInsert = db.prepare(`
    INSERT INTO medicines (id, pharmacy_id, name, generic_name, category, price, stock_quantity, batch_number, expiry_date, requires_prescription)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const m of medicines) {
    medInsert.run(m.id, m.pharmacy_id, m.name, m.generic_name, m.category, m.price, m.stock_quantity, m.batch_number, m.expiry_date, m.requires_prescription);
  }

  // Seed Drivers
  db.prepare(`
    INSERT INTO drivers (id, user_id, vehicle_number, vehicle_model, current_lat, current_lng, is_available, is_verified)
    VALUES ('drv_1', 'usr_drv_1', 'UP 32 EV 9876', 'Tata Tigor EV CareCab', 26.8467, 80.9462, 1, 1)
  `).run();

  // Seed Appointments
  const appointments = [
    { id: 'apt_101', patient_id: 'usr_pat_1', relative_id: 'usr_rel_1', doctor_id: 'doc_1', hospital_id: 'hosp_1', appointment_date: dateInDays(2), time_slot: '11:00 AM', status: 'Upcoming', notes: 'Quarterly cardiac review for father', needs_pickup: 1 },
    { id: 'apt_102', patient_id: 'usr_pat_1', relative_id: 'usr_rel_1', doctor_id: 'doc_2', hospital_id: 'hosp_1', appointment_date: dateInDays(-5), time_slot: '02:00 PM', status: 'Completed', notes: 'Knee X-ray consultation', needs_pickup: 0 },
  ];

  const aptInsert = db.prepare(`
    INSERT INTO appointments (id, patient_id, relative_id, doctor_id, hospital_id, appointment_date, time_slot, status, notes, needs_pickup)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of appointments) {
    aptInsert.run(a.id, a.patient_id, a.relative_id, a.doctor_id, a.hospital_id, a.appointment_date, a.time_slot, a.status, a.notes, a.needs_pickup);
  }

  // Seed Trips
  db.prepare(`
    INSERT INTO trips (id, patient_id, relative_id, driver_id, appointment_id, pickup_address, drop_address, status, driver_lat, driver_lng, scheduled_time)
    VALUES ('trip_201', 'usr_pat_1', 'usr_rel_1', 'drv_1', 'apt_101', '12/45 Gomti Nagar, Lucknow', 'KG Hospital, Chowk, Lucknow', 'In Transit', 26.8500, 80.9500, 'Today 10:15 AM')
  `).run();

  // Seed Prescriptions
  db.prepare(`
    INSERT INTO prescriptions (id, patient_id, doctor_id, hospital_id, diagnosis, medicines_json)
    VALUES ('rx_301', 'usr_pat_1', 'doc_1', 'hosp_1', 'Hypertension & Mild Angina', '[{"name":"Amlodipine 5mg","dosage":"1 tablet daily after breakfast"},{"name":"Telmisartan 40mg","dosage":"1 tablet bedtime"}]')
  `).run();

  // Seed Emergency SOS Alert
  db.prepare(`
    INSERT INTO sos_alerts (id, patient_id, patient_name, location_address, lat, lng, status)
    VALUES ('sos_401', 'usr_pat_1', 'Ramesh Sharma', '12/45 Gomti Nagar, Lucknow', 26.8467, 80.9462, 'Active')
  `).run();

  logger.info('✅ Database seeded successfully with demo dataset!');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Failed to seed database:', err);
      process.exit(1);
    });
}
