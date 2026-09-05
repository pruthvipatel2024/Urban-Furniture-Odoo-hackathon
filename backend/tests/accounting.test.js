const request = require('supertest');
const app = require('../src/app');
const { sequelize, ChartOfAccount, Journal } = require('../src/models');
const { seedDatabase } = require('../src/utils/seedData');

let adminToken = '';
let cashAccount;
let capitalAccount;
let cashJournal;

beforeAll(async () => {
  await seedDatabase();

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@urbanfurniture.com',
      password: 'admin123',
    });
  adminToken = loginRes.body.data.token;

  cashAccount = await ChartOfAccount.findOne({ where: { account_name: 'Cash' } });
  capitalAccount = await ChartOfAccount.findOne({ where: { account_name: 'Owner Capital' } });
  cashJournal = await Journal.findOne({ where: { type: 'cash' } });
});

afterAll(async () => {
  await sequelize.close();
});

describe('2. Double-Entry Accounting Engine Test Suite', () => {
  test('POST /api/journals/entries - Successfully posts balanced double-entry (Dr. Cash = Cr. Capital)', async () => {
    const res = await request(app)
      .post('/api/journals/entries')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        journalId: cashJournal.id,
        reference: 'Initial Capital Infusion #1',
        items: [
          { account_id: cashAccount.id, debit: 50000, credit: 0, description: 'Cash injected' },
          { account_id: capitalAccount.id, debit: 0, credit: 50000, description: 'Owner Capital credited' },
        ],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reference).toBe('Initial Capital Infusion #1');
    expect(res.body.data.items.length).toBe(2);
  });

  test('POST /api/journals/entries - Strictly rejects unbalanced journal entry (Dr. 5000 != Cr. 4000)', async () => {
    const res = await request(app)
      .post('/api/journals/entries')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        journalId: cashJournal.id,
        reference: 'Unbalanced Fraud Test',
        items: [
          { account_id: cashAccount.id, debit: 5000, credit: 0 },
          { account_id: capitalAccount.id, debit: 0, credit: 4000 },
        ],
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('unbalanced');
  });

  test('GET /api/reports/trial-balance - Verifies Grand Total Debits === Grand Total Credits', async () => {
    const res = await request(app)
      .get('/api/reports/trial-balance')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isBalanced).toBe(true);
    expect(res.body.data.grandTotalDebit).toBe(res.body.data.grandTotalCredit);
  });
});
