import React, { useState } from 'react';
import { 
  TrendingUp, 
  FileText, 
  Plus, 
  Trash2, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  Receipt
} from 'lucide-react';

export default function SalesFlow({
  salesOrders,
  setSalesOrders,
  invoices,
  setInvoices,
  contacts,
  products,
  addJournalEntry,
  onOpenPaymentModal,
  showCreateModal,
  setShowCreateModal
}) {
  const [activeSubTab, setActiveSubTab] = useState('invoices'); // 'orders' | 'invoices'

  // New Invoice Form State
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([
    { productId: '', qty: 1, unitPrice: 0, total: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(18); // 18% GST standard

  const customersList = contacts.filter(c => c.type === 'Customer' || c.type === 'Both');

  // Item Line handler
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
    const price = Number(updated[index].unitPrice || 0);
    updated[index].total = qty * price;

    setItems(updated);
  };

  const handleAddItemLine = () => {
    setItems([...items, { productId: '', qty: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItemLine = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  // Submit Invoice directly
  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!customerId || grandTotal <= 0) return;

    const customer = contacts.find(c => c.id === customerId);
    const invId = `INV-2024-00${invoices.length + 1}`;
    const jeId = `JE-INV-00${invoices.length + 1}`;

    const newInvoice = {
      id: invId,
      soRef: `SO-2024-00${salesOrders.length + 1}`,
      customerId,
      customerName: customer ? customer.name : 'Direct Customer',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal,
      tax: taxAmount,
      totalAmount: grandTotal,
      paidAmount: 0,
      balance: grandTotal,
      status: 'Unpaid',
      journalEntryId: jeId
    };

    // Auto-generate Double Entry Journal:
    // Debit: Accounts Receivable (Debtors)
    // Credit: Sale Income
    const journalEntry = {
      id: jeId,
      date: newInvoice.date,
      reference: `${invId} (${newInvoice.customerName})`,
      journalType: 'Sales',
      lines: [
        { account: 'Accounts Receivable (Debtors)', debit: grandTotal, credit: 0 },
        { account: 'Sale Income', debit: 0, credit: grandTotal }
      ]
    };

    setInvoices([newInvoice, ...invoices]);
    addJournalEntry(journalEntry, 'Accounts Receivable (Debtors)', 'Sale Income', grandTotal);

    setShowCreateModal(false);
    setCustomerId('');
    setItems([{ productId: '', qty: 1, unitPrice: 0, total: 0 }]);
    setActiveSubTab('invoices');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all
              ${activeSubTab === 'invoices' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                : 'text-slate-600 hover:bg-slate-100'
              }
            `}
          >
            <Receipt className="w-4 h-4" />
            <span>Customer Invoices ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all
              ${activeSubTab === 'orders' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                : 'text-slate-600 hover:bg-slate-100'
              }
            `}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sales Orders ({salesOrders.length})</span>
          </button>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Invoice</span>
        </button>
      </div>

      {/* 1. CUSTOMER INVOICES TABLE WITH DOUBLE ENTRY BADGE */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start space-x-3">
            <BookOpen className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Automated Double-Entry Rules for Sales Invoices:</span>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Generating a Sales Invoice posts to the Ledger: <strong className="font-mono">Debit: Accounts Receivable (Debtors)</strong> & <strong className="font-mono">Credit: Sale Income</strong>.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">SO Ref</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Outstanding</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Journal Entry Log</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{inv.id}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{inv.soRef}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{inv.customerName}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">{formatCurrency(inv.balance)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`
                        px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${inv.status === 'Partially Paid' ? 'bg-amber-100 text-amber-700' : ''}
                        ${inv.status === 'Unpaid' ? 'bg-rose-100 text-rose-700' : ''}
                      `}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        <span>{inv.journalEntryId}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {inv.balance > 0 ? (
                        <button
                          onClick={() => onOpenPaymentModal(inv, 'Customer Invoice')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded-lg text-xs transition-colors shadow-sm"
                        >
                          Receive Payment
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600">Fully Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. SALES ORDERS LIST */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <th className="py-3.5 px-4">SO Number</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Linked Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesOrders.map((so) => (
                <tr key={so.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{so.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{so.customerName}</td>
                  <td className="py-3.5 px-4 text-slate-500">{so.date}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">{formatCurrency(so.totalAmount)}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                      {so.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {so.invoiceId || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create New Customer Invoice</h3>
              <span className="text-xs text-emerald-600 bg-emerald-50 font-semibold px-2.5 py-0.5 rounded-full">New Sale</span>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Select Customer *</label>
                <select
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">-- Choose Customer --</option>
                  {customersList.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Line Items */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-semibold">Sales Items</label>
                
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="col-span-5">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="">-- Select Furniture Product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (₹{p.salesPrice})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-center"
                        placeholder="Qty"
                      />
                    </div>

                    <div className="col-span-2 text-right font-medium">
                      ₹{item.unitPrice}
                    </div>

                    <div className="col-span-2 text-right font-extrabold text-slate-900">
                      ₹{item.total}
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItemLine(index)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddItemLine}
                  className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 flex items-center space-x-1 pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              {/* Tax & Total */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-200">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>GST Tax (18%):</span>
                  <span className="font-semibold text-slate-200">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                  <span>Grand Total Amount:</span>
                  <span className="text-xl font-extrabold text-emerald-400">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md"
                >
                  Issue Invoice & Post Journal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
