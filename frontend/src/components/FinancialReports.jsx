import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Scale,
  TrendingUp,
  PieChart,
  Package,
  Printer,
  ShieldCheck,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export default function FinancialReports() {
  const {
    balanceSheetData,
    pnlData,
    budgetReportData,
    stockReportData,
    formatCurrency
  } = useAccounting();

  const [activeReport, setActiveReport] = useState('balance-sheet'); // 'balance-sheet' | 'pnl' | 'budget' | 'stock'

  return (
    <div className="space-y-6">
      {/* Official Company Statement Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-200 shadow-xs shrink-0">
            <img src="/logo.png" alt="Urban Furniture Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 font-display">Urban Furniture Ltd. — Statutory Statements</h2>
            <p className="text-xs text-slate-500">Official Double-Entry Accounting & Management Reports • FY 2026-2027</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#C6E7FF] hover:bg-[#9BD5FF] text-slate-900 text-xs font-bold rounded-xl border border-[#9BD5FF]/40 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top Filter & Report Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveReport('balance-sheet')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeReport === 'balance-sheet'
                ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Balance Sheet</span>
          </button>

          <button
            onClick={() => setActiveReport('pnl')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeReport === 'pnl'
                ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Profit & Loss (P&L)</span>
          </button>

          <button
            onClick={() => setActiveReport('stock')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeReport === 'stock'
                ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Stock Valuation</span>
          </button>

          <button
            onClick={() => setActiveReport('budget')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeReport === 'budget'
                ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Budget vs Actual</span>
          </button>
        </div>
      </div>

      {/* REPORT 1: BALANCE SHEET */}
      {activeReport === 'balance-sheet' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Balance Sheet Statement</h3>
              <p className="text-xs text-slate-500">As of Present • Total Assets = Total Liabilities + Equity</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              balanceSheetData.isBalanced ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {balanceSheetData.isBalanced ? '✓ Equation Balanced' : 'Discrepancy'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Assets */}
            <div className="bg-[#FBFBFB] p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                1. Assets (Current & Non-Current)
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-700">Cash on Hand</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(balanceSheetData.cashAcc)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-700">Bank Account (HDFC Bank)</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(balanceSheetData.bankAcc)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-700">Accounts Receivable (Debtors)</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(balanceSheetData.debtorsAcc)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-700">Inventory Asset Valuation</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(balanceSheetData.inventoryValuation)}</span>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-300 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-900">Total Assets:</span>
                <span className="font-mono text-base text-emerald-700">{formatCurrency(balanceSheetData.totalAssets)}</span>
              </div>
            </div>

            {/* Right: Liabilities & Equity */}
            <div className="bg-[#FBFBFB] p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
                2. Liabilities & Equity
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-slate-700">Accounts Payable (Creditors)</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(balanceSheetData.creditorsAcc)}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-slate-100 pt-2 font-semibold">
                  <span className="text-slate-800">Total Liabilities:</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(balanceSheetData.totalLiabilities)}</span>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-700">Owner's Capital / Equity</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(balanceSheetData.ownersEquity)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-700">Retained Earnings (Net Profit)</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(balanceSheetData.retainedEarnings)}</span>
                  </div>
                  <div className="flex justify-between py-1 font-semibold pt-1">
                    <span className="text-slate-800">Total Capital & Equity:</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(balanceSheetData.totalCapital)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-300 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-900">Total Liabilities & Equity:</span>
                <span className="font-mono text-base text-[#145B9D]">{formatCurrency(balanceSheetData.totalLiabilitiesAndCapital)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: PROFIT & LOSS */}
      {activeReport === 'pnl' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Profit & Loss (Income Statement)</h3>
              <p className="text-xs text-slate-500">Revenue - Cost of Goods Sold = Operating Profit</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              pnlData.netProfit >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {pnlData.profitMarginPercent}% Margin
            </span>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto text-xs">
            {/* Operating Income */}
            <div className="bg-[#FBFBFB] p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                1. Operating Revenue
              </h4>
              <div className="flex justify-between py-1">
                <span className="text-slate-700">Gross Sales Income (Billed Invoices)</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(pnlData.saleIncome)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                <span className="text-slate-900">Total Revenue:</span>
                <span className="font-mono text-emerald-700">{formatCurrency(pnlData.totalRevenue)}</span>
              </div>
            </div>

            {/* Procurement / COGS */}
            <div className="bg-[#FBFBFB] p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                2. Cost of Procurement / COGS
              </h4>
              <div className="flex justify-between py-1">
                <span className="text-slate-700">Vendor Procurement Expense</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(pnlData.purchaseExpense)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                <span className="text-slate-900">Total Procurement Expense:</span>
                <span className="font-mono text-amber-700">{formatCurrency(pnlData.purchaseExpense)}</span>
              </div>
            </div>

            {/* Net Profit Summary */}
            <div className="p-5 bg-[#C6E7FF]/40 rounded-2xl border border-[#9BD5FF] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Net Operating Profit</h4>
                <p className="text-[11px] text-slate-600">Surplus after deducting all procurement expenses</p>
              </div>
              <span className={`text-xl font-bold font-mono ${pnlData.netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                {formatCurrency(pnlData.netProfit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: STOCK VALUATION */}
      {activeReport === 'stock' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Inventory Stock Valuation</h3>
              <p className="text-xs text-slate-500">Available physical stock multiplied by unit acquisition cost</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#FBFBFB] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">SKU / ID</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Available Units</th>
                  <th className="py-3 px-4 text-right">Unit Cost (₹)</th>
                  <th className="py-3 px-4 text-right">Total Asset Valuation (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockReportData.map((p) => (
                  <tr key={p.id} className="hover:bg-[#D4F6FF]/20">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{p.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{p.category}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        p.isLowStock ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {p.availableStock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatCurrency(p.costPrice)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(p.totalValuation)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#FBFBFB] border-t-2 border-slate-300 font-bold text-xs">
                <tr>
                  <td colSpan="5" className="py-3 px-4 text-right text-slate-700">Total Inventory Asset:</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-900 text-sm">
                    {formatCurrency(stockReportData.reduce((s, p) => s + p.totalValuation, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: BUDGET REPORT */}
      {activeReport === 'budget' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Department Budget vs Actual</h3>
              <p className="text-xs text-slate-500">Fiscal period appropriations compared with recorded operating expenses</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#FBFBFB] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Budget Name</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Responsible</th>
                  <th className="py-3 px-4 text-right">Planned (₹)</th>
                  <th className="py-3 px-4 text-right">Actual Spent (₹)</th>
                  <th className="py-3 px-4 text-right">Variance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budgetReportData.map((b) => (
                  <tr key={b.id} className="hover:bg-[#D4F6FF]/20">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{b.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{b.periodStart} to {b.periodEnd}</td>
                    <td className="py-3.5 px-4 text-slate-700">{b.responsiblePerson}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(b.plannedAmount)}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatCurrency(b.actualSpent)}</td>
                    <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                      b.variance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {formatCurrency(b.variance)}
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
