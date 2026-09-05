import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  ShoppingCart,
  FileText,
  Plus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  CreditCard,
  Building2,
  BookOpen,
  X,
  Eye,
  Calendar,
  Layers
} from 'lucide-react';

export default function PurchaseFlow({ showCreateModal = false, setShowCreateModal }) {
  const {
    purchaseOrders,
    vendorBills,
    contacts,
    products,
    analyticAccounts,
    createPurchaseOrder,
    receiveGoodsPO,
    convertPOToVendorBill,
    setPaymentTargetDoc,
    setShowPaymentModal,
    formatCurrency,
    userRole
  } = useAccounting();

  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders' | 'bills'
  const [selectedBillForView, setSelectedBillForView] = useState(null);

  // PO Creation Form State
  const [vendorId, setVendorId] = useState('');
  const [analyticAccountId, setAnalyticAccountId] = useState('ANA-02');
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [poNotes, setPoNotes] = useState('');
  const [items, setItems] = useState([
    { productId: '', qty: 1, unitPrice: 0, taxPercent: 0, total: 0 }
  ]);
  const [formError, setFormError] = useState('');

  const vendorsList = contacts.filter(c => c.type === 'Vendor' || c.type === 'Both');

  // Dynamic Row Item Handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'productId') {
      const prd = products.find(p => p.id === value);
      if (prd) {
        updated[index].unitPrice = prd.costPrice || prd.salesPrice;
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
    setItems([...items, { productId: '', qty: 1, unitPrice: 0, taxPercent: 0, total: 0 }]);
  };

  const handleRemoveItemLine = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const poSubtotal = items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.unitPrice || 0)), 0);
  const poGrandTotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmitPO = (e) => {
    e.preventDefault();
    setFormError('');

    if (!vendorId) {
      setFormError('Please select a vendor.');
      return;
    }

    const validItems = items.filter(i => i.productId && i.qty > 0);
    if (validItems.length === 0) {
      setFormError('Please add at least one product with quantity > 0.');
      return;
    }

    try {
      createPurchaseOrder({
        vendorId,
        analyticAccountId,
        date: poDate,
        notes: poNotes,
        items: validItems
      });

      if (setShowCreateModal) setShowCreateModal(false);
      setVendorId('');
      setItems([{ productId: '', qty: 1, unitPrice: 0, taxPercent: 0, total: 0 }]);
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
            onClick={() => setActiveSubTab('orders')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'orders'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Purchase Orders ({purchaseOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bills')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'bills'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Vendor Bills ({vendorBills.length})</span>
          </button>
        </div>

        {userRole !== 'Contact' && (
          <button
            onClick={() => setShowCreateModal && setShowCreateModal(true)}
            className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-amber-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Purchase Order</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. PURCHASE ORDERS STREAM */}
      {/* ========================================================= */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <PackageCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Purchase Order Flow:</strong> Create PO → Click <strong>Receive Goods</strong> (increases inventory) → Convert to <strong>Vendor Bill</strong> (posts automatic double-entry journal).
              </span>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">PO #</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Ordered Items</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Goods Status</th>
                    <th className="py-3 px-4">Billing Status</th>
                    <th className="py-3 px-4 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{po.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">{po.vendorName}</td>
                      <td className="py-3.5 px-4 text-slate-400">{po.date}</td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {po.items.map(i => `${i.qty}x ${i.productName}`).join(', ')}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-100 font-mono">
                        {formatCurrency(po.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        {po.goodsReceived ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Stock In (+Units)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                            Pending Receipt
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            po.status === 'Billed'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {!po.goodsReceived && (
                            <button
                              onClick={() => receiveGoodsPO(po.id)}
                              className="inline-flex items-center space-x-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                            >
                              <PackageCheck className="w-3 h-3" />
                              <span>Receive Goods</span>
                            </button>
                          )}

                          {po.status !== 'Billed' ? (
                            <button
                              onClick={() => convertPOToVendorBill(po.id)}
                              className="inline-flex items-center space-x-1 bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow-md transition-all"
                            >
                              <span>Convert to Bill</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                              Bill: {po.billId}
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
      {/* 2. VENDOR BILLS STREAM WITH AUTOMATIC DOUBLE-ENTRY BADGES */}
      {/* ========================================================= */}
      {activeSubTab === 'bills' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between text-xs text-slate-300 border border-amber-500/20">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-100">Automatic Double-Entry Posting for Vendor Bills:</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Vendor Bill creation posts <code className="text-emerald-400 font-mono">Debit: Purchase Expense (COGS)</code> and <code className="text-indigo-400 font-mono">Credit: Accounts Payable (Creditors)</code>.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Bill #</th>
                    <th className="py-3 px-4">PO Reference</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Outstanding Bal</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Journal Entry</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {vendorBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{bill.id}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{bill.poRef}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">{bill.vendorName}</td>
                      <td className="py-3.5 px-4 text-slate-400">{bill.dueDate}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-100 font-mono">
                        {formatCurrency(bill.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 font-bold font-mono text-amber-400">
                        {formatCurrency(bill.balance)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            bill.status === 'Paid'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : bill.status === 'Partially Paid'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {bill.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[10px] bg-slate-950 text-indigo-300 px-2 py-0.5 rounded border border-slate-800">
                          {bill.journalEntryId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedBillForView(bill)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
                            title="Inspect Bill & Double Entry"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {bill.balance > 0 && userRole !== 'Contact' ? (
                            <button
                              onClick={() => {
                                setPaymentTargetDoc({ ...bill, type: 'Vendor Bill' });
                                setShowPaymentModal(true);
                              }}
                              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-2.5 py-1 rounded-lg text-xs transition-colors shadow-sm"
                            >
                              Pay Bill
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-400">Settled</span>
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
      {/* MODAL: CREATE PURCHASE ORDER */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-100">Create Purchase Order (PO)</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPO} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Select Vendor *</label>
                  <select
                    required
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-amber-500 outline-none"
                  >
                    <option value="">-- Choose Vendor --</option>
                    {vendorsList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.address?.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Analytic Cost Center</label>
                  <select
                    value={analyticAccountId}
                    onChange={(e) => setAnalyticAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-amber-500 outline-none"
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
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Purchase Order Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItemLine}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 items-center">
                      <div className="col-span-5">
                        <label className="block text-[10px] text-slate-500 mb-0.5">Product</label>
                        <select
                          required
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-slate-100 text-xs"
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Cost: ₹{p.costPrice})
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
                        <label className="block text-[10px] text-slate-500 mb-0.5">Unit Cost (₹)</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-900 rounded-lg border border-slate-700 text-slate-100 text-xs font-mono"
                        />
                      </div>

                      <div className="col-span-2 text-right">
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
                  ))}
                </div>
              </div>

              {/* Summary Bar */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="font-semibold text-slate-400">Grand Total Amount:</span>
                <span className="font-extrabold text-amber-400 text-lg font-mono">
                  {formatCurrency(poGrandTotal)}
                </span>
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-600/25"
                >
                  Confirm & Post Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VENDOR BILL INSPECTION MODAL */}
      {/* ========================================================= */}
      {selectedBillForView && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-white p-0.5 border border-teak-500/40 shrink-0">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100 font-display">Vendor Bill {selectedBillForView.id}</h3>
                  <p className="text-[10px] text-slate-400">Urban Furniture Accounting Ledger</p>
                </div>
              </div>
              <button onClick={() => setSelectedBillForView(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500">Vendor:</span>
                  <p className="font-bold text-slate-200">{selectedBillForView.vendorName}</p>
                </div>
                <div>
                  <span className="text-slate-500">Due Date:</span>
                  <p className="font-bold text-slate-200">{selectedBillForView.dueDate}</p>
                </div>
                <div>
                  <span className="text-slate-500">Total Billed:</span>
                  <p className="font-extrabold text-amber-400">{formatCurrency(selectedBillForView.totalAmount)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Balance:</span>
                  <p className="font-extrabold text-rose-400">{formatCurrency(selectedBillForView.balance)}</p>
                </div>
              </div>

              {/* Double entry breakdown */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/50 space-y-2">
                <span className="font-bold text-indigo-300 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Double-Entry Posting ({selectedBillForView.journalEntryId})</span>
                </span>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-emerald-400">
                    <span>Dr. Purchase Expense (COGS)</span>
                    <span>{formatCurrency(selectedBillForView.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-indigo-400 pl-4">
                    <span>Cr. Accounts Payable (Creditors)</span>
                    <span>{formatCurrency(selectedBillForView.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBillForView(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium text-xs"
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
