const { sequelize, JournalEntry, JournalItem, Journal, ChartOfAccount, CustomerInvoice, VendorBill } = require('../models');
const { add, areEqual, toFixedNumber } = require('../utils/decimal');

class AccountingService {
  /**
   * Helper to look up or create standard system accounts by name/type
   */
  static async getAccountByName(accountName, accountType, transaction = null) {
    let account = await ChartOfAccount.findOne({
      where: { account_name: accountName, is_archived: false },
      transaction,
    });

    if (!account) {
      account = await ChartOfAccount.create({
        account_name: accountName,
        account_type: accountType,
      }, { transaction });
    }

    return account;
  }

  /**
   * Helper to look up or create standard journals by type
   */
  static async getJournalByType(journalType, defaultAccountName = null, accountType = 'asset', transaction = null) {
    let journal = await Journal.findOne({
      where: { type: journalType },
      transaction,
    });

    if (!journal) {
      let defaultAccountId = null;
      if (defaultAccountName) {
        const acc = await AccountingService.getAccountByName(defaultAccountName, accountType, transaction);
        defaultAccountId = acc.id;
      }

      const names = {
        sales: 'Sales Journal',
        purchase: 'Purchase Journal',
        bank: 'Bank Journal',
        cash: 'Cash Journal',
      };

      journal = await Journal.create({
        name: names[journalType] || `${journalType.toUpperCase()} Journal`,
        type: journalType,
        default_account_id: defaultAccountId,
      }, { transaction });
    }

    return journal;
  }

  /**
   * Core Double-Entry Creator
   * Validates:
   * 1. At least 2 lines
   * 2. Sum(Debit) === Sum(Credit) > 0
   * 3. Each line is either Debit or Credit (never both, never neither)
   */
  static async createJournalEntry({ journalId, entryDate = new Date(), reference, items, userId = null, transaction = null }) {
    if (!items || items.length < 2) {
      throw new Error('A journal entry must contain at least two line items.');
    }

    let totalDebit = 0;
    let totalCredit = 0;

    const validatedItems = items.map((item, index) => {
      const debit = toFixedNumber(item.debit || 0);
      const credit = toFixedNumber(item.credit || 0);

      if ((debit > 0 && credit > 0) || (debit === 0 && credit === 0)) {
        throw new Error(`Line ${index + 1}: Each journal item must have either Debit > 0 OR Credit > 0 (never both).`);
      }

      if (debit < 0 || credit < 0) {
        throw new Error(`Line ${index + 1}: Debits and Credits cannot be negative values.`);
      }

      if (!item.account_id) {
        throw new Error(`Line ${index + 1}: Account ID is required.`);
      }

      totalDebit = add(totalDebit, debit);
      totalCredit = add(totalCredit, credit);

      return {
        account_id: item.account_id,
        debit,
        credit,
        description: item.description || reference || null,
      };
    });

    if (!areEqual(totalDebit, totalCredit)) {
      throw new Error(
        `Journal entry is unbalanced! Total Debits (₹${totalDebit.toFixed(2)}) must strictly equal Total Credits (₹${totalCredit.toFixed(2)}). Discrepancy: ₹${Math.abs(totalDebit - totalCredit).toFixed(2)}.`
      );
    }

    if (totalDebit <= 0) {
      throw new Error('Total entry value must be greater than zero.');
    }

    // Insert Header
    const entry = await JournalEntry.create({
      journal_id: journalId,
      entry_date: entryDate,
      reference,
      created_by: userId,
    }, { transaction });

    // Insert Line Items
    const itemsToCreate = validatedItems.map(item => ({
      ...item,
      journal_entry_id: entry.id,
    }));

    await JournalItem.bulkCreate(itemsToCreate, { transaction });

    return entry;
  }

  /**
   * Automatically post double-entry for Customer Invoice:
   * Dr. Debtors (Asset)  ₹Total
   *   Cr. Sale Income (Income)  ₹Total
   */
  static async postCustomerInvoice({ invoiceId, userId = null, transaction = null }) {
    const invoice = await CustomerInvoice.findByPk(invoiceId, { transaction });
    if (!invoice) {
      throw new Error(`Customer Invoice #${invoiceId} not found.`);
    }

    const totalAmt = Number(invoice.total_amount);
    if (totalAmt <= 0) return null;

    const salesJournal = await AccountingService.getJournalByType('sales', 'Sale Income', 'income', transaction);
    const debtorsAccount = await AccountingService.getAccountByName('Debtors', 'asset', transaction);
    const saleIncomeAccount = await AccountingService.getAccountByName('Sale Income', 'income', transaction);

    const ref = `CustomerInvoice#${invoice.id}`;

    // Prevent duplicate posting
    const existing = await JournalEntry.findOne({
      where: { reference: ref },
      transaction,
    });
    if (existing) return existing;

    const entry = await AccountingService.createJournalEntry({
      journalId: salesJournal.id,
      entryDate: invoice.invoice_date || new Date(),
      reference: ref,
      userId,
      items: [
        {
          account_id: debtorsAccount.id,
          debit: totalAmt,
          credit: 0,
          description: `Receivable from Customer #${invoice.customer_id} (Invoice #${invoice.id})`,
        },
        {
          account_id: saleIncomeAccount.id,
          debit: 0,
          credit: totalAmt,
          description: `Revenue for Invoice #${invoice.id}`,
        },
      ],
      transaction,
    });

    return entry;
  }

