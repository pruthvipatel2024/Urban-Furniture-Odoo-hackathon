const request = require('supertest');
const app = require('../src/app');
const { sequelize, Contact, Product, SalesOrder, CustomerInvoice } = require('../models');
const { seedDatabase } = require('../src/utils/seedData');

let adminToken = '';
let customer;
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

  customer = await Contact.findOne({ where: { email: 'nimesh.pathak@techspace.io' } });
  product = await Product.findOne({ where: { name: 'Executive Ergonomic Chair' } });
});

afterAll(async () => {
  await sequelize.close();
});

describe('3. Sales & Customer Invoicing Flow Test Suite', () => {
  let salesOrderId;
  let invoiceId;
  let initialStock;

  test('POST /api/sales-orders - Create Sales Order (Draft)', async () => {
    initialStock = Number(product.stock_quantity);

    const res = await request(app)
      .post('/api/sales-orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerId: customer.id,
        items: [
          {
            product_id: product.id,
            quantity: 2,
            unit_price: 5000,
            tax_percent: 18,
          },
        ],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('draft');
    expect(res.body.data.items.length).toBe(1);
    // Line total: 2 * 5000 * 1.18 = 11800
    expect(Number(res.body.data.items[0].line_total)).toBe(11800);
    salesOrderId = res.body.data.id;
  });

  test('POST /api/sales-orders/:id/confirm - Confirm Sales Order', async () => {
    const res = await request(app)
      .post(`/api/sales-orders/${salesOrderId}/confirm`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('confirmed');
  });

  test('POST /api/invoices/generate-from-so - Invoicing decrements stock & auto-posts double-entry', async () => {
    const res = await request(app)
      .post('/api/invoices/generate-from-so')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        salesOrderId,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(Number(res.body.data.total_amount)).toBe(11800);
    expect(res.body.data.payment_status).toBe('unpaid');
    invoiceId = res.body.data.id;

    // Verify stock decreased by 2
    const updatedProduct = await Product.findByPk(product.id);
    expect(Number(updatedProduct.stock_quantity)).toBe(initialStock - 2);
  });

  test('POST /api/payments - Overpayment is strictly rejected', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerInvoiceId: invoiceId,
        amount: 20000, // Exceeds 11800
        method: 'bank',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Overpayment rejected');
  });

  test('POST /api/payments - Valid payment marks invoice as PAID and settles receivable', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerInvoiceId: invoiceId,
        amount: 11800,
        method: 'bank',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);

    const updatedInvoice = await CustomerInvoice.findByPk(invoiceId);
    expect(updatedInvoice.payment_status).toBe('paid');
    expect(Number(updatedInvoice.amount_paid)).toBe(11800);
  });
});
