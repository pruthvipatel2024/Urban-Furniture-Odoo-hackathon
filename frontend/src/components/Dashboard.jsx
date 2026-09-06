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
  Scale,
  PieChart,
  FileText,
  ListOrdered,
  BookOpen
} from 'lucide-react';

export default function Dashboard({
  onOpenNewInvoice,
  onOpenNewBill,
  onOpenPaymentModal
}) {
  const {
    dashboardData,
    salesOrders,
    invoices,
    purchaseOrders,
    vendorBills,
    budgets,
    journalEntries,
    products,
    pnlData,
    balanceSheetData,
    stockReportData,
    liquidBalances,
    setActiveTab,
    formatCurrency
  } = useAccounting();

  // 1. Sales Calculations from live DB
  const salesAllCount = Number(dashboardData?.kpi?.totalSalesOrders ?? salesOrders.length);
  const salesConfirmedCount = Number(dashboardData?.kpi?.salesConfirmedCount ?? salesOrders.filter(so => (so.normalizedStatus || (so.status || '').toLowerCase()) === 'confirmed' || (so.normalizedStatus || (so.status || '').toLowerCase()) === 'invoiced').length);
  const salesDraftCount = Number(dashboardData?.kpi?.salesDraftCount ?? salesOrders.filter(so => (so.normalizedStatus || (so.status || '').toLowerCase()) === 'draft').length);

  // 2. Purchase Calculations from live DB
  const purchaseAllCount = Number(dashboardData?.kpi?.totalPurchaseOrders ?? purchaseOrders.length);
  const purchaseConfirmedCount = Number(dashboardData?.kpi?.purchaseConfirmedCount ?? purchaseOrders.filter(po => ['confirmed', 'received', 'billed'].includes(po.normalizedStatus || (po.status || '').toLowerCase())).length);
  const purchaseDraftCount = Number(dashboardData?.kpi?.purchaseDraftCount ?? purchaseOrders.filter(po => (po.normalizedStatus || (po.status || '').toLowerCase()) === 'draft').length);

  // 3. Budget Calculations from live DB
  const totalBudgetsCount = budgets.filter(b => ['confirmed', 'draft', 'revised'].includes(b.normalizedStatus || (b.status || '').toLowerCase())).length;
  const totalCommitted = budgets.filter(b => (b.normalizedStatus || (b.status || '').toLowerCase()) !== 'cancelled').reduce((acc, b) => acc + Number(b.committedAmount ?? b.plannedAmount ?? 0), 0);
  const totalAchieved = budgets.filter(b => (b.normalizedStatus || (b.status || '').toLowerCase()) !== 'cancelled').reduce((acc, b) => acc + Number(b.achievedAmount ?? 0), 0);

  // 4. Accounts Calculations from authoritative backend or live DB
  const postedEntriesCount = Number(dashboardData?.kpi?.postedEntriesCount ?? journalEntries.length);

  // Real inventory low-stock data check
  const lowStockProducts = (stockReportData || []).filter(p => p.isLowStock);
  const recentInvoices = [...invoices].slice(0, 5);
  const recentBills = [...vendorBills].slice(0, 5);

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* ========================================================================= */}
      {/* 1. HERO HEADER SECTION                                                    */}
      {/* ========================================================================= */}
      <div className="bg-white p-7 sm:p-8 lg:p-9 rounded-3xl text-[#17212B] shadow-xs border border-[#E3E7EA] relative overflow-hidden min-h-[120px] sm:min-h-[140px] flex flex-col justify-center">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-[#F8F0E6]/60 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-xs border border-[#E3E7EA] shrink-0">
              <img
                src="/logo.png"
                alt="Urban Furniture Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B2A4A] bg-[#EEF4F8] px-3 py-1 rounded-full border border-[#D8E1E8] font-mono">
                  ERP Dashboard
                </span>
                <span className="text-xs font-semibold text-[#18794E] flex items-center space-x-1.5 bg-[#EAF7F0] px-3 py-1 rounded-full border border-[#18794E]/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Double-Entry Balanced</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight text-[#0B2A4A] font-display">
                Urban Furniture Workspace
              </h1>
              <p className="text-xs sm:text-sm text-[#667482] font-normal">
                Real-time financial status, operational workflows, and double-entry accounting overview
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveTab('sales-orders');
                onOpenNewInvoice();
              }}
              className="h-11 sm:h-12 px-5 py-2.5 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#071B31] text-white text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>New Sales Order</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('purchase-orders');
                onOpenNewBill();
              }}
              className="h-11 sm:h-12 px-5 py-2.5 bg-[#EEF4F8] hover:bg-[#D8E5EF] active:bg-[#ADC6DC] text-[#0B2A4A] text-sm font-bold rounded-xl transition-all shadow-xs border border-[#D8E1E8] cursor-pointer flex items-center space-x-2"
            >
              <Plus className="w-4 h-4 text-[#0B2A4A]" />
              <span>New Purchase Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP BUSINESS SUMMARY CARDS (Sales, Purchase, Budget)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {/* 1. SALES SUMMARY CARD */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E3E7EA] shadow-xs hover:border-[#0B2A4A]/30 transition-all flex flex-col justify-between space-y-5 min-h-[250px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#EEF4F8] text-[#0B2A4A] border border-[#D8E1E8] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B2A4A] font-display leading-tight">Sales</h3>
                  <p className="text-xs text-[#8A96A3]">Order management</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('sales-orders');
                  onOpenNewInvoice();
                }}
                className="text-xs font-bold bg-[#0B2A4A] hover:bg-[#163B63] text-white px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
              >
                + New
              </button>
            </div>

            {/* Main Dominant Metric */}
            <div
              onClick={() => setActiveTab('sales-orders')}
              className="bg-[#FAFAF8] hover:bg-[#EEF4F8] p-4 rounded-xl border border-[#E3E7EA] cursor-pointer transition-colors"
            >
              <p className="text-xs font-medium text-[#667482]">Total Sales Orders</p>
              <p className="text-3xl lg:text-4xl font-extrabold font-sans text-[#0B2A4A] mt-1">{salesAllCount}</p>
            </div>

            {/* Secondary Sub-metrics (Confirmed vs Draft) */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div
                onClick={() => setActiveTab('sales-orders')}
                className="bg-[#FAFAF8] hover:bg-[#EAF7F0] p-3 rounded-xl border border-[#E3E7EA] cursor-pointer transition-colors"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#18794E]">Confirmed</p>
                <p className="text-xl font-bold font-sans text-[#18794E] mt-0.5">{salesConfirmedCount}</p>
              </div>
              <div
                onClick={() => setActiveTab('sales-orders')}
                className="bg-[#FAFAF8] hover:bg-[#EEF4F8] p-3 rounded-xl border border-[#E3E7EA] cursor-pointer transition-colors"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#667482]">Draft</p>
                <p className="text-xl font-bold font-sans text-[#17212B] mt-0.5">{salesDraftCount}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E3E7EA] flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm font-semibold text-[#0B2A4A]">
            <button onClick={() => setActiveTab('sales-orders')} className="hover:text-[#C98232] cursor-pointer">Sales Order</button>
            <span className="text-[#D8E1E8]">•</span>
            <button onClick={() => setActiveTab('sales-invoices')} className="hover:text-[#C98232] cursor-pointer">Sale Invoice</button>
            <span className="text-[#D8E1E8]">•</span>
            <button onClick={() => setActiveTab('sales-receipts')} className="hover:text-[#C98232] cursor-pointer">Receipt</button>
          </div>
        </div>

        {/* 2. PURCHASE SUMMARY CARD */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E3E7EA] shadow-xs hover:border-[#0B2A4A]/30 transition-all flex flex-col justify-between space-y-5 min-h-[250px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F0E6] text-[#C98232] border border-[#E5B875]/40 flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B2A4A] font-display leading-tight">Purchase</h3>
                  <p className="text-xs text-[#8A96A3]">Vendor procurement</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('purchase-orders');
                  onOpenNewBill();
                }}
                className="text-xs font-bold bg-[#0B2A4A] hover:bg-[#163B63] text-white px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
              >
                + New
              </button>
            </div>

            {/* Main Dominant Metric */}
            <div
              onClick={() => setActiveTab('purchase-orders')}
              className="bg-[#FAFAF8] hover:bg-[#EEF4F8] p-4 rounded-xl border border-[#E3E7EA] cursor-pointer transition-colors"
            >
              <p className="text-xs font-medium text-[#667482]">Total Purchase Orders</p>
              <p className="text-3xl lg:text-4xl font-extrabold font-sans text-[#0B2A4A] mt-1">{purchaseAllCount}</p>
            </div>

            {/* Secondary Sub-metrics (Confirmed vs Draft) */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div
                onClick={() => setActiveTab('purchase-orders')}
                className="bg-[#FAFAF8] hover:bg-[#EAF7F0] p-3 rounded-xl border border-[#E3E7EA] cursor-pointer transition-colors"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#18794E]">Confirmed</p>
                <p className="text-xl font-bold font-sans text-[#18794E] mt-0.5">{purchaseConfirmedCount}</p>
              </div>
              <div
                onClick={() => setActiveTab('purchase-orders')}
                className="bg-[#FAFAF8] hover:bg-[#EEF4F8] p-3 rounded-xl border border-[#E3E7EA] cursor-pointer transition-colors"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#667482]">Draft</p>
                <p className="text-xl font-bold font-sans text-[#17212B] mt-0.5">{purchaseDraftCount}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E3E7EA] flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm font-semibold text-[#0B2A4A]">
            <button onClick={() => setActiveTab('purchase-orders')} className="hover:text-[#C98232] cursor-pointer">Purchase Order</button>
            <span className="text-[#D8E1E8]">•</span>
            <button onClick={() => setActiveTab('purchase-bills')} className="hover:text-[#C98232] cursor-pointer">Purchase Bill</button>
            <span className="text-[#D8E1E8]">•</span>
            <button onClick={() => setActiveTab('purchase-payments')} className="hover:text-[#C98232] cursor-pointer">Payment</button>
          </div>
        </div>

        {/* 3. BUDGET SUMMARY CARD */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E3E7EA] shadow-xs hover:border-[#C98232]/40 transition-all flex flex-col justify-between space-y-5 min-h-[250px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8F0E6] text-[#C98232] border border-[#E5B875]/40 flex items-center justify-center shrink-0">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B2A4A] font-display leading-tight">Budget</h3>
                  <p className="text-xs text-[#8A96A3]">Analytic control</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('budgets')}
                className="text-xs font-bold bg-[#0B2A4A] hover:bg-[#163B63] text-white px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
              >
                + New
              </button>
            </div>

            {/* Main Dominant Metric */}
            <div
              onClick={() => setActiveTab('budgets')}
              className="bg-[#FAFAF8] hover:bg-[#F8F0E6] p-4 rounded-xl border border-[#E3E7EA] cursor-pointer transition-colors"
            >
              <p className="text-xs font-medium text-[#667482]">Total Budgets</p>
              <p className="text-3xl lg:text-4xl font-extrabold font-sans text-[#0B2A4A] mt-1">{totalBudgetsCount}</p>
            </div>

            {/* Secondary Sub-metrics (Committed & Achieved - Uncut Full Currency) */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setActiveTab('budgets')}
                className="bg-[#FAFAF8] hover:bg-[#F8F0E6] p-3 rounded-xl border border-[#E3E7EA] cursor-pointer transition-colors text-left"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#C98232]">Committed</p>
                <p className="text-sm sm:text-base font-bold font-mono text-[#17212B] mt-1 break-words">
                  {formatCurrency(totalCommitted)}
                </p>
              </div>
              <div
                onClick={() => setActiveTab('budgets')}
                className="bg-[#FAFAF8] hover:bg-[#EAF7F0] p-3 rounded-xl border border-[#E3E7EA] cursor-pointer transition-colors text-left"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#18794E]">Achieved</p>
                <p className="text-sm sm:text-base font-bold font-mono text-[#18794E] mt-1 break-words">
                  {formatCurrency(totalAchieved)}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E3E7EA] flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm font-semibold text-[#0B2A4A]">
            <button onClick={() => setActiveTab('master-analytics')} className="hover:text-[#C98232] cursor-pointer">Analyticals</button>
            <span className="text-[#D8E1E8]">•</span>
            <button onClick={() => setActiveTab('budgets')} className="hover:text-[#C98232] cursor-pointer">Budget</button>
            <span className="text-[#D8E1E8]">•</span>
            <button onClick={() => setActiveTab('reports-budget')} className="hover:text-[#C98232] cursor-pointer">Reports</button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. OPTIONAL REAL LOW STOCK WARNING ALERT                                  */}
      {/* ========================================================================= */}
      {lowStockProducts.length > 0 && (
        <div className="p-5 sm:p-6 bg-[#FFF6DF] border border-[#B7791F]/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <AlertCircle className="w-5 h-5 text-[#B7791F] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#17212B]">
                Low Stock Alert: {lowStockProducts.length} Product{lowStockProducts.length > 1 ? 's' : ''} Require Reordering
              </h4>
              <p className="text-xs text-[#667482] mt-1">
                {lowStockProducts.map(p => `${p.name} (${p.availableStock} in stock)`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('purchase-orders')}
            className="px-4 py-2 bg-[#C98232] hover:bg-[#A96823] text-white font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Create PO
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RECENT ACTIVITY: CUSTOMER INVOICES & VENDOR BILLS                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Customer Invoices */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3E7EA] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#0B2A4A] font-display">Recent Customer Invoices</h3>
              <p className="text-xs sm:text-sm text-[#8A96A3] mt-0.5">Sales orders billed to clients</p>
            </div>
            <button
              onClick={() => setActiveTab('sales-invoices')}
              className="text-sm font-bold text-[#0B2A4A] hover:text-[#C98232] cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-[#E3E7EA]">
            {recentInvoices.length === 0 ? (
              <p className="py-8 text-center text-[#8A96A3] text-sm">No customer invoices recorded yet.</p>
            ) : (
              recentInvoices.map((inv) => {
                const isPaid = (inv.normalizedStatus || (inv.status || '').toLowerCase()) === 'paid' || Number(inv.amountDue ?? inv.balance ?? 0) <= 0;
                const isPartiallyPaid = (inv.normalizedStatus || (inv.status || '').toLowerCase()) === 'partially_paid' || (Number(inv.paidAmount ?? inv.amountPaid ?? 0) > 0 && !isPaid);
                return (
                  <div
                    key={inv.id}
                    className="py-4 px-3 sm:px-4 rounded-2xl hover:bg-[#FAFAF8] transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono font-bold text-sm sm:text-base text-[#0B2A4A] truncate">
                          {inv.invoiceNumber || inv.number}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold shrink-0 ${
                          isPaid ? 'bg-[#EAF7F0] text-[#18794E]' :
                          isPartiallyPaid ? 'bg-[#FFF6DF] text-[#B7791F]' :
                          'bg-[#EEF4F8] text-[#667482]'
                        }`}>
                          {isPaid ? 'Paid' : isPartiallyPaid ? 'Partially Paid' : 'Unpaid'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#667482] truncate">{inv.customerName}</p>
                    </div>
                    <div className="shrink-0 text-right space-y-0.5">
                      <p className="font-mono font-bold text-sm sm:text-base text-[#17212B]">{formatCurrency(inv.total)}</p>
                      <p className="text-xs text-[#8A96A3]">Due: {inv.dueDate || inv.date}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Vendor Bills */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3E7EA] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#0B2A4A] font-display">Recent Vendor Bills</h3>
              <p className="text-xs sm:text-sm text-[#8A96A3] mt-0.5">Procurement bills from suppliers</p>
            </div>
            <button
              onClick={() => setActiveTab('purchase-bills')}
              className="text-sm font-bold text-[#0B2A4A] hover:text-[#C98232] cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-[#E3E7EA]">
            {recentBills.length === 0 ? (
              <p className="py-8 text-center text-[#8A96A3] text-sm">No vendor bills recorded yet.</p>
            ) : (
              recentBills.map((bill) => {
                const isPaid = (bill.normalizedStatus || (bill.status || '').toLowerCase()) === 'paid' || Number(bill.amountDue ?? bill.balance ?? 0) <= 0;
                const isPartiallyPaid = (bill.normalizedStatus || (bill.status || '').toLowerCase()) === 'partially_paid' || (Number(bill.paidAmount ?? bill.amountPaid ?? 0) > 0 && !isPaid);
                return (
                  <div
                    key={bill.id}
                    className="py-4 px-3 sm:px-4 rounded-2xl hover:bg-[#FAFAF8] transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono font-bold text-sm sm:text-base text-[#0B2A4A] truncate">
                          {bill.billNumber || bill.number}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold shrink-0 ${
                          isPaid ? 'bg-[#EAF7F0] text-[#18794E]' :
                          isPartiallyPaid ? 'bg-[#FFF6DF] text-[#B7791F]' :
                          'bg-[#EEF4F8] text-[#667482]'
                        }`}>
                          {isPaid ? 'Paid' : isPartiallyPaid ? 'Partially Paid' : 'Unpaid'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#667482] truncate">{bill.vendorName}</p>
                    </div>
                    <div className="shrink-0 text-right space-y-0.5">
                      <p className="font-mono font-bold text-sm sm:text-base text-[#17212B]">{formatCurrency(bill.total)}</p>
                      <p className="text-xs text-[#8A96A3]">Due: {bill.dueDate || bill.date}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
