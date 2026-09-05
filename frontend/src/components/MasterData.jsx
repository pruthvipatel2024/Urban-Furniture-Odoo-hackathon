import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Users,
  Package,
  BookOpen,
  Layers,
  Plus,
  Search,
  Sliders,
  Archive,
  RotateCcw,
  X,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Tag,
  DollarSign,
  TrendingUp,
  BarChart3,
  ShieldCheck
} from 'lucide-react';

export default function MasterData({ activeSubTab = 'contacts', setActiveSubTab }) {
  const {
    contacts,
    products,
    chartOfAccounts,
    journals,
    addContact,
    archiveContact,
    addProduct,
    adjustProductStock,
    addChartOfAccount,
    addJournal,
    formatCurrency,
    userRole
  } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Modal States
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);
  const [showAddCoaModal, setShowAddCoaModal] = useState(false);
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);

  // Form States
  const [contactForm, setContactForm] = useState({ name: '', type: 'Customer', email: '', mobile: '', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' });
  const [productForm, setProductForm] = useState({ name: '', type: 'Goods', salesPrice: '', costPrice: '', category: 'Chairs & Seating', stock: 10 });
  const [stockAdjustmentForm, setStockAdjustmentForm] = useState({ newStock: '', reason: 'Physical Stock Count' });
  const [coaForm, setCoaForm] = useState({ name: '', type: 'Asset' });
  const [journalForm, setJournalForm] = useState({ name: '', type: 'General' });
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -------------------------------------------------------------
  // CONTACTS LOGIC
  // -------------------------------------------------------------
  const filteredContacts = contacts.filter(c => {
    const matchType = filterType === 'All' || c.type === filterType || (filterType === 'Customer' && c.type === 'Both') || (filterType === 'Vendor' && c.type === 'Both');
    const matchSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.mobile || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const handleAddContactSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!contactForm.name.trim()) {
      setModalError('Contact name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addContact(contactForm);
      setShowAddContactModal(false);
      setContactForm({ name: '', type: 'Customer', email: '', mobile: '', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' });
    } catch (err) {
      setModalError(err.message || 'Failed to add contact.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // PRODUCTS LOGIC
  // -------------------------------------------------------------
  const filteredProducts = products.filter(p => {
    const matchType = filterType === 'All' || p.category === filterType || p.type === filterType;
    const matchSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!productForm.name.trim()) {
      setModalError('Product name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addProduct(productForm);
      setShowAddProductModal(false);
      setProductForm({ name: '', type: 'Goods', salesPrice: '', costPrice: '', category: 'Chairs & Seating', stock: 10 });
    } catch (err) {
      setModalError(err.message || 'Failed to add product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockAdjustmentSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!selectedProductForStock) return;
    setIsSubmitting(true);
    try {
      await adjustProductStock(selectedProductForStock.id, Number(stockAdjustmentForm.newStock), stockAdjustmentForm.reason);
      setShowAdjustStockModal(false);
      setSelectedProductForStock(null);
    } catch (err) {
      setModalError(err.message || 'Failed to adjust stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // COA LOGIC
  // -------------------------------------------------------------
  const filteredCoA = chartOfAccounts.filter(a => {
    const matchType = filterType === 'All' || a.type === filterType;
    const matchSearch = (a.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const handleAddCoaSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!coaForm.name.trim()) {
      setModalError('Account name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addChartOfAccount(coaForm);
      setShowAddCoaModal(false);
      setCoaForm({ name: '', type: 'Asset' });
    } catch (err) {
      setModalError(err.message || 'Failed to add account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // JOURNALS LOGIC
  // -------------------------------------------------------------
  const handleAddJournalSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!journalForm.name.trim()) {
      setModalError('Journal name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addJournal(journalForm);
      setShowAddJournalModal(false);
      setJournalForm({ name: '', type: 'General' });
    } catch (err) {
      setModalError(err.message || 'Failed to create journal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveSubTab('contacts');
              setSearchTerm('');
              setFilterType('All');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'contacts'
                ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Contacts Master</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
              {contacts.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('products');
              setSearchTerm('');
              setFilterType('All');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'products'
                ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products & Stock</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('coa');
              setSearchTerm('');
              setFilterType('All');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'coa'
                ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Chart of Accounts</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
              {chartOfAccounts.length}
            </span>
          </button>

          {userRole === 'Admin' && (
            <button
              onClick={() => {
                setActiveSubTab('journals');
                setSearchTerm('');
                setFilterType('All');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                activeSubTab === 'journals'
                  ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Journals Master</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
                {journals.length}
              </span>
            </button>
          )}
        </div>

        {/* Dynamic New Entity Button */}
        {userRole !== 'Contact' && (
          <div>
            {activeSubTab === 'contacts' && (
              <button
                onClick={() => setShowAddContactModal(true)}
                className="flex items-center space-x-1.5 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs border border-[#9BD5FF]/40 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Contact</span>
              </button>
            )}

            {activeSubTab === 'products' && (
              <button
                onClick={() => setShowAddProductModal(true)}
                className="flex items-center space-x-1.5 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs border border-[#9BD5FF]/40 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}

            {activeSubTab === 'coa' && (
              <button
                onClick={() => setShowAddCoaModal(true)}
                className="flex items-center space-x-1.5 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs border border-[#9BD5FF]/40 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Account</span>
              </button>
            )}

            {activeSubTab === 'journals' && userRole === 'Admin' && (
              <button
                onClick={() => setShowAddJournalModal(true)}
                className="flex items-center space-x-1.5 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs border border-[#9BD5FF]/40 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Journal</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* SUB-VIEW 1: CONTACTS */}
      {activeSubTab === 'contacts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              {['All', 'Customer', 'Vendor'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === t
                      ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>

            <div className="relative sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#FBFBFB] rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#3095EB]"
              />
            </div>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No contacts found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create customers and vendors to begin generating sales orders and purchase orders.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#FBFBFB] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Contact #</th>
                    <th className="py-3 px-4">Party Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.map((c) => (
                    <tr key={c.id} className="hover:bg-[#D4F6FF]/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{c.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{c.name}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          c.type === 'Customer' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          c.type === 'Vendor' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{c.email || '—'}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">{c.mobile || '—'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{c.address?.city || 'Mumbai'}, {c.address?.state || 'Maharashtra'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.isArchived ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {c.isArchived ? 'Archived' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => archiveContact(c.id)}
                          title={c.isArchived ? 'Restore Contact' : 'Archive Contact'}
                          className="p-1.5 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        >
                          {c.isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: PRODUCTS */}
      {activeSubTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search catalog items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#FBFBFB] rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#3095EB]"
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No products registered</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add catalog furniture items with cost and sales pricing.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#FBFBFB] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">SKU / ID</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Cost Price (₹)</th>
                    <th className="py-3 px-4 text-right">Sales Price (₹)</th>
                    <th className="py-3 px-4 text-center">Stock Level</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#D4F6FF]/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{p.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{p.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">{formatCurrency(p.costPrice)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(p.salesPrice)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          p.stock <= (p.reorderLevel || 5)
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProductForStock(p);
                            setStockAdjustmentForm({ newStock: p.stock, reason: 'Physical Stock Count' });
                            setShowAdjustStockModal(true);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: CHART OF ACCOUNTS */}
      {activeSubTab === 'coa' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              {['All', 'Asset', 'Liability', 'Income', 'Expense', 'Equity'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === t
                      ? 'bg-[#C6E7FF] text-slate-900 border border-[#9BD5FF]/40 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ledger accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#FBFBFB] rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#3095EB]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#FBFBFB] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Account Code</th>
                  <th className="py-3 px-4">Account Name</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCoA.map((acc) => (
                  <tr key={acc.id} className="hover:bg-[#D4F6FF]/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{acc.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{acc.name}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        acc.type === 'Asset' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        acc.type === 'Liability' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        acc.type === 'Income' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        acc.type === 'Expense' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        Authoritative
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: JOURNALS */}
      {activeSubTab === 'journals' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Accounting Journals</h3>
              <p className="text-xs text-slate-500">Official transaction journals for sales, purchases, bank, cash, and adjustments</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#FBFBFB] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Journal Code</th>
                  <th className="py-3 px-4">Journal Name</th>
                  <th className="py-3 px-4">Journal Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journals.map((j) => (
                  <tr key={j.id} className="hover:bg-[#D4F6FF]/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{j.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{j.name}</td>
                    <td className="py-3.5 px-4 capitalize font-mono text-slate-600">{j.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD CONTACT MODAL */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 font-display">Add Master Contact</h3>
              <button onClick={() => setShowAddContactModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddContactSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Party / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Living Spaces"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#3095EB]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Type</label>
                <select
                  value={contactForm.type}
                  onChange={(e) => setContactForm({ ...contactForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                >
                  <option value="Customer">Customer (Client)</option>
                  <option value="Vendor">Vendor (Supplier)</option>
                  <option value="Both">Both (Customer & Vendor)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="contact@company.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mobile / Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={contactForm.mobile}
                    onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={contactForm.city}
                    onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    value={contactForm.state}
                    onChange={(e) => setContactForm({ ...contactForm, state: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pincode</label>
                  <input
                    type="text"
                    value={contactForm.pincode}
                    onChange={(e) => setContactForm({ ...contactForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 rounded-xl font-bold border border-[#9BD5FF]/40 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 font-display">Add Catalog Product</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Mesh Task Chair"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-[#3095EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                  >
                    <option value="Chairs & Seating">Chairs & Seating</option>
                    <option value="Desks & Tables">Desks & Tables</option>
                    <option value="Storage & Cabinets">Storage & Cabinets</option>
                    <option value="Lounge & Sofas">Lounge & Sofas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cost Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 3000"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Sales Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 5000"
                    value={productForm.salesPrice}
                    onChange={(e) => setProductForm({ ...productForm, salesPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#C6E7FF] hover:bg-[#9BD5FF] active:bg-[#64B9FF] text-slate-900 rounded-xl font-bold border border-[#9BD5FF]/40 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {showAdjustStockModal && selectedProductForStock && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 font-display">Adjust Inventory Level</h3>
              <button onClick={() => setShowAdjustStockModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Product: <strong className="text-slate-900">{selectedProductForStock.name}</strong>
            </p>

            <form onSubmit={handleStockAdjustmentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">New Total Stock Units *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockAdjustmentForm.newStock}
                  onChange={(e) => setStockAdjustmentForm({ ...stockAdjustmentForm, newStock: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason for Adjustment</label>
                <input
                  type="text"
                  value={stockAdjustmentForm.reason}
                  onChange={(e) => setStockAdjustmentForm({ ...stockAdjustmentForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustStockModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#C6E7FF] hover:bg-[#9BD5FF] text-slate-900 rounded-xl font-bold border border-[#9BD5FF]/40 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ACCOUNT MODAL */}
      {showAddCoaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 font-display">New Chart of Account</h3>
              <button onClick={() => setShowAddCoaModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCoaSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office Equipment"
                  value={coaForm.name}
                  onChange={(e) => setCoaForm({ ...coaForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Account Classification</label>
                <select
                  value={coaForm.type}
                  onChange={(e) => setCoaForm({ ...coaForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                >
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddCoaModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#C6E7FF] hover:bg-[#9BD5FF] text-slate-900 rounded-xl font-bold border border-[#9BD5FF]/40 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD JOURNAL MODAL */}
      {showAddJournalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 font-display">New Journal</h3>
              <button onClick={() => setShowAddJournalModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddJournalSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Journal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ICICI Bank Journal"
                  value={journalForm.name}
                  onChange={(e) => setJournalForm({ ...journalForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Journal Type</label>
                <select
                  value={journalForm.type}
                  onChange={(e) => setJournalForm({ ...journalForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBFBFB] rounded-xl border border-slate-200 text-slate-800 outline-none"
                >
                  <option value="sales">Sales</option>
                  <option value="purchase">Purchase</option>
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddJournalModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#C6E7FF] hover:bg-[#9BD5FF] text-slate-900 rounded-xl font-bold border border-[#9BD5FF]/40 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Journal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
