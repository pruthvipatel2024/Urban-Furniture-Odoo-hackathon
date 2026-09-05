const request = require('supertest');
const app = require('../src/app');
const { sequelize, Contact, Product, PurchaseOrder, VendorBill } = require('../models');
const { seedDatabase } = require('../src/utils/seedData');

let adminToken = '';
let vendor;
let product;

beforeAll(async () => {
  await seedDatabase();

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@urbanfurniture.com',
      password: 'admin123',
    });
  adminToken = loginRes.body.data.token;

  vendor = await Contact.findOne({ where: { email: 'rahul.sharma@azurefurniture.in' } });
  product = await Product.findOne({ where: { name: 'Solid Teak Work Desk (160x80)' } });
});

afterAll(async () => {
  await sequelize.close();
});

describe('4. Purchase & Vendor Billing Flow Test Suite', () => {
  let purchaseOrderId;
  let billId;
  let initialStock;

  test('POST /api/purchase-orders - Create Purchase Order (Draft)', async () => {
    initialStock = Number(product.stock_quantity);

    const res = await request(app)
      .post('/api/purchase-orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        vendorId: vendor.id,
        items: [
          {
            product_id: product.id,
            quantity: 5,
            unit_price: 11000,
          },
        ],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('draft');
    expect(Number(res.body.data.items[0].line_total)).toBe(55000);
    purchaseOrderId = res.body.data.id;
  });

  test('POST /api/bills/generate-from-po - Convert PO to Bill, receives goods (+Stock) & posts double-entry', async () => {
    const res = await request(app)
      .post('/api/bills/generate-from-po')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        purchaseOrderId,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(Number(res.body.data.total_amount)).toBe(55000);
    expect(res.body.data.payment_status).toBe('unpaid');
    billId = res.body.data.id;

    // Verify stock incremented by +5
    const updatedProduct = await Product.findByPk(product.id);
    expect(Number(updatedProduct.stock_quantity)).toBe(initialStock + 5);
  });

  test('POST /api/payments - Disburse vendor payment to settle payable', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        vendorBillId: billId,
        amount: 55000,
        method: 'bank',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    const updatedBill = await VendorBill.findByPk(billId);
    expect(updatedBill.payment_status).toBe('paid');
    expect(Number(updatedBill.amount_paid)).toBe(55000);
  });
});
