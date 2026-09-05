const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');
const { seedDatabase } = require('../src/utils/seedData');

beforeAll(async () => {
  await seedDatabase();
});

afterAll(async () => {
  await sequelize.close();
});

describe('1. Authentication & RBAC Test Suite', () => {
  let adminToken = '';
  let contactToken = '';

  test('POST /api/auth/login - Admin Login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@urbanfurniture.com',
        password: 'admin123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('admin');
    adminToken = res.body.data.token;
  });

  test('POST /api/auth/login - Rejects invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@urbanfurniture.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - Retrieves current user profile with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('admin@urbanfurniture.com');
  });

  test('GET /api/users - Admin role can access users list', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.users)).toBe(true);
  });

  test('GET /api/users - Contact role is forbidden (RBAC)', async () => {
    // Login as contact
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nimesh.pathak@techspace.io',
        password: 'contact123',
      });

    contactToken = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${contactToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
