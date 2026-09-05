import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  initialContacts,
  initialProducts,
  initialChartOfAccounts,
  initialJournals,
  initialAnalyticAccounts,
  initialBudgets,
  initialPurchaseOrders,
  initialVendorBills,
  initialSalesOrders,
  initialInvoices,
  initialJournalEntries,
  initialPayments,
  initialNotifications
} from '../data/initialData';
import api from '../services/api';

const AccountingContext = createContext();

export function AccountingProvider({ children }) {
  // Navigation & Role
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('Admin'); // 'Admin' | 'Accountant' | 'Contact'
  const [activeContactId, setActiveContactId] = useState('CNT-002'); // Defaults to Nimesh Pathak
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Backend Live Status
  const [backendOnline, setBackendOnline] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Notification System State
  const [notifications, setNotifications] = useState(initialNotifications);

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

  // State Entities
  const [contacts, setContacts] = useState(initialContacts);
  const [products, setProducts] = useState(initialProducts);
  const [chartOfAccounts, setChartOfAccounts] = useState(initialChartOfAccounts);
  const [journals, setJournals] = useState(initialJournals);
  const [analyticAccounts, setAnalyticAccounts] = useState(initialAnalyticAccounts);
  const [budgets, setBudgets] = useState(initialBudgets);

  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [vendorBills, setVendorBills] = useState(initialVendorBills);
  const [salesOrders, setSalesOrders] = useState(initialSalesOrders);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [payments, setPayments] = useState(initialPayments);
  const [journalEntries, setJournalEntries] = useState(initialJournalEntries);

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
  // BACKEND SYNCHRONIZATION ENGINE
  // -------------------------------------------------------------
  const refreshFromBackend = useCallback(async () => {
    setSyncing(true);
    try {
      // 1. Authenticate if no token
      try {
        await api.auth.me();
      } catch {
        // Auto-login default admin for hackathon evaluation demo
        await api.auth.login('admin@urbanfurniture.com', 'admin123').catch(() => null);
      }

      // 2. Fetch all domain records in parallel
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
      ]);

      // Contacts mapping
      if (contactsRes.status === 'fulfilled' && contactsRes.value.data?.contacts?.length) {
        const mappedContacts = contactsRes.value.data.contacts.map(c => ({
          id: String(c.id).startsWith('CNT') ? c.id : `CNT-00${c.id}`,
          backendId: c.id,
          name: c.name,
          type: c.type ? (c.type.charAt(0).toUpperCase() + c.type.slice(1)) : 'Customer',
          email: c.email || '',
          mobile: c.mobile || '',
          address: {
            city: c.address_city || 'Mumbai',
            state: c.address_state || 'Maharashtra',
            pincode: c.address_pincode || '400001'
          },
          profileImage: c.profile_image || `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100`,
          isArchived: Boolean(c.is_archived)
        }));
        setContacts(mappedContacts);
      }

      // Products mapping
      if (productsRes.status === 'fulfilled' && productsRes.value.data?.products?.length) {
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
      if (coaRes.status === 'fulfilled' && Array.isArray(coaRes.value.data)) {
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
      if (journalsRes.status === 'fulfilled' && Array.isArray(journalsRes.value.data)) {
        const mappedJournals = journalsRes.value.data.map(j => ({
          id: `JRN-0${j.id}`,
          backendId: j.id,
          name: j.name,
          type: j.type ? (j.type.charAt(0).toUpperCase() + j.type.slice(1)) : 'General'
        }));
        setJournals(mappedJournals);
      }

      // Journal Entries mapping
      if (journalEntriesRes.status === 'fulfilled' && journalEntriesRes.value.data?.entries?.length) {
        const mappedEntries = journalEntriesRes.value.data.entries.map(je => ({
          id: `JE-00${je.id}`,
          backendId: je.id,
          date: je.entry_date,
          reference: je.reference,
          journalType: je.journal?.name || 'General Journal',
          lines: (je.items || []).map(item => ({
            account: item.account?.account_name || 'General Account',
            debit: Number(item.debit || 0),
            credit: Number(item.credit || 0)
          }))
        }));
        setJournalEntries(mappedEntries);
      }

      // Sales Orders mapping
      if (soRes.status === 'fulfilled' && soRes.value.data?.salesOrders?.length) {
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
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value.data?.invoices?.length) {
        const mappedInvoices = invoicesRes.value.data.invoices.map(inv => ({
          id: `INV-2026-00${inv.id}`,
          backendId: inv.id,
          customerId: inv.customer_id,
          customerName: inv.customer?.name || 'Customer',
          customerEmail: inv.customer?.email || '',
          customerPhone: inv.customer?.mobile || '',
          customerAddress: inv.customer?.address_city ? `${inv.customer.address_city}, ${inv.customer.address_state || ''}` : 'Mumbai, India',
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
      if (poRes.status === 'fulfilled' && poRes.value.data?.purchaseOrders?.length) {
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
      if (billsRes.status === 'fulfilled' && billsRes.value.data?.bills?.length) {
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
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.data?.payments?.length) {
        const mappedPayments = paymentsRes.value.data.payments.map(p => ({
          id: `PAY-2026-00${p.id}`,
          backendId: p.id,
          date: p.payment_date,
          type: p.customer_invoice_id ? 'Customer Payment' : 'Vendor Payment',
          docId: p.customer_invoice_id ? `INV-2026-00${p.customer_invoice_id}` : `BILL-2026-00${p.vendor_bill_id}`,
          contactName: p.customerInvoice?.customer?.name || p.vendorBill?.vendor?.name || 'Party',
          method: p.method === 'bank' ? 'Bank Account (HDFC)' : 'Cash on Hand',
          amount: Number(p.amount || 0),
          notes: p.notes || ''
        }));
        setPayments(mappedPayments);
      }

      // Budgets mapping
      if (budgetsRes.status === 'fulfilled' && Array.isArray(budgetsRes.value.data)) {
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

      setBackendOnline(true);
    } catch (err) {
      console.warn('[Backend Sync Warning]:', err.message);
      setBackendOnline(false);
    } finally {
      setSyncing(false);
    }
  }, []);

  // Sync on initial mount
  useEffect(() => {
    refreshFromBackend();
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

      showToast(`Contact "${contactData.name}" created in MySQL!`, 'success');
      refreshFromBackend();
      return res.data;
    } catch (err) {
      // Fallback local addition if offline
      const newId = `CNT-00${contacts.length + 1}`;
      const newContact = {
        id: newId,
        name: contactData.name,
        type: contactData.type || 'Customer',
        email: contactData.email,
        mobile: contactData.mobile || '+91 90000 00000',
        address: {
          city: contactData.city || 'Mumbai',
          state: contactData.state || 'Maharashtra',
          pincode: contactData.pincode || '400001'
        },
        profileImage: contactData.profileImage || `https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100`,
        isArchived: false,
        notes: contactData.notes || ''
      };
      setContacts([newContact, ...contacts]);
      showToast(`Contact created: ${err.message}`, err.isNetworkError ? 'info' : 'error');
      return newContact;
    }
  };

  const archiveContact = async (contactId) => {
    try {
      const contactObj = contacts.find(c => c.id === contactId);
      const rawId = contactObj?.backendId || parseInt(contactId.replace(/\D/g, ''), 10) || 1;
      await api.contacts.archive(rawId);
      showToast(`Contact status updated on backend.`, 'success');
      refreshFromBackend();
    } catch {
      setContacts(contacts.map(c => c.id === contactId ? { ...c, isArchived: !c.isArchived } : c));
      showToast(`Contact archived locally.`);
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

      showToast(`Product "${productData.name}" added to MySQL catalog!`, 'success');
      refreshFromBackend();
      return res.data;
    } catch (err) {
      const newId = `PRD-10${products.length + 1}`;
      const newProduct = {
        id: newId,
        name: productData.name,
        type: productData.type || 'Goods',
        salesPrice: Number(productData.salesPrice || 0),
        costPrice: Number(productData.costPrice || 0),
        category: productData.category || 'General Furniture',
        stock: Number(productData.stock || 0),
        reorderLevel: Number(productData.reorderLevel || 5),
        isArchived: false,
        description: productData.description || ''
      };
      setProducts([newProduct, ...products]);
      showToast(`Product added: ${err.message}`, 'info');
      return newProduct;
    }
  };

  const adjustProductStock = async (productId, newStock, reason = 'Inventory Count Adjustment') => {
    try {
      const prd = products.find(p => p.id === productId);
      const rawId = prd?.backendId || parseInt(productId.replace(/\D/g, ''), 10) || 1;
      const current = Number(prd?.stock || 0);
      const delta = Number(newStock) - current;

      if (delta !== 0) {
        await api.products.adjustStock(rawId, delta, reason);
      }
      showToast(`Stock updated for ${prd?.name || productId}: ${newStock} units.`, 'success');
      refreshFromBackend();
    } catch (err) {
      setProducts(products.map(p => p.id === productId ? { ...p, stock: Number(newStock) } : p));
      showToast(`Stock updated: ${err.message}`, 'info');
    }
  };

  const addChartOfAccount = async (accountData) => {
    try {
      await api.accounts.create({
        account_name: accountData.name,
        account_type: (accountData.type || 'Asset').toLowerCase()
      });
      showToast(`Account "${accountData.name}" created in Chart of Accounts!`, 'success');
      refreshFromBackend();
    } catch (err) {
      const newAccount = {
        id: `COA-${accountData.code || Math.floor(1000 + Math.random() * 9000)}`,
        name: accountData.name,
        type: accountData.type,
        balance: Number(accountData.initialBalance || 0)
      };
      setChartOfAccounts([...chartOfAccounts, newAccount]);
      showToast(`Account "${newAccount.name}" added locally.`);
    }
  };

  const addJournal = async (journalData) => {
    try {
      await api.journals.create({
        name: journalData.name,
        type: (journalData.type || 'sales').toLowerCase()
      });
      showToast(`Journal "${journalData.name}" created in MySQL!`, 'success');
      refreshFromBackend();
    } catch {
      const newJournal = {
        id: `JRN-0${journals.length + 1}`,
        name: journalData.name,
        type: journalData.type
      };
      setJournals([...journals, newJournal]);
      showToast(`Journal created locally.`);
    }
  };

  const addAnalyticAccount = async (analyticData) => {
    try {
      await api.budgets.createAnalytic({
        name: analyticData.name,
        type: (analyticData.type || 'expense').toLowerCase()
      });
      showToast(`Analytic Account "${analyticData.name}" created!`, 'success');
      refreshFromBackend();
    } catch {
      const newAnalytic = {
        id: `ANA-0${analyticAccounts.length + 1}`,
        name: analyticData.name,
        type: analyticData.type || 'Expense'
      };
      setAnalyticAccounts([...analyticAccounts, newAnalytic]);
      showToast(`Analytic account added locally.`);
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
      showToast(`Budget "${budgetData.name}" registered in MySQL!`, 'success');
      refreshFromBackend();
    } catch {
      const newId = `BDG-2026-0${budgets.length + 1}`;
      const newBudget = {
        id: newId,
        name: budgetData.name,
        periodStart: budgetData.periodStart || '2026-09-01',
        periodEnd: budgetData.periodEnd || '2026-09-30',
        responsiblePerson: budgetData.responsiblePerson || 'Admin',
        plannedAmount: Number(budgetData.plannedAmount || 0),
        actualAmount: 0,
        status: 'Active'
      };
      setBudgets([newBudget, ...budgets]);
      showToast(`Budget added locally.`);
    }
  };

  // -------------------------------------------------------------
  // TRANSACTION WORKFLOWS (API CONNECTED)
  // -------------------------------------------------------------

  // 1. PURCHASE ORDER WORKFLOW
  const createPurchaseOrder = async (poData) => {
    try {
      const vendorObj = contacts.find(c => c.id === poData.vendorId);
      const rawVendorId = vendorObj?.backendId || parseInt(String(poData.vendorId).replace(/\D/g, ''), 10) || 1;

      const items = poData.items.map(item => {
        const prd = products.find(p => p.id === item.productId);
        const rawPrdId = prd?.backendId || parseInt(String(item.productId).replace(/\D/g, ''), 10) || 1;
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
      refreshFromBackend();
      return res.data;
    } catch (err) {
      // Offline fallback
      const newId = `PO-2026-00${purchaseOrders.length + 1}`;
      const vendor = contacts.find(c => c.id === poData.vendorId);
      const items = poData.items.map(item => {
        const prd = products.find(p => p.id === item.productId);
        const qty = Number(item.qty || 1);
        const unitPrice = Number(item.unitPrice || prd?.costPrice || 0);
        return {
          productId: item.productId,
          productName: prd ? prd.name : 'Custom Furniture Item',
          qty,
          unitPrice,
          total: qty * unitPrice
        };
      });
      const totalAmount = items.reduce((s, i) => s + i.total, 0);

      const newPO = {
        id: newId,
        vendorId: poData.vendorId,
        vendorName: vendor ? vendor.name : 'Vendor',
        date: poData.date || new Date().toISOString().split('T')[0],
        status: 'Confirmed',
        goodsReceived: false,
        items,
        totalAmount
      };
      setPurchaseOrders([newPO, ...purchaseOrders]);
      showToast(`Purchase Order created: ${err.message}`, 'info');
      return newPO;
    }
  };

  const receiveGoodsPO = async (poId) => {
    try {
      const poObj = purchaseOrders.find(p => p.id === poId);
      const rawPoId = poObj?.backendId || parseInt(String(poId).replace(/\D/g, ''), 10) || 1;
      await api.purchases.confirm(rawPoId);
      showToast(`Goods receipt recorded for ${poId}!`, 'success');
      refreshFromBackend();
    } catch {
      setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, goodsReceived: true } : p));
      showToast(`Goods received for ${poId}.`);
    }
  };

  const convertPOToVendorBill = async (poId, customDueDate = null) => {
    try {
      const poObj = purchaseOrders.find(p => p.id === poId);
      const rawPoId = poObj?.backendId || parseInt(String(poId).replace(/\D/g, ''), 10) || 1;

      const res = await api.bills.generateFromPO(rawPoId, {
        dueDate: customDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      showToast(`Vendor Bill generated & Double-Entry posted in MySQL!`, 'success');
      refreshFromBackend();
      return res.data;
    } catch (err) {
      showToast(`Failed to generate vendor bill: ${err.message}`, 'error');
      return null;
    }
  };

  // 2. SALES ORDER WORKFLOW
  const createSalesOrder = async (soData) => {
    try {
      const customerObj = contacts.find(c => c.id === soData.customerId);
      const rawCustomerId = customerObj?.backendId || parseInt(String(soData.customerId).replace(/\D/g, ''), 10) || 1;

      const items = soData.items.map(item => {
        const prd = products.find(p => p.id === item.productId);
        const rawPrdId = prd?.backendId || parseInt(String(item.productId).replace(/\D/g, ''), 10) || 1;
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
      refreshFromBackend();
      return res.data;
    } catch (err) {
      const newId = `SO-2026-00${salesOrders.length + 1}`;
      const customer = contacts.find(c => c.id === soData.customerId);
      const items = soData.items.map(item => {
        const prd = products.find(p => p.id === item.productId);
        const qty = Number(item.qty || 1);
        const unitPrice = Number(item.unitPrice || prd?.salesPrice || 0);
        return {
          productId: item.productId,
          productName: prd ? prd.name : 'Custom Furniture',
          qty,
          unitPrice,
          total: qty * unitPrice
        };
      });
      const totalAmount = items.reduce((s, i) => s + i.total, 0);

      const newSO = {
        id: newId,
        customerId: soData.customerId,
        customerName: customer ? customer.name : 'Customer',
        date: soData.date || new Date().toISOString().split('T')[0],
        status: 'Confirmed',
        delivered: false,
        items,
        totalAmount
      };
      setSalesOrders([newSO, ...salesOrders]);
      showToast(`Sales order created: ${err.message}`, 'info');
      return newSO;
    }
  };

  const deliverGoodsSO = async (soId) => {
    try {
      const soObj = salesOrders.find(s => s.id === soId);
      const rawSoId = soObj?.backendId || parseInt(String(soId).replace(/\D/g, ''), 10) || 1;
      await api.sales.confirm(rawSoId);
      showToast(`Delivery recorded for ${soId}!`, 'success');
      refreshFromBackend();
    } catch {
      setSalesOrders(prev => prev.map(s => s.id === soId ? { ...s, delivered: true } : s));
      showToast(`Goods delivered for ${soId}.`);
    }
  };

  const convertSOToCustomerInvoice = async (soId, customDueDate = null) => {
    try {
      const soObj = salesOrders.find(s => s.id === soId);
      const rawSoId = soObj?.backendId || parseInt(String(soId).replace(/\D/g, ''), 10) || 1;

      const res = await api.invoices.generateFromSO(rawSoId, {
        dueDate: customDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      showToast(`Customer Invoice generated & Double-Entry posted in MySQL!`, 'success');
      refreshFromBackend();
      return res.data;
    } catch (err) {
      showToast(`Failed to generate invoice: ${err.message}`, 'error');
      return null;
    }
  };

  // 3. PAYMENT RECORDING (API CONNECTED)
  const recordPayment = async (paymentData) => {
    try {
      const { docId, docType, method, amount, notes } = paymentData;
      const isCustomerDoc = docType === 'Customer Invoice' || String(docId).startsWith('INV');
      const rawDocId = parseInt(String(docId).replace(/\D/g, ''), 10) || 1;

      const payload = {
        amount: Number(amount),
        method: method.toLowerCase().includes('bank') ? 'bank' : 'cash',
        notes: notes || '',
        customerInvoiceId: isCustomerDoc ? rawDocId : null,
        vendorBillId: !isCustomerDoc ? rawDocId : null
      };

      const res = await api.payments.record(payload);
      showToast(`Payment of ${formatCurrency(amount)} posted to Ledger in MySQL!`, 'success');
      refreshFromBackend();
      return res.data;
    } catch (err) {
      showToast(`Payment error: ${err.message}`, 'error');
      throw err;
    }
  };

  // 4. MANUAL JOURNAL ENTRY (API CONNECTED)
  const createManualJournalEntry = async (entryData) => {
    try {
      const res = await api.journals.createManualEntry({
        journalId: 1, // Default sales/general journal
        reference: entryData.reference || 'Manual Adjusting Entry',
        items: entryData.lines.map(l => ({
          account_id: l.accountId || 1,
          debit: Number(l.debit || 0),
          credit: Number(l.credit || 0),
          description: l.description || entryData.reference
        }))
      });

      showToast(`Manual Journal Entry posted to MySQL Ledger!`, 'success');
      refreshFromBackend();
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
        if (line.account?.toLowerCase().includes(accountName.toLowerCase()) || accountName.toLowerCase().includes(line.account?.toLowerCase())) {
          const debit = Number(line.debit || 0);
          const credit = Number(line.credit || 0);
          runningBalance += (debit - credit);

          ledgerItems.push({
            jeId: je.id,
            date: je.date,
            reference: je.reference,
            journalType: je.journalType,
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
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return { contact: null, invoices: [], vendorBills: [], totalInvoiced: 0, totalReceivable: 0, totalBilled: 0, totalPayable: 0 };

    const contactInvoices = invoices.filter(i => i.customerId === contactId || i.customerName === contact.name);
    const contactBills = vendorBills.filter(b => b.vendorId === contactId || b.vendorName === contact.name);

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

  // Balance Sheet Aggregation
  const balanceSheetData = useMemo(() => {
    const cashAcc = chartOfAccounts.find(a => a.name.includes('Cash'))?.balance || 25000;
    const bankAcc = chartOfAccounts.find(a => a.name.includes('Bank'))?.balance || 400000;
    const debtorsAcc = invoices.reduce((sum, inv) => sum + Number(inv.balance || 0), 0);
    const inventoryValuation = products
      .filter(p => p.type === 'Goods')
      .reduce((sum, p) => sum + (Number(p.stock || 0) * Number(p.costPrice || 0)), 0);

    const totalAssets = cashAcc + bankAcc + debtorsAcc + inventoryValuation;
    const creditorsAcc = vendorBills.reduce((sum, bill) => sum + Number(bill.balance || 0), 0);
    const gstPayableAcc = 0;
    const totalLiabilities = creditorsAcc + gstPayableAcc;

    const saleIncome = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
    const purchaseExpense = vendorBills.reduce((sum, bill) => sum + Number(bill.totalAmount || 0), 0);
    const netProfit = saleIncome - purchaseExpense;

    const ownersEquity = 500000;
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
      gstPayableAcc,
      totalLiabilities,
      ownersEquity,
      retainedEarnings,
      totalCapital,
      totalLiabilitiesAndCapital,
      isBalanced: Math.abs(totalAssets - totalLiabilitiesAndCapital) < 1
    };
  }, [chartOfAccounts, invoices, vendorBills, products]);

  // P&L Aggregation
  const pnlData = useMemo(() => {
    const saleIncome = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
    const purchaseExpense = vendorBills.reduce((sum, bill) => sum + Number(bill.totalAmount || 0), 0);
    const grossProfit = saleIncome - purchaseExpense;
    const totalOperatingExpenses = 25000;
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
  }, [invoices, vendorBills]);

  // Stock Report Aggregation
  const stockReportData = useMemo(() => {
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
  }, [products]);

  // Budget Report Aggregation
  const budgetReportData = useMemo(() => {
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
  }, [budgets]);

  // Value Bundle
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

    // Backend Connectivity
    backendOnline,
    syncing,
    refreshFromBackend,

    // Notification System
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