  /**
   * Automatically post double-entry for Vendor Bill:
   * Dr. Purchase Expense (Expense)  ₹Total
   *   Cr. Creditors (Liability)       ₹Total
   */
  static async postVendorBill({ billId, userId = null, transaction = null }) {
    const bill = await VendorBill.findByPk(billId, { transaction });
    if (!bill) {
      throw new Error(`Vendor Bill #${billId} not found.`);
    }

    const totalAmt = Number(bill.total_amount);
    if (totalAmt <= 0) return null;

    const purchaseJournal = await AccountingService.getJournalByType('purchase', 'Purchase Expense', 'expense', transaction);
    const purchaseExpenseAccount = await AccountingService.getAccountByName('Purchase Expense', 'expense', transaction);
    const creditorsAccount = await AccountingService.getAccountByName('Creditors', 'liability', transaction);

    const ref = `VendorBill#${bill.id}`;

    // Prevent duplicate posting
    const existing = await JournalEntry.findOne({
      where: { reference: ref },
      transaction,
    });
    if (existing) return existing;

    const entry = await AccountingService.createJournalEntry({
      journalId: purchaseJournal.id,
      entryDate: bill.invoice_date || new Date(),
      reference: ref,
      userId,
      items: [
        {
          account_id: purchaseExpenseAccount.id,
          debit: totalAmt,
          credit: 0,
          description: `Procurement expense for Bill #${bill.id} from Vendor #${bill.vendor_id}`,
        },
        {
          account_id: creditorsAccount.id,
          debit: 0,
          credit: totalAmt,
          description: `Payable to Vendor #${bill.vendor_id} (Bill #${bill.id})`,
        },
      ],
      transaction,
    });

    return entry;
  }

  /**
   * Automatically post double-entry for Payments:
   * Customer Receipt:
   *   Dr. Bank/Cash (Asset)    ₹Amount
   *     Cr. Debtors (Asset)      ₹Amount
   *
   * Vendor Payout:
   *   Dr. Creditors (Liability) ₹Amount
   *     Cr. Bank/Cash (Asset)    ₹Amount
   */
  static async postPayment({ payment, userId = null, transaction = null }) {
    const amount = Number(payment.amount);
    if (amount <= 0) return null;

    const isBank = payment.method === 'bank';
    const journalType = isBank ? 'bank' : 'cash';
    const cashOrBankAccountName = isBank ? 'Bank' : 'Cash';

    const journal = await AccountingService.getJournalByType(journalType, cashOrBankAccountName, 'asset', transaction);
    const liquidityAccount = await AccountingService.getAccountByName(cashOrBankAccountName, 'asset', transaction);

    if (payment.customer_invoice_id) {
      // Customer Receipt
      const debtorsAccount = await AccountingService.getAccountByName('Debtors', 'asset', transaction);
      const ref = `Payment#${payment.id} (CustomerInvoice#${payment.customer_invoice_id})`;

      return AccountingService.createJournalEntry({
        journalId: journal.id,
        entryDate: payment.payment_date || new Date(),
        reference: ref,
        userId: userId || payment.created_by,
        items: [
          {
            account_id: liquidityAccount.id,
            debit: amount,
            credit: 0,
            description: `Payment received via ${payment.method.toUpperCase()} for Invoice #${payment.customer_invoice_id}`,
          },
          {
            account_id: debtorsAccount.id,
            debit: 0,
            credit: amount,
            description: `Settlement of Debtors for Invoice #${payment.customer_invoice_id}`,
          },
        ],
        transaction,
      });
    }

    if (payment.vendor_bill_id) {
      // Vendor Payout
      const creditorsAccount = await AccountingService.getAccountByName('Creditors', 'liability', transaction);
      const ref = `Payment#${payment.id} (VendorBill#${payment.vendor_bill_id})`;

      return AccountingService.createJournalEntry({
        journalId: journal.id,
        entryDate: payment.payment_date || new Date(),
        reference: ref,
        userId: userId || payment.created_by,
        items: [
          {
            account_id: creditorsAccount.id,
            debit: amount,
            credit: 0,
            description: `Settlement of Creditors for Bill #${payment.vendor_bill_id}`,
          },
          {
            account_id: liquidityAccount.id,
            debit: 0,
            credit: amount,
            description: `Payment disbursed via ${payment.method.toUpperCase()} for Bill #${payment.vendor_bill_id}`,
          },
        ],
        transaction,
      });
    }

    throw new Error('Payment must be linked to either a customer invoice or a vendor bill.');
  }
}

module.exports = AccountingService;
