import React, { useState } from 'react';
import { 
  ShoppingCart, 
  FileText, 
  Plus, 
  Trash2, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  FileCheck,
  ChevronRight,
  BookOpen
} from 'lucide-react';

export default function PurchaseFlow({
  purchaseOrders,
  setPurchaseOrders,
  vendorBills,
  setVendorBills,
  contacts,
  products,
  addJournalEntry,
  onOpenPaymentModal,
  showCreateModal,
  setShowCreateModal
}) {
  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders' | 'bills'

  // New PO State
  const [vendorId, setVendorId] = useState('');
  const [poItems, setPoItems] = useState([
    { productId: '', qty: 1, unitPrice: 0, total: 0 }
  ]);

  const vendorsList = contacts.filter(c => c.type === 'Vendor' || c.type === 'Both');

  // Item lines calculation
  const handleItemChange = (index, field, value) => {
    const updated = [...poItems];
    updated[index][field] = value;

    if (field === 'productId') {
      const prd = products.find(p => p.id === value);
      if (prd) {
        updated[index].unitPrice = prd.costPrice || prd.salesPrice;
      }
    }

    const qty = Number(updated[index].qty || 0);
    const unitPrice = Number(updated[index].unitPrice || 0);
    updated[index].total = qty * unitPrice;

    setPoItems(updated);
  };

  const handleAddItemLine = () => {
    setPoItems([...poItems, { productId: '', qty: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItemLine = (index) => {
    if (poItems.length === 1) return;
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const poTotalAmount = poItems.reduce((sum, item) => sum + item.total, 0);

  // Submit PO
  const handleCreatePO = (e) => {
    e.preventDefault();
    if (!vendorId || poTotalAmount <= 0) return;

    const vendor = contacts.find(c => c.id === vendorId);
    const newPO = {
      id: `PO-2024-00${purchaseOrders.length + 1}`,
      vendorId,
      vendorName: vendor ? vendor.name : 'Unknown Vendor',
      date: new Date().toISOString().split('T')[0],
      status: 'Confirmed',
      items: poItems.map(item => ({
        ...item,
        productName: products.find(p => p.id === item.productId)?.name || 'Custom Product'
      })),
      totalAmount: poTotalAmount,
      billId: null
    };

    setPurchaseOrders([newPO, ...purchaseOrders]);
    setShowCreateModal(false);
    setVendorId('');
    setPoItems([{ productId: '', qty: 1, unitPrice: 0, total: 0 }]);
  };

  // Convert PO to Vendor Bill + Auto Double-Entry Journal Entry
  const handleConvertToBill = (po) => {
    if (po.billId) return;

    const billId = `BILL-2024-00${vendorBills.length + 1}`;
    const jeId = `JE-BILL-00${vendorBills.length + 1}`;

    const newBill = {
      id: billId,
      poRef: po.id,
      vendorId: po.vendorId,
      vendorName: po.vendorName,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalAmount: po.totalAmount,
      paidAmount: 0,
      balance: po.totalAmount,
      status: 'Unpaid',
      journalEntryId: jeId
    };

    // Auto-generate Double Entry Journal:
    // Debit: Purchase Expense (COGS)
    // Credit: Accounts Payable (Creditors)
    const journalEntry = {
      id: jeId,
      date: newBill.date,
      reference: `${billId} (${po.vendorName})`,
      journalType: 'Purchase',
      lines: [
        { account: 'Purchase Expense (COGS)', debit: po.totalAmount, credit: 0 },
        { account: 'Accounts Payable (Creditors)', debit: 0, credit: po.totalAmount }
      ]
    };

    setVendorBills([newBill, ...vendorBills]);

    // Update PO status to Billed
    setPurchaseOrders(purchaseOrders.map(p => 
      p.id === po.id ? { ...p, status: 'Billed', billId } : p
    ));

    // Register Journal Entry into global state
    addJournalEntry(journalEntry, 'Purchase Expense (COGS)', 'Accounts Payable (Creditors)', po.totalAmount);

    setActiveSubTab('bills');
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
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all
              ${activeSubTab === 'orders' 
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20' 
                : 'text-slate-600 hover:bg-slate-100'
              }
            `}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Purchase Orders ({purchaseOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bills')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all
              ${activeSubTab === 'bills' 
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20' 
                : 'text-slate-600 hover:bg-slate-100'
              }
            `}
          >
            <FileText className="w-4 h-4" />
            <span>Vendor Bills ({vendorBills.length})</span>
          </button>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* 1. PURCHASE ORDERS TABLE */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <th className="py-3.5 px-4">PO Number</th>
                <th className="py-3.5 px-4">Vendor</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{po.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{po.vendorName}</td>
                  <td className="py-3.5 px-4 text-slate-500">{po.date}</td>
                  <td className="py-3.5 px-4 text-slate-600">{po.items?.length || 0} Line Items</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">{formatCurrency(po.totalAmount)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`
                      px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${po.status === 'Billed' ? 'bg-indigo-100 text-indigo-700' : ''}
                      ${po.status === 'Confirmed' ? 'bg-amber-100 text-amber-700' : ''}
                      ${po.status === 'Draft' ? 'bg-slate-100 text-slate-600' : ''}
                    `}>
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {po.status !== 'Billed' ? (
                      <button
                        onClick={() => handleConvertToBill(po)}
                        className="inline-flex items-center space-x-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
                      >
                        <span>Convert to Bill</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                        Linked: {po.billId}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. VENDOR BILLS TABLE WITH JOURNAL ENTRY BADGE */}
      {activeSubTab === 'bills' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-start space-x-3">
            <BookOpen className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Automated Double-Entry Rules for Vendor Bills:</span>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Creating a Vendor Bill automatically posts to the Accounting Ledger: <strong className="font-mono">Debit: Purchase Expense (COGS)</strong> & <strong className="font-mono">Credit: Accounts Payable (Creditors)</strong>.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3.5 px-4">Bill Number</th>
                  <th className="py-3.5 px-4">PO Ref</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Outstanding</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Journal Entry Log</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{bill.id}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{bill.poRef}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{bill.vendorName}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{formatCurrency(bill.totalAmount)}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-700">{formatCurrency(bill.balance)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`
                        px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${bill.status === 'Partially Paid' ? 'bg-amber-100 text-amber-700' : ''}
                        ${bill.status === 'Unpaid' ? 'bg-rose-100 text-rose-700' : ''}
                      `}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        <span>{bill.journalEntryId}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {bill.balance > 0 ? (
                        <button
                          onClick={() => onOpenPaymentModal(bill, 'Vendor Bill')}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-2.5 py-1 rounded-lg text-xs transition-colors shadow-sm"
                        >
                          Pay Bill
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600">Fully Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PURCHASE ORDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create New Purchase Order</h3>
              <span className="text-xs text-amber-600 bg-amber-50 font-semibold px-2.5 py-0.5 rounded-full">Draft PO</span>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Select Vendor *</label>
                <select
                  required
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- Choose Vendor --</option>
                  {vendorsList.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.city})</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Line Items */}
              <div className="space-y-2">
                <label className="block text-slate-700 font-semibold">Order Line Items</label>
                
                {poItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="col-span-5">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="">-- Product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Cost: ₹{p.costPrice})</option>
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
                  className="text-xs text-amber-600 font-semibold hover:text-amber-700 flex items-center space-x-1 pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              {/* Total Calculation Footer */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Total Purchase Amount:</span>
                <span className="text-xl font-extrabold text-amber-400">{formatCurrency(poTotalAmount)}</span>
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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow-md"
                >
                  Confirm Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
