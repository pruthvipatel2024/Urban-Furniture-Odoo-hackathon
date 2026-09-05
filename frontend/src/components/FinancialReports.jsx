import React, { useState, useEffect } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Scale,
  TrendingUp,
  PieChart,
  Package,
  Printer,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ListOrdered
} from 'lucide-react';

export default function FinancialReports({ initialReport = 'balance-sheet' }) {
  const {
    balanceSheetData,
    pnlData,
    budgetReportData,
    stockReportData,
    trialBalanceData,
    formatCurrency
  } = useAccounting();

  const [activeReport, setActiveReport] = useState(initialReport); // 'balance-sheet' | 'pnl' | 'budget' | 'stock' | 'trial-balance'

  useEffect(() => {
    if (initialReport) {
      setActiveReport(initialReport);
    }
  }, [initialReport]);

  return (
    <div className="space-y-6">
      {/* Official Company Statement Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E3E7EA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center border border-[#E3E7EA] shadow-xs shrink-0">
            <img src="/logo.png" alt="Urban Furniture Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#0B2A4A] font-display">Urban Furniture Ltd. — Statutory Statements</h2>
            <p className="text-xs text-[#667482]">Official Double-Entry Accounting & Management Reports • FY 2026-2027</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top Filter & Report Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3E7EA] shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveReport('balance-sheet')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeReport === 'balance-sheet'
                ? 'bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8] shadow-xs'
                : 'text-[#667482] hover:text-[#0B2A4A] hover:bg-[#FAFAF8]'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Balance Sheet</span>
          </button>

          <button
            onClick={() => setActiveReport('pnl')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeReport === 'pnl'
                ? 'bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8] shadow-xs'
                : 'text-[#667482] hover:text-[#0B2A4A] hover:bg-[#FAFAF8]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Profit & Loss (P&L)</span>
          </button>

          <button
            onClick={() => setActiveReport('budget')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeReport === 'budget'
                ? 'bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8] shadow-xs'
                : 'text-[#667482] hover:text-[#0B2A4A] hover:bg-[#FAFAF8]'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Budget Report</span>
          </button>

          <button
            onClick={() => setActiveReport('trial-balance')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeReport === 'trial-balance'
                ? 'bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8] shadow-xs'
                : 'text-[#667482] hover:text-[#0B2A4A] hover:bg-[#FAFAF8]'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Trial Balance</span>
          </button>

          <button
            onClick={() => setActiveReport('stock')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeReport === 'stock'
                ? 'bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8] shadow-xs'
                : 'text-[#667482] hover:text-[#0B2A4A] hover:bg-[#FAFAF8]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Stock Valuation</span>
          </button>
        </div>
      </div>

      {/* REPORT 1: BALANCE SHEET */}
      {activeReport === 'balance-sheet' && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E7EA] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0B2A4A] font-display">Balance Sheet Statement</h3>
              <p className="text-xs text-[#667482]">As of Present • Total Assets = Total Liabilities + Capital</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              balanceSheetData.isBalanced ? 'bg-[#EAF7F0] text-[#18794E] border-[#A3E6C0]' : 'bg-[#FDECEC] text-[#B42318] border-[#F8B4B4]'
            }`}>
              {balanceSheetData.isBalanced ? '✓ Total Assets = Total Liabilities + Capital' : 'Discrepancy'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Assets */}
            <div className="bg-[#FAFAF8] p-5 rounded-2xl border border-[#E3E7EA] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#667482] border-b border-[#E3E7EA] pb-2">
                1. Assets (Bank, Cash, Debtors, Inventory, Other Assets)
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-[#17212B]">Cash Account (Cash on Hand)</span>
                  <span className="font-mono font-bold text-[#0B2A4A]">{formatCurrency(balanceSheetData.cashAcc)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#17212B]">Bank Account (HDFC Bank)</span>
                  <span className="font-mono font-bold text-[#0B2A4A]">{formatCurrency(balanceSheetData.bankAcc)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#17212B]">Accounts Receivable (Debtors)</span>
                  <span className="font-mono font-bold text-[#0B2A4A]">{formatCurrency(balanceSheetData.debtorsAcc)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#17212B]">Inventory Asset Valuation</span>
                  <span className="font-mono font-bold text-[#0B2A4A]">{formatCurrency(balanceSheetData.inventoryValuation)}</span>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-[#D8E1E8] flex justify-between items-center text-xs font-bold">
                <span className="text-[#17212B]">Total Assets:</span>
                <span className="font-mono text-base text-[#18794E]">{formatCurrency(balanceSheetData.totalAssets)}</span>
              </div>
            </div>

            {/* Right: Liabilities & Capital */}
            <div className="bg-[#FAFAF8] p-5 rounded-2xl border border-[#E3E7EA] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#667482] border-b border-[#E3E7EA] pb-2">
                2. Liabilities & Capital
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-[#17212B]">Accounts Payable (Creditors)</span>
                  <span className="font-mono font-bold text-[#0B2A4A]">{formatCurrency(balanceSheetData.creditorsAcc)}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-[#E3E7EA] pt-2 font-semibold">
                  <span className="text-[#17212B]">Total Liabilities:</span>
                  <span className="font-mono font-bold text-[#0B2A4A]">{formatCurrency(balanceSheetData.totalLiabilities)}</span>
                </div>

                <div className="pt-2 border-t border-[#E3E7EA]">
                  <div className="flex justify-between py-1">
                    <span className="text-[#17212B]">Owner's Capital / Equity</span>
                    <span className="font-mono font-bold text-[#0B2A4A]">{formatCurrency(balanceSheetData.ownersEquity)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#17212B]">Retained Net Profit</span>
                    <span className="font-mono font-bold text-[#0B2A4A]">{formatCurrency(balanceSheetData.retainedEarnings)}</span>
                  </div>
                  <div className="flex justify-between py-1 font-semibold pt-1">
                    <span className="text-[#17212B]">Total Capital:</span>
                    <span className="font-mono font-bold text-[#0B2A4A]">{formatCurrency(balanceSheetData.totalCapital)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-[#D8E1E8] flex justify-between items-center text-xs font-bold">
                <span className="text-[#17212B]">Total Liabilities + Capital:</span>
                <span className="font-mono text-base text-[#0B2A4A]">{formatCurrency(balanceSheetData.totalLiabilitiesAndCapital)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: PROFIT & LOSS */}
      {activeReport === 'pnl' && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E7EA] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0B2A4A] font-display">Profit and Loss Statement</h3>
              <p className="text-xs text-[#667482]">Income - Expense - Other Expense = Net Income</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              pnlData.netProfit >= 0 ? 'bg-[#EAF7F0] text-[#18794E] border-[#A3E6C0]' : 'bg-[#FDECEC] text-[#B42318] border-[#F8B4B4]'
            }`}>
              Operating Margin: {pnlData.profitMarginPercent}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Income */}
            <div className="bg-[#FAFAF8] p-5 rounded-2xl border border-[#E3E7EA] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#667482] border-b border-[#E3E7EA] pb-2">
                1. Income (Sales Revenue)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-[#17212B]">Income from Sales</span>
                  <span className="font-mono font-bold text-[#0B2A4A]">{formatCurrency(pnlData.totalRevenue)}</span>
                </div>
              </div>
              <div className="pt-3 border-t-2 border-[#D8E1E8] flex justify-between items-center text-xs font-bold">
                <span className="text-[#17212B]">Total Income:</span>
                <span className="font-mono text-base text-[#18794E]">{formatCurrency(pnlData.totalRevenue)}</span>
              </div>
            </div>

            {/* Right: Expenses */}
            <div className="bg-[#FAFAF8] p-5 rounded-2xl border border-[#E3E7EA] space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#667482] border-b border-[#E3E7EA] pb-2">
                2. Expenses (Purchases & Operations)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-[#17212B]">Purchase Expense (COGS)</span>
                  <span className="font-mono font-bold text-[#0B2A4A]">{formatCurrency(pnlData.purchaseExpense)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#17212B]">Other Operating Expenses</span>
                  <span className="font-mono font-bold text-[#0B2A4A]">{formatCurrency(pnlData.operatingExpenses || 0)}</span>
                </div>
              </div>
              <div className="pt-3 border-t-2 border-[#D8E1E8] flex justify-between items-center text-xs font-bold">
                <span className="text-[#17212B]">Total Expenses:</span>
                <span className="font-mono text-base text-[#B42318]">{formatCurrency(pnlData.purchaseExpense + (pnlData.operatingExpenses || 0))}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#EEF4F8] border border-[#D8E1E8] flex items-center justify-between">
            <span className="text-sm font-bold text-[#0B2A4A]">Net Income:</span>
            <span className={`text-xl font-bold font-mono ${pnlData.netProfit >= 0 ? 'text-[#18794E]' : 'text-[#B42318]'}`}>
              {formatCurrency(pnlData.netProfit)}
            </span>
          </div>
        </div>
      )}

      {/* REPORT 3: BUDGET REPORT */}
      {activeReport === 'budget' && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E7EA] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0B2A4A] font-display">Department Budget Variance Report</h3>
              <p className="text-xs text-[#667482]">Committed Planned vs Achieved Actuals from MySQL Invoices & Bills</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-bold">
                <tr>
                  <th className="p-4">Budget Name</th>
                  <th className="p-4">Period</th>
                  <th className="p-4 text-right">Committed</th>
                  <th className="p-4 text-right">Achieved</th>
                  <th className="p-4 text-right">Variance</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E7EA]/60">
                {budgetReportData.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="p-4 font-bold text-[#0B2A4A]">{b.name}</td>
                    <td className="p-4 text-[#667482]">{b.period_start} → {b.period_end}</td>
                    <td className="p-4 text-right font-mono font-bold text-[#0B2A4A]">{formatCurrency(b.planned_amount || b.committedAmount)}</td>
                    <td className="p-4 text-right font-mono font-bold text-[#C98232]">{formatCurrency(b.achieved_amount || b.achievedAmount)}</td>
                    <td className="p-4 text-right font-mono font-bold text-[#18794E]">{formatCurrency((b.planned_amount || 0) - (b.achieved_amount || 0))}</td>
                    <td className="p-4 text-center">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8]">
                        {b.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: TRIAL BALANCE */}
      {activeReport === 'trial-balance' && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E7EA] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0B2A4A] font-display">Trial Balance Statement</h3>
              <p className="text-xs text-[#667482]">Complete verification of Total Debits vs Total Credits • As of {trialBalanceData?.asOfDate || 'Today'}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              trialBalanceData?.isBalanced ? 'bg-[#EAF7F0] text-[#18794E] border-[#A3E6C0]' : 'bg-[#FDECEC] text-[#B42318] border-[#F8B4B4]'
            }`}>
              {trialBalanceData?.isBalanced ? '✓ Double-Entry Invariant Satisfied' : 'Discrepancy'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-bold">
                <tr>
                  <th className="p-4">Account ID</th>
                  <th className="p-4">Account Name</th>
                  <th className="p-4">Classification</th>
                  <th className="p-4 text-right">Debit Balance (₹)</th>
                  <th className="p-4 text-right">Credit Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E7EA]/60">
                {(!trialBalanceData?.rows || trialBalanceData.rows.length === 0) ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-[#8A96A3]">
                      No accounting entries available for the selected period.
                    </td>
                  </tr>
                ) : (
                  trialBalanceData.rows.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="p-4 font-mono font-bold text-[#0B2A4A]">{row.code || `COA-100${row.id}`}</td>
                      <td className="p-4 font-semibold text-[#17212B]">{row.name || row.account_name}</td>
                      <td className="p-4 text-[#667482]">{row.type || row.account_type}</td>
                      <td className="p-4 text-right font-mono font-bold text-[#17212B]">
                        {Number(row.debit) > 0 ? formatCurrency(row.debit) : '—'}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-[#17212B]">
                        {Number(row.credit) > 0 ? formatCurrency(row.credit) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-[#EEF4F8]/70 border-t-2 border-[#D8E1E8] font-bold text-xs">
                <tr>
                  <td colSpan="3" className="p-4 text-[#0B2A4A] font-bold">Grand Totals:</td>
                  <td className="p-4 text-right font-mono text-[#0B2A4A] text-sm">{formatCurrency(trialBalanceData?.totalDebit ?? 0)}</td>
                  <td className="p-4 text-right font-mono text-[#0B2A4A] text-sm">{formatCurrency(trialBalanceData?.totalCredit ?? 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 5: STOCK VALUATION */}
      {activeReport === 'stock' && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E7EA] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0B2A4A] font-display">Inventory Stock Valuation</h3>
              <p className="text-xs text-[#667482]">Real-time stock on hand valuation based on unit cost</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-bold">
                <tr>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Available Stock</th>
                  <th className="p-4 text-right">Unit Cost</th>
                  <th className="p-4 text-right">Sales Price</th>
                  <th className="p-4 text-right">Total Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E7EA]/60">
                {stockReportData.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="p-4 font-bold text-[#0B2A4A]">{item.name}</td>
                    <td className="p-4 text-[#667482]">{item.category}</td>
                    <td className="p-4 text-right font-mono font-bold text-[#17212B]">{item.availableStock}</td>
                    <td className="p-4 text-right font-mono text-[#667482]">{formatCurrency(item.costPrice)}</td>
                    <td className="p-4 text-right font-mono text-[#667482]">{formatCurrency(item.salesPrice)}</td>
                    <td className="p-4 text-right font-mono font-bold text-[#18794E]">{formatCurrency(item.totalValuation)}</td>
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
