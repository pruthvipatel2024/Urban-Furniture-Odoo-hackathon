const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');
const { seedDatabase } = require('../src/utils/seedData');

let adminToken = '';

beforeAll(async () => {
  await seedDatabase();

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@urbanfurniture.com',
      password: 'admin123',
    });
  adminToken = loginRes.body.data.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('5. Financial Reports & Dashboard Test Suite', () => {
  test('GET /api/reports/profit-loss - Generates P&L statement', async () => {
    const res = await request(app)
      .get('/api/reports/profit-loss')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.income).toBeDefined();
    expect(res.body.data.expenses).toBeDefined();
    expect(res.body.data.netProfit).toBeDefined();
  });

  test('GET /api/reports/balance-sheet - Validates Golden Accounting Equation (Assets = Liabilities + Capital)', async () => {
    const res = await request(app)
      .get('/api/reports/balance-sheet')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.isBalanced).toBe(true);
    expect(res.body.data.summary.variance).toBe(0);
  });

  test('GET /api/reports/stock - Generates Real-Time Inventory Valuation', async () => {
    const res = await request(app)
      .get('/api/reports/stock')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.totalProducts).toBeGreaterThan(0);
    expect(res.body.data.summary.totalInventoryCost).toBeGreaterThanOrEqual(0);
  });

  test('GET /api/dashboard/summary - Dynamic Dashboard KPIs without mock data', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.kpi.totalRevenue).toBeDefined();
    expect(res.body.data.kpi.outstandingReceivables).toBeDefined();
    expect(res.body.data.kpi.outstandingPayables).toBeDefined();
    expect(res.body.data.kpi.inventoryValuation).toBeDefined();
  });
});
