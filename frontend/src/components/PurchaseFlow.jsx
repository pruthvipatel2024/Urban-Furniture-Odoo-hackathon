import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  ShoppingCart,
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  CreditCard,
  X,
  FileCheck
} from 'lucide-react';

export default function PurchaseFlow({ showCreateModal = false, setShowCreateModal }) {
  const {
    purchaseOrders,
    vendorBills,
    contacts,
    products,
    createPurchaseOrder,
    receiveGoodsPO,
    convertPOToVendorBill,
    setPaymentTargetDoc,
    setShowPaymentModal,
    formatCurrency,
    userRole
  } = useAccounting();

  const [activeSubTab, setActiveSubTab] = useState('bills'); // 'orders' | 'bills'

  // PO Creation Form State
  const [vendorId, setVendorId] = useState('');
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [poNotes, setPoNotes] = useState('');
  const [items, setItems] = useState([
    { productId: '', qty: 1, unitPrice: 0, total: 0 }
  ]);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vendorsList = contacts.filter(c => c.type === 'Vendor' || c.type === 'Both');

  // Dynamic Line Item Handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'productId') {
      const prd = products.find(p => p.id === value || p.backendId === Number(value));
      if (prd) {
        updated[index].unitPrice = prd.costPrice;
      }
    }

    const qty = Number(updated[index].qty || 0);
    const unitPrice = Number(updated[index].unitPrice || 0);
    updated[index].total = qty * unitPrice;

    setItems(updated);
  };

  const handleAddItemLine = () => {
    setItems([...items, { productId: '', qty: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItemLine = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const poGrandTotal = items.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.unitPrice || 0)), 0);

  const handleSubmitPO = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!vendorId) {
      setFormError('Please select a vendor.');
      return;
    }

    const validItems = items.filter(i => i.productId && Number(i.qty) > 0);
    if (validItems.length === 0) {
      setFormError('Please select at least one valid product with quantity > 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPurchaseOrder({
        vendorId,
        date: poDate,
        notes: poNotes,
        items: validItems
      });

      setShowCreateModal(false);
      setVendorId('');
      setItems([{ productId: '', qty: 1, unitPrice: 0, total: 0 }]);
      setActiveSubTab('orders');
    } catch (err) {
      setFormError(err.message || 'Failed to create purchase order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Tabs & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('bills')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'bills'
                ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Vendor Bills</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
              {vendorBills.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'orders'
                ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Purchase Orders</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
              {purchaseOrders.length}
            </span>
          </button>
        </div>

        {userRole !== 'Contact' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs border border-[#9BD5FF]/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase Order</span>
          </button>
        )}
      </div>

      {/* VIEW 1: VENDOR BILLS */}
      {activeSubTab === 'bills' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Vendor Bills Register</h3>
              <p className="text-xs text-slate-500">Procurement bills from suppliers with double-entry general ledger posting</p>
            </div>
          </div>

          {vendorBills.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No vendor bills recorded yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create a purchase order and generate a vendor bill to manage payables.
              </p>
              {userRole !== 'Contact' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-[#C6E7FF] hover:bg-[#9BD5FF] text-slate-900 font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Purchase Order</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#FBFBFB] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Bill #</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Bill Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vendorBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-[#D4F6FF]/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{bill.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{bill.vendorName}</td>
                      <td className="py-3.5 px-4 text-slate-600">{bill.date}</td>
                      <td className="py-3.5 px-4 text-slate-600">{bill.dueDate}</td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900">
                        {formatCurrency(bill.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-rose-700">
                        {formatCurrency(bill.balance)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          bill.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : bill.status === 'Partially Paid'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {bill.balance > 0 && (
                          <button
                            onClick={() => {
                              setPaymentTargetDoc(bill);
                              setShowPaymentModal(true);
                            }}
                            className="px-2.5 py-1 bg-[#C6E7FF] hover:bg-[#9BD5FF] text-slate-900 font-bold text-[11px] rounded-lg transition-colors border border-[#9BD5FF]/40 cursor-pointer inline-flex items-center space-x-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Pay Vendor</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PURCHASE ORDERS */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Purchase Orders Register</h3>
              <p className="text-xs text-slate-500">Procurement orders sent to suppliers with goods receipt and stock increment processing</p>
            </div>
          </div>

          {purchaseOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No purchase orders created yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create a new purchase order to procure stock from vendors.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#FBFBFB] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">PO #</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Order Date</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseOrders.map((po) => {
                    const isReceived = po.goodsReceived || po.status === 'Billed';
                    const isBilled = vendorBills.some(b => b.id.includes(String(po.backendId)) || (b.purchaseOrder && b.purchaseOrder.id === po.backendId));

                    return (
                      <tr key={po.id} className="hover:bg-[#D4F6FF]/20 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{po.id}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{po.vendorName}</td>
                        <td className="py-3.5 px-4 text-slate-600">{po.date}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {po.items?.map(i => `${i.productName} (x${i.qty})`).join(', ') || 'Raw Materials'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900">
                          {formatCurrency(po.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            po.status === 'Billed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {po.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Step 1: Receive Goods */}
                            {!isReceived && (
                              <button
                                onClick={() => receiveGoodsPO(po.id)}
                                className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] rounded-lg border border-amber-200 transition-colors cursor-pointer flex items-center space-x-1"
                              >
                                <PackageCheck className="w-3 h-3" />
                                <span>Receive Goods</span>
                              </button>
                            )}

                            {/* Step 2: Generate Vendor Bill */}
                            {!isBilled && (
                              <button
                                onClick={() => convertPOToVendorBill(po.id)}
                                className="px-3 py-1 bg-[#C6E7FF] hover:bg-[#9BD5FF] text-slate-900 font-bold text-[11px] rounded-lg border border-[#9BD5FF]/40 transition-colors cursor-pointer flex items-center space-x-1"
                              >
                                <FileCheck className="w-3 h-3" />
                                <span>Generate Bill</span>
                              </button>
                            )}

                            {isBilled && (
                              <span className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Billed</span>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE PURCHASE ORDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#C6E7FF] text-slate-900">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-display">Create Purchase Order</h3>
                  <p className="text-[11px] text-slate-500">Record supplier procurement and receive stock</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPO} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Vendor Dropdown (No default selection) */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Vendor *</label>
                  <select
                    required
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#3095EB]"
                  >
                    <option value="">-- Choose Vendor --</option>
                    {vendorsList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.email || v.mobile || 'Vendor'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Date */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Order Date *</label>
                  <input
                    type="date"
                    required
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#3095EB]"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Procurement Items *</label>
                  <button
                    type="button"
                    onClick={handleAddItemLine}
                    className="text-[11px] font-bold text-[#1B76C7] hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-[#FBFBFB] p-2.5 rounded-xl border border-slate-200">
                      {/* Product Selector */}
                      <div className="col-span-5">
                        <select
                          required
                          value={item.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 text-xs outline-none"
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Current: {p.stock}, Cost: ₹{p.costPrice})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="Qty"
                          value={item.qty}
                          onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 text-xs text-center outline-none"
                        />
                      </div>

                      {/* Unit Cost */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          placeholder="Cost"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-800 text-xs text-right font-mono outline-none"
                        />
                      </div>

                      {/* Line Total */}
                      <div className="col-span-2 text-right font-mono font-bold text-slate-800 text-xs">
                        {formatCurrency(item.total)}
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-1 text-right">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemLine(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Calculations */}
              <div className="p-3 bg-[#D4F6FF]/30 rounded-xl border border-[#C6E7FF] flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">Purchase Order Total:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{formatCurrency(poGrandTotal)}</span>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Procurement Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Supplier quotation ref #SQ-8812"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 rounded-xl font-bold border border-[#9BD5FF]/40 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Order...' : 'Confirm Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
