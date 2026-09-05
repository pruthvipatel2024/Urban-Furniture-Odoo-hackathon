const { CustomerInvoice, VendorBill, Payment, Product, Contact, JournalEntry } = require('../models');
const { add, subtract } = require('../utils/decimal');
const ReportService = require('./report.service');

class DashboardService {
  /**
   * Executive Dashboard Summary - 100% dynamic from MySQL
   */
  static async getSummary() {
    // 1. Invoices Aggregates
    const invoices = await CustomerInvoice.findAll();
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalReceivable = 0;

    for (const inv of invoices) {
      const tot = Number(inv.total_amount);
      const pd = Number(inv.amount_paid);
      totalInvoiced = add(totalInvoiced, tot);
      totalCollected = add(totalCollected, pd);
      totalReceivable = add(totalReceivable, subtract(tot, pd));
    }

    // 2. Vendor Bills Aggregates
    const bills = await VendorBill.findAll();
    let totalBilled = 0;
    let totalDisbursed = 0;
    let totalPayable = 0;

    for (const b of bills) {
      const tot = Number(b.total_amount);
      const pd = Number(b.amount_paid);
      totalBilled = add(totalBilled, tot);
      totalDisbursed = add(totalDisbursed, pd);
      totalPayable = add(totalPayable, subtract(tot, pd));
    }

    // 3. Profit & Loss Metrics
    const pl = await ReportService.getProfitAndLoss({});
    const netProfit = pl.netProfit;

    // 4. Products & Stock Metrics
    const stockReport = await ReportService.getStockReport();
    const inventoryValuation = stockReport.summary.totalInventoryCost;
    const lowStockCount = stockReport.items.filter(i => i.is_low_stock).length;

    // 5. Total Active Contacts
    const totalCustomers = await Contact.count({ where: { type: ['customer', 'both'], is_archived: false } });
    const totalVendors = await Contact.count({ where: { type: ['vendor', 'both'], is_archived: false } });

    // 6. Cash and Bank Balances from Ledger
    const bs = await ReportService.getBalanceSheet({});
    let cashBalance = 0;
    let bankBalance = 0;
    for (const a of bs.assets?.accounts || []) {
      const lower = (a.name || '').toLowerCase();
      if (lower === 'cash' || lower.includes('cash on hand') || lower.includes('petty cash')) {
        cashBalance = add(cashBalance, Number(a.balance || 0));
      } else if (lower === 'bank' || lower.includes('bank account') || lower.includes('hdfc') || lower.includes('sbi')) {
        bankBalance = add(bankBalance, Number(a.balance || 0));
      }
    }

    // 7. Total Posted Journal Entries
    const postedEntriesCount = await JournalEntry.count();

    // 8. Recent Payments
    const recentPayments = await Payment.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: CustomerInvoice, as: 'customerInvoice', include: [{ model: Contact, as: 'customer' }] },
        { model: VendorBill, as: 'vendorBill', include: [{ model: Contact, as: 'vendor' }] },
      ],
    });

    // 9. Recent Invoices
    const recentInvoices = await CustomerInvoice.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: Contact, as: 'customer' }],
    });

    // 10. Recent Journal Entries
    const recentJournals = await JournalEntry.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
    });

    return {
      kpi: {
        totalRevenue: totalInvoiced,
        totalPurchases: totalBilled,
        netProfit,
        profitMargin: totalInvoiced > 0 ? ((netProfit / totalInvoiced) * 100).toFixed(1) : 0,
        outstandingReceivables: totalReceivable,
        outstandingPayables: totalPayable,
        inventoryValuation,
        totalCustomers,
        totalVendors,
        lowStockAlerts: lowStockCount,
        cashBalance,
        bankBalance,
        liquidFunds: add(cashBalance, bankBalance),
        postedEntriesCount,
      },
      recentInvoices,
      recentPayments,
      recentJournals,
    };
  }
}

module.exports = DashboardService;
