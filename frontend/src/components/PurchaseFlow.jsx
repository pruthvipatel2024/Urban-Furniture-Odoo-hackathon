import React, { useState, useEffect } from 'react';
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
  FileCheck,
  Eye,
  ArrowLeft,
  Search,
  ExternalLink
} from 'lucide-react';

export default function PurchaseFlow({
  initialSubTab = 'bills',
  showCreateModal = false,
  setShowCreateModal
}) {
  const {
    purchaseOrders,
    vendorBills,
    payments,
    contacts,
    products,
    analyticAccounts,
    chartOfAccounts,
    createPurchaseOrder,
    confirmPurchaseOrder,
    receiveGoodsPO,
    convertPOToVendorBill,
    confirmVendorBill,
    setPaymentTargetDoc,
    setShowPaymentModal,
    formatCurrency,
    setActiveTab,
    userRole
  } = useAccounting();

  const [activeSubTab, setActiveSubTab] = useState(initialSubTab); // 'orders' | 'bills' | 'payments'
  const [selectedPOForDetail, setSelectedPOForDetail] = useState(null);
  const [selectedBillForDetail, setSelectedBillForDetail] = useState(null);
  const [isCreatingPO, setIsCreatingPO] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    if (showCreateModal) {
      setIsCreatingPO(true);
      if (setShowCreateModal) setShowCreateModal(false);
    }
  }, [showCreateModal]);

  // PO Creation Form State
  const [vendorId, setVendorId] = useState('');
  const [analyticAccountId, setAnalyticAccountId] = useState('');
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState('Immediate Payment');
  const [items, setItems] = useState([
    { productId: '', chartOfAccountId: '', analyticAccountId: '', qty: 1, unitPrice: 0, total: 0 }
  ]);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vendorsList = contacts.filter(c => c.type === 'Vendor' || c.type === 'Both');
  const expenseAccounts = chartOfAccounts.filter(a => a.type === 'Expense' || a.type === 'Other Expense' || a.type === 'Asset');

  // Vendor Payments filter
  const vendorPayments = payments.filter(p => p.type === 'Send' || p.payment_type === 'outbound' || p.amount > 0);

  // Dynamic Line Item Handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'productId') {
      const prd = products.find(p => p.id === value || p.backendId === Number(value));
      if (prd) {
        updated[index].unitPrice = prd.costPrice || prd.cost || 0;
      }
    }

    const qty = Number(updated[index].qty || 0);
    const unitPrice = Number(updated[index].unitPrice || 0);
    updated[index].total = qty * unitPrice;

    setItems(updated);
  };

  const handleAddItemLine = () => {
    setItems([...items, { productId: '', chartOfAccountId: '', analyticAccountId: '', qty: 1, unitPrice: 0, total: 0 }]);
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
      setFormError('Please select a vendor contact.');
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
        analyticAccountId: analyticAccountId || null,
        date: poDate,
        paymentTerms,
        items: validItems
      });

      setIsCreatingPO(false);
      setVendorId('');
      setAnalyticAccountId('');
      setItems([{ productId: '', chartOfAccountId: '', analyticAccountId: '', qty: 1, unitPrice: 0, total: 0 }]);
      setActiveSubTab('orders');
    } catch (err) {
      setFormError(err.message || 'Failed to create purchase order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Lists
  const filteredBills = vendorBills.filter(bill =>
    (bill.billNumber || bill.number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bill.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = purchaseOrders.filter(po =>
    (po.orderNumber || po.number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (po.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = vendorPayments.filter(pmt =>
    (pmt.number || pmt.partnerName || pmt.partner || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Purchase Dedicated Header */}
      {!isCreatingPO && !selectedPOForDetail && !selectedBillForDetail && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3E7EA] shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#EEF4F8] border border-[#E3E7EA] text-[#0B2A4A] flex items-center justify-center shadow-xs shrink-0">
              {activeSubTab === 'orders' && <ShoppingCart className="w-5 h-5 text-[#C98232]" />}
              {activeSubTab === 'bills' && <Receipt className="w-5 h-5 text-[#0B2A4A]" />}
              {activeSubTab === 'payments' && <CreditCard className="w-5 h-5 text-[#0B2A4A]" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-lg text-[#0B2A4A]">
                  {activeSubTab === 'orders' && 'Purchase Orders'}
                  {activeSubTab === 'bills' && 'Purchase Bills'}
                  {activeSubTab === 'payments' && 'Vendor Payments'}
                </h2>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#EEF4F8] text-[#0B2A4A] font-semibold border border-[#E3E7EA]">
                  {activeSubTab === 'orders' && `${purchaseOrders.length} Orders`}
                  {activeSubTab === 'bills' && `${vendorBills.length} Bills`}
                  {activeSubTab === 'payments' && `${vendorPayments.length} Payments`}
                </span>
              </div>
              <p className="text-xs text-[#667482] mt-0.5">
                {activeSubTab === 'orders' && 'Vendor quotations, purchase orders confirmation, and receipt of goods'}
                {activeSubTab === 'bills' && 'Supplier invoices, payable totals, payment due dates, and ledger recording'}
                {activeSubTab === 'payments' && 'Settled supplier payments and disbursements across Bank and Cash'}
              </p>
            </div>
          </div>

          {/* Action Button */}
          {userRole !== 'Contact' && (
            <div className="shrink-0">
              {activeSubTab === 'orders' && (
                <button
                  onClick={() => setIsCreatingPO(true)}
                  className="flex items-center space-x-1.5 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#0B2A4A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Purchase Order</span>
                </button>
              )}

              {activeSubTab === 'bills' && (
                <button
                  onClick={() => {
                    setActiveSubTab('orders');
                    setIsCreatingPO(true);
                  }}
                  className="flex items-center space-x-1.5 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#0B2A4A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Bill (via PO)</span>
                </button>
              )}

              {activeSubTab === 'payments' && (
                <button
                  onClick={() => {
                    setPaymentTargetDoc(null);
                    setShowPaymentModal(true);
                  }}
                  className="flex items-center space-x-1.5 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#0B2A4A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Payment</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PURCHASE ORDER FULL FORM VIEW (Excalidraw Specification)               */}
      {/* ========================================================================= */}
      {(isCreatingPO || selectedPOForDetail) && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden p-6 space-y-6">
          {/* Top Form Header with Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EA] pb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setIsCreatingPO(false);
                  setSelectedPOForDetail(null);
                }}
                className="p-2 text-[#667482] hover:text-[#0B2A4A] hover:bg-[#EEF4F8] rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-base font-bold text-[#0B2A4A]">
                  {isCreatingPO ? 'New Purchase Order' : `Purchase Order — ${selectedPOForDetail.orderNumber || selectedPOForDetail.number}`}
                </h3>
                <p className="text-xs text-[#667482]">
                  {isCreatingPO ? 'Enter vendor and raw materials procurement lines' : `Issued to ${selectedPOForDetail.vendorName}`}
                </p>
              </div>
            </div>

            {/* Contextual Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setIsCreatingPO(false);
                  setSelectedPOForDetail(null);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-[#E3E7EA] text-[#667482] hover:bg-[#FAFAF8] text-xs font-semibold transition-all cursor-pointer"
              >
                Back
              </button>

              {selectedPOForDetail && selectedPOForDetail.status === 'draft' && (
                <button
                  onClick={async () => {
                    await confirmPurchaseOrder(selectedPOForDetail.id);
                    setSelectedPOForDetail(prev => ({ ...prev, status: 'confirmed' }));
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#18794E] hover:bg-[#146340] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  Confirm PO
                </button>
              )}

              {selectedPOForDetail && (selectedPOForDetail.status === 'confirmed' || selectedPOForDetail.status === 'draft') && (
                <button
                  onClick={async () => {
                    await receiveGoodsPO(selectedPOForDetail.id);
                    setSelectedPOForDetail(prev => ({ ...prev, status: 'received' }));
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#EEF4F8] hover:bg-[#E2ECF2] text-[#0B2A4A] border border-[#D8E1E8] text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <PackageCheck className="w-4 h-4 text-[#C98232]" />
                  <span>Receive Goods</span>
                </button>
              )}

              {selectedPOForDetail && (selectedPOForDetail.status === 'confirmed' || selectedPOForDetail.status === 'received') && (
                <button
                  onClick={async () => {
                    await convertPOToVendorBill(selectedPOForDetail.id);
                    setSelectedPOForDetail(null);
                    setActiveSubTab('bills');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Create Bill</span>
                </button>
              )}

              {isCreatingPO && (
                <button
                  onClick={handleSubmitPO}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm'}
                </button>
              )}
            </div>
          </div>

          {formError && (
            <div className="p-3.5 bg-[#FDECEC] border border-[#B42318]/30 rounded-xl text-[#B42318] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Form Header Fields Grid */}
          {isCreatingPO ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1.5">PO No. (Auto Generated)</label>
                <input
                  type="text"
                  disabled
                  value="P0000X (Auto)"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAF8] border border-[#E3E7EA] rounded-xl text-xs text-[#8A96A3] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Vendor Name *</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
                >
                  <option value="">Select Vendor Contact</option>
                  {vendorsList.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.email || 'No email'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1.5">PO Date</label>
                <input
                  type="date"
                  value={poDate}
                  onChange={(e) => setPoDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g. Net 30, Immediate"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#FAFAF8] p-4 rounded-xl border border-[#E3E7EA] text-xs">
              <div>
                <span className="text-[#667482] font-semibold block">PO Number</span>
                <span className="font-mono font-bold text-[#0B2A4A] text-sm">{selectedPOForDetail.orderNumber || selectedPOForDetail.number}</span>
              </div>
              <div>
                <span className="text-[#667482] font-semibold block">Vendor Name</span>
                <span className="font-bold text-[#17212B]">{selectedPOForDetail.vendorName}</span>
              </div>
              <div>
                <span className="text-[#667482] font-semibold block">PO Date / Terms</span>
                <span className="text-[#667482]">{selectedPOForDetail.date} • {selectedPOForDetail.paymentTerms || 'Standard'}</span>
              </div>
              <div>
                <span className="text-[#667482] font-semibold block">Status</span>
                <span className={`inline-block mt-0.5 text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                  selectedPOForDetail.status === 'billed' ? 'bg-[#EAF7F0] text-[#18794E] border border-[#18794E]/20' :
                  selectedPOForDetail.status === 'received' ? 'bg-[#F8F0E6] text-[#C98232] border border-[#C98232]/20' :
                  selectedPOForDetail.status === 'confirmed' ? 'bg-[#EAF3F9] text-[#245B86] border border-[#245B86]/20' :
                  'bg-[#EEF4F8] text-[#667482] border border-[#E3E7EA]'
                }`}>
                  {selectedPOForDetail.status}
                </span>
              </div>
            </div>
          )}

          {/* Line Items Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#667482]">Procurement Items</h4>
            <div className="border border-[#E3E7EA] rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="p-3 w-12">Sr.</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Budget Analytics</th>
                    <th className="p-3 w-20 text-right">Qty</th>
                    <th className="p-3 w-28 text-right">Unit Price</th>
                    <th className="p-3 w-28 text-right">Total</th>
                    {isCreatingPO && <th className="p-3 w-10"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {isCreatingPO ? (
                    items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFAF8]/50">
                        <td className="p-3 text-[#8A96A3] font-mono">{idx + 1}</td>
                        <td className="p-3 min-w-[200px]">
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            className="w-full p-2 bg-white border border-[#E3E7EA] rounded-lg text-xs text-[#17212B]"
                          >
                            <option value="">Select Product / Material</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (Cost: ₹{p.costPrice || p.cost || 0})</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 min-w-[160px]">
                          <select
                            value={item.analyticAccountId}
                            onChange={(e) => handleItemChange(idx, 'analyticAccountId', e.target.value)}
                            className="w-full p-2 bg-white border border-[#E3E7EA] rounded-lg text-xs text-[#17212B]"
                          >
                            <option value="">None / Inherited</option>
                            {analyticAccounts.map(a => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                            className="w-20 p-2 bg-white border border-[#E3E7EA] rounded-lg text-xs text-right font-mono text-[#17212B]"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                            className="w-28 p-2 bg-white border border-[#E3E7EA] rounded-lg text-xs text-right font-mono text-[#17212B]"
                          />
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[#0B2A4A]">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="p-3 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItemLine(idx)}
                              className="text-[#8A96A3] hover:text-[#B42318] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    selectedPOForDetail.items && selectedPOForDetail.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFAF8]/50">
                        <td className="p-3 text-[#8A96A3] font-mono">{idx + 1}</td>
                        <td className="p-3 font-semibold text-[#17212B]">{item.productName || item.name}</td>
                        <td className="p-3 text-[#667482]">{item.analyticAccountName || 'Procurement Expense'}</td>
                        <td className="p-3 text-right font-mono text-[#667482]">{item.qty || item.quantity}</td>
                        <td className="p-3 text-right font-mono text-[#667482]">{formatCurrency(item.unitPrice || item.price)}</td>
                        <td className="p-3 text-right font-mono font-bold text-[#0B2A4A]">{formatCurrency(item.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {isCreatingPO && (
              <button
                type="button"
                onClick={handleAddItemLine}
                className="text-xs font-semibold text-[#C98232] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Material Line</span>
              </button>
            )}
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-4 border-t border-[#E3E7EA]">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-sm font-bold text-[#0B2A4A] pt-2">
                <span>Document Total:</span>
                <span className="font-mono text-[#0B2A4A]">
                  {formatCurrency(isCreatingPO ? poGrandTotal : selectedPOForDetail.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VENDOR BILL FULL FORM VIEW (Excalidraw Specification)                  */}
      {/* ========================================================================= */}
      {selectedBillForDetail && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden p-6 space-y-6">
          {/* Top Form Header with Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EA] pb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedBillForDetail(null)}
                className="p-2 text-[#667482] hover:text-[#0B2A4A] hover:bg-[#EEF4F8] rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-base font-bold text-[#0B2A4A]">
                  Vendor Bill — {selectedBillForDetail.billNumber || selectedBillForDetail.number}
                </h3>
                <p className="text-xs text-[#667482]">Payable to {selectedBillForDetail.vendorName}</p>
              </div>
            </div>

            {/* Contextual Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedBillForDetail(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#E3E7EA] text-[#667482] hover:bg-[#FAFAF8] text-xs font-semibold transition-all cursor-pointer"
              >
                Back
              </button>

              {((selectedBillForDetail.normalizedStatus || (selectedBillForDetail.status || '').toLowerCase()) === 'draft') && (
                <button
                  onClick={async () => {
                    await confirmVendorBill(selectedBillForDetail.id);
                    setSelectedBillForDetail(prev => ({ ...prev, status: 'confirmed', normalizedStatus: 'confirmed' }));
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#18794E] hover:bg-[#146340] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  Confirm Bill
                </button>
              )}

              {((selectedBillForDetail.normalizedStatus || (selectedBillForDetail.status || '').toLowerCase()) !== 'paid') && Number(selectedBillForDetail.amountDue ?? selectedBillForDetail.balance ?? 0) > 0 && (
                <button
                  onClick={() => {
                    setPaymentTargetDoc(selectedBillForDetail);
                    setShowPaymentModal(true);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Vendor Bill</span>
                </button>
              )}
            </div>
          </div>

          {/* Bill Header Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#FAFAF8] p-4 rounded-xl border border-[#E3E7EA] text-xs">
            <div>
              <span className="text-[#667482] font-semibold block">Vendor Bill No.</span>
              <span className="font-mono font-bold text-[#0B2A4A] text-sm">{selectedBillForDetail.billNumber || selectedBillForDetail.number}</span>
            </div>

            <div>
              <span className="text-[#667482] font-semibold block">Vendor Name</span>
              <span className="font-bold text-[#17212B]">{selectedBillForDetail.vendorName}</span>
            </div>

            <div>
              <span className="text-[#667482] font-semibold block">Bill Date / Due Date</span>
              <span className="text-[#17212B]">{selectedBillForDetail.date} • Due: {selectedBillForDetail.dueDate || selectedBillForDetail.date}</span>
            </div>

            <div>
              <span className="text-[#667482] font-semibold block">Created From PO</span>
              {selectedBillForDetail.createdFromPoNumber || selectedBillForDetail.purchase_order_id ? (
                <span className="inline-flex items-center space-x-1 text-[#18794E] bg-[#EAF7F0] px-2.5 py-0.5 rounded-full font-mono font-semibold text-[11px] border border-[#18794E]/20">
                  <span>PO: {selectedBillForDetail.createdFromPoNumber || `PO-${selectedBillForDetail.purchase_order_id}`}</span>
                </span>
              ) : (
                <span className="text-[#8A96A3] italic">Direct Vendor Bill</span>
              )}
            </div>
          </div>

          {/* Bill Line Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#667482]">Bill Line Items</h4>
            <div className="border border-[#E3E7EA] rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="p-3 w-12">Sr.</th>
                    <th className="p-3">Product / Material</th>
                    <th className="p-3">Chart of Account</th>
                    <th className="p-3">Budget Analytics</th>
                    <th className="p-3 w-20 text-right">Qty</th>
                    <th className="p-3 w-28 text-right">Unit Price</th>
                    <th className="p-3 w-28 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {selectedBillForDetail.items && selectedBillForDetail.items.length > 0 ? (
                    selectedBillForDetail.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFAF8]/50">
                        <td className="p-3 text-[#8A96A3] font-mono">{idx + 1}</td>
                        <td className="p-3 font-semibold text-[#17212B]">{item.productName || item.name}</td>
                        <td className="p-3 text-[#667482]">Purchase Expense</td>
                        <td className="p-3 text-[#667482]">{item.analyticAccountName || 'Procurement Expense'}</td>
                        <td className="p-3 text-right font-mono text-[#667482]">{item.qty || item.quantity}</td>
                        <td className="p-3 text-right font-mono text-[#667482]">{formatCurrency(item.unitPrice || item.price)}</td>
                        <td className="p-3 text-right font-mono font-bold text-[#0B2A4A]">{formatCurrency(item.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 text-[#8A96A3] font-mono">1</td>
                      <td className="p-3 font-semibold text-[#17212B]">Raw Timber & Materials</td>
                      <td className="p-3 text-[#667482]">Purchase Expense</td>
                      <td className="p-3 text-[#667482]">Procurement Expense</td>
                      <td className="p-3 text-right font-mono text-[#667482]">1</td>
                      <td className="p-3 text-right font-mono text-[#667482]">{formatCurrency(selectedBillForDetail.total)}</td>
                      <td className="p-3 text-right font-mono font-bold text-[#0B2A4A]">{formatCurrency(selectedBillForDetail.total)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-xl bg-[#EEF4F8] border border-[#E3E7EA] text-xs">
            <div>
              <span className="text-[#667482] font-semibold block">Total Bill Amount</span>
              <span className="text-base font-bold text-[#0B2A4A] font-mono">{formatCurrency(selectedBillForDetail.total)}</span>
            </div>
            <div>
              <span className="text-[#667482] font-semibold block">Paid Via Bank</span>
              <span className="text-base font-bold text-[#245B86] font-mono">{formatCurrency(selectedBillForDetail.paidViaBank || 0)}</span>
            </div>
            <div>
              <span className="text-[#667482] font-semibold block">Paid Via Cash</span>
              <span className="text-base font-bold text-[#18794E] font-mono">{formatCurrency(selectedBillForDetail.paidViaCash || 0)}</span>
            </div>
            <div>
              <span className="text-[#667482] font-semibold block">Amount Due</span>
              <span className="text-base font-bold text-[#B42318] font-mono">
                {formatCurrency(selectedBillForDetail.amountDue !== undefined ? selectedBillForDetail.amountDue : (selectedBillForDetail.total - (selectedBillForDetail.amountPaid || 0)))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LIST VIEWS (Vendor Bills, Purchase Orders, Payments)                   */}
      {/* ========================================================================= */}
      {!isCreatingPO && !selectedPOForDetail && !selectedBillForDetail && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-[#E3E7EA] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
              <input
                type="text"
                placeholder={
                  activeSubTab === 'orders' ? 'Search purchase orders by number, vendor...' :
                  activeSubTab === 'bills' ? 'Search purchase bills by number, vendor...' :
                  'Search vendor payments by partner or number...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FAFAF8] text-xs text-[#17212B] placeholder-[#8A96A3] border border-[#E3E7EA] rounded-xl outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
              />
            </div>
          </div>

          {/* TAB 1: PURCHASE BILLS TABLE */}
          {activeSubTab === 'bills' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="p-4">Vendor Bill No.</th>
                    <th className="p-4">Vendor Name</th>
                    <th className="p-4">Bill Reference</th>
                    <th className="p-4">Bill Date</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-right">Amount Due</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-[#8A96A3]">
                        No vendor bills found in database.
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => (
                      <tr
                        key={bill.id}
                        onClick={() => setSelectedBillForDetail(bill)}
                        className="hover:bg-[#FAFAF8] cursor-pointer transition-colors"
                      >
                        <td className="p-4 font-mono font-bold text-[#0B2A4A]">
                          {bill.billNumber || bill.number}
                        </td>
                        <td className="p-4 font-semibold text-[#17212B]">
                          {bill.vendorName}
                        </td>
                        <td className="p-4 text-[#667482]">
                          {bill.createdFromPoNumber ? `PO: ${bill.createdFromPoNumber}` : (bill.reference || 'Procurement')}
                        </td>
                        <td className="p-4 text-[#667482]">{bill.date}</td>
                        <td className="p-4 text-[#667482]">{bill.dueDate || bill.date}</td>
                        <td className="p-4 text-right font-mono font-bold text-[#17212B]">
                          {formatCurrency(bill.total)}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-[#B42318]">
                          {formatCurrency(bill.amountDue !== undefined ? bill.amountDue : (bill.total - (bill.amountPaid || 0)))}
                        </td>
                        <td className="p-4 text-center">
                          {(() => {
                            const isPaid = (bill.normalizedStatus || (bill.status || '').toLowerCase()) === 'paid' || Number(bill.amountDue ?? bill.balance ?? 0) <= 0;
                            const isPartiallyPaid = (bill.normalizedStatus || (bill.status || '').toLowerCase()) === 'partially_paid' || (Number(bill.paidAmount ?? bill.amountPaid ?? 0) > 0 && !isPaid);
                            return (
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                                isPaid ? 'bg-[#EAF7F0] text-[#18794E] border border-[#18794E]/20' :
                                isPartiallyPaid ? 'bg-[#FFF6DF] text-[#B7791F] border border-[#B7791F]/20' :
                                'bg-[#EEF4F8] text-[#667482] border border-[#E3E7EA]'
                              }`}>
                                {isPaid ? 'PAID' : isPartiallyPaid ? 'PARTIALLY PAID' : 'UNPAID'}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedBillForDetail(bill)}
                            className="p-1.5 text-[#667482] hover:text-[#0B2A4A] rounded-lg hover:bg-[#EEF4F8] cursor-pointer mr-1"
                            title="View Bill"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {((bill.normalizedStatus || (bill.status || '').toLowerCase()) !== 'paid') && Number(bill.amountDue ?? bill.balance ?? 0) > 0 && (
                            <button
                              onClick={() => {
                                setPaymentTargetDoc(bill);
                                setShowPaymentModal(true);
                              }}
                              className="px-2.5 py-1 bg-[#0B2A4A] hover:bg-[#163B63] text-white rounded-lg font-semibold text-[11px] cursor-pointer shadow-xs"
                            >
                              Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: PURCHASE ORDERS TABLE */}
          {activeSubTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="p-4">PO No.</th>
                    <th className="p-4">Vendor Name</th>
                    <th className="p-4">PO Date</th>
                    <th className="p-4 text-right">Total Amount</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-[#8A96A3]">
                        No purchase orders found in database.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((po) => (
                      <tr
                        key={po.id}
                        onClick={() => setSelectedPOForDetail(po)}
                        className="hover:bg-[#FAFAF8] cursor-pointer transition-colors"
                      >
                        <td className="p-4 font-mono font-bold text-[#0B2A4A]">
                          {po.orderNumber || po.number}
                        </td>
                        <td className="p-4 font-semibold text-[#17212B]">
                          {po.vendorName}
                        </td>
                        <td className="p-4 text-[#667482]">{po.date}</td>
                        <td className="p-4 text-right font-mono font-bold text-[#17212B]">
                          {formatCurrency(po.total)}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                            po.status === 'billed' ? 'bg-[#EAF7F0] text-[#18794E] border border-[#18794E]/20' :
                            po.status === 'received' ? 'bg-[#F8F0E6] text-[#C98232] border border-[#C98232]/20' :
                            po.status === 'confirmed' ? 'bg-[#EAF3F9] text-[#245B86] border border-[#245B86]/20' :
                            'bg-[#EEF4F8] text-[#667482] border border-[#E3E7EA]'
                          }`}>
                            {po.status}
                          </span>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedPOForDetail(po)}
                            className="p-1.5 text-[#667482] hover:text-[#0B2A4A] rounded-lg hover:bg-[#EEF4F8] cursor-pointer mr-1"
                            title="View Purchase Order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {po.status === 'confirmed' && (
                            <button
                              onClick={async () => {
                                await receiveGoodsPO(po.id);
                              }}
                              className="px-2.5 py-1 bg-[#EEF4F8] hover:bg-[#E2ECF2] text-[#0B2A4A] rounded-lg font-semibold text-[11px] border border-[#D8E1E8] cursor-pointer mr-1"
                            >
                              Receive
                            </button>
                          )}
                          {(po.status === 'confirmed' || po.status === 'received') && (
                            <button
                              onClick={async () => {
                                await convertPOToVendorBill(po.id);
                                setActiveSubTab('bills');
                              }}
                              className="px-2.5 py-1 bg-[#0B2A4A] hover:bg-[#163B63] text-white rounded-lg font-semibold text-[11px] cursor-pointer"
                            >
                              Bill
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: VENDOR PAYMENTS TABLE */}
          {activeSubTab === 'payments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="p-4">Payment ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Vendor</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4 text-right">Amount Disbursed</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-[#8A96A3]">
                        No vendor payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((pmt) => (
                      <tr key={pmt.id} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="p-4 font-mono font-bold text-[#0B2A4A]">
                          {pmt.number || `PMT-${pmt.id}`}
                        </td>
                        <td className="p-4 text-[#667482]">{pmt.date}</td>
                        <td className="p-4 font-semibold text-[#17212B]">{pmt.partnerName || pmt.partner || 'Vendor'}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#EEF4F8] text-[#0B2A4A] font-semibold text-[11px] border border-[#E3E7EA]">
                            {pmt.method || pmt.payment_method || 'Bank'}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-[#B42318] text-sm">
                          -{formatCurrency(pmt.amount)}
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase bg-[#EAF7F0] text-[#18794E] border border-[#18794E]/20">
                            Posted
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
