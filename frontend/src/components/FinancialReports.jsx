import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Scale,
  TrendingUp,
  PieChart,
  Package,
  Calendar,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  DollarSign
} from 'lucide-react';

export default function FinancialReports() {
  const {
    balanceSheetData,
    pnlData,
    budgetReportData,
    stockReportData,
    chartOfAccounts,
    formatCurrency
  } = useAccounting();

  const [activeReport, setActiveReport] = useState('balance-sheet'); // 'balance-sheet' | 'pnl' | 'budget' | 'stock' | 'trial-balance'
  const [asOfDate, setAsOfDate] = useState('2026-09-05');

  // Trial Balance Grand Totals
  const totalTrialDebits = chartOfAccounts.reduce((sum, acc) => {
    const isDebit = acc.type === 'Asset' || acc.type === 'Expense';
    return sum + (isDebit ? Math.max(0, acc.balance) : 0);
  }, 0);

  const totalTrialCredits = chartOfAccounts.reduce((sum, acc) => {
    const isCredit = acc.type === 'Liability' || acc.type === 'Capital' || acc.type === 'Income';
    return sum + (isCredit ? Math.max(0, acc.balance) : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Official Company Statement Header (with Logo) */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-teak-500/30">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center border border-teak-500/40 shadow-lg shrink-0">
            <img src="/logo.png" alt="Urban Furniture Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-100 font-display">Urban Furniture Ltd. — Financial Statements</h2>
            <p className="text-xs text-slate-400">Official GAAP/Double-Entry Statutory Financial Reports • FY 2026-2027</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-teak-300 bg-teak-950/60 px-3 py-1 rounded-xl border border-teak-700/50">
            Audit Status: Live Verified
          </span>
        </div>
      </div>

      {/* Top Filter & Report Switcher */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveReport('balance-sheet')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeReport === 'balance-sheet'
                ? 'bg-gradient-to-r from-teak-600 to-teak-500 text-white shadow-lg shadow-teak-600/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-navy-900'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Balance Sheet</span>
          </button>

          <button
            onClick={() => setActiveReport('pnl')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeReport === 'pnl'
                ? 'bg-gradient-to-r from-teak-600 to-teak-500 text-white shadow-lg shadow-teak-600/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-navy-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Profit & Loss (P&L)</span>
          </button>

          <button
            onClick={() => setActiveReport('budget')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeReport === 'budget'
                ? 'bg-gradient-to-r from-teak-600 to-teak-500 text-white shadow-lg shadow-teak-600/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-navy-900'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Budget vs Actual</span>
          </button>

          <button
            onClick={() => setActiveReport('stock')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeReport === 'stock'
                ? 'bg-gradient-to-r from-teak-600 to-teak-500 text-white shadow-lg shadow-teak-600/30 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-navy-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Stock & Inventory Valuation</span>
          </button>
        </div>

        {/* Date Filter & Actions */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 bg-[#080e1e] px-3 py-1.5 rounded-xl border border-[#1e3e62]/60">
            <Calendar className="w-3.5 h-3.5 text-teak-400" />
            <span className="text-slate-400 font-medium">As of Date:</span>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="bg-transparent font-semibold text-slate-200 outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 text-slate-400 hover:text-white bg-[#080e1e] hover:bg-navy-900 border border-[#1e3e62]/60 rounded-xl transition-colors"
            title="Print Financial Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. BALANCE SHEET REPORT */}
      {/* ========================================================= */}
      {activeReport === 'balance-sheet' && (
        <div className="space-y-4">
          {/* Accounting Equation Verification Banner */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
              balanceSheetData.isBalanced
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center space-x-2 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-sm">
                  Accounting Equation Integrity: Assets = Liabilities + Capital
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Calculated directly from live double-entry journal items and ledger balances.
                </p>
              </div>
            </div>
            <div className="font-mono font-extrabold text-base bg-slate-950/80 px-4 py-1.5 rounded-xl border border-slate-800">
              {formatCurrency(balanceSheetData.totalAssets)} = {formatCurrency(balanceSheetData.totalLiabilitiesAndCapital)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ASSETS SECTION */}
            <div className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between">
              <div>
                <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-100 flex justify-between items-center">
                  <span>Current & Inventory Assets</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                    Asset Accounts
                  </span>
                </div>

                <div className="divide-y divide-slate-800/50 text-xs">
                  <div className="py-3 px-5 flex justify-between items-center">
                    <span className="font-medium text-slate-300">Cash on Hand (Petty Cash)</span>
                    <span className="font-bold text-slate-100 font-mono">{formatCurrency(balanceSheetData.cashAcc)}</span>
                  </div>
                  <div className="py-3 px-5 flex justify-between items-center">
                    <span className="font-medium text-slate-300">Bank Account (HDFC Current A/C)</span>
                    <span className="font-bold text-slate-100 font-mono">{formatCurrency(balanceSheetData.bankAcc)}</span>
                  </div>
                  <div className="py-3 px-5 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-slate-300 block">Accounts Receivable (Trade Debtors)</span>
                      <span className="text-[10px] text-slate-500">Unsettled customer invoices</span>
                    </div>
                    <span className="font-bold text-emerald-400 font-mono">{formatCurrency(balanceSheetData.debtorsAcc)}</span>
                  </div>
                  <div className="py-3 px-5 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-slate-300 block">Furniture Inventory Stock Valuation</span>
                      <span className="text-[10px] text-slate-500">Physical on-hand items @ cost</span>
                    </div>
                    <span className="font-bold text-indigo-300 font-mono">{formatCurrency(balanceSheetData.inventoryValuation)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
                <span className="font-bold text-xs text-slate-300 uppercase">Total Assets</span>
                <span className="font-extrabold text-emerald-400 text-lg font-mono">
                  {formatCurrency(balanceSheetData.totalAssets)}
                </span>
              </div>
            </div>

            {/* LIABILITIES & CAPITAL SECTION */}
            <div className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between">
              <div>
                <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-100 flex justify-between items-center">
                  <span>Liabilities & Equity Capital</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                    Liabilities + Equity
                  </span>
                </div>

                <div className="divide-y divide-slate-800/50 text-xs">
                  <div className="py-2 px-5 bg-slate-950/40 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Liabilities
                  </div>
                  <div className="py-3 px-5 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-slate-300 block">Accounts Payable (Trade Creditors)</span>
                      <span className="text-[10px] text-slate-500">Unsettled vendor bills</span>
                    </div>
                    <span className="font-bold text-amber-400 font-mono">{formatCurrency(balanceSheetData.creditorsAcc)}</span>
                  </div>
                  <div className="py-3 px-5 flex justify-between items-center">
                    <span className="font-medium text-slate-300">GST Output Tax Payable</span>
                    <span className="font-bold text-slate-100 font-mono">{formatCurrency(balanceSheetData.gstPayableAcc)}</span>
                  </div>

                  <div className="py-2 px-5 bg-slate-950/40 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Capital & Reserves
                  </div>
                  <div className="py-3 px-5 flex justify-between items-center">
                    <span className="font-medium text-slate-300">Owner's Initial Equity Capital</span>
                    <span className="font-bold text-slate-100 font-mono">{formatCurrency(balanceSheetData.ownersEquity)}</span>
                  </div>
                  <div className="py-3 px-5 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-slate-300 block">Retained Earnings (Current Period Profit)</span>
                      <span className="text-[10px] text-slate-500">Cumulative Net Profit</span>
                    </div>
                    <span className={`font-bold font-mono ${balanceSheetData.retainedEarnings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(balanceSheetData.retainedEarnings)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
                <span className="font-bold text-xs text-slate-300 uppercase">Total Liabilities & Capital</span>
                <span className="font-extrabold text-indigo-400 text-lg font-mono">
                  {formatCurrency(balanceSheetData.totalLiabilitiesAndCapital)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PROFIT & LOSS (P&L) REPORT */}
      {/* ========================================================= */}
      {activeReport === 'pnl' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-100">Profit & Loss Statement (Income Statement)</h3>
              <p className="text-xs text-slate-400">
                Operating income minus cost of goods sold and departmental operating expenses.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Net Profit Margin</span>
              <p className="text-lg font-bold font-mono text-emerald-400">{pnlData.profitMarginPercent}%</p>
            </div>
          </div>

          <div className="space-y-6 text-xs">
            {/* 1. Revenue */}
            <div className="space-y-2">
              <div className="p-2.5 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 font-bold uppercase text-[11px] flex justify-between">
                <span>1. Operating Revenue & Sales Income</span>
                <span>Amount (₹)</span>
              </div>
              <div className="space-y-2 px-4">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Gross Sales Income (Customer Invoices)</span>
                  <span className="font-bold text-slate-100 font-mono">{formatCurrency(pnlData.saleIncome)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Assembly & Delivery Services Revenue</span>
                  <span className="font-bold text-slate-100 font-mono">{formatCurrency(pnlData.serviceRevenue)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-emerald-400 text-sm">
                  <span>Total Operating Revenue (A):</span>
                  <span className="font-mono">{formatCurrency(pnlData.totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* 2. COGS */}
            <div className="space-y-2">
              <div className="p-2.5 px-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 font-bold uppercase text-[11px] flex justify-between">
                <span>2. Cost of Goods Sold (Direct Purchases)</span>
                <span>Amount (₹)</span>
              </div>
              <div className="space-y-2 px-4">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Furniture Procurement & Manufacturing Bills</span>
                  <span className="font-bold text-slate-100 font-mono">{formatCurrency(pnlData.purchaseExpense)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-amber-400 text-sm">
                  <span>Total Cost of Goods Sold (B):</span>
                  <span className="font-mono">{formatCurrency(pnlData.purchaseExpense)}</span>
                </div>
              </div>
            </div>

            {/* Gross Profit Callout */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center font-bold text-sm">
              <span className="text-slate-200">Gross Operating Profit (A − B):</span>
              <span className="font-mono text-emerald-400 text-base">{formatCurrency(pnlData.grossProfit)}</span>
            </div>

            {/* 3. Operating Expenses */}
            <div className="space-y-2">
              <div className="p-2.5 px-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 font-bold uppercase text-[11px] flex justify-between">
                <span>3. Departmental Operating Expenses</span>
                <span>Amount (₹)</span>
              </div>
              <div className="space-y-2 px-4">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Marketing, Advertising & Branding Campaign</span>
                  <span className="font-bold text-slate-100 font-mono">{formatCurrency(pnlData.marketingExpense)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Showroom Operations, Rent & Facility Utilities</span>
                  <span className="font-bold text-slate-100 font-mono">{formatCurrency(pnlData.showroomExpense)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-rose-400 text-sm">
                  <span>Total Operating Expenses (C):</span>
                  <span className="font-mono">{formatCurrency(pnlData.totalOperatingExpenses)}</span>
                </div>
              </div>
            </div>

            {/* Final Net Profit Banner */}
            <div className="p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-2xl border border-indigo-500/30 flex justify-between items-center">
              <div>
                <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Net Profit / Loss</span>
                <p className="text-xs text-slate-400 mt-0.5">Calculated as: Gross Profit − Operating Expenses</p>
              </div>
              <div className="font-mono font-extrabold text-2xl text-emerald-400">
                {formatCurrency(pnlData.netProfit)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. BUDGET REPORT */}
      {/* ========================================================= */}
      {activeReport === 'budget' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Departmental Budget vs Actual Report:</strong> Compares planned budget caps against live expenses tagged to each analytic cost center.
              </span>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Budget ID</th>
                  <th className="py-3 px-4">Department / Analytic Center</th>
                  <th className="py-3 px-4">Responsible Lead</th>
                  <th className="py-3 px-4 text-right">Planned Budget</th>
                  <th className="py-3 px-4 text-right">Actual Expense</th>
                  <th className="py-3 px-4 text-right">Variance (Remaining)</th>
                  <th className="py-3 px-4 text-right">Utilization %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {budgetReportData.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{b.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">{b.analyticAccountName}</td>
                    <td className="py-3.5 px-4 text-slate-400">{b.responsiblePerson}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                      {formatCurrency(b.plannedAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                      {formatCurrency(b.actualSpent)}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-mono font-extrabold ${b.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(b.variance)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          b.isOverBudget
                            ? 'bg-rose-500/20 text-rose-300'
                            : b.usagePercent >= 80
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {b.usagePercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. STOCK & INVENTORY VALUATION REPORT */}
      {/* ========================================================= */}
      {activeReport === 'stock' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Inventory Valuation Report:</strong> Real-time tracking of purchased quantities, sales dispatches, available physical stock, and asset valuation.
              </span>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Item SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Purchased</th>
                  <th className="py-3 px-4 text-center">Sold</th>
                  <th className="py-3 px-4 text-center">Available Stock</th>
                  <th className="py-3 px-4 text-right">Unit Cost (₹)</th>
                  <th className="py-3 px-4 text-right">Asset Valuation (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stockReportData.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{p.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">{p.name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{p.category}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300">{p.purchasedQty}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300">{p.soldQty}</td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className={`font-bold ${p.isLowStock ? 'text-amber-400' : 'text-slate-100'}`}>
                        {p.availableStock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300">{formatCurrency(p.costPrice)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-400">
                      {formatCurrency(p.totalValuation)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
