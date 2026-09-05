const { sequelize, Payment, CustomerInvoice, VendorBill, Contact } = require('../models');
const { add, subtract, toFixedNumber } = require('../utils/decimal');
const AccountingService = require('./accounting.service');

class PaymentService {
  /**
   * Process Customer or Vendor Payment with Overpayment Protection & Atomic Journal Entry
   */
  static async recordPayment({
    paymentDate = new Date(),
    amount,
    method, // 'cash' | 'bank'
    vendorBillId = null,
    customerInvoiceId = null,
    notes = null,
    userId = null,
  }) {
    const payAmount = toFixedNumber(amount);
    if (!payAmount || payAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    if (!['cash', 'bank'].includes(method)) {
      throw new Error('Payment method must be either "cash" or "bank".');
    }

    if ((vendorBillId && customerInvoiceId) || (!vendorBillId && !customerInvoiceId)) {
      throw new Error('Payment must be linked to either a Vendor Bill OR a Customer Invoice (not both, not neither).');
    }

    return sequelize.transaction(async (t) => {
      let linkedDoc;

      // 1. Customer Invoice Payment (Inflow)
      if (customerInvoiceId) {
        const invoice = await CustomerInvoice.findByPk(customerInvoiceId, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!invoice) {
          throw new Error(`Customer Invoice #${customerInvoiceId} not found.`);
        }

        const total = Number(invoice.total_amount);
        const paid = Number(invoice.amount_paid);
        const remaining = subtract(total, paid);

        if (remaining <= 0) {
          throw new Error(`Invoice #${customerInvoiceId} is already fully paid.`);
        }

        if (payAmount > remaining + 0.005) {
          throw new Error(
            `Overpayment rejected! Payment of ₹${payAmount.toFixed(2)} exceeds remaining balance of ₹${remaining.toFixed(2)} on Invoice #${customerInvoiceId}.`
          );
        }

        const newPaid = add(paid, payAmount);
        invoice.amount_paid = newPaid;
        invoice.payment_status = newPaid >= total - 0.005 ? 'paid' : 'partially_paid';
        await invoice.save({ transaction: t });

        linkedDoc = invoice;
      }

      // 2. Vendor Bill Payment (Outflow)
      if (vendorBillId) {
        const bill = await VendorBill.findByPk(vendorBillId, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!bill) {
          throw new Error(`Vendor Bill #${vendorBillId} not found.`);
        }

        const total = Number(bill.total_amount);
        const paid = Number(bill.amount_paid);
        const remaining = subtract(total, paid);

        if (remaining <= 0) {
          throw new Error(`Vendor Bill #${vendorBillId} is already fully paid.`);
        }

        if (payAmount > remaining + 0.005) {
          throw new Error(
            `Overpayment rejected! Payment of ₹${payAmount.toFixed(2)} exceeds remaining balance of ₹${remaining.toFixed(2)} on Bill #${vendorBillId}.`
          );
        }

        const newPaid = add(paid, payAmount);
        bill.amount_paid = newPaid;
        bill.payment_status = newPaid >= total - 0.005 ? 'paid' : 'partially_paid';
        await bill.save({ transaction: t });

        linkedDoc = bill;
      }

      // 3. Create Payment Record
      const payment = await Payment.create({
        payment_date: paymentDate,
        amount: payAmount,
        method,
        vendor_bill_id: vendorBillId,
        customer_invoice_id: customerInvoiceId,
        notes,
        created_by: userId,
      }, { transaction: t });

      // 4. Post Balanced Double-Entry into General Ledger
      await AccountingService.postPayment({
        payment,
        userId,
        transaction: t,
      });

      return Payment.findByPk(payment.id, {
        include: [
          { model: CustomerInvoice, as: 'customerInvoice', include: [{ model: Contact, as: 'customer' }] },
          { model: VendorBill, as: 'vendorBill', include: [{ model: Contact, as: 'vendor' }] },
        ],
        transaction: t,
      });
    });
  }
}

module.exports = PaymentService;
