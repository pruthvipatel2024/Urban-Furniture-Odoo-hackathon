import React, { useState, useEffect } from 'react';
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
  Package,
  ArrowLeft,
  Search,
  ExternalLink,
  FileText,
  Edit2
} from 'lucide-react';

export default function SalesFlow({
  initialSubTab = 'invoices',
  showCreateModal = false,
  setShowCreateModal
}) {
  const {
    salesOrders,
    invoices,
    payments,
    contacts,
    products,
    analyticAccounts,
    chartOfAccounts,
    createSalesOrder,
    updateSalesOrder,
    confirmSalesOrder,
    deliverGoodsSO,
    convertSOToCustomerInvoice,
    confirmInvoice,
    setPaymentTargetDoc,
    setShowPaymentModal,
    formatCurrency,
    setActiveTab,
    userRole,
    getDraft,
    saveDraft,
    clearDraft
  } = useAccounting();

  const [activeSubTab, setActiveSubTab] = useState(initialSubTab); // 'orders' | 'invoices' | 'receipts'
  const [selectedSOForDetail, setSelectedSOForDetail] = useState(null);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState(null);
  const [isCreatingSO, setIsCreatingSO] = useState(false);
  const [soMode, setSoMode] = useState({ mode: 'create', recordId: null });
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    if (showCreateModal) {
      handleOpenNewSO();
      if (setShowCreateModal) setShowCreateModal(false);
    }
  }, [showCreateModal]);

  // SO Creation / Edit Form State
  const [customerId, setCustomerId] = useState('');
  const [analyticAccountId, setAnalyticAccountId] = useState('');
  const [soDate, setSoDate] = useState(new Date().toISOString().split('T')[0]);
  const [soNotes, setSoNotes] = useState('');
  const [items, setItems] = useState([
    { productId: '', chartOfAccountId: '', analyticAccountId: '', qty: 1, unitPrice: 0, taxPercent: 18, total: 0 }
  ]);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customersList = contacts.filter(c => c.type === 'Customer' || c.type === 'Both');
  const salesAccounts = chartOfAccounts.filter(a => a.type === 'Income' || a.type === 'Asset');

  // Customer Payments / Receipts filter
  const customerReceipts = payments.filter(p => p.type === 'Receive' || p.payment_type === 'inbound' || p.amount > 0);

  // Open Blank SO Form (New)
  const handleOpenNewSO = () => {
    setIsCreatingSO(true);
    setSelectedSOForDetail(null);
    setSoMode({ mode: 'create', recordId: null });
    const draft = getDraft ? getDraft('sales_order', 'create', 'new') : null;
    if (draft) {
      setCustomerId(draft.customerId || '');
      setAnalyticAccountId(draft.analyticAccountId || '');
      setSoDate(draft.soDate || new Date().toISOString().split('T')[0]);
      setSoNotes(draft.soNotes || '');
      setItems(draft.items && draft.items.length > 0 ? draft.items : [{ productId: '', chartOfAccountId: '', analyticAccountId: '', qty: 1, unitPrice: 0, taxPercent: 18, total: 0 }]);
      setHasRestoredDraft(true);
    } else {
      setCustomerId('');
      setAnalyticAccountId('');
      setSoDate(new Date().toISOString().split('T')[0]);
      setSoNotes('');
      setItems([{ productId: '', chartOfAccountId: '', analyticAccountId: '', qty: 1, unitPrice: 0, taxPercent: 18, total: 0 }]);
      setHasRestoredDraft(false);
    }
    setFormError('');
  };

  // Open Form for Editing Existing SO
  const handleOpenEditSO = (so) => {
    const rawId = so.backendId || so.id;
    setSelectedSOForDetail(so);
    setIsCreatingSO(true);
    setSoMode({ mode: 'edit', recordId: rawId });

    const draft = getDraft ? getDraft('sales_order', 'edit', rawId) : null;
    if (draft) {
      setCustomerId(draft.customerId || '');
      setAnalyticAccountId(draft.analyticAccountId || '');
      setSoDate(draft.soDate || new Date().toISOString().split('T')[0]);
      setSoNotes(draft.soNotes || '');
      setItems(draft.items || []);
      setHasRestoredDraft(true);
    } else {
      setCustomerId(String(so.customerId || so.customer_id || ''));
      setAnalyticAccountId(String(so.analyticAccountId || so.analytic_account_id || ''));
      setSoDate(so.date || so.order_date || new Date().toISOString().split('T')[0]);
      setSoNotes(so.notes || '');
      const mappedItems = (so.items || so.order_lines || []).map(line => ({
        id: line.id,
        productId: String(line.productId || line.product_id || ''),
        chartOfAccountId: String(line.chartOfAccountId || line.chart_of_account_id || ''),
        analyticAccountId: String(line.analyticAccountId || line.analytic_account_id || ''),
        qty: Number(line.qty || line.quantity || 1),
        unitPrice: Number(line.unitPrice || line.unit_price || line.price || 0),
        taxPercent: Number(line.taxPercent || line.tax_percent || 18),
        total: Number(line.total || 0)
      }));
      setItems(mappedItems.length > 0 ? mappedItems : [{ productId: '', chartOfAccountId: '', analyticAccountId: '', qty: 1, unitPrice: 0, taxPercent: 18, total: 0 }]);
      setHasRestoredDraft(false);
    }
    setFormError('');
  };

  // Auto-save draft
  useEffect(() => {
    if (isCreatingSO && saveDraft) {
      saveDraft('sales_order', soMode.mode, soMode.recordId || 'new', {
        customerId,
        analyticAccountId,
        soDate,
        soNotes,
        items
      });
    }
  }, [isCreatingSO, soMode, customerId, analyticAccountId, soDate, soNotes, items, saveDraft]);

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
    setItems([...items, { productId: '', chartOfAccountId: '', analyticAccountId: '', qty: 1, unitPrice: 0, taxPercent: 18, total: 0 }]);
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
      if (soMode.mode === 'edit' && soMode.recordId) {
        await updateSalesOrder(soMode.recordId, {
          customerId,
          analyticAccountId: analyticAccountId || null,
          date: soDate,
          notes: soNotes,
          items: validItems
        });
        if (clearDraft) clearDraft('sales_order', 'edit', soMode.recordId);
      } else {
        await createSalesOrder({
          customerId,
          analyticAccountId: analyticAccountId || null,
          date: soDate,
          notes: soNotes,
          items: validItems
        });
        if (clearDraft) clearDraft('sales_order', 'create', 'new');
      }

      setIsCreatingSO(false);
      setSelectedSOForDetail(null);
      setCustomerId('');
      setAnalyticAccountId('');
      setHasRestoredDraft(false);
      setItems([{ productId: '', chartOfAccountId: '', analyticAccountId: '', qty: 1, unitPrice: 0, taxPercent: 18, total: 0 }]);
      setActiveSubTab('orders');
    } catch (err) {
      setFormError(err.message || 'Failed to save sales order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Lists
  const filteredInvoices = invoices.filter(inv =>
    (inv.invoiceNumber || inv.number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = salesOrders.filter(so =>
    (so.orderNumber || so.number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (so.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReceipts = customerReceipts.filter(rcpt =>
    (rcpt.number || rcpt.partnerName || rcpt.partner || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Sales Dedicated Header */}
      {!isCreatingSO && !selectedSOForDetail && !selectedInvoiceForDetail && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3E7EA] shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#EEF4F8] border border-[#E3E7EA] text-[#0B2A4A] flex items-center justify-center shadow-xs shrink-0">
              {activeSubTab === 'orders' && <TrendingUp className="w-5 h-5 text-[#C98232]" />}
              {activeSubTab === 'invoices' && <Receipt className="w-5 h-5 text-[#0B2A4A]" />}
              {activeSubTab === 'receipts' && <CreditCard className="w-5 h-5 text-[#0B2A4A]" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-lg text-[#0B2A4A]">
                  {activeSubTab === 'orders' && 'Sales Orders'}
                  {activeSubTab === 'invoices' && 'Customer Invoices'}
                  {activeSubTab === 'receipts' && 'Customer Receipts'}
                </h2>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#EEF4F8] text-[#0B2A4A] font-semibold border border-[#E3E7EA]">
                  {activeSubTab === 'orders' && `${salesOrders.length} Orders`}
                  {activeSubTab === 'invoices' && `${invoices.length} Invoices`}
                  {activeSubTab === 'receipts' && `${customerReceipts.length} Receipts`}
                </span>
              </div>
              <p className="text-xs text-[#667482] mt-0.5">
                {activeSubTab === 'orders' && 'Quotations, sales orders confirmation, and invoice creation workflow'}
                {activeSubTab === 'invoices' && 'Customer invoices, dynamic receivable totals, payment tracking, and ledger posting'}
                {activeSubTab === 'receipts' && 'Recorded customer settlements across Bank and Cash liquid accounts'}
              </p>
            </div>
          </div>

          {/* Action Button */}
          {userRole !== 'Contact' && (
            <div className="shrink-0">
              {activeSubTab === 'orders' && (
                <button
                  onClick={handleOpenNewSO}
                  className="flex items-center space-x-1.5 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#0B2A4A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Sales Order</span>
                </button>
              )}

              {activeSubTab === 'invoices' && (
                <button
                  onClick={() => {
                    setActiveSubTab('orders');
                    handleOpenNewSO();
                  }}
                  className="flex items-center space-x-1.5 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#0B2A4A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Invoice (via SO)</span>
                </button>
              )}

              {activeSubTab === 'receipts' && (
                <button
                  onClick={() => {
                    setPaymentTargetDoc(null);
                    setShowPaymentModal(true);
                  }}
                  className="flex items-center space-x-1.5 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#0B2A4A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Receipt</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SALES ORDER FULL FORM VIEW (Excalidraw Specification)                   */}
      {/* ========================================================================= */}
      {(isCreatingSO || selectedSOForDetail) && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden p-6 space-y-6">
          {/* Top Form Header with Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EA] pb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setIsCreatingSO(false);
                  setSelectedSOForDetail(null);
                }}
                className="p-2 text-[#667482] hover:text-[#0B2A4A] hover:bg-[#EEF4F8] rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-[#0B2A4A]">
                    {isCreatingSO
                      ? (soMode.mode === 'edit' ? `Edit Sales Order — ${selectedSOForDetail?.orderNumber || selectedSOForDetail?.number || '#' + soMode.recordId}` : 'New Sales Order')
                      : `Sales Order — ${selectedSOForDetail.orderNumber || selectedSOForDetail.number}`}
                  </h3>
                  {isCreatingSO && (
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      soMode.mode === 'edit'
                        ? 'bg-[#EBF1F5] text-[#0B2A4A] border-[#D8E1E8]'
                        : 'bg-[#EAF7F0] text-[#18794E] border-[#A3E6C0]'
                    }`}>
                      {soMode.mode === 'edit' ? `Edit Mode (#${soMode.recordId})` : 'Create Mode'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#667482]">
                  {isCreatingSO ? 'Enter customer and product line items' : `Created on ${selectedSOForDetail.date}`}
                </p>
              </div>
            </div>

            {/* Contextual Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setIsCreatingSO(false);
                  setSelectedSOForDetail(null);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-[#E3E7EA] text-[#667482] hover:bg-[#FAFAF8] text-xs font-semibold transition-all cursor-pointer"
              >
                Back
              </button>

              {selectedSOForDetail && selectedSOForDetail.status === 'draft' && !isCreatingSO && (
                <>
                  <button
                    onClick={() => handleOpenEditSO(selectedSOForDetail)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#EEF4F8] hover:bg-[#E2ECF2] text-[#0B2A4A] border border-[#D8E1E8] text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Order</span>
                  </button>
                  <button
                    onClick={async () => {
                      await confirmSalesOrder(selectedSOForDetail.id);
                      setSelectedSOForDetail(prev => ({ ...prev, status: 'confirmed' }));
                    }}
                    className="px-4 py-1.5 rounded-xl bg-[#18794E] hover:bg-[#146340] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  >
                    Confirm Order
                  </button>
                </>
              )}

              {selectedSOForDetail && selectedSOForDetail.status === 'confirmed' && !isCreatingSO && (
                <button
                  onClick={async () => {
                    await convertSOToCustomerInvoice(selectedSOForDetail.id);
                    setSelectedSOForDetail(null);
                    setActiveSubTab('invoices');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Create Invoice</span>
                </button>
              )}

              {isCreatingSO && (
                <button
                  onClick={handleSubmitSO}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (soMode.mode === 'edit' ? 'Update Order' : 'Confirm')}
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

          {/* Restored Draft Banner */}
          {hasRestoredDraft && isCreatingSO && (
            <div className="p-3 bg-[#EEF4F8] border border-[#D8E1E8] rounded-xl text-xs text-[#0B2A4A] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#0B2A4A]" />
                <span>Unsaved draft restored from previous session.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (clearDraft) clearDraft('sales_order', soMode.mode, soMode.recordId || 'new');
                  setHasRestoredDraft(false);
                  if (soMode.mode === 'edit' && selectedSOForDetail) {
                    setCustomerId(String(selectedSOForDetail.customerId || selectedSOForDetail.customer_id || ''));
                    setAnalyticAccountId(String(selectedSOForDetail.analyticAccountId || selectedSOForDetail.analytic_account_id || ''));
                    setSoDate(selectedSOForDetail.date || selectedSOForDetail.order_date || new Date().toISOString().split('T')[0]);
                    setSoNotes(selectedSOForDetail.notes || '');
                    const mappedItems = (selectedSOForDetail.items || selectedSOForDetail.order_lines || []).map(line => ({
                      id: line.id,
                      productId: String(line.productId || line.product_id || ''),
                      chartOfAccountId: String(line.chartOfAccountId || line.chart_of_account_id || ''),
                      analyticAccountId: String(line.analyticAccountId || line.analytic_account_id || ''),
                      qty: Number(line.qty || line.quantity || 1),
                      unitPrice: Number(line.unitPrice || line.unit_price || line.price || 0),
                      taxPercent: Number(line.taxPercent || line.tax_percent || 18),
                      total: Number(line.total || 0)
                    }));
                    setItems(mappedItems.length > 0 ? mappedItems : [{ productId: '', chartOfAccountId: '', analyticAccountId: '', qty: 1, unitPrice: 0, taxPercent: 18, total: 0 }]);
                  } else {
                    setCustomerId('');
                    setAnalyticAccountId('');
                    setSoDate(new Date().toISOString().split('T')[0]);
                    setSoNotes('');
                    setItems([{ productId: '', chartOfAccountId: '', analyticAccountId: '', qty: 1, unitPrice: 0, taxPercent: 18, total: 0 }]);
                  }
                }}
                className="text-xs text-[#B42318] hover:underline font-semibold cursor-pointer"
              >
                Discard Draft
              </button>
            </div>
          )}

          {/* Form Header Fields Grid */}
          {isCreatingSO ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1.5">SO No. (Auto Generated)</label>
                <input
                  type="text"
                  disabled
                  value="S0000X (Auto)"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAF8] border border-[#E3E7EA] rounded-xl text-xs text-[#8A96A3] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Customer Name *</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
                >
                  <option value="">Select Customer Contact</option>
                  {customersList.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email || 'No email'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1.5">SO Date</label>
                <input
                  type="date"
                  value={soDate}
                  onChange={(e) => setSoDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Budget Analytics (Optional)</label>
                <select
                  value={analyticAccountId}
                  onChange={(e) => setAnalyticAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
                >
                  <option value="">Select Analytic Account</option>
                  {analyticAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#FAFAF8] p-4 rounded-xl border border-[#E3E7EA] text-xs">
              <div>
                <span className="text-[#667482] font-semibold block">SO Number</span>
                <span className="font-mono font-bold text-[#0B2A4A] text-sm">{selectedSOForDetail.orderNumber || selectedSOForDetail.number}</span>
              </div>
              <div>
                <span className="text-[#667482] font-semibold block">Customer Name</span>
                <span className="font-bold text-[#17212B]">{selectedSOForDetail.customerName}</span>
              </div>
              <div>
                <span className="text-[#667482] font-semibold block">SO Date</span>
                <span className="text-[#667482]">{selectedSOForDetail.date}</span>
              </div>
              <div>
                <span className="text-[#667482] font-semibold block">Status</span>
                <span className={`inline-block mt-0.5 text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                  selectedSOForDetail.status === 'invoiced' ? 'bg-[#EAF7F0] text-[#18794E] border border-[#18794E]/20' :
                  selectedSOForDetail.status === 'confirmed' ? 'bg-[#EAF3F9] text-[#245B86] border border-[#245B86]/20' :
                  'bg-[#EEF4F8] text-[#667482] border border-[#E3E7EA]'
                }`}>
                  {selectedSOForDetail.status}
                </span>
              </div>
            </div>
          )}

          {/* Line Items Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#667482]">Order Lines</h4>
            <div className="border border-[#E3E7EA] rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="p-3 w-12">Sr.</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Chart of Accounts</th>
                    <th className="p-3">Budget Analytics</th>
                    <th className="p-3 w-16 text-right">Qty</th>
                    <th className="p-3 w-24 text-right">Unit Price</th>
                    <th className="p-3 w-20 text-center">GST %</th>
                    <th className="p-3 w-24 text-right">Base Subtotal</th>
                    <th className="p-3 w-28 text-right">Total (Incl. GST)</th>
                    {isCreatingSO && <th className="p-3 w-10"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {isCreatingSO ? (
                    items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFAF8]/50">
                        <td className="p-3 text-[#8A96A3] font-mono">{idx + 1}</td>
                        <td className="p-3 min-w-[170px]">
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            className="w-full p-2 bg-white border border-[#E3E7EA] rounded-lg text-xs text-[#17212B]"
                          >
                            <option value="">Select Product</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (₹{p.salesPrice})</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 min-w-[130px]">
                          <select
                            value={item.chartOfAccountId}
                            onChange={(e) => handleItemChange(idx, 'chartOfAccountId', e.target.value)}
                            className="w-full p-2 bg-white border border-[#E3E7EA] rounded-lg text-xs text-[#17212B]"
                          >
                            <option value="">Sales Revenue A/c</option>
                            {salesAccounts.map(a => (
                              <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 min-w-[130px]">
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
                            className="w-16 p-2 bg-white border border-[#E3E7EA] rounded-lg text-xs text-right font-mono text-[#17212B]"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                            className="w-24 p-2 bg-white border border-[#E3E7EA] rounded-lg text-xs text-right font-mono text-[#17212B]"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            value={item.taxPercent !== undefined ? item.taxPercent : 18}
                            onChange={(e) => handleItemChange(idx, 'taxPercent', e.target.value)}
                            className="w-16 p-2 bg-white border border-[#E3E7EA] rounded-lg text-xs text-center font-mono text-[#17212B]"
                          />
                        </td>
                        <td className="p-3 text-right font-mono text-[#667482]">
                          {formatCurrency(Number(item.qty || 0) * Number(item.unitPrice || 0))}
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
                    selectedSOForDetail.items && selectedSOForDetail.items.map((item, idx) => {
                      const qty = Number(item.qty || item.quantity || 1);
                      const unitPrice = Number(item.unitPrice || item.price || 0);
                      const taxPercent = Number(item.taxPercent !== undefined ? item.taxPercent : (item.tax_percent !== undefined ? item.tax_percent : 18));
                      const lineBase = item.subtotal !== undefined ? Number(item.subtotal) : (qty * unitPrice);
                      const lineTotal = item.total !== undefined ? Number(item.total) : (item.lineTotal !== undefined ? Number(item.lineTotal) : (lineBase * (1 + taxPercent / 100)));
                      return (
                        <tr key={idx} className="hover:bg-[#FAFAF8]/50">
                          <td className="p-3 text-[#8A96A3] font-mono">{idx + 1}</td>
                          <td className="p-3 font-semibold text-[#17212B]">{item.productName || item.name}</td>
                          <td className="p-3 text-[#667482]">Sales Revenue</td>
                          <td className="p-3 text-[#667482]">{item.analyticAccountName || 'General'}</td>
                          <td className="p-3 text-right font-mono text-[#667482]">{qty}</td>
                          <td className="p-3 text-right font-mono text-[#667482]">{formatCurrency(unitPrice)}</td>
                          <td className="p-3 text-center font-mono font-bold text-[#18794E]">{taxPercent}%</td>
                          <td className="p-3 text-right font-mono text-[#667482]">{formatCurrency(lineBase)}</td>
                          <td className="p-3 text-right font-mono font-bold text-[#0B2A4A]">{formatCurrency(lineTotal)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {isCreatingSO && (
              <button
                type="button"
                onClick={handleAddItemLine}
                className="text-xs font-semibold text-[#C98232] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product Line</span>
              </button>
            )}
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-4 border-t border-[#E3E7EA]">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-[#667482]">
                <span>Taxable Base (Subtotal):</span>
                <span className="font-mono font-bold text-[#17212B]">
                  {formatCurrency(isCreatingSO ? soSubtotal : (selectedSOForDetail.subtotal !== undefined ? selectedSOForDetail.subtotal : (selectedSOForDetail.total / 1.18)))}
                </span>
              </div>
              <div className="flex justify-between text-[#667482]">
                <span>GST (18% / Central & State Tax):</span>
                <span className="font-mono font-bold text-[#18794E]">
                  +{formatCurrency(isCreatingSO ? soTaxTotal : (selectedSOForDetail.taxAmount !== undefined ? selectedSOForDetail.taxAmount : (selectedSOForDetail.tax !== undefined ? selectedSOForDetail.tax : (selectedSOForDetail.total - (selectedSOForDetail.subtotal || (selectedSOForDetail.total / 1.18))))))}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#0B2A4A] pt-2 border-t border-[#E3E7EA]">
                <span>Document Total:</span>
                <span className="font-mono text-[#0B2A4A]">
                  {formatCurrency(isCreatingSO ? soGrandTotal : selectedSOForDetail.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* 2. CUSTOMER INVOICE FULL FORM VIEW (Excalidraw Specification)             */}
      {/* ========================================================================= */}
      {selectedInvoiceForDetail && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden p-6 space-y-6">
          {/* Top Form Header with Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EA] pb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedInvoiceForDetail(null)}
                className="p-2 text-[#667482] hover:text-[#0B2A4A] hover:bg-[#EEF4F8] rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-base font-bold text-[#0B2A4A]">
                  Customer Invoice — {selectedInvoiceForDetail.invoiceNumber || selectedInvoiceForDetail.number}
                </h3>
                <p className="text-xs text-[#667482]">Issued to {selectedInvoiceForDetail.customerName}</p>
              </div>
            </div>

            {/* Contextual Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedInvoiceForDetail(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#E3E7EA] text-[#667482] hover:bg-[#FAFAF8] text-xs font-semibold transition-all cursor-pointer"
              >
                Back
              </button>

              <button
                onClick={() => setSelectedInvoiceForPrint(selectedInvoiceForDetail)}
                className="px-3.5 py-1.5 rounded-xl border border-[#D8E1E8] bg-[#EEF4F8] hover:bg-[#E2ECF2] text-[#0B2A4A] text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>

              {((selectedInvoiceForDetail.normalizedStatus || (selectedInvoiceForDetail.status || '').toLowerCase()) === 'draft') && (
                <button
                  onClick={async () => {
                    await confirmInvoice(selectedInvoiceForDetail.id);
                    setSelectedInvoiceForDetail(prev => ({ ...prev, status: 'confirmed', normalizedStatus: 'confirmed' }));
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#18794E] hover:bg-[#146340] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  Confirm Invoice
                </button>
              )}

              {((selectedInvoiceForDetail.normalizedStatus || (selectedInvoiceForDetail.status || '').toLowerCase()) !== 'paid') && Number(selectedInvoiceForDetail.amountDue ?? selectedInvoiceForDetail.balance ?? 0) > 0 && (
                <button
                  onClick={() => {
                    setPaymentTargetDoc(selectedInvoiceForDetail);
                    setShowPaymentModal(true);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Register Payment</span>
                </button>
              )}
            </div>
          </div>

          {/* Invoice Header Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#FAFAF8] p-4 rounded-xl border border-[#E3E7EA] text-xs">
            <div>
              <span className="text-[#667482] font-semibold block">Customer Invoice No.</span>
              <span className="font-mono font-bold text-[#0B2A4A] text-sm">{selectedInvoiceForDetail.invoiceNumber || selectedInvoiceForDetail.number}</span>
            </div>

            <div>
              <span className="text-[#667482] font-semibold block">Customer Name</span>
              <span className="font-bold text-[#17212B]">{selectedInvoiceForDetail.customerName}</span>
            </div>

            <div>
              <span className="text-[#667482] font-semibold block">Invoice Date / Due Date</span>
              <span className="text-[#17212B]">{selectedInvoiceForDetail.date} • Due: {selectedInvoiceForDetail.dueDate || selectedInvoiceForDetail.date}</span>
            </div>

            <div>
              <span className="text-[#667482] font-semibold block">Originating SO</span>
              {selectedInvoiceForDetail.originatingSoNumber || selectedInvoiceForDetail.sales_order_id ? (
                <span className="inline-flex items-center space-x-1 text-[#18794E] bg-[#EAF7F0] px-2.5 py-0.5 rounded-full font-mono font-semibold text-[11px] border border-[#18794E]/20">
                  <span>SO: {selectedInvoiceForDetail.originatingSoNumber || `SO-${selectedInvoiceForDetail.sales_order_id}`}</span>
                </span>
              ) : (
                <span className="text-[#8A96A3] italic">Direct Invoice</span>
              )}
            </div>
          </div>

          {/* Invoice Line Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#667482]">Invoice Line Items</h4>
            <div className="border border-[#E3E7EA] rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="p-3 w-12">Sr.</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Chart of Account</th>
                    <th className="p-3">Budget Analytics</th>
                    <th className="p-3 w-16 text-right">Qty</th>
                    <th className="p-3 w-24 text-right">Unit Price</th>
                    <th className="p-3 w-20 text-center">GST %</th>
                    <th className="p-3 w-24 text-right">Base Subtotal</th>
                    <th className="p-3 w-28 text-right">Total (Incl. GST)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {selectedInvoiceForDetail.items && selectedInvoiceForDetail.items.length > 0 ? (
                    selectedInvoiceForDetail.items.map((item, idx) => {
                      const qty = Number(item.qty || item.quantity || 1);
                      const unitPrice = Number(item.unitPrice || item.price || 0);
                      const taxPercent = Number(item.taxPercent !== undefined ? item.taxPercent : (item.tax_percent !== undefined ? item.tax_percent : 18));
                      const lineBase = item.subtotal !== undefined ? Number(item.subtotal) : (qty * unitPrice);
                      const lineTotal = item.total !== undefined ? Number(item.total) : (item.lineTotal !== undefined ? Number(item.lineTotal) : (lineBase * (1 + taxPercent / 100)));
                      return (
                        <tr key={idx} className="hover:bg-[#FAFAF8]/50">
                          <td className="p-3 text-[#8A96A3] font-mono">{idx + 1}</td>
                          <td className="p-3 font-semibold text-[#17212B]">{item.productName || item.name}</td>
                          <td className="p-3 text-[#667482]">Sales Revenue</td>
                          <td className="p-3 text-[#667482]">{item.analyticAccountName || 'General Furniture'}</td>
                          <td className="p-3 text-right font-mono text-[#667482]">{qty}</td>
                          <td className="p-3 text-right font-mono text-[#667482]">{formatCurrency(unitPrice)}</td>
                          <td className="p-3 text-center font-mono font-bold text-[#18794E]">{taxPercent}%</td>
                          <td className="p-3 text-right font-mono text-[#667482]">{formatCurrency(lineBase)}</td>
                          <td className="p-3 text-right font-mono font-bold text-[#0B2A4A]">{formatCurrency(lineTotal)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="p-3 text-[#8A96A3] font-mono">1</td>
                      <td className="p-3 font-semibold text-[#17212B]">Commercial Furniture Supply</td>
                      <td className="p-3 text-[#667482]">Sales Revenue</td>
                      <td className="p-3 text-[#667482]">General Furniture</td>
                      <td className="p-3 text-right font-mono text-[#667482]">1</td>
                      <td className="p-3 text-right font-mono text-[#667482]">{formatCurrency(selectedInvoiceForDetail.subtotal || (selectedInvoiceForDetail.total / 1.18))}</td>
                      <td className="p-3 text-center font-mono font-bold text-[#18794E]">18%</td>
                      <td className="p-3 text-right font-mono text-[#667482]">{formatCurrency(selectedInvoiceForDetail.subtotal || (selectedInvoiceForDetail.total / 1.18))}</td>
                      <td className="p-3 text-right font-mono font-bold text-[#0B2A4A]">{formatCurrency(selectedInvoiceForDetail.total)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 p-5 rounded-xl bg-[#EEF4F8] border border-[#E3E7EA] text-xs">
            <div>
              <span className="text-[#667482] font-semibold block">Taxable Base</span>
              <span className="text-base font-bold text-[#17212B] font-mono">
                {formatCurrency(selectedInvoiceForDetail.subtotal !== undefined ? selectedInvoiceForDetail.subtotal : (selectedInvoiceForDetail.total / 1.18))}
              </span>
            </div>
            <div>
              <span className="text-[#667482] font-semibold block">GST (18%)</span>
              <span className="text-base font-bold text-[#18794E] font-mono">
                +{formatCurrency(selectedInvoiceForDetail.taxAmount !== undefined ? selectedInvoiceForDetail.taxAmount : (selectedInvoiceForDetail.tax !== undefined ? selectedInvoiceForDetail.tax : (selectedInvoiceForDetail.total - (selectedInvoiceForDetail.subtotal || (selectedInvoiceForDetail.total / 1.18)))))}
              </span>
            </div>
            <div>
              <span className="text-[#667482] font-semibold block">Total Invoice</span>
              <span className="text-base font-bold text-[#0B2A4A] font-mono">{formatCurrency(selectedInvoiceForDetail.total)}</span>
            </div>
            <div>
              <span className="text-[#667482] font-semibold block">Paid Amount</span>
              <span className="text-base font-bold text-[#245B86] font-mono">
                {formatCurrency(selectedInvoiceForDetail.amountPaid || selectedInvoiceForDetail.paidAmount || (selectedInvoiceForDetail.paidViaBank || 0) + (selectedInvoiceForDetail.paidViaCash || 0))}
              </span>
            </div>
            <div>
              <span className="text-[#667482] font-semibold block">Amount Due</span>
              <span className="text-base font-bold text-[#B42318] font-mono">
                {formatCurrency(selectedInvoiceForDetail.amountDue !== undefined ? selectedInvoiceForDetail.amountDue : (selectedInvoiceForDetail.total - (selectedInvoiceForDetail.amountPaid || selectedInvoiceForDetail.paidAmount || 0)))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LIST VIEWS (Customer Invoices, Sales Orders, Receipts)                  */}
      {/* ========================================================================= */}
      {!isCreatingSO && !selectedSOForDetail && !selectedInvoiceForDetail && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-[#E3E7EA] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
              <input
                type="text"
                placeholder={
                  activeSubTab === 'orders' ? 'Search sales orders by number, customer...' :
                  activeSubTab === 'invoices' ? 'Search customer invoices by number, customer...' :
                  'Search receipts by partner or number...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FAFAF8] text-xs text-[#17212B] placeholder-[#8A96A3] border border-[#E3E7EA] rounded-xl outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
              />
            </div>
          </div>

          {/* TAB 1: CUSTOMER INVOICES TABLE */}
          {activeSubTab === 'invoices' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="p-4">Customer Invoice No.</th>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Invoice Reference</th>
                    <th className="p-4">Invoice Date</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-right">Amount Due</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-[#8A96A3]">
                        No customer invoices found in database.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() => setSelectedInvoiceForDetail(inv)}
                        className="hover:bg-[#FAFAF8] cursor-pointer transition-colors"
                      >
                        <td className="p-4 font-mono font-bold text-[#0B2A4A]">
                          {inv.invoiceNumber || inv.number}
                        </td>
                        <td className="p-4 font-semibold text-[#17212B]">
                          {inv.customerName}
                        </td>
                        <td className="p-4 text-[#667482]">
                          {inv.originatingSoNumber ? `SO: ${inv.originatingSoNumber}` : (inv.reference || 'Standard')}
                        </td>
                        <td className="p-4 text-[#667482]">{inv.date}</td>
                        <td className="p-4 text-[#667482]">{inv.dueDate || inv.date}</td>
                        <td className="p-4 text-right font-mono font-bold text-[#17212B]">
                          {formatCurrency(inv.total)}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-[#B42318]">
                          {formatCurrency(inv.amountDue !== undefined ? inv.amountDue : (inv.total - (inv.amountPaid || 0)))}
                        </td>
                        <td className="p-4 text-center">
                          {(() => {
                            const isPaid = (inv.normalizedStatus || (inv.status || '').toLowerCase()) === 'paid' || Number(inv.amountDue ?? inv.balance ?? 0) <= 0;
                            const isPartiallyPaid = (inv.normalizedStatus || (inv.status || '').toLowerCase()) === 'partially_paid' || (Number(inv.paidAmount ?? inv.amountPaid ?? 0) > 0 && !isPaid);
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
                            onClick={() => setSelectedInvoiceForDetail(inv)}
                            className="p-1.5 text-[#667482] hover:text-[#0B2A4A] rounded-lg hover:bg-[#EEF4F8] cursor-pointer mr-1"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {((inv.normalizedStatus || (inv.status || '').toLowerCase()) !== 'paid') && Number(inv.amountDue ?? inv.balance ?? 0) > 0 && (
                            <button
                              onClick={() => {
                                setPaymentTargetDoc(inv);
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

          {/* TAB 2: SALES ORDERS TABLE */}
          {activeSubTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="p-4">SO No.</th>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">SO Date</th>
                    <th className="p-4 text-right">Total Amount</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-[#8A96A3]">
                        No sales orders found in database.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((so) => (
                      <tr
                        key={so.id}
                        onClick={() => setSelectedSOForDetail(so)}
                        className="hover:bg-[#FAFAF8] cursor-pointer transition-colors"
                      >
                        <td className="p-4 font-mono font-bold text-[#0B2A4A]">
                          {so.orderNumber || so.number}
                        </td>
                        <td className="p-4 font-semibold text-[#17212B]">
                          {so.customerName}
                        </td>
                        <td className="p-4 text-[#667482]">{so.date}</td>
                        <td className="p-4 text-right font-mono font-bold text-[#17212B]">
                          {formatCurrency(so.total)}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                            so.status === 'invoiced' ? 'bg-[#EAF7F0] text-[#18794E] border border-[#18794E]/20' :
                            so.status === 'confirmed' ? 'bg-[#EAF3F9] text-[#245B86] border border-[#245B86]/20' :
                            'bg-[#EEF4F8] text-[#667482] border border-[#E3E7EA]'
                          }`}>
                            {so.status}
                          </span>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedSOForDetail(so)}
                            className="p-1.5 text-[#667482] hover:text-[#0B2A4A] rounded-lg hover:bg-[#EEF4F8] cursor-pointer mr-1"
                            title="View Sales Order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {so.status === 'draft' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditSO(so);
                              }}
                              className="p-1.5 text-[#0B2A4A] hover:text-[#163B63] rounded-lg hover:bg-[#EEF4F8] cursor-pointer mr-1"
                              title="Edit Sales Order"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {so.status === 'confirmed' && (
                            <button
                              onClick={async () => {
                                await convertSOToCustomerInvoice(so.id);
                                setActiveSubTab('invoices');
                              }}
                              className="px-2.5 py-1 bg-[#0B2A4A] hover:bg-[#163B63] text-white rounded-lg font-semibold text-[11px] cursor-pointer"
                            >
                              Invoice
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

          {/* TAB 3: CUSTOMER RECEIPTS TABLE */}
          {activeSubTab === 'receipts' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="p-4">Receipt / Payment ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4 text-right">Amount Received</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {filteredReceipts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-[#8A96A3]">
                        No customer receipts recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredReceipts.map((rcpt) => (
                      <tr key={rcpt.id} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="p-4 font-mono font-bold text-[#0B2A4A]">
                          {rcpt.number || `RCPT-${rcpt.id}`}
                        </td>
                        <td className="p-4 text-[#667482]">{rcpt.date}</td>
                        <td className="p-4 font-semibold text-[#17212B]">{rcpt.partnerName || rcpt.partner || 'Customer'}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#EEF4F8] text-[#0B2A4A] font-semibold text-[11px] border border-[#E3E7EA]">
                            {rcpt.method || rcpt.payment_method || 'Bank'}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-[#18794E] text-sm">
                          +{formatCurrency(rcpt.amount)}
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

      {/* Printable Invoice Modal */}
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
