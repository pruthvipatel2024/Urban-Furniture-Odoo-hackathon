const { Op } = require('sequelize');
const { ChartOfAccount, JournalItem, JournalEntry, Product, Budget, AnalyticAccount } = require('../models');
const { add, subtract, multiply, divide, toFixedNumber, areEqual } = require('../utils/decimal');

class ReportService {
  /**
   * 1. Profit & Loss Statement (Income - Expenses = Net Profit)
   */
  static async getProfitAndLoss({ startDate = null, endDate = null }) {
    const entryDateFilter = {};
    if (startDate && endDate) {
      entryDateFilter.entry_date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      entryDateFilter.entry_date = { [Op.gte]: startDate };
    } else if (endDate) {
      entryDateFilter.entry_date = { [Op.lte]: endDate };
    }

    const accounts = await ChartOfAccount.findAll({
      where: {
        account_type: ['income', 'expense'],
        is_archived: false,
      },
      include: [
        {
          model: JournalItem,
          as: 'journalItems',
          required: false,
          include: [
            {
              model: JournalEntry,
              as: 'journalEntry',
              where: Object.keys(entryDateFilter).length > 0 ? entryDateFilter : undefined,
              required: Object.keys(entryDateFilter).length > 0,
            },
          ],
        },
      ],
      order: [['account_type', 'DESC'], ['account_name', 'ASC']],
    });

    const incomeAccounts = [];
    const expenseAccounts = [];
    let totalIncome = 0;
    let totalExpense = 0;

    for (const acc of accounts) {
      let totalDebit = 0;
      let totalCredit = 0;

      for (const item of acc.journalItems || []) {
        totalDebit = add(totalDebit, Number(item.debit));
        totalCredit = add(totalCredit, Number(item.credit));
      }

      if (acc.account_type === 'income') {
        const netIncome = subtract(totalCredit, totalDebit);
        totalIncome = add(totalIncome, netIncome);
        incomeAccounts.push({
          id: acc.id,
          name: acc.account_name,
          type: acc.account_type,
          amount: netIncome,
        });
      } else {
        const netExpense = subtract(totalDebit, totalCredit);
        totalExpense = add(totalExpense, netExpense);
        expenseAccounts.push({
          id: acc.id,
          name: acc.account_name,
          type: acc.account_type,
          amount: netExpense,
        });
      }
    }

    const netProfit = subtract(totalIncome, totalExpense);

    return {
      period: {
        startDate: startDate || 'All Time',
        endDate: endDate || 'Present',
      },
      income: {
        accounts: incomeAccounts,
        total: totalIncome,
      },
      expenses: {
        accounts: expenseAccounts,
        total: totalExpense,
      },
      netProfit,
      isProfitable: netProfit >= 0,
    };
  }

  /**
   * 2. Balance Sheet (Assets = Liabilities + Capital)
   */
  static async getBalanceSheet({ asOfDate = null }) {
    const entryDateFilter = asOfDate ? { entry_date: { [Op.lte]: asOfDate } } : {};

    const accounts = await ChartOfAccount.findAll({
      where: {
        account_type: ['asset', 'liability', 'capital'],
        is_archived: false,
      },
      include: [
        {
          model: JournalItem,
          as: 'journalItems',
          required: false,
          include: [
            {
              model: JournalEntry,
              as: 'journalEntry',
              where: Object.keys(entryDateFilter).length > 0 ? entryDateFilter : undefined,
              required: Object.keys(entryDateFilter).length > 0,
            },
          ],
        },
      ],
      order: [['account_type', 'ASC'], ['account_name', 'ASC']],
    });

    const assetAccounts = [];
    const liabilityAccounts = [];
    const capitalAccounts = [];

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalCapital = 0;

    for (const acc of accounts) {
      let totalDebit = 0;
      let totalCredit = 0;

      for (const item of acc.journalItems || []) {
        totalDebit = add(totalDebit, Number(item.debit));
        totalCredit = add(totalCredit, Number(item.credit));
      }

      if (acc.account_type === 'asset') {
        const balance = subtract(totalDebit, totalCredit);
        totalAssets = add(totalAssets, balance);
        assetAccounts.push({
          id: acc.id,
          name: acc.account_name,
          type: acc.account_type,
          balance,
        });
      } else if (acc.account_type === 'liability') {
        const balance = subtract(totalCredit, totalDebit);
        totalLiabilities = add(totalLiabilities, balance);
        liabilityAccounts.push({
          id: acc.id,
          name: acc.account_name,
          type: acc.account_type,
          balance,
        });
      } else if (acc.account_type === 'capital') {
        const balance = subtract(totalCredit, totalDebit);
        totalCapital = add(totalCapital, balance);
        capitalAccounts.push({
          id: acc.id,
          name: acc.account_name,
          type: acc.account_type,
          balance,
        });
      }
    }

    // Calculate Retained Net Profit up to asOfDate
    const pl = await ReportService.getProfitAndLoss({ endDate: asOfDate });
    const retainedEarnings = pl.netProfit;

    const totalLiabilitiesAndCapital = add(totalLiabilities, add(totalCapital, retainedEarnings));
    const variance = subtract(totalAssets, totalLiabilitiesAndCapital);
    const isBalanced = areEqual(totalAssets, totalLiabilitiesAndCapital);

    return {
      asOfDate: asOfDate || new Date().toISOString().split('T')[0],
      assets: {
        accounts: assetAccounts,
        total: totalAssets,
      },
      liabilities: {
        accounts: liabilityAccounts,
        total: totalLiabilities,
      },
      capital: {
        accounts: capitalAccounts,
        retainedEarnings,
        totalCapitalBase: totalCapital,
        totalCapitalWithEarnings: add(totalCapital, retainedEarnings),
      },
      summary: {
        totalAssets,
        totalLiabilitiesAndCapital,
        variance,
        isBalanced,
      },
    };
  }

