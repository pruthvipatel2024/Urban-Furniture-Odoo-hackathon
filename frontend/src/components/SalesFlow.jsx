import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import StoreInvoiceModal from './StoreInvoiceModal';
import {
  TrendingUp,
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  X,
  Printer,
  Eye,
  FileCheck,
  Package
} from 'lucide-react';

export default function SalesFlow({ showCreateModal = false, setShowCreateModal }) {
  const {
    salesOrders,
    invoices,
    contacts,
    products,
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
  const [soDate, setSoDate] = useState(new Date().toISOString().split('T')[0]);
  const [soNotes, setSoNotes] = useState('');
  const [items, setItems] = useState([
    { productId: '', qty: 1, unitPrice: 0, taxPercent: 18, total: 0 }
  ]);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customersList = contacts.filter(c => c.type === 'Customer' || c.type === 'Both');

  // Dynamic Line Item Handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'productId') {
      const prd = products.find(p => p.id === value || p.backendId === Number(value));
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

  const handleSubmitSO = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!customerId) {
      setFormError('Please select a customer.');
      return;
    }

    const validItems = items.filter(i => i.productId && Number(i.qty) > 0);
    if (validItems.length === 0) {
      setFormError('Please select at least one valid product with quantity > 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSalesOrder({
        customerId,
        date: soDate,
        notes: soNotes,
        items: validItems
      });

      setShowCreateModal(false);
      setCustomerId('');
      setItems([{ productId: '', qty: 1, unitPrice: 0, taxPercent: 18, total: 0 }]);
      setActiveSubTab('orders');
    } catch (err) {
      setFormError(err.message || 'Failed to create sales order.');
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
            onClick={() => setActiveSubTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'invoices'
                ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Customer Invoices</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
              {invoices.length}
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
            <TrendingUp className="w-4 h-4" />
            <span>Sales Orders</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
              {salesOrders.length}
            </span>
          </button>
        </div>

        {userRole !== 'Contact' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs border border-[#9BD5FF]/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Sales Order</span>
          </button>
        )}
      </div>

      {/* VIEW 1: CUSTOMER INVOICES */}
      {activeSubTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Customer Invoices Register</h3>
              <p className="text-xs text-slate-500">Invoices billed to clients with double-entry general ledger posting</p>
            </div>
          </div>

          {invoices.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No invoices recorded yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create a sales order and generate an invoice to start billing your customers.
              </p>
              {userRole !== 'Contact' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-[#C6E7FF] hover:bg-[#9BD5FF] text-slate-900 font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Sales Order</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#FBFBFB] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Invoice Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#D4F6FF]/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{inv.id}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{inv.customerName}</p>
                        <p className="text-[11px] text-slate-400">{inv.customerEmail}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{inv.date}</td>
                      <td className="py-3.5 px-4 text-slate-600">{inv.dueDate}</td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-[#145B9D]">
                        {formatCurrency(inv.balance)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : inv.status === 'Partially Paid'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedInvoiceForPrint(inv)}
                            title="View & Print Official Invoice"
                            className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {inv.balance > 0 && (
                            <button
                              onClick={() => {
                                setPaymentTargetDoc(inv);
                                setShowPaymentModal(true);
                              }}
                              className="px-2.5 py-1 bg-[#C6E7FF] hover:bg-[#9BD5FF] text-slate-900 font-bold text-[11px] rounded-lg transition-colors border border-[#9BD5FF]/40 cursor-pointer flex items-center space-x-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Pay Now</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SALES ORDERS */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Sales Orders Register</h3>
              <p className="text-xs text-slate-500">Confirmed customer orders with inventory reservation and delivery processing</p>
            </div>
          </div>

          {salesOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <TrendingUp className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No sales orders created yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create a new sales order to begin fulfilling customer orders.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#FBFBFB] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">SO #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Order Date</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesOrders.map((so) => {
                    const isDelivered = so.delivered || so.status === 'Invoiced';
                    const isInvoiced = invoices.some(i => i.id.includes(String(so.backendId)) || (i.salesOrder && i.salesOrder.id === so.backendId));

                    return (
                      <tr key={so.id} className="hover:bg-[#D4F6FF]/20 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{so.id}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{so.customerName}</td>
                        <td className="py-3.5 px-4 text-slate-600">{so.date}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {so.items?.map(i => `${i.productName} (x${i.qty})`).join(', ') || 'General Items'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900">
                          {formatCurrency(so.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            so.status === 'Invoiced'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {so.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Step 1: Deliver Goods */}
                            {!isDelivered && (
                              <button
                                onClick={() => deliverGoodsSO(so.id)}
                                className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] rounded-lg border border-amber-200 transition-colors cursor-pointer flex items-center space-x-1"
                              >
                                <Truck className="w-3 h-3" />
                                <span>Confirm Delivery</span>
                              </button>
                            )}

                            {/* Step 2: Generate Invoice */}
                            {!isInvoiced && (
                              <button
                                onClick={() => convertSOToCustomerInvoice(so.id)}
                                className="px-3 py-1 bg-[#C6E7FF] hover:bg-[#9BD5FF] text-slate-900 font-bold text-[11px] rounded-lg border border-[#9BD5FF]/40 transition-colors cursor-pointer flex items-center space-x-1"
                              >
                                <FileCheck className="w-3 h-3" />
                                <span>Generate Invoice</span>
                              </button>
                            )}

                            {isInvoiced && (
                              <span className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Invoiced</span>
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

      {/* CREATE SALES ORDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#C6E7FF] text-slate-900">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-display">Create Sales Order</h3>
                  <p className="text-[11px] text-slate-500">Record customer order and generate sales quotation</p>
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

            <form onSubmit={handleSubmitSO} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Customer Dropdown (No default selection) */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Customer *</label>
                  <select
                    required
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#3095EB]"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customersList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email || c.mobile || 'Customer'})
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
                    value={soDate}
                    onChange={(e) => setSoDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#3095EB]"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Order Line Items *</label>
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
                              {p.name} (Stock: {p.stock}, ₹{p.salesPrice})
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

                      {/* Unit Price */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          placeholder="Price"
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
                <span className="font-semibold text-slate-700">Order Grand Total:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{formatCurrency(soGrandTotal)}</span>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Order Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Delivery requested by next Tuesday"
                  value={soNotes}
                  onChange={(e) => setSoNotes(e.target.value)}
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
                  {isSubmitting ? 'Creating Order...' : 'Confirm Sales Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE STORE INVOICE MODAL */}
      {selectedInvoiceForPrint && (
        <StoreInvoiceModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
