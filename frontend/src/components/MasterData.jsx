import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Users,
  Package,
  BookOpen,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Tag,
  DollarSign,
  Layers,
  BarChart3,
  SlidersHorizontal,
  Archive,
  ArrowUpRight,
  Receipt,
  FileText,
  CreditCard,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function MasterData({ activeSubTab = 'contacts', setActiveSubTab }) {
  const {
    contacts,
    addContact,
    archiveContact,
    products,
    addProduct,
    adjustProductStock,
    chartOfAccounts,
    addChartOfAccount,
    journals,
    addJournal,
    analyticAccounts,
    addAnalyticAccount,
    getContactHistory,
    formatCurrency,
    userRole
  } = useAccounting();

  // Internal Tabs
  const currentTab = activeSubTab || 'contacts';

  // Search & Filters
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCoAModal, setShowAddCoAModal] = useState(false);
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
  const [showAddAnalyticModal, setShowAddAnalyticModal] = useState(false);
  const [stockAdjustModalProduct, setStockAdjustModalProduct] = useState(null);
  const [selectedContactForDrawer, setSelectedContactForDrawer] = useState(null);

  // Form States
  const [contactForm, setContactForm] = useState({
    name: '',
    type: 'Customer',
    email: '',
    mobile: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    notes: ''
  });

  const [productForm, setProductForm] = useState({
    name: '',
    type: 'Goods',
    salesPrice: '',
    costPrice: '',
    category: 'Seating',
    stock: 10,
    reorderLevel: 5,
    description: ''
  });

  const [coaForm, setCoaForm] = useState({
    code: '',
    name: '',
    type: 'Asset',
    subCategory: 'Current Asset',
    initialBalance: 0
  });

  const [journalForm, setJournalForm] = useState({
    name: '',
    type: 'Sales',
    defaultDebitAccountId: '',
    defaultCreditAccountId: '',
    description: ''
  });

  const [analyticForm, setAnalyticForm] = useState({
    name: '',
    type: 'Expense',
    code: '',
    description: ''
  });

  const [newStockQty, setNewStockQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Physical Stock Audit Count');

  // Submit Handlers
  const handleCreateContact = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) return;
    addContact(contactForm);
    setContactForm({
      name: '',
      type: 'Customer',
      email: '',
      mobile: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      notes: ''
    });
    setShowAddContactModal(false);
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.salesPrice) return;
    addProduct(productForm);
    setProductForm({
      name: '',
      type: 'Goods',
      salesPrice: '',
      costPrice: '',
      category: 'Seating',
      stock: 10,
      reorderLevel: 5,
      description: ''
    });
    setShowAddProductModal(false);
  };

  const handleCreateCoA = (e) => {
    e.preventDefault();
    if (!coaForm.name || !coaForm.code) return;
    addChartOfAccount(coaForm);
    setCoaForm({ code: '', name: '', type: 'Asset', subCategory: 'Current Asset', initialBalance: 0 });
    setShowAddCoAModal(false);
  };

  const handleCreateJournal = (e) => {
    e.preventDefault();
    if (!journalForm.name) return;
    addJournal(journalForm);
    setJournalForm({ name: '', type: 'Sales', defaultDebitAccountId: '', defaultCreditAccountId: '', description: '' });
    setShowAddJournalModal(false);
  };

  const handleCreateAnalytic = (e) => {
    e.preventDefault();
    if (!analyticForm.name) return;
    addAnalyticAccount(analyticForm);
    setAnalyticForm({ name: '', type: 'Expense', code: '', description: '' });
    setShowAddAnalyticModal(false);
  };

  const handleApplyStockAdjustment = (e) => {
    e.preventDefault();
    if (!stockAdjustModalProduct || newStockQty === '') return;
    adjustProductStock(stockAdjustModalProduct.id, Number(newStockQty), adjustReason);
    setStockAdjustModalProduct(null);
    setNewStockQty('');
  };

  // Filtered contacts
  const filteredContacts = contacts.filter(c => {
    const matchType = filterType === 'All' || c.type === filterType || (c.type === 'Both' && (filterType === 'Customer' || filterType === 'Vendor'));
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address?.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchType = filterType === 'All' || p.type === filterType || p.category === filterType;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const contactHistory = selectedContactForDrawer ? getContactHistory(selectedContactForDrawer.id) : null;

  return (
    <div className="space-y-6">
      {/* Sub-module Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('contacts')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'contacts'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Contacts ({contacts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('products')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'products'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products & Stock ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('coa')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'coa'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Chart of Accounts ({chartOfAccounts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('journals')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'journals'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Journals Master ({journals.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytic Accounts ({analyticAccounts.length})</span>
          </button>
        </div>

        {/* Dynamic Action Buttons */}
        <div>
          {currentTab === 'contacts' && userRole !== 'Contact' && (
            <button
              onClick={() => setShowAddContactModal(true)}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Contact</span>
            </button>
          )}

          {currentTab === 'products' && userRole !== 'Contact' && (
            <button
              onClick={() => setShowAddProductModal(true)}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Product</span>
            </button>
          )}

          {currentTab === 'coa' && userRole === 'Admin' && (
            <button
              onClick={() => setShowAddCoAModal(true)}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add CoA Account</span>
            </button>
          )}

          {currentTab === 'journals' && userRole === 'Admin' && (
            <button
              onClick={() => setShowAddJournalModal(true)}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Journal</span>
            </button>
          )}

          {currentTab === 'analytics' && userRole !== 'Contact' && (
            <button
              onClick={() => setShowAddAnalyticModal(true)}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Cost Center</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. CONTACTS MASTER VIEW */}
      {/* ========================================================= */}
      {currentTab === 'contacts' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Type:</span>
              {['All', 'Customer', 'Vendor', 'Both'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    filterType === t ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search contact, city, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 text-xs rounded-xl border border-slate-700 focus:border-indigo-500 outline-none text-slate-200"
              />
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Role / Type</th>
                    <th className="py-3 px-4">Phone & Email</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredContacts.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedContactForDrawer(c)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={c.profileImage}
                            alt={c.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                              {c.name}
                            </span>
                            <p className="text-[10px] font-mono text-slate-400">{c.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            c.type === 'Customer'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : c.type === 'Vendor'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center space-x-1.5 text-slate-300">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{c.email}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{c.mobile}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>
                            {c.address?.city}, {c.address?.state}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 text-[11px] font-semibold ${
                            c.isArchived ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{c.isArchived ? 'Archived' : 'Active'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedContactForDrawer(c);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                          >
                            View Ledger
                          </button>
                          {userRole === 'Admin' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                archiveContact(c.id);
                              }}
                              className="text-slate-400 hover:text-rose-400 p-1"
                              title={c.isArchived ? 'Unarchive' : 'Archive Contact'}
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
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
      {/* 2. PRODUCTS & INVENTORY MASTER VIEW */}
      {/* ========================================================= */}
      {currentTab === 'products' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Category:</span>
              {['All', 'Goods', 'Service', 'Combo'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    filterType === t ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search furniture product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 text-xs rounded-xl border border-slate-700 focus:border-indigo-500 outline-none text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const margin = p.salesPrice - p.costPrice;
              const marginPercent = p.salesPrice > 0 ? Math.round((margin / p.salesPrice) * 100) : 0;
              const isLowStock = p.type === 'Goods' && p.stock <= p.reorderLevel;

              return (
                <div
                  key={p.id}
                  className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {p.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.type === 'Goods'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : p.type === 'Service'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {p.type}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-100 mt-2.5 group-hover:text-indigo-400 transition-colors">
                      {p.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description || `Category: ${p.category}`}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800/80">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">Sales Price</span>
                        <p className="font-extrabold text-emerald-400 text-sm">{formatCurrency(p.salesPrice)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-medium">Cost (Purchase)</span>
                        <p className="font-bold text-slate-300 text-sm">{formatCurrency(p.costPrice)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/40 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">Stock On-Hand</span>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className={`font-mono font-bold text-sm ${isLowStock ? 'text-amber-400' : 'text-slate-100'}`}>
                            {p.stock} units
                          </span>
                          {isLowStock && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-semibold">
                              Low Stock
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <button
                          onClick={() => {
                            setStockAdjustModalProduct(p);
                            setNewStockQty(p.stock);
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium"
                        >
                          Adjust Stock
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. CHART OF ACCOUNTS (CoA) MASTER VIEW */}
      {/* ========================================================= */}
      {currentTab === 'coa' && (
        <div className="space-y-6">
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Chart of Accounts governs the double-entry accounting ledger. All balances update in real-time as transactions occur.
              </span>
            </div>
            <span className="font-mono text-indigo-300 font-bold bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-800/50">
              5 Account Classifications
            </span>
          </div>

          {['Asset', 'Liability', 'Capital', 'Income', 'Expense'].map((type) => {
            const accounts = chartOfAccounts.filter((a) => a.type === type);
            if (accounts.length === 0) return null;

            return (
              <div key={type} className="glass-panel rounded-2xl overflow-hidden">
                <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        type === 'Asset'
                          ? 'bg-emerald-400'
                          : type === 'Liability'
                          ? 'bg-amber-400'
                          : type === 'Capital'
                          ? 'bg-purple-400'
                          : type === 'Income'
                          ? 'bg-teal-400'
                          : 'bg-rose-400'
                      }`}
                    ></span>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-100">{type} Accounts</h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800">
                    {accounts.length} Accounts
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800/60 text-slate-400 text-[11px]">
                        <th className="py-3 px-5">Code</th>
                        <th className="py-3 px-5">Account Name</th>
                        <th className="py-3 px-5">Sub Classification</th>
                        <th className="py-3 px-5 text-right">Ledger Balance (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {accounts.map((acc) => (
                        <tr key={acc.id || acc.code} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-5 font-mono font-bold text-indigo-400">{acc.code}</td>
                          <td className="py-3 px-5 font-bold text-slate-100">{acc.name}</td>
                          <td className="py-3 px-5 text-slate-400">{acc.subCategory}</td>
                          <td className="py-3 px-5 text-right font-extrabold text-slate-100 font-mono">
                            {formatCurrency(acc.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. JOURNALS MASTER VIEW */}
      {/* ========================================================= */}
      {currentTab === 'journals' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Journals categorize financial transactions. Each journal can route to default CoA debit/credit accounts.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {journals.map((j) => (
              <div key={j.id} className="glass-panel p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {j.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    {j.type} Journal
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-100">{j.name}</h4>
                <p className="text-xs text-slate-400">{j.description}</p>

                <div className="pt-3 border-t border-slate-800 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Default Debit:</span>
                    <span className="text-emerald-400 font-semibold">{j.defaultDebitAccountId || 'Auto Rule'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Default Credit:</span>
                    <span className="text-indigo-400 font-semibold">{j.defaultCreditAccountId || 'Auto Rule'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ANALYTIC ACCOUNTS / COST CENTERS VIEW */}
      {/* ========================================================= */}
      {currentTab === 'analytics' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Analytic Accounts act as cost centers and project markers for tracking revenues & expenses by showroom, warehouse, or campaign.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticAccounts.map((a) => (
              <div key={a.id} className="glass-panel p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {a.code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      a.type === 'Income'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {a.type} Center
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-100">{a.name}</h4>
                <p className="text-xs text-slate-400">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CONTACT DETAILS & LEDGER HISTORY DRAWER */}
      {/* ========================================================= */}
      {selectedContactForDrawer && contactHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedContactForDrawer.profileImage}
                  alt={selectedContactForDrawer.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-100">{selectedContactForDrawer.name}</h3>
                  <span className="text-xs font-mono text-indigo-400">{selectedContactForDrawer.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedContactForDrawer(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Balances Card */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Customer Receivables</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">{formatCurrency(contactHistory.totalReceivable)}</p>
                <span className="text-[11px] text-slate-500">Invoiced: {formatCurrency(contactHistory.totalInvoiced)}</span>
              </div>
              <div className="glass-card p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Vendor Payables</span>
                <p className="text-lg font-bold text-amber-400 mt-1">{formatCurrency(contactHistory.totalPayable)}</p>
                <span className="text-[11px] text-slate-500">Billed: {formatCurrency(contactHistory.totalBilled)}</span>
              </div>
            </div>

            {/* Invoices or Bills list */}
            {contactHistory.invoices.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Customer Invoices</h4>
                <div className="glass-panel rounded-xl overflow-hidden divide-y divide-slate-800/60 text-xs">
                  {contactHistory.invoices.map((inv) => (
                    <div key={inv.id} className="p-3 flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-slate-200">{inv.id}</span>
                        <span className="text-slate-500 ml-2">{inv.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-100">{formatCurrency(inv.totalAmount)}</span>
                        <span
                          className={`ml-2 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            inv.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contactHistory.vendorBills.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Vendor Bills</h4>
                <div className="glass-panel rounded-xl overflow-hidden divide-y divide-slate-800/60 text-xs">
                  {contactHistory.vendorBills.map((b) => (
                    <div key={b.id} className="p-3 flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold text-slate-200">{b.id}</span>
                        <span className="text-slate-500 ml-2">{b.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-100">{formatCurrency(b.totalAmount)}</span>
                        <span
                          className={`ml-2 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            b.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD CONTACT */}
      {/* ========================================================= */}
      {showAddContactModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">Create New Master Contact</h3>
              <button onClick={() => setShowAddContactModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Contact / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prestige Living Interiors"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Contact Role / Type</label>
                  <select
                    value={contactForm.type}
                    onChange={(e) => setContactForm({ ...contactForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Both">Both (Customer + Vendor)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={contactForm.mobile}
                    onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="contact@company.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    value={contactForm.city}
                    onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">State</label>
                  <input
                    type="text"
                    placeholder="Maharashtra"
                    value={contactForm.state}
                    onChange={(e) => setContactForm({ ...contactForm, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Pincode</label>
                  <input
                    type="text"
                    placeholder="400001"
                    value={contactForm.pincode}
                    onChange={(e) => setContactForm({ ...contactForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD PRODUCT */}
      {/* ========================================================= */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">Add New Furniture Product</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Standing Desk"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Product Type</label>
                  <select
                    value={productForm.type}
                    onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none"
                  >
                    <option value="Goods">Goods (Physical Inventory)</option>
                    <option value="Service">Service (Assembly / Transport)</option>
                    <option value="Combo">Combo (Bundle Package)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Office Furniture"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Sales Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="5000"
                    value={productForm.salesPrice}
                    onChange={(e) => setProductForm({ ...productForm, salesPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Cost / Purchase Price (₹)</label>
                  <input
                    type="number"
                    placeholder="3000"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Reorder Alert Level</label>
                  <input
                    type="number"
                    value={productForm.reorderLevel}
                    onChange={(e) => setProductForm({ ...productForm, reorderLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: STOCK ADJUSTMENT */}
      {/* ========================================================= */}
      {stockAdjustModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 rounded-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">Stock Count Adjustment</h3>
              <button onClick={() => setStockAdjustModalProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyStockAdjustment} className="space-y-3 text-xs">
              <p className="text-slate-300">
                Adjusting on-hand inventory stock for <strong>{stockAdjustModalProduct.name}</strong>.
              </p>

              <div>
                <label className="block text-slate-400 font-medium mb-1">New Physical Count *</label>
                <input
                  type="number"
                  required
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Reason for Adjustment</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setStockAdjustModalProduct(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD CHART OF ACCOUNTS */}
      {/* ========================================================= */}
      {showAddCoAModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">Add Account to Chart of Accounts</h3>
              <button onClick={() => setShowAddCoAModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoA} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Account Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1050"
                    value={coaForm.code}
                    onChange={(e) => setCoaForm({ ...coaForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Classification Type *</label>
                  <select
                    value={coaForm.type}
                    onChange={(e) => setCoaForm({ ...coaForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100"
                  >
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Capital">Capital (Equity)</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ICICI Current Account"
                  value={coaForm.name}
                  onChange={(e) => setCoaForm({ ...coaForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Subcategory</label>
                <input
                  type="text"
                  placeholder="Current Asset"
                  value={coaForm.subCategory}
                  onChange={(e) => setCoaForm({ ...coaForm, subCategory: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-slate-100"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddCoAModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-md"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