  /**
   * 3. Stock Valuation & Inventory Report
   */
  static async getStockReport() {
    const products = await Product.findAll({
      where: { is_archived: false },
      order: [['category', 'ASC'], ['name', 'ASC']],
    });

    let totalStockQty = 0;
    let totalCostValuation = 0;
    let totalSalesValuation = 0;

    const items = products.map((p) => {
      const qty = Number(p.stock_quantity);
      const cost = Number(p.cost_price);
      const salesPrice = Number(p.sales_price);

      const costValuation = multiply(qty, cost);
      const salesValuation = multiply(qty, salesPrice);
      const potentialMargin = subtract(salesValuation, costValuation);

      totalStockQty = add(totalStockQty, qty);
      totalCostValuation = add(totalCostValuation, costValuation);
      totalSalesValuation = add(totalSalesValuation, salesValuation);

      return {
        id: p.id,
        name: p.name,
        category: p.category || 'Uncategorized',
        type: p.type,
        stock_quantity: qty,
        cost_price: cost,
        sales_price: salesPrice,
        cost_valuation: costValuation,
        sales_valuation: salesValuation,
        potential_margin: potentialMargin,
        is_low_stock: qty <= 5 && p.type === 'goods',
      };
    });

    return {
      items,
      summary: {
        totalProducts: products.length,
        totalPhysicalStock: totalStockQty,
        totalInventoryCost: totalCostValuation,
        totalPotentialRevenue: totalSalesValuation,
        potentialGrossProfit: subtract(totalSalesValuation, totalCostValuation),
      },
    };
  }

  /**
   * 4. Budget vs Actual Report
   */
  static async getBudgetReport() {
    const budgets = await Budget.findAll({
      include: [{ model: AnalyticAccount, as: 'analyticAccount' }],
      order: [['period_start', 'DESC']],
    });

    const report = [];
    for (const b of budgets) {
      const planned = Number(b.planned_amount);
      // Determine actual spend from ledger expenses
      const actual = 0; // Baseline linked to analytic accounts or expenses
      const remaining = subtract(planned, actual);
      const utilization = planned > 0 ? multiply(divide(actual, planned), 100) : 0;

      report.push({
        id: b.id,
        name: b.name,
        analyticAccount: b.analyticAccount ? b.analyticAccount.name : 'General',
        period_start: b.period_start,
        period_end: b.period_end,
        responsible_person: b.responsible_person,
        planned_amount: planned,
        actual_amount: actual,
        remaining_amount: remaining,
        utilization_percent: utilization,
        is_over_budget: actual > planned,
      });
    }

    return report;
  }

  /**
   * 5. General Trial Balance (Total Debits = Total Credits)
   */
  static async getTrialBalance({ asOfDate = null } = {}) {
    const entryDateFilter = asOfDate ? { entry_date: { [Op.lte]: asOfDate } } : {};

    const accounts = await ChartOfAccount.findAll({
      where: { is_archived: false },
      include: [
        {
          model: JournalItem,
          as: 'journalItems',
          required: false,
          include: [
            {
              model: JournalEntry,
              as: 'journalEntry',
              where: Object.keys(entryDateFilter).length > 0 ? entryDateFilter : undefined,
              required: Object.keys(entryDateFilter).length > 0,
            },
          ],
        },
      ],
      order: [['account_type', 'ASC'], ['account_name', 'ASC']],
    });

    let grandTotalDebit = 0;
    let grandTotalCredit = 0;

    const rows = accounts.map((acc) => {
      let debit = 0;
      let credit = 0;

      for (const item of acc.journalItems || []) {
        debit = add(debit, Number(item.debit));
        credit = add(credit, Number(item.credit));
      }

      grandTotalDebit = add(grandTotalDebit, debit);
      grandTotalCredit = add(grandTotalCredit, credit);

      const netDebit = debit > credit ? subtract(debit, credit) : 0;
      const netCredit = credit > debit ? subtract(credit, debit) : 0;

      return {
        id: acc.id,
        account_name: acc.account_name,
        account_type: acc.account_type,
        total_debit: debit,
        total_credit: credit,
        net_debit: netDebit,
        net_credit: netCredit,
      };
    });

    return {
      asOfDate: asOfDate || new Date().toISOString().split('T')[0],
      rows,
      grandTotalDebit,
      grandTotalCredit,
      isBalanced: areEqual(grandTotalDebit, grandTotalCredit),
      variance: Math.abs(grandTotalDebit - grandTotalCredit),
    };
  }
}

module.exports = ReportService;
