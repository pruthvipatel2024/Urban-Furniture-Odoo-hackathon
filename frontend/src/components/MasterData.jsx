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
  ShieldCheck,
  LayoutGrid,
  List,
  Eye,
  CheckCircle2,
  FolderTree,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';

export default function MasterData({ activeSubTab = 'contacts', setActiveSubTab }) {
  const {
    contacts,
    products,
    chartOfAccounts,
    journals,
    analyticAccounts,
    budgets,
    addContact,
    archiveContact,
    addProduct,
    adjustProductStock,
    addChartOfAccount,
    addJournal,
    addAnalyticAccount,
    formatCurrency,
    setActiveTab,
    userRole
  } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'

  // Form View Selection States (Excalidraw: clicking New or record opens Form View)
  const [selectedContact, setSelectedContact] = useState(null); // contact object or 'new'
  const [selectedProduct, setSelectedProduct] = useState(null); // product object or 'new'
  const [selectedAnalytic, setSelectedAnalytic] = useState(null); // analytic object or 'new'

  // Modal States for COA & Journals
  const [showAddCoaModal, setShowAddCoaModal] = useState(false);
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form Data States
  const [contactFormData, setContactFormData] = useState({
    name: '',
    type: 'Customer',
    email: '',
    mobile: '',
    street: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400001',
    imageUrl: ''
  });

  const [productFormData, setProductFormData] = useState({
    name: '',
    type: 'Goods', // Goods | Service | Combo
    salesPrice: '',
    costPrice: '',
    category: 'Chairs & Seating',
    stock: 10,
    imageUrl: ''
  });

  const [analyticFormData, setAnalyticFormData] = useState({
    name: '',
    type: 'expense', // income | expense
    description: ''
  });

  const [coaForm, setCoaForm] = useState({ name: '', type: 'Asset' });
  const [journalForm, setJournalForm] = useState({ name: '', type: 'General' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available Categories (supports on-the-fly additions)
  const [categories, setCategories] = useState([
    'Chairs & Seating',
    'Desks & Tables',
    'Storage & Cabinets',
    'Lounge & Sofas',
    'Office Accessories'
  ]);

  // Handle Contact Selection / New
  const handleOpenNewContact = () => {
    setContactFormData({
      name: '',
      type: 'Customer',
      email: '',
      mobile: '',
      street: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
      imageUrl: ''
    });
    setFormError('');
    setSelectedContact('new');
  };

  const handleOpenEditContact = (c) => {
    setContactFormData({
      name: c.name || '',
      type: c.type || 'Customer',
      email: c.email || '',
      mobile: c.mobile || '',
      street: c.address?.street || '',
      city: c.address?.city || 'Mumbai',
      state: c.address?.state || 'Maharashtra',
      country: c.address?.country || 'India',
      pincode: c.address?.pincode || '400001',
      imageUrl: c.imageUrl || ''
    });
    setFormError('');
    setSelectedContact(c);
  };

  // Handle Product Selection / New
  const handleOpenNewProduct = () => {
    setProductFormData({
      name: '',
      type: 'Goods',
      salesPrice: '',
      costPrice: '',
      category: categories[0] || 'Chairs & Seating',
      stock: 10,
      imageUrl: ''
    });
    setFormError('');
    setSelectedProduct('new');
  };

  const handleOpenEditProduct = (p) => {
    setProductFormData({
      name: p.name || '',
      type: p.type || 'Goods',
      salesPrice: p.salesPrice || '',
      costPrice: p.costPrice || p.cost || '',
      category: p.category || 'Chairs & Seating',
      stock: p.availableStock !== undefined ? p.availableStock : (p.stock || 0),
      imageUrl: p.imageUrl || ''
    });
    setFormError('');
    setSelectedProduct(p);
  };

  // Handle Analytic Selection / New
  const handleOpenNewAnalytic = () => {
    setAnalyticFormData({
      name: '',
      type: 'expense',
      description: ''
    });
    setFormError('');
    setSelectedAnalytic('new');
  };

  const handleOpenEditAnalytic = (a) => {
    setAnalyticFormData({
      name: a.name || '',
      type: (a.type || 'expense').toLowerCase(),
      description: a.description || ''
    });
    setFormError('');
    setSelectedAnalytic(a);
  };

  // Submit Contact Form
  const handleSaveContact = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    if (!contactFormData.name.trim()) {
      setFormError('Contact Name is required.');
      return;
    }

    if (contactFormData.email && selectedContact === 'new') {
      const emailExists = contacts.some(c => c.email && c.email.toLowerCase() === contactFormData.email.toLowerCase().trim());
      if (emailExists) {
        setFormError('A contact with this unique email address already exists in MySQL.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await addContact(contactFormData);
      setSelectedContact(null);
    } catch (err) {
      setFormError(err.message || 'Failed to save contact.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Product Form
  const handleSaveProduct = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    if (!productFormData.name.trim()) {
      setFormError('Product Name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addProduct(productFormData);
      setSelectedProduct(null);
    } catch (err) {
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Analytic Account Form
  const handleSaveAnalytic = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    if (!analyticFormData.name.trim()) {
      setFormError('Analytic Account Name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addAnalyticAccount(analyticFormData);
      setSelectedAnalytic(null);
    } catch (err) {
      setFormError(err.message || 'Failed to save analytic account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Category on the fly (Many2one inline create)
  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      const trimmed = newCategoryName.trim();
      if (!categories.includes(trimmed)) {
        setCategories([...categories, trimmed]);
      }
      setProductFormData({ ...productFormData, category: trimmed });
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    }
  };

  // Filtered Lists
  const filteredContacts = contacts.filter(c => {
    const matchType = filterType === 'All' || c.type === filterType || (filterType === 'Customer' && c.type === 'Both') || (filterType === 'Vendor' && c.type === 'Both');
    const matchSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.mobile || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const filteredProducts = products.filter(p => {
    const matchType = filterType === 'All' || p.category === filterType || p.type === filterType;
    const matchSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const filteredAnalytics = analyticAccounts.filter(a => {
    const matchType = filterType === 'All' || (a.type || '').toLowerCase() === filterType.toLowerCase();
    const matchSearch = (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  const filteredCoA = chartOfAccounts.filter(a => {
    const matchType = filterType === 'All' || (a.type || '').toLowerCase() === filterType.toLowerCase();
    const matchSearch = (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Master Data Dedicated Header */}
      {!selectedContact && !selectedProduct && !selectedAnalytic && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3E7EA] shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#EEF4F8] border border-[#E3E7EA] text-[#0B2A4A] flex items-center justify-center shadow-xs shrink-0">
              {activeSubTab === 'contacts' && <Users className="w-5 h-5 text-[#0B2A4A]" />}
              {activeSubTab === 'products' && <Package className="w-5 h-5 text-[#C98232]" />}
              {activeSubTab === 'analytics' && <FolderTree className="w-5 h-5 text-[#0B2A4A]" />}
              {activeSubTab === 'coa' && <BookOpen className="w-5 h-5 text-[#0B2A4A]" />}
              {activeSubTab === 'journals' && <Layers className="w-5 h-5 text-[#0B2A4A]" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-lg text-[#0B2A4A]">
                  {activeSubTab === 'contacts' && 'Contacts Directory'}
                  {activeSubTab === 'products' && 'Products & Inventory'}
                  {activeSubTab === 'analytics' && 'Analytic Accounts'}
                  {activeSubTab === 'coa' && 'Chart of Accounts'}
                  {activeSubTab === 'journals' && 'Journals Master'}
                </h2>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#EEF4F8] text-[#0B2A4A] font-semibold border border-[#E3E7EA]">
                  {activeSubTab === 'contacts' && `${contacts.length} Records`}
                  {activeSubTab === 'products' && `${products.length} Products`}
                  {activeSubTab === 'analytics' && `${analyticAccounts.length} Accounts`}
                  {activeSubTab === 'coa' && `${chartOfAccounts.length} Accounts`}
                  {activeSubTab === 'journals' && `${journals.length} Journals`}
                </span>
              </div>
              <p className="text-xs text-[#667482] mt-0.5">
                {activeSubTab === 'contacts' && 'Manage customers, vendors, and partners directory with complete contact profiles'}
                {activeSubTab === 'products' && 'Manage furniture products catalog, categories, pricing, and stock valuation'}
                {activeSubTab === 'analytics' && 'Cost centers, project tagging, and analytical expenditure allocation'}
                {activeSubTab === 'coa' && 'General ledger accounts list with account types, codes, and balance sheets'}
                {activeSubTab === 'journals' && 'Financial journals for bank, cash, sales, purchases, and miscellaneous entries'}
              </p>
            </div>
          </div>

          {/* View Toggle & New Entity Button */}
          <div className="flex items-center space-x-3 shrink-0">
            {['contacts', 'products', 'analytics'].includes(activeSubTab) && (
              <div className="flex items-center bg-[#FAFAF8] p-1 rounded-xl border border-[#E3E7EA]">
                <button
                  onClick={() => setViewMode('list')}
                  title="List View"
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-[#0B2A4A] shadow-xs font-bold border border-[#E3E7EA]'
                      : 'text-[#667482] hover:text-[#0B2A4A]'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  title="Kanban View"
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'kanban'
                      ? 'bg-white text-[#0B2A4A] shadow-xs font-bold border border-[#E3E7EA]'
                      : 'text-[#667482] hover:text-[#0B2A4A]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            )}

            {userRole !== 'Contact' && (
              <div>
                {activeSubTab === 'contacts' && (
                  <button
                    onClick={handleOpenNewContact}
                    className="flex items-center space-x-1.5 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#0B2A4A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Contact</span>
                  </button>
                )}

                {activeSubTab === 'products' && (
                  <button
                    onClick={handleOpenNewProduct}
                    className="flex items-center space-x-1.5 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#0B2A4A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Product</span>
                  </button>
                )}

                {activeSubTab === 'analytics' && (
                  <button
                    onClick={handleOpenNewAnalytic}
                    className="flex items-center space-x-1.5 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#0B2A4A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Analytic Account</span>
                  </button>
                )}

                {activeSubTab === 'coa' && (
                  <button
                    onClick={() => setShowAddCoaModal(true)}
                    className="flex items-center space-x-1.5 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#0B2A4A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Account</span>
                  </button>
                )}

                {activeSubTab === 'journals' && userRole === 'Admin' && (
                  <button
                    onClick={() => setShowAddJournalModal(true)}
                    className="flex items-center space-x-1.5 bg-[#0B2A4A] hover:bg-[#163B63] active:bg-[#0B2A4A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Journal</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CONTACT MASTER FORM VIEW (Excalidraw: New, Confirm, Back)              */}
      {/* ========================================================================= */}
      {selectedContact && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden p-6 space-y-6">
          {/* Form Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EA] pb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedContact(null)}
                className="p-2 text-[#667482] hover:text-[#0B2A4A] hover:bg-[#EEF4F8] rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-base font-bold text-[#0B2A4A]">
                  {selectedContact === 'new' ? 'Contact Master Form View' : `Contact — ${contactFormData.name}`}
                </h3>
                <p className="text-xs text-[#667482]">Manage customer or vendor contact profile</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenNewContact}
                className="px-3.5 py-1.5 rounded-xl border border-[#E3E7EA] text-[#0B2A4A] bg-[#EEF4F8] hover:bg-[#E2ECF2] text-xs font-semibold transition-all cursor-pointer"
              >
                New
              </button>

              <button
                onClick={handleSaveContact}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Confirm'}
              </button>

              <button
                onClick={() => setSelectedContact(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#E3E7EA] text-[#667482] hover:bg-[#FAFAF8] text-xs font-semibold transition-all cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>

          {formError && (
            <div className="p-3.5 bg-[#FDECEC] border border-[#B42318]/30 rounded-xl text-[#B42318] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Contact Fields Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Contact Details */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Contact Name *</label>
                  <input
                    type="text"
                    value={contactFormData.name}
                    onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                    placeholder="e.g. Open Wood Corp, Joey Wills"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Partner Type</label>
                  <select
                    value={contactFormData.type}
                    onChange={(e) => setContactFormData({ ...contactFormData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Both">Both (Customer & Vendor)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Unique Email</label>
                  <input
                    type="email"
                    value={contactFormData.email}
                    onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                    placeholder="e.g. openwood21@example.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={contactFormData.mobile}
                    onChange={(e) => setContactFormData({ ...contactFormData, mobile: e.target.value })}
                    placeholder="e.g. +91 9090090909"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div className="space-y-3 pt-3 border-t border-[#E3E7EA]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#667482]">Address Information</h4>
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Street Address</label>
                  <input
                    type="text"
                    value={contactFormData.street}
                    onChange={(e) => setContactFormData({ ...contactFormData, street: e.target.value })}
                    placeholder="e.g. 104 Design Boulevard"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#17212B] mb-1">City</label>
                    <input
                      type="text"
                      value={contactFormData.city}
                      onChange={(e) => setContactFormData({ ...contactFormData, city: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E3E7EA] rounded-lg text-xs text-[#17212B] outline-none focus:border-[#0B2A4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#17212B] mb-1">State</label>
                    <input
                      type="text"
                      value={contactFormData.state}
                      onChange={(e) => setContactFormData({ ...contactFormData, state: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E3E7EA] rounded-lg text-xs text-[#17212B] outline-none focus:border-[#0B2A4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#17212B] mb-1">Country</label>
                    <input
                      type="text"
                      value={contactFormData.country}
                      onChange={(e) => setContactFormData({ ...contactFormData, country: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E3E7EA] rounded-lg text-xs text-[#17212B] outline-none focus:border-[#0B2A4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#17212B] mb-1">Pincode</label>
                    <input
                      type="text"
                      value={contactFormData.pincode}
                      onChange={(e) => setContactFormData({ ...contactFormData, pincode: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E3E7EA] rounded-lg text-xs text-[#17212B] outline-none focus:border-[#0B2A4A]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Upload Image Card */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#17212B]">Upload Image</label>
              <div className="border-2 border-dashed border-[#E3E7EA] rounded-2xl p-6 text-center bg-[#FAFAF8] flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#EEF4F8] border border-[#E3E7EA] flex items-center justify-center text-[#0B2A4A] text-xl font-bold">
                  {contactFormData.name ? contactFormData.name.charAt(0).toUpperCase() : <ImageIcon className="w-6 h-6 text-[#8A96A3]" />}
                </div>
                <div className="text-xs text-[#667482]">
                  <p className="font-semibold text-[#17212B]">Contact Avatar / Logo</p>
                  <p className="text-[10px] text-[#8A96A3] mt-0.5">PNG, JPG, SVG up to 5MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PRODUCT MASTER FORM VIEW (Excalidraw: New, Confirm, Back, Category)    */}
      {/* ========================================================================= */}
      {selectedProduct && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden p-6 space-y-6">
          {/* Form Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EA] pb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 text-[#667482] hover:text-[#0B2A4A] hover:bg-[#EEF4F8] rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-base font-bold text-[#0B2A4A]">
                  {selectedProduct === 'new' ? 'Product Master Form View' : `Product — ${productFormData.name}`}
                </h3>
                <p className="text-xs text-[#667482]">Catalog pricing, category assignment and stock level</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenNewProduct}
                className="px-3.5 py-1.5 rounded-xl border border-[#E3E7EA] text-[#0B2A4A] bg-[#EEF4F8] hover:bg-[#E2ECF2] text-xs font-semibold transition-all cursor-pointer"
              >
                New
              </button>

              <button
                onClick={handleSaveProduct}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Confirm'}
              </button>

              <button
                onClick={() => setSelectedProduct(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#E3E7EA] text-[#667482] hover:bg-[#FAFAF8] text-xs font-semibold transition-all cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>

          {formError && (
            <div className="p-3.5 bg-[#FDECEC] border border-[#B42318]/30 rounded-xl text-[#B42318] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Product Fields Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    placeholder="e.g. Ergonomic Executive Chair"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Product Type</label>
                  <select
                    value={productFormData.type}
                    onChange={(e) => setProductFormData({ ...productFormData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
                  >
                    <option value="Goods">Goods (Physical Stock)</option>
                    <option value="Service">Service</option>
                    <option value="Combo">Combo</option>
                  </select>
                </div>
              </div>

              {/* Category (Many2one with Create & Save on the fly) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#17212B]">Category</label>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                    className="text-[11px] font-semibold text-[#C98232] hover:underline cursor-pointer"
                  >
                    {showNewCategoryInput ? 'Choose existing' : '+ Create category on the fly'}
                  </button>
                </div>

                {showNewCategoryInput ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter new category name..."
                      className="flex-1 px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="px-3.5 py-2.5 bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Save Category
                    </button>
                  </div>
                ) : (
                  <select
                    value={productFormData.category}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Prices & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#E3E7EA]">
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Sales Price (₹) *</label>
                  <input
                    type="number"
                    value={productFormData.salesPrice}
                    onChange={(e) => setProductFormData({ ...productFormData, salesPrice: e.target.value })}
                    placeholder="e.g. 100.00"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] font-mono outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={productFormData.costPrice}
                    onChange={(e) => setProductFormData({ ...productFormData, costPrice: e.target.value })}
                    placeholder="e.g. 50.00"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] font-mono outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Initial Stock Qty</label>
                  <input
                    type="number"
                    value={productFormData.stock}
                    onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] font-mono outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
                  />
                </div>
              </div>
            </div>

            {/* Right: Upload Image Card */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#17212B]">Upload Image</label>
              <div className="border-2 border-dashed border-[#E3E7EA] rounded-2xl p-6 text-center bg-[#FAFAF8] flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#F8F0E6] border border-[#E3E7EA] flex items-center justify-center text-[#C98232]">
                  <Package className="w-8 h-8 text-[#C98232]" />
                </div>
                <div className="text-xs text-[#667482]">
                  <p className="font-semibold text-[#17212B]">Product Image Preview</p>
                  <p className="text-[10px] text-[#8A96A3] mt-0.5">High-resolution furniture render</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ANALYTIC ACCOUNT FORM VIEW (Excalidraw: Income/Expense, Budgets)       */}
      {/* ========================================================================= */}
      {selectedAnalytic && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7EA] pb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedAnalytic(null)}
                className="p-2 text-[#667482] hover:text-[#0B2A4A] hover:bg-[#EEF4F8] rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-base font-bold text-[#0B2A4A]">
                  {selectedAnalytic === 'new' ? 'Analytic Account Form View' : `Analytic Account — ${analyticFormData.name}`}
                </h3>
                <p className="text-xs text-[#667482]">Multi-dimensional cost center & revenue project tracking</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleOpenNewAnalytic}
                className="px-3.5 py-1.5 rounded-xl border border-[#E3E7EA] text-[#0B2A4A] bg-[#EEF4F8] hover:bg-[#E2ECF2] text-xs font-semibold transition-all cursor-pointer"
              >
                New
              </button>

              <button
                onClick={handleSaveAnalytic}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Confirm'}
              </button>

              <button
                onClick={() => setSelectedAnalytic(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#E3E7EA] text-[#667482] hover:bg-[#FAFAF8] text-xs font-semibold transition-all cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>

          {formError && (
            <div className="p-3.5 bg-[#FDECEC] border border-[#B42318]/30 rounded-xl text-[#B42318] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Analytic Account Name *</label>
              <input
                type="text"
                value={analyticFormData.name}
                onChange={(e) => setAnalyticFormData({ ...analyticFormData, name: e.target.value })}
                placeholder="e.g. Project A - Corporate Lounge"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Analytic Account Type</label>
              <select
                value={analyticFormData.type}
                onChange={(e) => setAnalyticFormData({ ...analyticFormData, type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
              >
                <option value="income">Income (Revenue Analytics)</option>
                <option value="expense">Expense (Cost Center Analytics)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#17212B] mb-1.5">Description & Purpose</label>
              <textarea
                value={analyticFormData.description}
                onChange={(e) => setAnalyticFormData({ ...analyticFormData, description: e.target.value })}
                placeholder="Describe project scope, department tracking, or client tags..."
                rows="3"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
              ></textarea>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MASTER DATA LIST & KANBAN VIEWS (Contacts, Products, Analytics, COA, J) */}
      {/* ========================================================================= */}
      {!selectedContact && !selectedProduct && !selectedAnalytic && (
        <div className="bg-white rounded-2xl border border-[#E3E7EA] shadow-xs overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-[#E3E7EA] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A96A3]" />
              <input
                type="text"
                placeholder={
                  activeSubTab === 'contacts' ? 'Search contacts by name, email, phone...' :
                  activeSubTab === 'products' ? 'Search products by name, category...' :
                  activeSubTab === 'analytics' ? 'Search analytic accounts by name, code...' :
                  activeSubTab === 'coa' ? 'Search chart of accounts by code, name...' :
                  'Search journals...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FAFAF8] text-xs text-[#17212B] placeholder-[#8A96A3] border border-[#E3E7EA] rounded-xl outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8] transition-all"
              />
            </div>

            {/* Quick Filter Tabs */}
            {activeSubTab === 'contacts' && (
              <div className="flex items-center space-x-1 bg-[#FAFAF8] p-1 rounded-xl border border-[#E3E7EA] text-xs shrink-0 overflow-x-auto">
                {['All', 'Customer', 'Vendor', 'Customer & Vendor'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      filterType === t
                        ? 'bg-white text-[#0B2A4A] border border-[#E3E7EA] shadow-xs'
                        : 'text-[#667482] hover:text-[#0B2A4A]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {activeSubTab === 'analytics' && (
              <div className="flex items-center space-x-1 bg-[#FAFAF8] p-1 rounded-xl border border-[#E3E7EA] text-xs shrink-0">
                {['All', 'Expense', 'Income'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      filterType === t
                        ? 'bg-white text-[#0B2A4A] border border-[#E3E7EA] shadow-xs'
                        : 'text-[#667482] hover:text-[#0B2A4A]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {activeSubTab === 'coa' && (
              <div className="flex items-center space-x-1 bg-[#FAFAF8] p-1 rounded-xl border border-[#E3E7EA] text-xs shrink-0 overflow-x-auto">
                {['All', 'Asset', 'Liability', 'Equity', 'Income', 'Expense'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      filterType === t
                        ? 'bg-white text-[#0B2A4A] border border-[#E3E7EA] shadow-xs'
                        : 'text-[#667482] hover:text-[#0B2A4A]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TAB 1: CONTACTS VIEW */}
          {activeSubTab === 'contacts' && (
            viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-semibold tracking-wider">
                    <tr>
                      <th className="p-4 w-12 text-center">Select</th>
                      <th className="p-4 w-16">Image</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Type</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E7EA]/60">
                    {filteredContacts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-[#8A96A3]">
                          No contacts found in database.
                        </td>
                      </tr>
                    ) : (
                      filteredContacts.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => handleOpenEditContact(c)}
                          className="hover:bg-[#FAFAF8] cursor-pointer transition-colors"
                        >
                          <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" className="rounded border-[#E3E7EA] text-[#0B2A4A] focus:ring-[#EEF4F8]" />
                          </td>
                          <td className="p-4">
                            <div className="w-8 h-8 rounded-lg bg-[#EEF4F8] border border-[#E3E7EA] flex items-center justify-center text-[#0B2A4A] font-bold text-xs">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                          </td>
                          <td className="p-4 font-bold text-[#0B2A4A]">{c.name}</td>
                          <td className="p-4 text-[#667482]">{c.email || '—'}</td>
                          <td className="p-4 text-[#667482] font-mono">{c.mobile || '—'}</td>
                          <td className="p-4">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF4F8] text-[#0B2A4A] border border-[#E3E7EA]">
                              {c.type}
                            </span>
                          </td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEditContact(c)}
                              className="p-1.5 text-[#667482] hover:text-[#0B2A4A] rounded-lg hover:bg-[#EEF4F8] cursor-pointer"
                              title="Edit Contact"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* KANBAN VIEW */
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContacts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleOpenEditContact(c)}
                    className="bg-[#FAFAF8] hover:bg-white rounded-2xl border border-[#E3E7EA] p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EEF4F8] text-[#0B2A4A] font-bold flex items-center justify-center text-sm border border-[#E3E7EA]">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0B2A4A] text-sm leading-tight">{c.name}</h4>
                        <span className="text-[10px] text-[#8A96A3] font-mono">{c.type}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-[#667482] border-t border-[#E3E7EA] pt-3">
                      <p className="flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#8A96A3]" />
                        <span className="truncate">{c.email || 'No email registered'}</span>
                      </p>
                      <p className="flex items-center space-x-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-[#8A96A3]" />
                        <span>{c.mobile || 'No phone registered'}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 2: PRODUCTS VIEW */}
          {activeSubTab === 'products' && (
            viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-semibold tracking-wider">
                    <tr>
                      <th className="p-4 w-16">Image</th>
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Product Type</th>
                      <th className="p-4 text-right">Sales Price</th>
                      <th className="p-4 text-right">Cost Price</th>
                      <th className="p-4 text-right">On Hand Stock</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E7EA]/60">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-[#8A96A3]">
                          No products found in database.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr
                          key={p.id}
                          onClick={() => handleOpenEditProduct(p)}
                          className="hover:bg-[#FAFAF8] cursor-pointer transition-colors"
                        >
                          <td className="p-4">
                            <div className="w-8 h-8 rounded-lg bg-[#F8F0E6] border border-[#E3E7EA] flex items-center justify-center text-[#C98232]">
                              <Package className="w-4 h-4 text-[#C98232]" />
                            </div>
                          </td>
                          <td className="p-4 font-bold text-[#0B2A4A]">{p.name}</td>
                          <td className="p-4 text-[#667482]">{p.category}</td>
                          <td className="p-4">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF4F8] text-[#0B2A4A] border border-[#E3E7EA]">
                              {p.type || 'Goods'}
                            </span>
                          </td>
                          <td className="p-4 text-right font-mono font-bold text-[#17212B]">
                            {formatCurrency(p.salesPrice)}
                          </td>
                          <td className="p-4 text-right font-mono text-[#667482]">
                            {formatCurrency(p.costPrice || p.cost || 0)}
                          </td>
                          <td className="p-4 text-right font-mono font-bold text-[#18794E]">
                            {p.availableStock !== undefined ? p.availableStock : (p.stock || 0)}
                          </td>
                          <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1.5 text-[#667482] hover:text-[#0B2A4A] rounded-lg hover:bg-[#EEF4F8] cursor-pointer"
                              title="Edit Product"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* PRODUCTS KANBAN VIEW */
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleOpenEditProduct(p)}
                    className="bg-[#FAFAF8] hover:bg-white rounded-2xl border border-[#E3E7EA] p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-[#0B2A4A] text-sm leading-tight">{p.name}</h4>
                        <span className="text-[10px] text-[#667482] font-semibold">{p.category}</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF4F8] text-[#0B2A4A] border border-[#E3E7EA]">
                        {p.type || 'Goods'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#E3E7EA] pt-3 text-xs">
                      <div>
                        <span className="text-[10px] text-[#8A96A3] block">Sales Price</span>
                        <span className="font-mono font-bold text-[#17212B] text-sm">{formatCurrency(p.salesPrice)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#8A96A3] block">Available Stock</span>
                        <span className="font-mono font-bold text-[#18794E]">{p.availableStock !== undefined ? p.availableStock : (p.stock || 0)} units</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 3: ANALYTIC ACCOUNTS VIEW */}
          {activeSubTab === 'analytics' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="p-4">Analytic Account Name</th>
                    <th className="p-4">Code</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {filteredAnalytics.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-[#8A96A3]">
                        No analytic accounts found.
                      </td>
                    </tr>
                  ) : (
                    filteredAnalytics.map((a) => (
                      <tr
                        key={a.id}
                        onClick={() => handleOpenEditAnalytic(a)}
                        className="hover:bg-[#FAFAF8] cursor-pointer transition-colors"
                      >
                        <td className="p-4 font-bold text-[#0B2A4A]">{a.name}</td>
                        <td className="p-4 font-mono text-[#667482]">{a.code}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            (a.type || '').toLowerCase() === 'income' ? 'bg-[#EAF7F0] text-[#18794E] border border-[#18794E]/20' : 'bg-[#FFF6DF] text-[#B7791F] border border-[#B7791F]/20'
                          }`}>
                            {(a.type || 'Expense').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-[#667482]">{a.description || 'General Project'}</td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenEditAnalytic(a)}
                            className="p-1.5 text-[#667482] hover:text-[#0B2A4A] rounded-lg hover:bg-[#EEF4F8] cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: CHART OF ACCOUNTS VIEW */}
          {activeSubTab === 'coa' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="p-4">Account ID</th>
                    <th className="p-4">Account Name</th>
                    <th className="p-4">Account Type</th>
                    <th className="p-4 text-right">Current Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {filteredCoA.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-[#8A96A3]">
                        No chart of accounts found.
                      </td>
                    </tr>
                  ) : (
                    filteredCoA.map((acc) => (
                      <tr key={acc.id} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="p-4 font-mono font-bold text-[#0B2A4A]">{acc.code || `COA-100${acc.backendId || acc.id}`}</td>
                        <td className="p-4 font-semibold text-[#17212B]">{acc.name}</td>
                        <td className="p-4">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF4F8] text-[#0B2A4A] border border-[#E3E7EA]">
                            {acc.type}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-[#17212B]">
                          {formatCurrency(acc.currentBalance ?? acc.balance)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: JOURNALS MASTER VIEW */}
          {activeSubTab === 'journals' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EEF4F8] border-b border-[#E3E7EA] text-[#667482] uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="p-4">Journal Code</th>
                    <th className="p-4">Journal Name</th>
                    <th className="p-4">Journal Type</th>
                    <th className="p-4">Default Debit / Credit Account</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {journals.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-[#8A96A3]">
                        No journals configured.
                      </td>
                    </tr>
                  ) : (
                    journals.map((j) => (
                      <tr key={j.id} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="p-4 font-mono font-bold text-[#0B2A4A]">{j.code || (j.type ? j.type.toUpperCase() : `JRN-0${j.id}`)}</td>
                        <td className="p-4 font-semibold text-[#17212B]">{j.name}</td>
                        <td className="p-4">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF4F8] text-[#0B2A4A] border border-[#E3E7EA]">
                            {j.type}
                          </span>
                        </td>
                        <td className="p-4 text-[#667482]">{j.defaultDebitAccountName || j.defaultCreditAccountName || 'Automated General Ledger'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: New Chart of Account */}
      {showAddCoaModal && (
        <div className="fixed inset-0 z-50 bg-[#0B2A4A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-[#E3E7EA]">
            <div className="flex items-center justify-between border-b border-[#E3E7EA] pb-3">
              <h3 className="font-bold text-[#0B2A4A] text-sm">New Chart of Account</h3>
              <button onClick={() => setShowAddCoaModal(false)} className="text-[#8A96A3] hover:text-[#0B2A4A] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17212B] mb-1">Account Name *</label>
                <input
                  type="text"
                  value={coaForm.name}
                  onChange={(e) => setCoaForm({ ...coaForm, name: e.target.value })}
                  placeholder="e.g. Office Supplies Expense"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#17212B] mb-1">Account Type</label>
                <select
                  value={coaForm.type}
                  onChange={(e) => setCoaForm({ ...coaForm, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
                >
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Bank">Bank</option>
                  <option value="Cash">Cash</option>
                  <option value="Capital">Capital</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                  <option value="Other Expense">Other Expense</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E3E7EA]">
              <button onClick={() => setShowAddCoaModal(false)} className="px-3.5 py-2 rounded-xl border border-[#E3E7EA] text-xs font-semibold text-[#667482] hover:bg-[#FAFAF8] cursor-pointer">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (coaForm.name.trim()) {
                    await addChartOfAccount(coaForm);
                    setShowAddCoaModal(false);
                    setCoaForm({ name: '', type: 'Asset' });
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Journal */}
      {showAddJournalModal && (
        <div className="fixed inset-0 z-50 bg-[#0B2A4A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-[#E3E7EA]">
            <div className="flex items-center justify-between border-b border-[#E3E7EA] pb-3">
              <h3 className="font-bold text-[#0B2A4A] text-sm">New Journal Configuration</h3>
              <button onClick={() => setShowAddJournalModal(false)} className="text-[#8A96A3] hover:text-[#0B2A4A] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#17212B] mb-1">Journal Name *</label>
                <input
                  type="text"
                  value={journalForm.name}
                  onChange={(e) => setJournalForm({ ...journalForm, name: e.target.value })}
                  placeholder="e.g. Miscellaneous Journal"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#17212B] mb-1">Journal Type</label>
                <select
                  value={journalForm.type}
                  onChange={(e) => setJournalForm({ ...journalForm, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E3E7EA] rounded-xl text-xs text-[#17212B] outline-none focus:border-[#0B2A4A] focus:ring-2 focus:ring-[#EEF4F8]"
                >
                  <option value="General">General</option>
                  <option value="Sales">Sales</option>
                  <option value="Purchase">Purchase</option>
                  <option value="Bank">Bank</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-3 border-t border-[#E3E7EA]">
              <button onClick={() => setShowAddJournalModal(false)} className="px-3.5 py-2 rounded-xl border border-[#E3E7EA] text-xs font-semibold text-[#667482] hover:bg-[#FAFAF8] cursor-pointer">
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (journalForm.name.trim()) {
                    await addJournal(journalForm);
                    setShowAddJournalModal(false);
                    setJournalForm({ name: '', type: 'General' });
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Create Journal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
