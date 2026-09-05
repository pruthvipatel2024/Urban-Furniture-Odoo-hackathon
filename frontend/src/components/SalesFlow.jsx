import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  TrendingUp,
  Receipt,
  Plus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Building2,
  BookOpen,
  X,
  Printer,
  Eye,
  FileCheck,
  ShieldAlert
} from 'lucide-react';

export default function SalesFlow({ showCreateModal = false, setShowCreateModal }) {
  const {
    salesOrders,
    invoices,
    contacts,
    products,
    analyticAccounts,
    createSalesOrder,
    deliverGoodsSO,
    convertSOToCustomerInvoice,
    setPaymentTargetDoc,
    setShowPaymentModal,
    formatCurrency,
    userRole
  } = useAccounting();

  const [activeSubTab, setActiveSubTab] = useState('invoices'); // 'orders' | 'invoices'
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);

  // SO Creation Form State
  const [customerId, setCustomerId] = useState('');
  const [analyticAccountId, setAnalyticAccountId] = useState('ANA-03');
  const [soDate, setSoDate] = useState(new Date().toISOString().split('T')[0]);
  const [soNotes, setSoNotes] = useState('');
  const [items, setItems] = useState([
    { productId: '', qty: 1, unitPrice: 0, taxPercent: 18, total: 0 }
  ]);
  const [formError, setFormError] = useState('');

  const customersList = contacts.filter(c => c.type === 'Customer' || c.type === 'Both');

  // Dynamic Line Item Handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'productId') {
      const prd = products.find(p => p.id === value);
      if (prd) {
        updated[index].unitPrice = prd.salesPrice;
      }
    }

    const qty = Number(updated[index].qty || 0);
    const unitPrice = Number(updated[index].unitPrice || 0);
    const taxPercent = Number(updated[index].taxPercent || 0);
    const subtotal = qty * unitPrice;
    const tax = (subtotal * taxPercent) / 100;
    updated[index].total = subtotal + tax;

    setItems(updated);
  };

  const handleAddItemLine = () => {
    setItems([...items, { productId: '', qty: 1, unitPrice: 0, taxPercent: 18, total: 0 }]);
  };

  const handleRemoveItemLine = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const soSubtotal = items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.unitPrice || 0)), 0);
  const soTaxTotal = items.reduce((sum, item) => {
    const sub = Number(item.qty || 0) * Number(item.unitPrice || 0);
    return sum + ((sub * Number(item.taxPercent || 0)) / 100);
  }, 0);
  const soGrandTotal = soSubtotal + soTaxTotal;

  const handleSubmitSO = (e) => {
    e.preventDefault();
    setFormError('');

    if (!customerId) {
      setFormError('Please select a customer.');
      return;
    }

    const validItems = items.filter(i => i.productId && i.qty > 0);
    if (validItems.length === 0) {
      setFormError('Please add at least one product with quantity > 0.');
      return;
    }

    try {
      createSalesOrder({
        customerId,
        analyticAccountId,
        date: soDate,
        notes: soNotes,
        items: validItems
      });

      if (setShowCreateModal) setShowCreateModal(false);
      setCustomerId('');
      setItems([{ productId: '', qty: 1, unitPrice: 0, taxPercent: 18, total: 0 }]);
      setActiveSubTab('orders');
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'invoices'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Customer Invoices ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sales Orders ({salesOrders.length})</span>
          </button>
        </div>

        {userRole !== 'Contact' && (
          <button
            onClick={() => setShowCreateModal && setShowCreateModal(true)}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Sales Order</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. CUSTOMER INVOICES STREAM WITH AUTO DOUBLE-ENTRY BADGES */}
      {/* ========================================================= */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between text-xs text-slate-300 border border-emerald-500/20">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-100">Automatic Double-Entry Posting for Customer Invoices:</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Customer Invoice creation posts <code className="text-emerald-400 font-mono">Debit: Accounts Receivable (Debtors)</code> and <code className="text-indigo-400 font-mono">Credit: Sale Income</code>.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">SO Reference</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Outstanding Bal</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Journal Entry</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{inv.id}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{inv.soRef}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">{inv.customerName}</td>
                      <td className="py-3.5 px-4 text-slate-400">{inv.dueDate}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-100 font-mono">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-emerald-400">
                        {formatCurrency(inv.balance)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : inv.status === 'Partially Paid'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[10px] bg-slate-950 text-indigo-300 px-2 py-0.5 rounded border border-slate-800">
                          {inv.journalEntryId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedInvoiceForPrint(inv)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
                            title="Print / View Invoice PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {inv.balance > 0 ? (
                            <button
                              onClick={() => {
                                setPaymentTargetDoc({ ...inv, type: 'Customer Invoice' });
                                setShowPaymentModal(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-2.5 py-1 rounded-lg text-xs transition-colors shadow-sm"
                            >
                              Receive Payment
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-400">Fully Paid</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SALES ORDERS STREAM */}
      {/* ========================================================= */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Sales Order Flow:</strong> Create SO (validates stock availability) → Click <strong>Deliver Goods</strong> (decrements stock) → Convert to <strong>Customer Invoice</strong> (posts automatic double-entry journal).
              </span>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">SO #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Ordered Items</th>
                    <th className="py-3 px-4">Total (incl. GST)</th>
                    <th className="py-3 px-4">Delivery Status</th>
                    <th className="py-3 px-4">Invoice Status</th>
                    <th className="py-3 px-4 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {salesOrders.map((so) => (
                    <tr key={so.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{so.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">{so.customerName}</td>
                      <td className="py-3.5 px-4 text-slate-400">{so.date}</td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {so.items.map(i => `${i.qty}x ${i.productName}`).join(', ')}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-100 font-mono">
                        {formatCurrency(so.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        {so.delivered ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Stock Dispatched</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                            Awaiting Dispatch
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            so.status === 'Invoiced'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {so.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {!so.delivered && (
                            <button
                              onClick={() => deliverGoodsSO(so.id)}
                              className="inline-flex items-center space-x-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                            >
                              <Truck className="w-3 h-3" />
                              <span>Deliver Goods</span>
                            </button>
                          )}

                          {so.status !== 'Invoiced' ? (
                            <button
                              onClick={() => convertSOToCustomerInvoice(so.id)}
                              className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-md transition-all"
                            >
                              <span>Generate Invoice</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                              Inv: {so.invoiceId}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE SALES ORDER */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-100">Create Sales Order (SO)</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-medium flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSO} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Select Customer *</label>
                  <select
                    required
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-emerald-500 outline-none"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customersList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.address?.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Analytic Income Center</label>
                  <select
                    value={analyticAccountId}
                    onChange={(e) => setAnalyticAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-emerald-500 outline-none"
                  >
                    {analyticAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Order Date</label>
                  <input
                    type="date"
                    value={soDate}
                    onChange={(e) => setSoDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Sales Order Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItemLine}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => {
                    const selectedPrd = products.find(p => p.id === item.productId);
                    const stockNotice = selectedPrd && selectedPrd.type === 'Goods' ? `(Avail: ${selectedPrd.stock})` : '';

                    return (
                      <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 items-center">
                        <div className="col-span-4">
                          <label className="block text-[10px] text-slate-500 mb-0.5">Product {stockNotice}</label>
                          <select
                            required
                            value={item.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-slate-100 text-xs"
                          >
                            <option value="">-- Choose Product --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (Price: ₹{p.salesPrice} | Stock: {p.stock})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-500 mb-0.5">Qty</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.qty}
                            onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-slate-100 text-xs font-mono font-bold"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-500 mb-0.5">Unit Price (₹)</label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-slate-100 text-xs font-mono"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-500 mb-0.5">GST %</label>
                          <select
                            value={item.taxPercent}
                            onChange={(e) => handleItemChange(idx, 'taxPercent', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-slate-100 text-xs"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18% (Standard)</option>
                            <option value="28">28%</option>
                          </select>
                        </div>

                        <div className="col-span-1 text-right">
                          <label className="block text-[10px] text-slate-500 mb-0.5">Total</label>
                          <span className="font-mono font-bold text-slate-100 block py-1">
                            {formatCurrency(item.total)}
                          </span>
                        </div>

                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemLine(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Bar */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div className="space-y-0.5 text-slate-400">
                  <div>Subtotal: <strong className="text-slate-200">{formatCurrency(soSubtotal)}</strong></div>
                  <div>GST Tax Amount: <strong className="text-slate-200">{formatCurrency(soTaxTotal)}</strong></div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block font-medium">Grand Total</span>
                  <span className="font-extrabold text-emerald-400 text-lg font-mono">
                    {formatCurrency(soGrandTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-600/25"
                >
                  Confirm & Post Sales Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CUSTOMER INVOICE PRINT / PDF MODAL */}
      {/* ========================================================= */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 printable-document">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                    UF
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Urban Furniture Ltd.</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">GSTIN: 27AABCU1234F1Z8 | CIN: U36100MH2024PTC123456</p>
                <p className="text-xs text-slate-500">Bhiwandi Furniture Park, Mumbai, Maharashtra - 421302</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-full uppercase">
                  Tax Invoice
                </span>
                <h3 className="text-lg font-mono font-extrabold text-indigo-700 mt-2">{selectedInvoiceForPrint.id}</h3>
                <p className="text-xs text-slate-500">Date: {selectedInvoiceForPrint.date}</p>
                <p className="text-xs text-slate-500">Due: {selectedInvoiceForPrint.dueDate}</p>
              </div>
            </div>

            {/* Bill to */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Billed To:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedInvoiceForPrint.customerName}</p>
                <p className="text-slate-600 mt-0.5">{selectedInvoiceForPrint.customerAddress}</p>
                <p className="text-slate-600">{selectedInvoiceForPrint.customerEmail}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Payment Status:</span>
                <p className="mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      selectedInvoiceForPrint.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedInvoiceForPrint.status}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 mt-2 font-mono">
                  Linked SO: {selectedInvoiceForPrint.soRef}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-600 font-bold">
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Price (₹)</th>
                  <th className="py-2.5 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedInvoiceForPrint.items?.map((item, i) => (
                  <tr key={i}>
                    <td className="py-3 font-semibold text-slate-800">{item.productName}</td>
                    <td className="py-3 text-center font-mono">{item.qty}</td>
                    <td className="py-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-right font-mono font-bold">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">{formatCurrency(selectedInvoiceForPrint.subtotal || selectedInvoiceForPrint.totalAmount)}</span>
                </div>
                {selectedInvoiceForPrint.tax > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18%):</span>
                    <span className="font-mono font-bold">{formatCurrency(selectedInvoiceForPrint.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="font-mono text-emerald-700">{formatCurrency(selectedInvoiceForPrint.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Paid Amount:</span>
                  <span className="font-mono font-bold text-emerald-600">{formatCurrency(selectedInvoiceForPrint.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Outstanding Balance:</span>
                  <span className="font-mono">{formatCurrency(selectedInvoiceForPrint.balance)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 no-print">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tax Invoice (PDF)</span>
              </button>

              <button
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
