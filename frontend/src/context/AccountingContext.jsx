import React, { createContext, useContext, useState, useMemo } from 'react';
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
  initialPayments
} from '../data/initialData';

const AccountingContext = createContext();

export function AccountingProvider({ children }) {
  // Navigation & Role
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('Admin'); // 'Admin' | 'Accountant' | 'Contact'
  const [activeContactId, setActiveContactId] = useState('CNT-002'); // Defaults to Nimesh Pathak when role=Contact
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast Notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
  // MASTER DATA ACTIONS
  // -------------------------------------------------------------
  const addContact = (contactData) => {
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
      profileImage: contactData.profileImage || `https://images.unsplash.com/photo-${1500000000000 + contacts.length}?w=100&auto=format&fit=crop&q=80`,
      isArchived: false,
      notes: contactData.notes || ''
    };
    setContacts([newContact, ...contacts]);
    showToast(`Contact "${newContact.name}" (${newContact.type}) created successfully!`);
    return newContact;
  };

  const archiveContact = (contactId) => {
    // Validation: check if transactions exist
    const hasTransactions = purchaseOrders.some(p => p.vendorId === contactId) ||
      salesOrders.some(s => s.customerId === contactId) ||
      invoices.some(i => i.customerId === contactId) ||
      vendorBills.some(b => b.vendorId === contactId);

    setContacts(contacts.map(c => {
      if (c.id === contactId) {
        return { ...c, isArchived: !c.isArchived };
      }
      return c;
    }));

    showToast(hasTransactions ? `Contact status updated (archived with existing audit history).` : `Contact archived successfully.`);
  };

  const addProduct = (productData) => {
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
    showToast(`Product "${newProduct.name}" added to catalog with stock ${newProduct.stock}.`);
    return newProduct;
  };

  const adjustProductStock = (productId, newStock, reason = 'Inventory Count Adjustment') => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return { ...p, stock: Number(newStock) };
      }
      return p;
    }));
    showToast(`Stock updated for product ${productId}: ${newStock} units (${reason}).`);
  };

  const addChartOfAccount = (accountData) => {
    const newAccount = {
      id: `COA-${accountData.code || Math.floor(1000 + Math.random() * 9000)}`,
      code: accountData.code,
      name: accountData.name,
      type: accountData.type, // 'Asset' | 'Liability' | 'Capital' | 'Income' | 'Expense'
      subCategory: accountData.subCategory || 'General',
      balance: Number(accountData.initialBalance || 0)
    };
    setChartOfAccounts([...chartOfAccounts, newAccount]);
    showToast(`Account "${newAccount.name}" added to Chart of Accounts.`);
    return newAccount;
  };

  const addJournal = (journalData) => {
    const newJournal = {
      id: `JRN-0${journals.length + 1}`,
      name: journalData.name,
      type: journalData.type,
      defaultDebitAccountId: journalData.defaultDebitAccountId,
      defaultCreditAccountId: journalData.defaultCreditAccountId,
      description: journalData.description || ''
    };
    setJournals([...journals, newJournal]);
    showToast(`Journal "${newJournal.name}" created successfully.`);
    return newJournal;
  };

  const addAnalyticAccount = (analyticData) => {
    const newAnalytic = {
      id: `ANA-0${analyticAccounts.length + 1}`,
      name: analyticData.name,
      type: analyticData.type || 'Expense',
      code: analyticData.code || `ANA-${Date.now().toString().slice(-4)}`,
      description: analyticData.description || ''
    };
    setAnalyticAccounts([...analyticAccounts, newAnalytic]);
    showToast(`Analytic Account "${newAnalytic.name}" created.`);
    return newAnalytic;
  };

  const addBudget = (budgetData) => {
    const newId = `BDG-2026-0${budgets.length + 1}`;
    const analyticAcc = analyticAccounts.find(a => a.id === budgetData.analyticAccountId);
    const newBudget = {
      id: newId,
      name: budgetData.name,
      periodStart: budgetData.periodStart || '2026-09-01',
      periodEnd: budgetData.periodEnd || '2026-09-30',
      responsiblePerson: budgetData.responsiblePerson || 'Accountant Admin',
      plannedAmount: Number(budgetData.plannedAmount || 0),
      analyticAccountId: budgetData.analyticAccountId,
      analyticAccountName: analyticAcc ? analyticAcc.name : 'General Account',
      actualAmount: 0,
      status: 'Active'
    };
    setBudgets([newBudget, ...budgets]);
    showToast(`Budget "${newBudget.name}" of ${formatCurrency(newBudget.plannedAmount)} created!`);
    return newBudget;
  };

  // -------------------------------------------------------------
  // TRANSACTION WORKFLOWS & AUTOMATIC DOUBLE-ENTRY ENGINE
  // -------------------------------------------------------------

  // Helper: Post a balanced double-entry
  const postJournalEntry = ({ journalType, reference, lines, date = new Date().toISOString().split('T')[0], analyticAccountId = null }) => {
    const jeId = `JE-AUTO-${Date.now().toString().slice(-6)}`;
    const totalDebits = lines.reduce((sum, l) => sum + Number(l.debit || 0), 0);
    const totalCredits = lines.reduce((sum, l) => sum + Number(l.credit || 0), 0);

    // Strict Double Entry Rule validation
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error(`Double-Entry Imbalance: Debits (${totalDebits}) must equal Credits (${totalCredits}).`);
    }

    const newJE = {
      id: jeId,
      date,
      reference,
      journalType,
      journalName: `${journalType} Journal`,
      analyticAccountId,
      lines: lines.map(l => ({
        accountId: l.accountId || '',
        account: l.account,
        debit: Number(l.debit || 0),
        credit: Number(l.credit || 0)
      }))
    };

    setJournalEntries(prev => [newJE, ...prev]);

    // Live update Chart of Accounts balances
    setChartOfAccounts(prevCoA => prevCoA.map(acc => {
      let debitAdded = 0;
      let creditAdded = 0;
      lines.forEach(l => {
        if (l.account === acc.name || (l.accountId && l.accountId === acc.id)) {
          debitAdded += Number(l.debit || 0);
          creditAdded += Number(l.credit || 0);
        }
      });

      if (debitAdded === 0 && creditAdded === 0) return acc;

      // Normal balance adjustments
      let newBalance = acc.balance;
      if (acc.type === 'Asset' || acc.type === 'Expense') {
        newBalance = acc.balance + debitAdded - creditAdded;
      } else {
        // Liability, Capital, Income
        newBalance = acc.balance + creditAdded - debitAdded;
      }
      return { ...acc, balance: newBalance };
    }));

    return jeId;
  };

  // 1. PURCHASE ORDER WORKFLOW
  const createPurchaseOrder = (poData) => {
    const newId = `PO-2026-00${purchaseOrders.length + 1}`;
    const vendor = contacts.find(c => c.id === poData.vendorId);
    
    const items = poData.items.map(item => {
      const prd = products.find(p => p.id === item.productId);
      const qty = Number(item.qty || 1);
      const unitPrice = Number(item.unitPrice || prd?.costPrice || 0);
      const taxPercent = Number(item.taxPercent || 0);
      const taxAmount = (qty * unitPrice * taxPercent) / 100;
      const total = (qty * unitPrice) + taxAmount;
      return {
        productId: item.productId,
        productName: prd ? prd.name : 'Custom Furniture Item',
        qty,
        unitPrice,
        taxPercent,
        taxAmount,
        total
      };
    });

    const subtotal = items.reduce((s, i) => s + (i.qty * i.unitPrice), 0);
    const taxTotal = items.reduce((s, i) => s + i.taxAmount, 0);
    const totalAmount = subtotal + taxTotal;

    const newPO = {
      id: newId,
      vendorId: poData.vendorId,
      vendorName: vendor ? vendor.name : 'Vendor',
      date: poData.date || new Date().toISOString().split('T')[0],
      status: 'Confirmed',
      goodsReceived: false,
      goodsReceivedDate: null,
      items,
      subtotal,
      taxTotal,
      totalAmount,
      billId: null,
      analyticAccountId: poData.analyticAccountId || 'ANA-02',
      notes: poData.notes || ''
    };

    setPurchaseOrders([newPO, ...purchaseOrders]);
    showToast(`Purchase Order ${newId} created for ${newPO.vendorName} (${formatCurrency(totalAmount)}).`);
    return newPO;
  };

  // Step 2 in Purchase: Goods Received (Increases Stock on Hand)
  const receiveGoodsPO = (poId) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    // Increase product stock for all physical goods in PO
    setProducts(prevProducts => prevProducts.map(prd => {
      const line = po.items.find(i => i.productId === prd.id);
      if (line && prd.type === 'Goods') {
        return { ...prd, stock: prd.stock + line.qty };
      }
      return prd;
    }));

    setPurchaseOrders(prevPOs => prevPOs.map(p => {
      if (p.id === poId) {
        return {
          ...p,
          goodsReceived: true,
          goodsReceivedDate: new Date().toISOString().split('T')[0],
          status: p.status === 'Billed' ? 'Billed' : 'Goods Received'
        };
      }
      return p;
    }));

    showToast(`Goods received for ${poId}! Product stock has been increased in inventory.`);
  };

  // Step 3 in Purchase: Convert PO -> Vendor Bill + Auto Double Entry
  const convertPOToVendorBill = (poId, customDueDate = null) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return null;
    if (po.billId) {
      showToast(`This PO is already linked to Vendor Bill ${po.billId}`, 'info');
      return null;
    }

    const billId = `BILL-2026-00${vendorBills.length + 1}`;
    const billDate = new Date().toISOString().split('T')[0];
    const dueDate = customDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // If goods were not already marked received, receive them automatically now
    if (!po.goodsReceived) {
      receiveGoodsPO(poId);
    }

    // Auto-create balanced Journal Entry:
    // Debit: Purchase Expense (COGS)  |  Credit: Accounts Payable (Creditors)
    const jeId = postJournalEntry({
      journalType: 'Purchase',
      reference: `${billId} (${po.vendorName})`,
      analyticAccountId: po.analyticAccountId,
      lines: [
        { account: 'Purchase Expense (COGS)', debit: po.totalAmount, credit: 0 },
        { account: 'Accounts Payable (Creditors)', debit: 0, credit: po.totalAmount }
      ]
    });

    const newBill = {
      id: billId,
      poRef: po.id,
      vendorId: po.vendorId,
      vendorName: po.vendorName,
      date: billDate,
      dueDate,
      items: po.items,
      subtotal: po.subtotal,
      tax: po.taxTotal,
      totalAmount: po.totalAmount,
      paidAmount: 0,
      balance: po.totalAmount,
      status: 'Unpaid',
      journalEntryId: jeId,
      analyticAccountId: po.analyticAccountId
    };

    setVendorBills([newBill, ...vendorBills]);

    // Link Bill to PO
    setPurchaseOrders(prevPOs => prevPOs.map(p => 
      p.id === poId ? { ...p, status: 'Billed', billId } : p
    ));

    showToast(`Vendor Bill ${billId} generated! Auto Double-Entry (${jeId}) posted to Ledger.`);
    return newBill;
  };

  // 2. SALES ORDER WORKFLOW
  const createSalesOrder = (soData) => {
    const newId = `SO-2026-00${salesOrders.length + 1}`;
    const customer = contacts.find(c => c.id === soData.customerId);

    // Business Logic: Check stock availability for Goods
    for (const item of soData.items) {
      const prd = products.find(p => p.id === item.productId);
      if (prd && prd.type === 'Goods' && prd.stock < Number(item.qty)) {
        throw new Error(`Insufficient Stock: Cannot sell ${item.qty} units of "${prd.name}". Available stock is only ${prd.stock} units.`);
      }
    }

    const items = soData.items.map(item => {
      const prd = products.find(p => p.id === item.productId);
      const qty = Number(item.qty || 1);
      const unitPrice = Number(item.unitPrice || prd?.salesPrice || 0);
      const taxPercent = Number(item.taxPercent || 0);
      const taxAmount = (qty * unitPrice * taxPercent) / 100;
      const total = (qty * unitPrice) + taxAmount;
      return {
        productId: item.productId,
        productName: prd ? prd.name : 'Custom Furniture',
        qty,
        unitPrice,
        taxPercent,
        taxAmount,
        total
      };
    });

    const subtotal = items.reduce((s, i) => s + (i.qty * i.unitPrice), 0);
    const taxTotal = items.reduce((s, i) => s + i.taxAmount, 0);
    const totalAmount = subtotal + taxTotal;

    const newSO = {
      id: newId,
      customerId: soData.customerId,
      customerName: customer ? customer.name : 'Customer',
      date: soData.date || new Date().toISOString().split('T')[0],
      status: 'Confirmed',
      delivered: false,
      deliveredDate: null,
      items,
      subtotal,
      taxTotal,
      totalAmount,
      invoiceId: null,
      analyticAccountId: soData.analyticAccountId || 'ANA-03',
      notes: soData.notes || ''
    };

    setSalesOrders([newSO, ...salesOrders]);
    showToast(`Sales Order ${newId} confirmed for ${newSO.customerName} (${formatCurrency(totalAmount)}).`);
    return newSO;
  };

  // Step 2 in Sales: Deliver Goods (Decrements Stock on Hand)
  const deliverGoodsSO = (soId) => {
    const so = salesOrders.find(s => s.id === soId);
    if (!so) return;

    // Check stock once more
    for (const line of so.items) {
      const prd = products.find(p => p.id === line.productId);
      if (prd && prd.type === 'Goods' && prd.stock < line.qty) {
        throw new Error(`Cannot deliver: Stock for "${prd.name}" is now only ${prd.stock} (requires ${line.qty}).`);
      }
    }

    // Decrement stock
    setProducts(prevProducts => prevProducts.map(prd => {
      const line = so.items.find(i => i.productId === prd.id);
      if (line && prd.type === 'Goods') {
        return { ...prd, stock: Math.max(0, prd.stock - line.qty) };
      }
      return prd;
    }));

    setSalesOrders(prevSOs => prevSOs.map(s => {
      if (s.id === soId) {
        return {
          ...s,
          delivered: true,
          deliveredDate: new Date().toISOString().split('T')[0],
          status: s.status === 'Invoiced' ? 'Invoiced' : 'Delivered'
        };
      }
      return s;
    }));

    showToast(`Goods delivered for ${soId}! Stock updated in inventory.`);
  };

  // Step 3 in Sales: Convert SO -> Customer Invoice + Auto Double Entry
  const convertSOToCustomerInvoice = (soId, customDueDate = null) => {
    const so = salesOrders.find(s => s.id === soId);
    if (!so) return null;
    if (so.invoiceId) {
      showToast(`This SO is already converted to Invoice ${so.invoiceId}`, 'info');
      return null;
    }

    const customer = contacts.find(c => c.id === so.customerId);
    const invId = `INV-2026-00${invoices.length + 1}`;
    const invDate = new Date().toISOString().split('T')[0];
    const dueDate = customDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // If not delivered yet, deliver automatically
    if (!so.delivered) {
      deliverGoodsSO(soId);
    }

    // Auto-create balanced Journal Entry:
    // Debit: Accounts Receivable (Debtors)  |  Credit: Sale Income
    const jeId = postJournalEntry({
      journalType: 'Sales',
      reference: `${invId} (${so.customerName})`,
      analyticAccountId: so.analyticAccountId,
      lines: [
        { account: 'Accounts Receivable (Debtors)', debit: so.totalAmount, credit: 0 },
        { account: 'Sale Income', debit: 0, credit: so.totalAmount }
      ]
    });

    const newInvoice = {
      id: invId,
      soRef: so.id,
      customerId: so.customerId,
      customerName: so.customerName,
      customerEmail: customer?.email || 'customer@client.com',
      customerAddress: customer?.address ? `${customer.address.city}, ${customer.address.state} - ${customer.address.pincode}` : 'Mumbai, India',
      date: invDate,
      dueDate,
      items: so.items,
      subtotal: so.subtotal,
      taxRate: so.taxTotal > 0 ? 18 : 0,
      tax: so.taxTotal,
      totalAmount: so.totalAmount,
      paidAmount: 0,
      balance: so.totalAmount,
      status: 'Unpaid',
      journalEntryId: jeId,
      analyticAccountId: so.analyticAccountId
    };

    setInvoices([newInvoice, ...invoices]);

    // Link Invoice to SO
    setSalesOrders(prevSOs => prevSOs.map(s => 
      s.id === soId ? { ...s, status: 'Invoiced', invoiceId: invId } : s
    ));

    showToast(`Customer Invoice ${invId} generated! Auto Double-Entry (${jeId}) posted to Ledger.`);
    return newInvoice;
  };

  // 3. PAYMENT RECORDING & LEDGER SETTLEMENT
  const recordPayment = (paymentData) => {
    const { docId, docType, contactName, method, amount, notes } = paymentData;
    const payAmt = Number(amount);

    if (payAmt <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const payId = `PAY-2026-00${payments.length + 1}`;
    const payDate = new Date().toISOString().split('T')[0];
    const isCustomerDoc = docType === 'Customer Invoice' || docType.includes('Invoice');

    let debitAcc = '';
    let creditAcc = '';

    if (isCustomerDoc) {
      // Customer Receipt:
      // Debit: Bank Account (HDFC) or Cash on Hand
      // Credit: Accounts Receivable (Debtors)
      const targetInv = invoices.find(i => i.id === docId);
      if (!targetInv) throw new Error(`Invoice ${docId} not found.`);
      if (payAmt > targetInv.balance + 0.01) {
        throw new Error(`Payment (${formatCurrency(payAmt)}) exceeds outstanding balance (${formatCurrency(targetInv.balance)}).`);
      }

      debitAcc = method.includes('Bank') ? 'Bank Account (HDFC)' : 'Cash on Hand';
      creditAcc = 'Accounts Receivable (Debtors)';

      // Update Invoice
      setInvoices(prevInvoices => prevInvoices.map(inv => {
        if (inv.id === docId) {
          const newPaid = Number(inv.paidAmount || 0) + payAmt;
          const newBal = Math.max(0, Number(inv.totalAmount || 0) - newPaid);
          const newStatus = newBal <= 0.01 ? 'Paid' : 'Partially Paid';
          return { ...inv, paidAmount: newPaid, balance: newBal, status: newStatus };
        }
        return inv;
      }));
    } else {
      // Vendor Outflow:
      // Debit: Accounts Payable (Creditors)
      // Credit: Bank Account (HDFC) or Cash on Hand
      const targetBill = vendorBills.find(b => b.id === docId);
      if (!targetBill) throw new Error(`Vendor Bill ${docId} not found.`);
      if (payAmt > targetBill.balance + 0.01) {
        throw new Error(`Payment (${formatCurrency(payAmt)}) exceeds bill balance (${formatCurrency(targetBill.balance)}).`);
      }

      debitAcc = 'Accounts Payable (Creditors)';
      creditAcc = method.includes('Bank') ? 'Bank Account (HDFC)' : 'Cash on Hand';

      // Update Vendor Bill
      setVendorBills(prevBills => prevBills.map(bill => {
        if (bill.id === docId) {
          const newPaid = Number(bill.paidAmount || 0) + payAmt;
          const newBal = Math.max(0, Number(bill.totalAmount || 0) - newPaid);
          const newStatus = newBal <= 0.01 ? 'Paid' : 'Partially Paid';
          return { ...bill, paidAmount: newPaid, balance: newBal, status: newStatus };
        }
        return bill;
      }));
    }

    // Auto Double-Entry for Payment
    const jeId = postJournalEntry({
      journalType: method.includes('Bank') ? 'Bank' : 'Cash',
      reference: `${payId} against ${docId} (${contactName})`,
      lines: [
        { account: debitAcc, debit: payAmt, credit: 0 },
        { account: creditAcc, debit: 0, credit: payAmt }
      ]
    });

    const newPayment = {
      id: payId,
      date: payDate,
      type: isCustomerDoc ? 'Customer Payment' : 'Vendor Payment',
      docType: isCustomerDoc ? 'Customer Invoice' : 'Vendor Bill',
      docId,
      contactName,
      method,
      amount: payAmt,
      journalEntryId: jeId,
      notes: notes || 'Settlement processed via ERP'
    };

    setPayments([newPayment, ...payments]);
    showToast(`Payment of ${formatCurrency(payAmt)} registered for ${docId}! Ledger updated with ${jeId}.`);
    return newPayment;
  };

  // 4. MANUAL JOURNAL ENTRY BUILDER (WITH EQUALITY VALIDATION)
  const createManualJournalEntry = (entryData) => {
    const totalDebits = entryData.lines.reduce((s, l) => s + Number(l.debit || 0), 0);
    const totalCredits = entryData.lines.reduce((s, l) => s + Number(l.credit || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error(`Cannot post unbalanced entry! Total Debits (${formatCurrency(totalDebits)}) ≠ Total Credits (${formatCurrency(totalCredits)}). Difference: ${formatCurrency(Math.abs(totalDebits - totalCredits))}`);
    }

    if (totalDebits <= 0) {
      throw new Error('Journal Entry must have amounts greater than zero.');
    }

    const jeId = postJournalEntry({
      journalType: entryData.journalType || 'General',
      reference: entryData.reference || 'Manual Adjusting Journal Entry',
      analyticAccountId: entryData.analyticAccountId || null,
      lines: entryData.lines,
      date: entryData.date || new Date().toISOString().split('T')[0]
    });

    showToast(`Manual Journal Entry ${jeId} posted successfully!`);
    return jeId;
  };

  // -------------------------------------------------------------
  // REPORT AGGREGATORS
  // -------------------------------------------------------------

  // 1. General Ledger Statements for any account
  const getAccountLedger = (accountName) => {
    const ledgerItems = [];
    let runningBalance = 0;

    // Sort entries chronologically
    const sortedEntries = [...journalEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedEntries.forEach(je => {
      je.lines.forEach(line => {
        if (line.account.toLowerCase().includes(accountName.toLowerCase()) || accountName.toLowerCase().includes(line.account.toLowerCase())) {
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

  // 2. Contact Transaction History & Outstanding Balance
  const getContactHistory = (contactId) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return null;

    const contactPOs = purchaseOrders.filter(p => p.vendorId === contactId);
    const contactBills = vendorBills.filter(b => b.vendorId === contactId);
    const contactSOs = salesOrders.filter(s => s.customerId === contactId);
    const contactInvoices = invoices.filter(i => i.customerId === contactId);
    const contactPayments = payments.filter(p => p.contactName === contact.name);

    const totalInvoiced = contactInvoices.reduce((s, i) => s + Number(i.totalAmount || 0), 0);
    const totalReceivable = contactInvoices.reduce((s, i) => s + Number(i.balance || 0), 0);

    const totalBilled = contactBills.reduce((s, b) => s + Number(b.totalAmount || 0), 0);
    const totalPayable = contactBills.reduce((s, b) => s + Number(b.balance || 0), 0);

    return {
      contact,
      purchaseOrders: contactPOs,
      vendorBills: contactBills,
      salesOrders: contactSOs,
      invoices: contactInvoices,
      payments: contactPayments,
      totalInvoiced,
      totalReceivable,
      totalBilled,
      totalPayable
    };
  };

  // 3. Dynamic Balance Sheet Aggregation
  const balanceSheetData = useMemo(() => {
    // Assets
    const cashAcc = chartOfAccounts.find(a => a.name.includes('Cash'))?.balance || 25000;
    const bankAcc = chartOfAccounts.find(a => a.name.includes('Bank'))?.balance || 400000;
    const debtorsAcc = invoices.reduce((sum, inv) => sum + Number(inv.balance || 0), 0);
    
    // Inventory Asset value: calculate live from products (stock * costPrice)
    const inventoryValuation = products
      .filter(p => p.type === 'Goods')
      .reduce((sum, p) => sum + (p.stock * p.costPrice), 0);

    const totalAssets = cashAcc + bankAcc + debtorsAcc + inventoryValuation;

    // Liabilities
    const creditorsAcc = vendorBills.reduce((sum, bill) => sum + Number(bill.balance || 0), 0);
    const gstPayableAcc = chartOfAccounts.find(a => a.name.includes('GST'))?.balance || 0;
    const totalLiabilities = creditorsAcc + gstPayableAcc;

    // Revenue & Expenses
    const saleIncome = invoices.reduce((sum, inv) => sum + Number(inv.subtotal || inv.totalAmount || 0), 0);
    const purchaseExpense = vendorBills.reduce((sum, bill) => sum + Number(bill.totalAmount || 0), 0);
    const otherExpenses = 25000; // marketing + utilities baseline
    const netProfit = saleIncome - purchaseExpense - otherExpenses;

    // Capital & Equity
    const ownersEquity = 500000;
    const retainedEarnings = netProfit;
    const totalCapital = ownersEquity + retainedEarnings;

    const totalLiabilitiesAndCapital = totalLiabilities + totalCapital;
    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndCapital) < 1;

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
      isBalanced
    };
  }, [chartOfAccounts, invoices, vendorBills, products]);

  // 4. Dynamic Profit & Loss Aggregation
  const pnlData = useMemo(() => {
    const saleIncome = invoices.reduce((sum, inv) => sum + Number(inv.subtotal || inv.totalAmount || 0), 0);
    const serviceRevenue = invoices.reduce((sum, inv) => {
      const srvItem = inv.items?.find(i => i.productName.includes('Service') || i.productName.includes('Assembly'));
      return sum + (srvItem ? Number(srvItem.total || 0) : 0);
    }, 0);
    const totalRevenue = saleIncome;

    const purchaseExpense = vendorBills.reduce((sum, bill) => sum + Number(bill.totalAmount || 0), 0);
    const grossProfit = totalRevenue - purchaseExpense;

    const marketingExpense = 15000;
    const showroomExpense = 10000;
    const totalOperatingExpenses = marketingExpense + showroomExpense;

    const netProfit = grossProfit - totalOperatingExpenses;
    const profitMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    return {
      saleIncome,
      serviceRevenue,
      totalRevenue,
      purchaseExpense,
      grossProfit,
      marketingExpense,
      showroomExpense,
      totalOperatingExpenses,
      netProfit,
      profitMarginPercent
    };
  }, [invoices, vendorBills]);

  // 5. Dynamic Stock Report Aggregation
  const stockReportData = useMemo(() => {
    return products.map(product => {
      // Calculate total purchased
      const purchasedQty = purchaseOrders.reduce((sum, po) => {
        const line = po.items?.find(i => i.productId === product.id);
        return sum + (line ? Number(line.qty) : 0);
      }, 0);

      // Calculate total sold
      const soldQty = salesOrders.reduce((sum, so) => {
        const line = so.items?.find(i => i.productId === product.id);
        return sum + (line ? Number(line.qty) : 0);
      }, 0);

      const availableStock = product.stock;
      const totalValuation = availableStock * product.costPrice;
      const isLowStock = product.type === 'Goods' && availableStock <= product.reorderLevel;

      return {
        ...product,
        purchasedQty,
        soldQty,
        availableStock,
        totalValuation,
        isLowStock
      };
    });
  }, [products, purchaseOrders, salesOrders]);

  // 6. Dynamic Budget Variance Report
  const budgetReportData = useMemo(() => {
    return budgets.map(b => {
      // Calculate actual expense from journal entries or bills associated with this analytic account
      const analyticBills = vendorBills.filter(bill => bill.analyticAccountId === b.analyticAccountId);
      const billsSpent = analyticBills.reduce((sum, bill) => sum + Number(bill.totalAmount || 0), 0);

      const actualSpent = Math.max(b.actualAmount, billsSpent);
      const variance = b.plannedAmount - actualSpent;
      const usagePercent = Math.min(100, Math.round((actualSpent / b.plannedAmount) * 100));

      return {
        ...b,
        actualSpent,
        variance,
        usagePercent,
        isOverBudget: actualSpent > b.plannedAmount
      };
    });
  }, [budgets, vendorBills, journalEntries]);

  // Value Bundle
  const contextValue = {
    // Navigation & Roles
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
