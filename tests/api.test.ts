import request from 'supertest';
import app from '../src/app';
import { initDb } from '../src/config/db';
import { seed } from '../src/seed/seedData';

beforeAll(async () => {
  initDb();
  await seed();
});

describe('CareLink Backend REST API Suite', () => {
  it('GET /api/v1/health should return 200 OK and system status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
    expect(res.body.system).toContain('CareLink');
  });

  it('POST /api/v1/auth/login should authenticate seeded user and return JWT', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'arjun@carelink.health',
      password: 'CareLink#2026',
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toEqual('relative');
  });

  it('GET /api/v1/appointments/hospitals should return partner hospitals', async () => {
    const res = await request(app).get('/api/v1/appointments/hospitals');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('GET /api/v1/medicines should search medicine inventory', async () => {
    const res = await request(app).get('/api/v1/medicines?search=Amlodipine');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].name).toContain('Amlodipine');
  });
});
