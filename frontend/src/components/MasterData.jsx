import React, { useState, useEffect } from 'react';
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
    updateContact,
    archiveContact,
    addProduct,
    updateProduct,
    adjustProductStock,
    addChartOfAccount,
    updateChartOfAccount,
    addJournal,
    updateJournal,
    addAnalyticAccount,
    updateAnalyticAccount,
    formatCurrency,
    setActiveTab,
    userRole,
    getDraft,
    saveDraft,
    clearDraft,
  } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'

  // Explicit CRUD Modes: { mode: 'create' | 'edit', recordId: null }
  const [contactMode, setContactMode] = useState({ mode: 'create', recordId: null });
  const [productMode, setProductMode] = useState({ mode: 'create', recordId: null });
  const [analyticMode, setAnalyticMode] = useState({ mode: 'create', recordId: null });
  const [coaModalMode, setCoaModalMode] = useState({ mode: 'create', recordId: null });
  const [journalModalMode, setJournalModalMode] = useState({ mode: 'create', recordId: null });

  // Form View Selection States
  const [selectedContact, setSelectedContact] = useState(null); // contact object or 'new'
  const [selectedProduct, setSelectedProduct] = useState(null); // product object or 'new'
  const [selectedAnalytic, setSelectedAnalytic] = useState(null); // analytic object or 'new'

  // Photo Upload States
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = React.useRef(null);

  // Draft Restored Banner State
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

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
    profileImage: null
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
  const [journalForm, setJournalForm] = useState({ name: '', type: 'General', defaultAccountId: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available Categories
  const [categories, setCategories] = useState([
    'Chairs & Seating',
    'Desks & Tables',
    'Storage & Cabinets',
    'Lounge & Sofas',
    'Office Accessories'
  ]);

  // Draft auto-save effects
  useEffect(() => {
    if (selectedContact && saveDraft) {
      saveDraft('contact', contactMode.mode, contactMode.recordId || 'new', contactFormData);
    }
  }, [contactFormData, selectedContact, contactMode]);

  useEffect(() => {
    if (selectedProduct && saveDraft) {
      saveDraft('product', productMode.mode, productMode.recordId || 'new', productFormData);
    }
  }, [productFormData, selectedProduct, productMode]);

  useEffect(() => {
    if (selectedAnalytic && saveDraft) {
      saveDraft('analytic', analyticMode.mode, analyticMode.recordId || 'new', analyticFormData);
    }
  }, [analyticFormData, selectedAnalytic, analyticMode]);

  // Photo selection with validation
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select an image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds 5MB limit.');
      return;
    }

    setPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
    setFormError('');
  };

  // Handle Contact Selection / New
  const handleOpenNewContact = () => {
    const defaultData = {
      name: '',
      type: 'Customer',
      email: '',
      mobile: '',
      street: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
      profileImage: null
    };
    const draft = getDraft ? getDraft('contact', 'create', 'new') : null;
    if (draft && draft.name) {
      setContactFormData({ ...defaultData, ...draft });
      setHasRestoredDraft(true);
    } else {
      setContactFormData(defaultData);
      setHasRestoredDraft(false);
    }
    setContactMode({ mode: 'create', recordId: null });
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormError('');
    setSelectedContact('new');
  };

  const handleOpenEditContact = (c) => {
    const rawId = c.backendId || c.id;
    const initialData = {
      name: c.name || '',
      type: c.type || 'Customer',
      email: c.email || '',
      mobile: c.mobile || '',
      street: c.address?.street || '',
      city: c.address?.city || 'Mumbai',
      state: c.address?.state || 'Maharashtra',
      country: c.address?.country || 'India',
      pincode: c.address?.pincode || '400001',
      profileImage: c.profileImage || null
    };
    const draft = getDraft ? getDraft('contact', 'edit', rawId) : null;
    if (draft) {
      setContactFormData({ ...initialData, ...draft });
      setHasRestoredDraft(true);
    } else {
      setContactFormData(initialData);
      setHasRestoredDraft(false);
    }
    setContactMode({ mode: 'edit', recordId: rawId });
    setPhotoFile(null);
    setPhotoPreview(c.profileImage || null);
    setFormError('');
    setSelectedContact(c);
  };

  // Handle Product Selection / New
  const handleOpenNewProduct = () => {
    const defaultData = {
      name: '',
      type: 'Goods',
      salesPrice: '',
      costPrice: '',
      category: categories[0] || 'Chairs & Seating',
      stock: 10,
      imageUrl: ''
    };
    const draft = getDraft ? getDraft('product', 'create', 'new') : null;
    if (draft && draft.name) {
      setProductFormData({ ...defaultData, ...draft });
      setHasRestoredDraft(true);
    } else {
      setProductFormData(defaultData);
      setHasRestoredDraft(false);
    }
    setProductMode({ mode: 'create', recordId: null });
    setFormError('');
    setSelectedProduct('new');
  };

  const handleOpenEditProduct = (p) => {
    const rawId = p.backendId || p.id;
    const initialData = {
      name: p.name || '',
      type: p.type || 'Goods',
      salesPrice: p.salesPrice !== undefined ? p.salesPrice : '',
      costPrice: p.costPrice !== undefined ? p.costPrice : (p.cost || ''),
      category: p.category || 'Chairs & Seating',
      stock: p.availableStock !== undefined ? p.availableStock : (p.stock || 0),
      imageUrl: p.imageUrl || ''
    };
    const draft = getDraft ? getDraft('product', 'edit', rawId) : null;
    if (draft) {
      setProductFormData({ ...initialData, ...draft });
      setHasRestoredDraft(true);
    } else {
      setProductFormData(initialData);
      setHasRestoredDraft(false);
    }
    setProductMode({ mode: 'edit', recordId: rawId });
    setFormError('');
    setSelectedProduct(p);
  };

  // Handle Analytic Selection / New
  const handleOpenNewAnalytic = () => {
    const defaultData = {
      name: '',
      type: 'expense',
      description: ''
    };
    const draft = getDraft ? getDraft('analytic', 'create', 'new') : null;
    if (draft && draft.name) {
      setAnalyticFormData({ ...defaultData, ...draft });
      setHasRestoredDraft(true);
    } else {
      setAnalyticFormData(defaultData);
      setHasRestoredDraft(false);
    }
    setAnalyticMode({ mode: 'create', recordId: null });
    setFormError('');
    setSelectedAnalytic('new');
  };

  const handleOpenEditAnalytic = (a) => {
    const rawId = a.backendId || a.id;
    const initialData = {
      name: a.name || '',
      type: (a.type || 'expense').toLowerCase(),
      description: a.description || ''
    };
    const draft = getDraft ? getDraft('analytic', 'edit', rawId) : null;
    if (draft) {
      setAnalyticFormData({ ...initialData, ...draft });
      setHasRestoredDraft(true);
    } else {
      setAnalyticFormData(initialData);
      setHasRestoredDraft(false);
    }
    setAnalyticMode({ mode: 'edit', recordId: rawId });
    setFormError('');
    setSelectedAnalytic(a);
  };

  // Modal open handlers for COA and Journals
  const handleOpenNewCoa = () => {
    setCoaForm({ name: '', type: 'Asset' });
    setCoaModalMode({ mode: 'create', recordId: null });
    setShowAddCoaModal(true);
  };

  const handleOpenEditCoa = (acc) => {
    const rawId = acc.backendId || acc.id;
    setCoaForm({ name: acc.name || acc.account_name, type: acc.type || 'Asset' });
    setCoaModalMode({ mode: 'edit', recordId: rawId });
    setShowAddCoaModal(true);
  };

  const handleOpenNewJournal = () => {
    setJournalForm({ name: '', type: 'General', defaultAccountId: '' });
    setJournalModalMode({ mode: 'create', recordId: null });
    setShowAddJournalModal(true);
  };

  const handleOpenEditJournal = (j) => {
    const rawId = j.backendId || j.id;
    setJournalForm({
      name: j.name,
      type: j.type || 'General',
      defaultAccountId: j.defaultAccountId || ''
    });
    setJournalModalMode({ mode: 'edit', recordId: rawId });
    setShowAddJournalModal(true);
  };

  // Submit Contact Form
  const handleSaveContact = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    if (!contactFormData.name.trim()) {
      setFormError('Contact Name is required.');
      return;
    }

    if (contactFormData.email && contactMode.mode === 'create') {
      const emailExists = contacts.some(c => c.email && c.email.toLowerCase() === contactFormData.email.toLowerCase().trim());
      if (emailExists) {
        setFormError('A contact with this unique email address already exists in MySQL.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (contactMode.mode === 'edit' && contactMode.recordId) {
        await updateContact(contactMode.recordId, { ...contactFormData, photoFile });
        if (clearDraft) clearDraft('contact', 'edit', contactMode.recordId);
      } else {
        await addContact({ ...contactFormData, photoFile });
        if (clearDraft) clearDraft('contact', 'create', 'new');
      }
      setSelectedContact(null);
      setPhotoFile(null);
      setPhotoPreview(null);
      setHasRestoredDraft(false);
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
      if (productMode.mode === 'edit' && productMode.recordId) {
        await updateProduct(productMode.recordId, productFormData);
        if (clearDraft) clearDraft('product', 'edit', productMode.recordId);
      } else {
        await addProduct(productFormData);
        if (clearDraft) clearDraft('product', 'create', 'new');
      }
      setSelectedProduct(null);
      setHasRestoredDraft(false);
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
      if (analyticMode.mode === 'edit' && analyticMode.recordId) {
        await updateAnalyticAccount(analyticMode.recordId, analyticFormData);
        if (clearDraft) clearDraft('analytic', 'edit', analyticMode.recordId);
      } else {
        await addAnalyticAccount(analyticFormData);
        if (clearDraft) clearDraft('analytic', 'create', 'new');
      }
      setSelectedAnalytic(null);
      setHasRestoredDraft(false);
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
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-[#0B2A4A]">
                    {contactMode.mode === 'edit' ? `Edit Contact — ${contactFormData.name}` : 'New Contact Form View'}
                  </h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${contactMode.mode === 'edit' ? 'bg-[#F8F0E6] text-[#C98232] border border-[#C98232]/30' : 'bg-[#EEF4F8] text-[#0B2A4A] border border-[#E3E7EA]'}`}>
                    {contactMode.mode === 'edit' ? `Edit Mode (#${contactMode.recordId})` : 'Create Mode'}
                  </span>
                </div>
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
                className="px-4 py-1.5 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
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

          {hasRestoredDraft && (
            <div className="p-3 bg-[#EEF4F8] border border-[#0B2A4A]/20 rounded-xl text-xs text-[#0B2A4A] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#0B2A4A]" />
                <span>Unsaved draft restored from previous session.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (contactMode.mode === 'edit' && contactMode.recordId) {
                    if (clearDraft) clearDraft('contact', 'edit', contactMode.recordId);
                    const orig = contacts.find(c => (c.backendId || c.id) === contactMode.recordId);
                    if (orig) handleOpenEditContact(orig);
                  } else {
                    if (clearDraft) clearDraft('contact', 'create', 'new');
                    handleOpenNewContact();
                  }
                  setHasRestoredDraft(false);
                }}
                className="text-xs text-[#B42318] hover:underline font-semibold cursor-pointer"
              >
                Discard Draft
              </button>
            </div>
          )}

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

            {/* Right: Upload Image Card with Real File Input & Preview */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#17212B]">Contact Photo</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
                id="contact-photo-input"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E3E7EA] hover:border-[#0B2A4A] rounded-2xl p-6 text-center bg-[#FAFAF8] flex flex-col items-center justify-center space-y-3 cursor-pointer transition-colors group"
              >
                {photoPreview || contactFormData.profileImage ? (
                  <div className="relative group/preview">
                    <img
                      src={photoPreview || contactFormData.profileImage}
                      alt="Contact Preview"
                      className="w-24 h-24 rounded-2xl object-cover border border-[#E3E7EA] shadow-xs"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/preview:opacity-100 flex items-center justify-center text-white text-[11px] font-semibold transition-opacity">
                      Change Photo
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#EEF4F8] border border-[#E3E7EA] flex items-center justify-center text-[#0B2A4A] text-xl font-bold group-hover:bg-[#E2ECF2] transition-colors">
                    {contactFormData.name ? contactFormData.name.charAt(0).toUpperCase() : <ImageIcon className="w-6 h-6 text-[#8A96A3]" />}
                  </div>
                )}
                <div className="text-xs text-[#667482]">
                  <p className="font-semibold text-[#17212B] group-hover:text-[#0B2A4A] transition-colors">
                    {photoPreview || contactFormData.profileImage ? 'Click to Change Photo' : 'Click to Upload Photo'}
                  </p>
                  <p className="text-[10px] text-[#8A96A3] mt-0.5">PNG, JPG, WEBP up to 5MB</p>
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
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-[#0B2A4A]">
                    {productMode.mode === 'edit' ? `Edit Product — ${productFormData.name}` : 'New Product Form View'}
                  </h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${productMode.mode === 'edit' ? 'bg-[#F8F0E6] text-[#C98232] border border-[#C98232]/30' : 'bg-[#EEF4F8] text-[#0B2A4A] border border-[#E3E7EA]'}`}>
                    {productMode.mode === 'edit' ? `Edit Mode (#${productMode.recordId})` : 'Create Mode'}
                  </span>
                </div>
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
                className="px-4 py-1.5 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
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

          {hasRestoredDraft && (
            <div className="p-3 bg-[#EEF4F8] border border-[#0B2A4A]/20 rounded-xl text-xs text-[#0B2A4A] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#0B2A4A]" />
                <span>Unsaved draft restored from previous session.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (productMode.mode === 'edit' && productMode.recordId) {
                    if (clearDraft) clearDraft('product', 'edit', productMode.recordId);
                    const orig = products.find(p => (p.backendId || p.id) === productMode.recordId);
                    if (orig) handleOpenEditProduct(orig);
                  } else {
                    if (clearDraft) clearDraft('product', 'create', 'new');
                    handleOpenNewProduct();
                  }
                  setHasRestoredDraft(false);
                }}
                className="text-xs text-[#B42318] hover:underline font-semibold cursor-pointer"
              >
                Discard Draft
              </button>
            </div>
          )}

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
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-[#0B2A4A]">
                    {analyticMode.mode === 'edit' ? `Edit Analytic Account — ${analyticFormData.name}` : 'New Analytic Account Form View'}
                  </h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${analyticMode.mode === 'edit' ? 'bg-[#F8F0E6] text-[#C98232] border border-[#C98232]/30' : 'bg-[#EEF4F8] text-[#0B2A4A] border border-[#E3E7EA]'}`}>
                    {analyticMode.mode === 'edit' ? `Edit Mode (#${analyticMode.recordId})` : 'Create Mode'}
                  </span>
                </div>
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
                className="px-4 py-1.5 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
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

          {hasRestoredDraft && (
            <div className="p-3 bg-[#EEF4F8] border border-[#0B2A4A]/20 rounded-xl text-xs text-[#0B2A4A] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#0B2A4A]" />
                <span>Unsaved draft restored from previous session.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (analyticMode.mode === 'edit' && analyticMode.recordId) {
                    if (clearDraft) clearDraft('analytic', 'edit', analyticMode.recordId);
                    const orig = analyticAccounts.find(a => (a.backendId || a.id) === analyticMode.recordId);
                    if (orig) handleOpenEditAnalytic(orig);
                  } else {
                    if (clearDraft) clearDraft('analytic', 'create', 'new');
                    handleOpenNewAnalytic();
                  }
                  setHasRestoredDraft(false);
                }}
                className="text-xs text-[#B42318] hover:underline font-semibold cursor-pointer"
              >
                Discard Draft
              </button>
            </div>
          )}

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
                            <div className="w-8 h-8 rounded-lg bg-[#EEF4F8] border border-[#E3E7EA] flex items-center justify-center text-[#0B2A4A] font-bold text-xs overflow-hidden">
                              {c.profileImage ? (
                                <img src={c.profileImage} alt={c.name} className="w-full h-full object-cover" />
                              ) : (
                                c.name.charAt(0).toUpperCase()
                              )}
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
                      <div className="w-10 h-10 rounded-xl bg-[#EEF4F8] text-[#0B2A4A] font-bold flex items-center justify-center text-sm border border-[#E3E7EA] overflow-hidden">
                        {c.profileImage ? (
                          <img src={c.profileImage} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          c.name.charAt(0).toUpperCase()
                        )}
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
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {filteredCoA.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-[#8A96A3]">
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
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenEditCoa(acc)}
                            className="p-1.5 text-[#667482] hover:text-[#0B2A4A] rounded-lg hover:bg-[#EEF4F8] cursor-pointer"
                            title="Edit Account"
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
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E7EA]/60">
                  {journals.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-[#8A96A3]">
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
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenEditJournal(j)}
                            className="p-1.5 text-[#667482] hover:text-[#0B2A4A] rounded-lg hover:bg-[#EEF4F8] cursor-pointer"
                            title="Edit Journal"
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
        </div>
      )}

      {/* Modal: New / Edit Chart of Account */}
      {showAddCoaModal && (
        <div className="fixed inset-0 z-50 bg-[#0B2A4A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-[#E3E7EA]">
            <div className="flex items-center justify-between border-b border-[#E3E7EA] pb-3">
              <h3 className="font-bold text-[#0B2A4A] text-sm">
                {coaModalMode.mode === 'edit' ? `Edit Account (#${coaModalMode.recordId})` : 'New Chart of Account'}
              </h3>
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
                disabled={isSubmitting}
                onClick={async () => {
                  if (coaForm.name.trim()) {
                    setIsSubmitting(true);
                    try {
                      if (coaModalMode.mode === 'edit' && coaModalMode.recordId) {
                        await updateChartOfAccount(coaModalMode.recordId, coaForm);
                      } else {
                        await addChartOfAccount(coaForm);
                      }
                      setShowAddCoaModal(false);
                      setCoaForm({ name: '', type: 'Asset' });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : (coaModalMode.mode === 'edit' ? 'Update Account' : 'Create Account')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New / Edit Journal */}
      {showAddJournalModal && (
        <div className="fixed inset-0 z-50 bg-[#0B2A4A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-[#E3E7EA]">
            <div className="flex items-center justify-between border-b border-[#E3E7EA] pb-3">
              <h3 className="font-bold text-[#0B2A4A] text-sm">
                {journalModalMode.mode === 'edit' ? `Edit Journal (#${journalModalMode.recordId})` : 'New Journal Configuration'}
              </h3>
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
                disabled={isSubmitting}
                onClick={async () => {
                  if (journalForm.name.trim()) {
                    setIsSubmitting(true);
                    try {
                      if (journalModalMode.mode === 'edit' && journalModalMode.recordId) {
                        await updateJournal(journalModalMode.recordId, journalForm);
                      } else {
                        await addJournal(journalForm);
                      }
                      setShowAddJournalModal(false);
                      setJournalForm({ name: '', type: 'General', defaultAccountId: '' });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#0B2A4A] hover:bg-[#163B63] text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : (journalModalMode.mode === 'edit' ? 'Update Journal' : 'Create Journal')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
