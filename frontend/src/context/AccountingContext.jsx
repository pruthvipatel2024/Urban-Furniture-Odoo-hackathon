import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import api from '../services/api';

const AccountingContext = createContext();

export function AccountingProvider({ children }) {
  // Navigation & Active View
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('Admin'); // 'Admin' | 'Accountant' | 'Contact'
  const [activeContactId, setActiveContactId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Backend Live Status & Loading States
  const [backendOnline, setBackendOnline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Toast Notifications
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Activity Notifications
  const [notifications, setNotifications] = useState([]);

  const addNotification = ({ title, message, type = 'info' }) => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Pure Backend-Driven Dynamic Entities (Zero Mock Data)
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [chartOfAccounts, setChartOfAccounts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [analyticAccounts, setAnalyticAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendorBills, setVendorBills] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);

  // Authoritative Backend Report States
  const [dashboardData, setDashboardData] = useState(null);
  const [pnlReport, setPnlReport] = useState(null);
  const [balanceSheetReport, setBalanceSheetReport] = useState(null);
  const [stockReport, setStockReport] = useState(null);
  const [budgetReport, setBudgetReport] = useState(null);
  const [trialBalanceReport, setTrialBalanceReport] = useState(null);

  // Global Modals State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTargetDoc, setPaymentTargetDoc] = useState(null);
  const [showDemoTourModal, setShowDemoTourModal] = useState(false);

  // Formatting Helper
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // -------------------------------------------------------------
  // HELPER: EXACT BACKEND ID RESOLUTION
  // -------------------------------------------------------------
  const extractBackendId = (input, list = []) => {
    if (!input && input !== 0) return 1;
    if (typeof input === 'number') return input;
    if (typeof input === 'object' && input !== null) {
      if (input.backendId) return Number(input.backendId);
      if (input.id && typeof input.id === 'number') return input.id;
      input = input.id;
    }
    const str = String(input).trim();
    const found = list.find(item => item.id === str || String(item.backendId) === str || item.name === str);
    if (found?.backendId) return Number(found.backendId);

    if (str.includes('-')) {
      const parts = str.split('-');
      const lastPart = parts[parts.length - 1];
      const parsed = parseInt(lastPart, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const cleanNum = parseInt(str.replace(/\D/g, ''), 10);
    return isNaN(cleanNum) ? 1 : cleanNum;
  };

  // -------------------------------------------------------------
  // BACKEND REFRESH ENGINE (100% AUTHORITATIVE)
  // -------------------------------------------------------------
  const refreshFromBackend = useCallback(async () => {
    setSyncing(true);
    try {
      // 1. Verify health
      const healthRes = await api.health();
      if (healthRes.status === 'healthy' || healthRes.status === 'ok') {
        setBackendOnline(true);
      }

      // 2. Fetch all domain records and authoritative reports concurrently
      const [
        contactsRes,
        productsRes,
        coaRes,
        journalsRes,
        journalEntriesRes,
        soRes,
        invoicesRes,
        poRes,
        billsRes,
        paymentsRes,
        budgetsRes,
        analyticsRes,
        dashboardRes,
        pnlRes,
        balanceSheetRes,
        stockRes,
        budgetReportRes,
        trialBalanceRes,
      ] = await Promise.allSettled([
        api.contacts.getAll({ includeArchived: 'true', limit: 100 }),
        api.products.getAll({ includeArchived: 'true', limit: 100 }),
        api.accounts.getAll({ includeArchived: 'true' }),
        api.journals.getAll(),
        api.journals.getEntries({ limit: 100 }),
        api.sales.getAll({ limit: 100 }),
        api.invoices.getAll({ limit: 100 }),
        api.purchases.getAll({ limit: 100 }),
        api.bills.getAll({ limit: 100 }),
        api.payments.getAll({ limit: 100 }),
        api.budgets.getAll(),
        api.budgets.getAnalytics(),
        api.dashboard.getSummary(),
        api.reports.getProfitLoss({}),
        api.reports.getBalanceSheet({}),
        api.reports.getStock(),
        api.reports.getBudget(),
        api.reports.getTrialBalance({}),
      ]);

      // Contacts mapping
      if (contactsRes.status === 'fulfilled' && Array.isArray(contactsRes.value?.data?.contacts)) {
        const mappedContacts = contactsRes.value.data.contacts.map(c => ({
          id: String(c.id).startsWith('CNT') ? c.id : `CNT-00${c.id}`,
          backendId: c.id,
          name: c.name,
          type: c.type ? (c.type.charAt(0).toUpperCase() + c.type.slice(1)) : 'Customer',
          email: c.email || '',
          mobile: c.mobile || '',
          address: {
            city: c.address_city || '',
            state: c.address_state || '',
            pincode: c.address_pincode || ''
          },
          profileImage: c.profile_image || null,
          isArchived: Boolean(c.is_archived)
        }));
        setContacts(mappedContacts);
      } else if (contactsRes.status === 'fulfilled' && Array.isArray(contactsRes.value?.data)) {
        const mappedContacts = contactsRes.value.data.map(c => ({
          id: String(c.id).startsWith('CNT') ? c.id : `CNT-00${c.id}`,
          backendId: c.id,
          name: c.name,
          type: c.type ? (c.type.charAt(0).toUpperCase() + c.type.slice(1)) : 'Customer',
          email: c.email || '',
          mobile: c.mobile || '',
          address: {
            city: c.address_city || '',
            state: c.address_state || '',
            pincode: c.address_pincode || ''
          },
          profileImage: c.profile_image || null,
          isArchived: Boolean(c.is_archived)
        }));
        setContacts(mappedContacts);
      }

      // Products mapping
      if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value?.data?.products)) {
        const mappedProducts = productsRes.value.data.products.map(p => ({
          id: String(p.id).startsWith('PRD') ? p.id : `PRD-10${p.id}`,
          backendId: p.id,
          name: p.name,
          type: p.type ? (p.type.charAt(0).toUpperCase() + p.type.slice(1)) : 'Goods',
          salesPrice: Number(p.sales_price || 0),
          costPrice: Number(p.cost_price || 0),
          category: p.category || 'General',
          stock: Number(p.stock_quantity || 0),
          reorderLevel: 5,
          isArchived: Boolean(p.is_archived)
        }));
        setProducts(mappedProducts);
      }

      // Chart of Accounts mapping
      if (coaRes.status === 'fulfilled' && Array.isArray(coaRes.value?.data)) {
        const mappedCoA = coaRes.value.data.map(a => ({
          id: String(a.id).startsWith('COA') ? a.id : `COA-100${a.id}`,
          backendId: a.id,
          name: a.account_name,
          type: a.account_type ? (a.account_type.charAt(0).toUpperCase() + a.account_type.slice(1)) : 'Asset',
          balance: 0,
          isArchived: Boolean(a.is_archived)
        }));
        setChartOfAccounts(mappedCoA);
      }

      // Journals mapping
      if (journalsRes.status === 'fulfilled' && Array.isArray(journalsRes.value?.data)) {
        const mappedJournals = journalsRes.value.data.map(j => ({
          id: `JRN-0${j.id}`,
          backendId: j.id,
          name: j.name,
          type: j.type ? (j.type.charAt(0).toUpperCase() + j.type.slice(1)) : 'General'
        }));
        setJournals(mappedJournals);
      }

      // Journal Entries mapping
      if (journalEntriesRes.status === 'fulfilled' && Array.isArray(journalEntriesRes.value?.data?.entries)) {
        const mappedEntries = journalEntriesRes.value.data.entries.map(je => ({
          id: `JE-00${je.id}`,
          backendId: je.id,
          date: je.entry_date,
          reference: je.reference,
          journalType: je.journal?.name || 'General Journal',
          lines: (je.items || []).map(item => ({
            account: item.account?.account_name || 'General Account',
            debit: Number(item.debit || 0),
            credit: Number(item.credit || 0),
            description: item.description || ''
          }))
        }));
        setJournalEntries(mappedEntries);
      }

      // Sales Orders mapping
      if (soRes.status === 'fulfilled' && Array.isArray(soRes.value?.data?.salesOrders)) {
        const mappedSOs = soRes.value.data.salesOrders.map(so => ({
          id: `SO-2026-00${so.id}`,
          backendId: so.id,
          customerId: so.customer_id,
          customerName: so.customer?.name || 'Customer',
          date: so.order_date,
          status: so.status ? (so.status.charAt(0).toUpperCase() + so.status.slice(1)) : 'Confirmed',
          delivered: so.status === 'invoiced' || so.status === 'confirmed',
          subtotal: (so.items || []).reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unit_price)), 0),
          totalAmount: (so.items || []).reduce((sum, i) => sum + Number(i.line_total || 0), 0),
          items: (so.items || []).map(item => ({
            productId: item.product_id,
            productName: item.product?.name || 'Product',
            qty: Number(item.quantity || 1),
            unitPrice: Number(item.unit_price || 0),
            total: Number(item.line_total || 0)
          }))
        }));
        setSalesOrders(mappedSOs);
      }

      // Invoices mapping
      if (invoicesRes.status === 'fulfilled' && Array.isArray(invoicesRes.value?.data?.invoices)) {
        const mappedInvoices = invoicesRes.value.data.invoices.map(inv => ({
          id: `INV-2026-00${inv.id}`,
          backendId: inv.id,
          customerId: inv.customer_id,
          customerName: inv.customer?.name || 'Customer',
          customerEmail: inv.customer?.email || '',
          customerPhone: inv.customer?.mobile || '',
          customerAddress: inv.customer?.address_city ? `${inv.customer.address_city}, ${inv.customer.address_state || ''}` : '',
          date: inv.invoice_date,
          dueDate: inv.due_date,
          totalAmount: Number(inv.total_amount || 0),
          paidAmount: Number(inv.amount_paid || 0),
          balance: Number(inv.balance !== undefined ? inv.balance : (Number(inv.total_amount) - Number(inv.amount_paid))),
          status: inv.payment_status === 'paid' ? 'Paid' : (inv.payment_status === 'partially_paid' ? 'Partially Paid' : 'Unpaid'),
          items: (inv.salesOrder?.items || []).map(item => ({
            productId: item.product_id,
            productName: item.product?.name || 'Product',
            qty: Number(item.quantity || 1),
            unitPrice: Number(item.unit_price || 0),
            total: Number(item.line_total || 0)
          }))
        }));
        setInvoices(mappedInvoices);
      }

      // Purchase Orders mapping
      if (poRes.status === 'fulfilled' && Array.isArray(poRes.value?.data?.purchaseOrders)) {
        const mappedPOs = poRes.value.data.purchaseOrders.map(po => ({
          id: `PO-2026-00${po.id}`,
          backendId: po.id,
          vendorId: po.vendor_id,
          vendorName: po.vendor?.name || 'Vendor',
          date: po.order_date,
          status: po.status ? (po.status.charAt(0).toUpperCase() + po.status.slice(1)) : 'Confirmed',
          goodsReceived: po.status === 'billed',
          totalAmount: (po.items || []).reduce((sum, i) => sum + Number(i.line_total || 0), 0),
          items: (po.items || []).map(item => ({
            productId: item.product_id,
            productName: item.product?.name || 'Product',
            qty: Number(item.quantity || 1),
            unitPrice: Number(item.unit_price || 0),
            total: Number(item.line_total || 0)
          }))
        }));
        setPurchaseOrders(mappedPOs);
      }

      // Vendor Bills mapping
      if (billsRes.status === 'fulfilled' && Array.isArray(billsRes.value?.data?.bills)) {
        const mappedBills = billsRes.value.data.bills.map(b => ({
          id: `BILL-2026-00${b.id}`,
          backendId: b.id,
          vendorId: b.vendor_id,
          vendorName: b.vendor?.name || 'Vendor',
          date: b.invoice_date,
          dueDate: b.due_date,
          totalAmount: Number(b.total_amount || 0),
          paidAmount: Number(b.amount_paid || 0),
          balance: Number(b.balance !== undefined ? b.balance : (Number(b.total_amount) - Number(b.amount_paid))),
          status: b.payment_status === 'paid' ? 'Paid' : (b.payment_status === 'partially_paid' ? 'Partially Paid' : 'Unpaid'),
          items: (b.purchaseOrder?.items || []).map(item => ({
            productId: item.product_id,
            productName: item.product?.name || 'Product',
            qty: Number(item.quantity || 1),
            unitPrice: Number(item.unit_price || 0),
            total: Number(item.line_total || 0)
          }))
        }));
        setVendorBills(mappedBills);
      }

      // Payments mapping
      if (paymentsRes.status === 'fulfilled' && Array.isArray(paymentsRes.value?.data?.payments)) {
        const mappedPayments = paymentsRes.value.data.payments.map(p => ({
          id: `PAY-2026-00${p.id}`,
          backendId: p.id,
          date: p.payment_date,
          type: p.customer_invoice_id ? 'Customer Payment' : 'Vendor Payment',
          docId: p.customer_invoice_id ? `INV-2026-00${p.customer_invoice_id}` : `BILL-2026-00${p.vendor_bill_id}`,
          contactName: p.customerInvoice?.customer?.name || p.vendorBill?.vendor?.name || 'Party',
          method: p.method === 'bank' ? 'Pay Online / Bank' : 'Cash on Hand',
          amount: Number(p.amount || 0),
          notes: p.notes || ''
        }));
        setPayments(mappedPayments);
      }

      // Budgets mapping
      if (budgetsRes.status === 'fulfilled' && Array.isArray(budgetsRes.value?.data)) {
        const mappedBudgets = budgetsRes.value.data.map(b => ({
          id: `BDG-2026-0${b.id}`,
          backendId: b.id,
          name: b.name,
          periodStart: b.period_start,
          periodEnd: b.period_end,
          responsiblePerson: b.responsible_person || 'Admin',
          plannedAmount: Number(b.planned_amount || 0),
          actualAmount: 0,
          status: 'Active'
        }));
        setBudgets(mappedBudgets);
      }

      // Authoritative Backend Report Mappings
      if (dashboardRes.status === 'fulfilled' && dashboardRes.value?.data) {
        setDashboardData(dashboardRes.value.data);
      }
      if (pnlRes.status === 'fulfilled' && pnlRes.value?.data) {
        setPnlReport(pnlRes.value.data);
      }
      if (balanceSheetRes.status === 'fulfilled' && balanceSheetRes.value?.data) {
        setBalanceSheetReport(balanceSheetRes.value.data);
      }
      if (stockRes.status === 'fulfilled' && stockRes.value?.data) {
        setStockReport(stockRes.value.data);
      }
      if (budgetReportRes.status === 'fulfilled' && budgetReportRes.value?.data) {
        setBudgetReport(budgetReportRes.value.data);
      }
      if (trialBalanceRes.status === 'fulfilled' && trialBalanceRes.value?.data) {
        setTrialBalanceReport(trialBalanceRes.value.data);
      }

      setBackendOnline(true);
    } catch (err) {
      console.warn('[Backend Sync Warning]:', err.message);
      setBackendOnline(false);
    } finally {
      setSyncing(false);
      setInitialLoading(false);
    }
  }, []);

  // -------------------------------------------------------------
  // AUTHENTICATION: LOGIN & LOGOUT
  // -------------------------------------------------------------
  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const res = await api.auth.login(email, password);
      const user = res.data?.user;
      setCurrentUser(user);
      setIsAuthenticated(true);

      const rawRole = user?.role ? user.role.toUpperCase() : 'ADMIN';
      let formattedRole = 'Admin';
      if (rawRole === 'ACCOUNTANT') formattedRole = 'Accountant';
      if (rawRole === 'CONTACT') formattedRole = 'Contact';

      setUserRole(formattedRole);
      if (formattedRole === 'Contact') {
        setActiveTab('portal');
        if (user.contact_id) {
          setActiveContactId(`CNT-00${user.contact_id}`);
        }
      } else {
        setActiveTab('dashboard');
      }

      showToast(`Welcome back, ${user?.name || 'User'}!`, 'success');
      await refreshFromBackend();
      return { success: true, user };
    } catch (err) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      api.setToken('');
      setCurrentUser(null);
      setIsAuthenticated(false);
      setContacts([]);
      setProducts([]);
      setInvoices([]);
      setVendorBills([]);
      setSalesOrders([]);
      setPurchaseOrders([]);
      setPayments([]);
      setJournalEntries([]);
      showToast('You have been signed out.', 'info');
    }
  };

  // Restore Session on Mount
  useEffect(() => {
    const initAuthSession = async () => {
      setAuthLoading(true);
      const token = api.getToken();
      if (token) {
        try {
          const meRes = await api.auth.me();
          const user = meRes?.data;
          if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            const rawRole = user.role ? user.role.toUpperCase() : 'ADMIN';
            let formattedRole = 'Admin';
            if (rawRole === 'ACCOUNTANT') formattedRole = 'Accountant';
            if (rawRole === 'CONTACT') formattedRole = 'Contact';

            setUserRole(formattedRole);
            if (formattedRole === 'Contact') {
              setActiveTab('portal');
              if (user.contact_id) {
                setActiveContactId(`CNT-00${user.contact_id}`);
              }
            }
            await refreshFromBackend();
          } else {
            setIsAuthenticated(false);
            api.setToken('');
          }
        } catch {
          api.setToken('');
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setAuthLoading(false);
    };

    initAuthSession();
  }, [refreshFromBackend]);

  // -------------------------------------------------------------
  // MASTER DATA ACTIONS (API CONNECTED)
  // -------------------------------------------------------------
  const addContact = async (contactData) => {
    try {
      const typeFormatted = (contactData.type || 'Customer').toLowerCase();
      const res = await api.contacts.create({
        name: contactData.name,
        type: typeFormatted === 'both' ? 'both' : (typeFormatted.includes('vendor') ? 'vendor' : 'customer'),
        email: contactData.email || null,
        mobile: contactData.mobile || null,
        address_city: contactData.city || 'Mumbai',
        address_state: contactData.state || 'Maharashtra',
        address_pincode: contactData.pincode || '400001',
        profile_image: contactData.profileImage || null
      });

      showToast(`Contact "${contactData.name}" created successfully!`, 'success');
      await refreshFromBackend();
      return res.data;
    } catch (err) {
      showToast(`Failed to create contact: ${err.message}`, 'error');
      throw err;
    }
  };

  const archiveContact = async (contactId) => {
    try {
      const contactObj = contacts.find(c => c.id === contactId);
      const rawId = contactObj?.backendId || extractBackendId(contactId, contacts);
      await api.contacts.archive(rawId);
      showToast(`Contact status updated on backend.`, 'success');
      await refreshFromBackend();
    } catch (err) {
      showToast(`Failed to archive contact: ${err.message}`, 'error');
      throw err;
    }
  };

  const addProduct = async (productData) => {
    try {
      const typeFormatted = (productData.type || 'Goods').toLowerCase();
      const res = await api.products.create({
        name: productData.name,
        type: ['goods', 'service', 'combo'].includes(typeFormatted) ? typeFormatted : 'goods',
        sales_price: Number(productData.salesPrice || 0),
        cost_price: Number(productData.costPrice || 0),
        category: productData.category || 'General Furniture',
        stock_quantity: Number(productData.stock || 0)
      });

      showToast(`Product "${productData.name}" added to catalog!`, 'success');
      await refreshFromBackend();
      return res.data;
    } catch (err) {
      showToast(`Failed to add product: ${err.message}`, 'error');
      throw err;
    }
  };

  const adjustProductStock = async (productId, newStock, reason = 'Inventory Count Adjustment') => {
    try {
      const prd = products.find(p => p.id === productId || p.backendId === productId);
      const rawId = prd?.backendId || extractBackendId(productId, products);
      const current = Number(prd?.stock || 0);
      const delta = Number(newStock) - current;

      if (delta !== 0) {
        await api.products.adjustStock(rawId, delta, reason);
      }
      showToast(`Stock updated for ${prd?.name || productId}: ${newStock} units.`, 'success');
      await refreshFromBackend();
    } catch (err) {
      showToast(`Stock update error: ${err.message}`, 'error');
      throw err;
    }
  };

  const addChartOfAccount = async (accountData) => {
    try {
      await api.accounts.create({
        account_name: accountData.name,
        account_type: (accountData.type || 'Asset').toLowerCase()
      });
      showToast(`Account "${accountData.name}" created in Chart of Accounts!`, 'success');
      await refreshFromBackend();
    } catch (err) {
      showToast(`Failed to create account: ${err.message}`, 'error');
      throw err;
    }
  };

  const addJournal = async (journalData) => {
    try {
      await api.journals.create({
        name: journalData.name,
        type: (journalData.type || 'sales').toLowerCase()
      });
      showToast(`Journal "${journalData.name}" created!`, 'success');
      await refreshFromBackend();
    } catch (err) {
      showToast(`Failed to create journal: ${err.message}`, 'error');
      throw err;
    }
  };

  const addAnalyticAccount = async (analyticData) => {
    try {
      await api.budgets.createAnalytic({
        name: analyticData.name,
        type: (analyticData.type || 'expense').toLowerCase()
      });
      showToast(`Analytic Account "${analyticData.name}" created!`, 'success');
      await refreshFromBackend();
    } catch (err) {
      showToast(`Failed to create analytic account: ${err.message}`, 'error');
      throw err;
    }
  };

  const addBudget = async (budgetData) => {
    try {
      await api.budgets.create({
        name: budgetData.name,
        period_start: budgetData.periodStart || '2026-09-01',
        period_end: budgetData.periodEnd || '2026-09-30',
        responsible_person: budgetData.responsiblePerson || 'Admin',
        planned_amount: Number(budgetData.plannedAmount || 0)
      });
      showToast(`Budget "${budgetData.name}" registered!`, 'success');
      await refreshFromBackend();
    } catch (err) {
      showToast(`Failed to create budget: ${err.message}`, 'error');
      throw err;
    }
  };

  // -------------------------------------------------------------
  // TRANSACTION WORKFLOWS (API CONNECTED WITH REAL ATOMICITY)
  // -------------------------------------------------------------

  // 1. PURCHASE ORDER WORKFLOW
  const createPurchaseOrder = async (poData) => {
    try {
      const rawVendorId = extractBackendId(poData.vendorId, contacts);

      const items = poData.items.map(item => {
        const rawPrdId = extractBackendId(item.productId, products);
        const prd = products.find(p => p.backendId === rawPrdId || p.id === item.productId);
        return {
          product_id: rawPrdId,
          quantity: Number(item.qty || 1),
          unit_price: Number(item.unitPrice || prd?.costPrice || 0)
        };
      });

      const res = await api.purchases.create({
        vendorId: rawVendorId,
        orderDate: poData.date || new Date().toISOString().split('T')[0],
        notes: poData.notes || '',
        items
      });

      showToast(`Purchase Order created in MySQL!`, 'success');
      await refreshFromBackend();
      return res.data;
    } catch (err) {
      showToast(`Purchase order error: ${err.message}`, 'error');
      throw err;
    }
  };

  const receiveGoodsPO = async (poId) => {
    try {
      const rawPoId = extractBackendId(poId, purchaseOrders);
      await api.purchases.confirm(rawPoId);
      showToast(`Goods receipt recorded & stock updated!`, 'success');
      await refreshFromBackend();
    } catch (err) {
      showToast(`Goods receipt error: ${err.message}`, 'error');
      throw err;
    }
  };

  const convertPOToVendorBill = async (poId, customDueDate = null) => {
    try {
      const rawPoId = extractBackendId(poId, purchaseOrders);
      const res = await api.bills.generateFromPO(rawPoId, {
        dueDate: customDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      showToast(`Vendor Bill generated & Double-Entry posted in General Ledger!`, 'success');
      await refreshFromBackend();
      return res.data;
    } catch (err) {
      showToast(`Failed to generate vendor bill: ${err.message}`, 'error');
      throw err;
    }
  };

  // 2. SALES ORDER WORKFLOW
  const createSalesOrder = async (soData) => {
    try {
      const rawCustomerId = extractBackendId(soData.customerId, contacts);

      const items = soData.items.map(item => {
        const rawPrdId = extractBackendId(item.productId, products);
        const prd = products.find(p => p.backendId === rawPrdId || p.id === item.productId);
        return {
          product_id: rawPrdId,
          quantity: Number(item.qty || 1),
          unit_price: Number(item.unitPrice || prd?.salesPrice || 0),
          tax_percent: Number(item.taxPercent || 0)
        };
      });

      const res = await api.sales.create({
        customerId: rawCustomerId,
        orderDate: soData.date || new Date().toISOString().split('T')[0],
        notes: soData.notes || '',
        items
      });

      showToast(`Sales Order created in MySQL!`, 'success');
      await refreshFromBackend();
      return res.data;
    } catch (err) {
      showToast(`Sales order error: ${err.message}`, 'error');
      throw err;
    }
  };

  const deliverGoodsSO = async (soId) => {
    try {
      const rawSoId = extractBackendId(soId, salesOrders);
      await api.sales.confirm(rawSoId);
      showToast(`Delivery recorded & stock decremented!`, 'success');
      await refreshFromBackend();
    } catch (err) {
      showToast(`Delivery confirmation error: ${err.message}`, 'error');
      throw err;
    }
  };

  const convertSOToCustomerInvoice = async (soId, customDueDate = null) => {
    try {
      const rawSoId = extractBackendId(soId, salesOrders);
      const res = await api.invoices.generateFromSO(rawSoId, {
        dueDate: customDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      showToast(`Customer Invoice generated & Double-Entry posted in General Ledger!`, 'success');
      await refreshFromBackend();
      return res.data;
    } catch (err) {
      showToast(`Failed to generate invoice: ${err.message}`, 'error');
      throw err;
    }
  };

  // 3. PAYMENT RECORDING (SIMULATED FUNDS + REAL DOUBLE-ENTRY POSTING)
  const recordPayment = async (paymentData) => {
    try {
      const { docId, docType, method, amount, notes } = paymentData;
      const invObj = invoices.find(i => i.id === docId || i.backendId === Number(docId));
      const billObj = vendorBills.find(b => b.id === docId || b.backendId === Number(docId));

      const isCustomerDoc = docType === 'Customer Invoice' || String(docId).startsWith('INV') || Boolean(invObj);

      let rawDocId;
      if (isCustomerDoc) {
        rawDocId = invObj?.backendId || extractBackendId(docId, invoices);
      } else {
        rawDocId = billObj?.backendId || extractBackendId(docId, vendorBills);
      }

      const methodClean = method?.toLowerCase().includes('cash') ? 'cash' : 'bank';

      const payload = {
        amount: Number(amount),
        method: methodClean,
        notes: notes || '',
        customerInvoiceId: isCustomerDoc ? rawDocId : null,
        vendorBillId: !isCustomerDoc ? rawDocId : null
      };

      const res = await api.payments.record(payload);
      showToast(`Payment of ${formatCurrency(amount)} posted & settled in MySQL Ledger!`, 'success');
      await refreshFromBackend();
      return res.data;
    } catch (err) {
      showToast(`Payment error: ${err.message}`, 'error');
      throw err;
    }
  };

  // 4. MANUAL JOURNAL ENTRY (BALANCED DEBITS & CREDITS)
  const createManualJournalEntry = async (entryData) => {
    try {
      const res = await api.journals.createManualEntry({
        journalId: 1,
        reference: entryData.reference || 'Manual Adjusting Entry',
        items: entryData.lines.map(l => ({
          account_id: l.accountId || 1,
          debit: Number(l.debit || 0),
          credit: Number(l.credit || 0),
          description: l.description || entryData.reference
        }))
      });

      showToast(`Manual Journal Entry posted to General Ledger!`, 'success');
      await refreshFromBackend();
      return res.data;
    } catch (err) {
      showToast(`Journal Entry error: ${err.message}`, 'error');
      throw err;
    }
  };

  // -------------------------------------------------------------
  // REPORT AGGREGATORS & CONTACT HISTORY
  // -------------------------------------------------------------
  const getAccountLedger = (accountName) => {
    const ledgerItems = [];
    let runningBalance = 0;
    const sortedEntries = [...journalEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedEntries.forEach(je => {
      je.lines?.forEach(line => {
        if (!accountName || line.account?.toLowerCase().includes(accountName.toLowerCase()) || accountName.toLowerCase().includes(line.account?.toLowerCase())) {
          const debit = Number(line.debit || 0);
          const credit = Number(line.credit || 0);
          runningBalance += (debit - credit);

          ledgerItems.push({
            jeId: je.id,
            date: je.date,
            reference: je.reference,
            journalType: je.journalType,
            account: line.account,
            description: line.description || je.reference,
            debit,
            credit,
            balance: runningBalance
          });
        }
      });
    });

    return ledgerItems;
  };

  const getContactHistory = (contactId) => {
    const targetId = contactId || activeContactId;
    if (!targetId && contacts.length === 0) {
      return { contact: null, invoices: [], vendorBills: [], totalInvoiced: 0, totalReceivable: 0, totalBilled: 0, totalPayable: 0 };
    }

    const contact = contacts.find(c => 
      c.id === targetId || 
      c.backendId === Number(targetId) || 
      String(c.backendId) === String(targetId) ||
      `CNT-00${c.backendId}` === String(targetId)
    ) || contacts[0];

    if (!contact) return { contact: null, invoices: [], vendorBills: [], totalInvoiced: 0, totalReceivable: 0, totalBilled: 0, totalPayable: 0 };

    const contactBackendId = contact.backendId || extractBackendId(contact.id, contacts);

    const contactInvoices = invoices.filter(i => 
      Number(i.customerId) === Number(contactBackendId) || 
      i.customerId === contact.id || 
      `CNT-00${i.customerId}` === contact.id ||
      i.customerName === contact.name
    );

    const contactBills = vendorBills.filter(b => 
      Number(b.vendorId) === Number(contactBackendId) || 
      b.vendorId === contact.id || 
      `CNT-00${b.vendorId}` === contact.id ||
      b.vendorName === contact.name
    );

    const totalInvoiced = contactInvoices.reduce((s, i) => s + Number(i.totalAmount || 0), 0);
    const totalReceivable = contactInvoices.reduce((s, i) => s + Number(i.balance || 0), 0);
    const totalBilled = contactBills.reduce((s, b) => s + Number(b.totalAmount || 0), 0);
    const totalPayable = contactBills.reduce((s, b) => s + Number(b.balance || 0), 0);

    return {
      contact,
      invoices: contactInvoices,
      vendorBills: contactBills,
      totalInvoiced,
      totalReceivable,
      totalBilled,
      totalPayable
    };
  };

  // Simulated Liquid Balances Calculation (Derived from Backend Ledger + Dashboard)
  const liquidBalances = useMemo(() => {
    if (dashboardData?.kpi) {
      const bank = Number(dashboardData.kpi.bankBalance || 0);
      const cash = Number(dashboardData.kpi.cashBalance || 0);
      return {
        bank,
        cash,
        totalLiquid: Number(dashboardData.kpi.liquidFunds !== undefined ? dashboardData.kpi.liquidFunds : (bank + cash))
      };
    }

    let bank = 100000;
    let cash = 50000;

    payments.forEach(p => {
      const amt = Number(p.amount || 0);
      const isBank = p.method?.toLowerCase().includes('bank');
      if (p.type === 'Customer Payment') {
        if (isBank) bank += amt;
        else cash += amt;
      } else {
        if (isBank) bank -= amt;
        else cash -= amt;
      }
    });

    return {
      bank: Math.max(0, bank),
      cash: Math.max(0, cash),
      totalLiquid: Math.max(0, bank) + Math.max(0, cash)
    };
  }, [dashboardData, payments]);

  // Balance Sheet Aggregation (Authoritative from Backend Report with Local Reactive Fallback)
  const balanceSheetData = useMemo(() => {
    if (balanceSheetReport) {
      const cashAcc = Number(balanceSheetReport.assets?.accounts?.find(a => a.name?.toLowerCase() === 'cash')?.balance || liquidBalances.cash);
      const bankAcc = Number(balanceSheetReport.assets?.accounts?.find(a => a.name?.toLowerCase() === 'bank')?.balance || liquidBalances.bank);
      const debtorsAcc = Number(balanceSheetReport.assets?.accounts?.find(a => a.name?.toLowerCase() === 'debtors')?.balance || 0);
      const inventoryValuation = Number(dashboardData?.kpi?.inventoryValuation || stockReport?.summary?.totalInventoryCost || 0);

      const totalAssets = Number(balanceSheetReport.summary?.totalAssets !== undefined ? balanceSheetReport.summary.totalAssets : (cashAcc + bankAcc + debtorsAcc + inventoryValuation));
      const creditorsAcc = Number(balanceSheetReport.liabilities?.accounts?.find(a => a.name?.toLowerCase() === 'creditors')?.balance || 0);
      const totalLiabilities = Number(balanceSheetReport.liabilities?.total !== undefined ? balanceSheetReport.liabilities.total : creditorsAcc);

      const ownersEquity = Number(balanceSheetReport.capital?.totalCapitalBase || 150000);
      const retainedEarnings = Number(balanceSheetReport.capital?.retainedEarnings !== undefined ? balanceSheetReport.capital.retainedEarnings : (pnlReport?.netProfit || 0));
      const totalCapital = Number(balanceSheetReport.capital?.totalCapitalWithEarnings !== undefined ? balanceSheetReport.capital.totalCapitalWithEarnings : (ownersEquity + retainedEarnings));
      const totalLiabilitiesAndCapital = Number(balanceSheetReport.summary?.totalLiabilitiesAndCapital !== undefined ? balanceSheetReport.summary.totalLiabilitiesAndCapital : (totalLiabilities + totalCapital));
      const isBalanced = balanceSheetReport.summary?.isBalanced !== undefined ? Boolean(balanceSheetReport.summary.isBalanced) : Math.abs(totalAssets - totalLiabilitiesAndCapital) < 1;

      return {
        cashAcc,
        bankAcc,
        debtorsAcc,
        inventoryValuation,
        totalAssets,
        creditorsAcc,
        gstPayableAcc: 0,
        totalLiabilities,
        ownersEquity,
        retainedEarnings,
        totalCapital,
        totalLiabilitiesAndCapital,
        isBalanced
      };
    }

    const cashAcc = liquidBalances.cash;
    const bankAcc = liquidBalances.bank;
    const debtorsAcc = invoices.reduce((sum, inv) => sum + Number(inv.balance || 0), 0);
    const inventoryValuation = products
      .filter(p => p.type === 'Goods')
      .reduce((sum, p) => sum + (Number(p.stock || 0) * Number(p.costPrice || 0)), 0);

    const totalAssets = cashAcc + bankAcc + debtorsAcc + inventoryValuation;
    const creditorsAcc = vendorBills.reduce((sum, bill) => sum + Number(bill.balance || 0), 0);
    const totalLiabilities = creditorsAcc;

    const saleIncome = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
    const purchaseExpense = vendorBills.reduce((sum, bill) => sum + Number(bill.totalAmount || 0), 0);
    const netProfit = saleIncome - purchaseExpense;

    const ownersEquity = 150000;
    const retainedEarnings = netProfit;
    const totalCapital = ownersEquity + retainedEarnings;
    const totalLiabilitiesAndCapital = totalLiabilities + totalCapital;

    return {
      cashAcc,
      bankAcc,
      debtorsAcc,
      inventoryValuation,
      totalAssets,
      creditorsAcc,
      gstPayableAcc: 0,
      totalLiabilities,
      ownersEquity,
      retainedEarnings,
      totalCapital,
      totalLiabilitiesAndCapital,
      isBalanced: Math.abs(totalAssets - totalLiabilitiesAndCapital) < 1
    };
  }, [balanceSheetReport, dashboardData, stockReport, pnlReport, liquidBalances, invoices, vendorBills, products]);

  // P&L Aggregation (Authoritative from Backend Report)
  const pnlData = useMemo(() => {
    if (pnlReport) {
      const saleIncome = Number(pnlReport.income?.total || 0);
      const purchaseExpense = Number(pnlReport.expenses?.total || 0);
      const grossProfit = saleIncome - purchaseExpense;
      const netProfit = Number(pnlReport.netProfit || 0);
      const profitMarginPercent = saleIncome > 0 ? ((netProfit / saleIncome) * 100).toFixed(1) : 0;

      return {
        saleIncome,
        totalRevenue: saleIncome,
        purchaseExpense,
        grossProfit,
        totalOperatingExpenses: 0,
        netProfit,
        profitMarginPercent
      };
    }

    const saleIncome = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
    const purchaseExpense = vendorBills.reduce((sum, bill) => sum + Number(bill.totalAmount || 0), 0);
    const grossProfit = saleIncome - purchaseExpense;
    const totalOperatingExpenses = 0;
    const netProfit = grossProfit - totalOperatingExpenses;
    const profitMarginPercent = saleIncome > 0 ? ((netProfit / saleIncome) * 100).toFixed(1) : 0;

    return {
      saleIncome,
      totalRevenue: saleIncome,
      purchaseExpense,
      grossProfit,
      totalOperatingExpenses,
      netProfit,
      profitMarginPercent
    };
  }, [pnlReport, invoices, vendorBills]);

  // Stock Report Aggregation (Authoritative from Backend Report)
  const stockReportData = useMemo(() => {
    if (stockReport?.items && Array.isArray(stockReport.items) && stockReport.items.length > 0) {
      return stockReport.items.map(item => ({
        id: String(item.id).startsWith('PRD') ? item.id : `PRD-10${item.id}`,
        backendId: item.id,
        name: item.name,
        category: item.category || 'General',
        type: item.type ? (item.type.charAt(0).toUpperCase() + item.type.slice(1)) : 'Goods',
        costPrice: Number(item.cost_price || 0),
        salesPrice: Number(item.sales_price || 0),
        stock: Number(item.stock_quantity || 0),
        availableStock: Number(item.stock_quantity || 0),
        totalValuation: Number(item.cost_valuation || 0),
        isLowStock: Boolean(item.is_low_stock),
        reorderLevel: 5,
      }));
    }

    return products.map(product => {
      const availableStock = Number(product.stock || 0);
      const totalValuation = availableStock * Number(product.costPrice || 0);
      return {
        ...product,
        availableStock,
        totalValuation,
        isLowStock: product.type === 'Goods' && availableStock <= (product.reorderLevel || 5)
      };
    });
  }, [stockReport, products]);

  // Budget Report Aggregation (Authoritative from Backend Report)
  const budgetReportData = useMemo(() => {
    if (Array.isArray(budgetReport) && budgetReport.length > 0) {
      return budgetReport.map(b => ({
        id: String(b.id).startsWith('BDG') ? b.id : `BDG-2026-0${b.id}`,
        backendId: b.id,
        name: b.name,
        periodStart: b.period_start,
        periodEnd: b.period_end,
        responsiblePerson: b.responsible_person || 'Admin',
        plannedAmount: Number(b.planned_amount || 0),
        actualSpent: Number(b.actual_amount || 0),
        variance: Number(b.remaining_amount || 0),
        usagePercent: Math.round(Number(b.utilization_percent || 0)),
        isOverBudget: Boolean(b.is_over_budget)
      }));
    }

    return budgets.map(b => {
      const planned = Number(b.plannedAmount || 0);
      const actualSpent = Number(b.actualAmount || 0);
      const variance = planned - actualSpent;
      const usagePercent = planned > 0 ? Math.min(100, Math.round((actualSpent / planned) * 100)) : 0;
      return {
        ...b,
        plannedAmount: planned,
        actualSpent,
        variance,
        usagePercent,
        isOverBudget: actualSpent > planned
      };
    });
  }, [budgetReport, budgets]);

  // Context Bundle
  const contextValue = {
    activeTab,
    setActiveTab,
    userRole,
    setUserRole,
    activeContactId,
    setActiveContactId,
    sidebarOpen,
    setSidebarOpen,
    searchQuery,
    setSearchQuery,
    toast,
    showToast,

    // Authentication
    currentUser,
    isAuthenticated,
    authLoading,
    login,
    logout,

    // Backend Connectivity
    backendOnline,
    syncing,
    initialLoading,
    refreshFromBackend,

    // Notifications
    notifications,
    unreadNotificationCount,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,

    // Entities
    contacts,
    products,
    chartOfAccounts,
    journals,
    analyticAccounts,
    budgets,
    purchaseOrders,
    vendorBills,
    salesOrders,
    invoices,
    payments,
    journalEntries,
    liquidBalances,

    // Authoritative Backend Reports
    dashboardData,
    pnlReport,
    balanceSheetReport,
    stockReport,
    budgetReport,
    trialBalanceReport,
    fetchContactLedgerHistory: (id) => api.contacts.getLedgerHistory(id),

    // Global Modals
    showPaymentModal,
    setShowPaymentModal,
    paymentTargetDoc,
    setPaymentTargetDoc,
    showDemoTourModal,
    setShowDemoTourModal,

    // Actions
    formatCurrency,
    addContact,
    archiveContact,
    addProduct,
    adjustProductStock,
    addChartOfAccount,
    addJournal,
    addAnalyticAccount,
    addBudget,
    createPurchaseOrder,
    receiveGoodsPO,
    convertPOToVendorBill,
    createSalesOrder,
    deliverGoodsSO,
    convertSOToCustomerInvoice,
    recordPayment,
    createManualJournalEntry,

    // Aggregations
    getAccountLedger,
    getContactHistory,
    balanceSheetData,
    pnlData,
    stockReportData,
    budgetReportData
  };

  return (
    <AccountingContext.Provider value={contextValue}>
      {children}
    </AccountingContext.Provider>
  );
}

export function useAccounting() {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
}
