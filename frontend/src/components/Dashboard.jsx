import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CreditCard,
  AlertCircle,
  ShieldCheck,
  Package,
  Layers,
  Scale
} from 'lucide-react';

export default function Dashboard({
  onOpenNewInvoice,
  onOpenNewBill,
  onOpenPaymentModal
}) {
  const {
    invoices,
    vendorBills,
    products,
    pnlData,
    balanceSheetData,
    stockReportData,
    liquidBalances,
    setActiveTab,
    formatCurrency
  } = useAccounting();

  const totalRevenue = pnlData.totalRevenue || 0;
  const totalPurchases = pnlData.purchaseExpense || 0;
  const netProfit = pnlData.netProfit || 0;
  const totalReceivables = balanceSheetData.debtorsAcc || 0;
  const totalPayables = balanceSheetData.creditorsAcc || 0;
  const totalLiquid = liquidBalances.totalLiquid || 0;
  const inventoryValuation = balanceSheetData.inventoryValuation || 0;

  const lowStockProducts = stockReportData.filter(p => p.isLowStock);
  const recentInvoices = [...invoices].slice(0, 5);
  const recentBills = [...vendorBills].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner with Clean Light SaaS Styling */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl text-slate-800 shadow-xs border border-slate-200 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-[#C6E7FF]/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-5">
          {/* Header Top Row: Logo + Badges + Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-white p-1 flex items-center justify-center shadow-xs border border-slate-200 shrink-0">
                <img
                  src="/logo.png"
                  alt="Urban Furniture Official Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#10497D] bg-[#C6E7FF] px-2.5 py-0.5 rounded-full border border-[#9BD5FF]/40 font-mono">
                    ERP Accounting
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 flex items-center space-x-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Double-Entry Balanced</span>
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-display">
                  Urban Furniture ERP Workspace
                </h1>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => {
                  setActiveTab('sales');
                  onOpenNewInvoice();
                }}
                className="flex items-center space-x-1.5 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs border border-[#9BD5FF]/40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-900" />
                <span>New Sales Order</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('purchases');
                  onOpenNewBill();
                }}
                className="flex items-center space-x-1.5 bg-[#D4F6FF] hover:bg-[#ACEEFF] active:bg-[#75DCFF] text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs border border-[#ACEEFF]/40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-900" />
                <span>New Purchase Order</span>
              </button>
            </div>
          </div>

          {/* Subtitle Line */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <p className="text-xs text-slate-500 font-medium">
              Real-time synchronization with MySQL database • Live balance validations • Double-entry ledger integration
            </p>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#C6E7FF] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Sales Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-900 font-mono">{formatCurrency(totalRevenue)}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{invoices.length} Invoices Issued</p>
          </div>
        </div>

        {/* Total Purchases */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#C6E7FF] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Procurement</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-900 font-mono">{formatCurrency(totalPurchases)}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{vendorBills.length} Vendor Bills Recorded</p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#C6E7FF] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Net Operating Profit</span>
            <div className={`p-2 rounded-xl border ${netProfit >= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-xl font-bold font-mono ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatCurrency(netProfit)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {pnlData.profitMarginPercent}% Operating Margin
            </p>
          </div>
        </div>

        {/* Liquid Reserves (Simulated Bank + Cash) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#C6E7FF] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Liquid Funds Available</span>
            <div className="p-2 rounded-xl bg-[#D4F6FF] text-[#145B9D] border border-[#ACEEFF]">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-900 font-mono">{formatCurrency(totalLiquid)}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Bank: {formatCurrency(liquidBalances.bank)} • Cash: {formatCurrency(liquidBalances.cash)}
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Accounts Receivable */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Accounts Receivable (Debtors)</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Unpaid Inflow</span>
          </div>
          <h4 className="text-lg font-bold text-slate-900 font-mono">{formatCurrency(totalReceivables)}</h4>
          <p className="text-[11px] text-slate-400 mt-1">Pending collection from customers</p>
        </div>

        {/* Accounts Payable */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Accounts Payable (Creditors)</span>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">Unpaid Outflow</span>
          </div>
          <h4 className="text-lg font-bold text-slate-900 font-mono">{formatCurrency(totalPayables)}</h4>
          <p className="text-[11px] text-slate-400 mt-1">Pending payments to vendors</p>
        </div>

        {/* Stock Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Inventory Valuation</span>
            <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold">Asset Value</span>
          </div>
          <h4 className="text-lg font-bold text-slate-900 font-mono">{formatCurrency(inventoryValuation)}</h4>
          <p className="text-[11px] text-slate-400 mt-1">{products.length} catalog items tracked</p>
        </div>
      </div>

      {/* Low Stock Warning Alert */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Low Stock Alert: {lowStockProducts.length} Product{lowStockProducts.length > 1 ? 's' : ''} Require Reordering
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                {lowStockProducts.map(p => `${p.name} (${p.availableStock} in stock)`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('purchases')}
            className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Create PO
          </button>
        </div>
      )}

      {/* Recent Activity: Invoices & Vendor Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Customer Invoices */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Recent Customer Invoices</h3>
              <p className="text-[11px] text-slate-400">Sales orders billed to clients</p>
            </div>
            <button
              onClick={() => setActiveTab('sales')}
              className="text-xs font-bold text-[#1B76C7] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2 bg-[#FBFBFB] rounded-xl border border-dashed border-slate-200">
              <Package className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">No invoices recorded yet</p>
              <button
                onClick={() => {
                  setActiveTab('sales');
                  onOpenNewInvoice();
                }}
                className="text-xs font-bold text-[#1B76C7] hover:underline cursor-pointer"
              >
                Create your first sales order
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentInvoices.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{inv.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        inv.status === 'Partially Paid' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{inv.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold font-mono text-slate-900">{formatCurrency(inv.totalAmount)}</p>
                    <p className="text-[10px] text-slate-400">Due: {formatCurrency(inv.balance)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Vendor Bills */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Recent Vendor Bills</h3>
              <p className="text-[11px] text-slate-400">Procurement bills from suppliers</p>
            </div>
            <button
              onClick={() => setActiveTab('purchases')}
              className="text-xs font-bold text-[#1B76C7] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          {recentBills.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2 bg-[#FBFBFB] rounded-xl border border-dashed border-slate-200">
              <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">No vendor bills recorded yet</p>
              <button
                onClick={() => {
                  setActiveTab('purchases');
                  onOpenNewBill();
                }}
                className="text-xs font-bold text-[#1B76C7] hover:underline cursor-pointer"
              >
                Create your first purchase order
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentBills.map((bill) => (
                <div key={bill.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{bill.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        bill.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        bill.status === 'Partially Paid' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {bill.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{bill.vendorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold font-mono text-slate-900">{formatCurrency(bill.totalAmount)}</p>
                    <p className="text-[10px] text-slate-400">Due: {formatCurrency(bill.balance)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
