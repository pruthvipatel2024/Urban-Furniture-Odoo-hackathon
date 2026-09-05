import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import MasterData from './components/MasterData';
import PurchaseFlow from './components/PurchaseFlow';
import SalesFlow from './components/SalesFlow';
import PaymentModal from './components/PaymentModal';
import JournalEntriesView from './components/JournalEntriesView';
import FinancialReports from './components/FinancialReports';

import {
  initialContacts,
  initialProducts,
  initialChartOfAccounts,
  initialPurchaseOrders,
  initialVendorBills,
  initialSalesOrders,
  initialInvoices,
  initialJournalEntries,
  initialPayments
} from './data/initialData';

import { CheckCircle2, CreditCard, ListOrdered, Receipt, ShoppingCart } from 'lucide-react';

export default function App() {
  // Global State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [masterSubTab, setMasterSubTab] = useState('contacts');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState('Admin'); // 'Admin' | 'Accountant' | 'Contact'
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [contacts, setContacts] = useState(initialContacts);
  const [products, setProducts] = useState(initialProducts);
  const [chartOfAccounts, setChartOfAccounts] = useState(initialChartOfAccounts);
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [vendorBills, setVendorBills] = useState(initialVendorBills);
  const [salesOrders, setSalesOrders] = useState(initialSalesOrders);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [journalEntries, setJournalEntries] = useState(initialJournalEntries);
  const [payments, setPayments] = useState(initialPayments);

  // Modal Controls
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTargetDoc, setPaymentTargetDoc] = useState(null);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showCreatePOModal, setShowCreatePOModal] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Double Entry Journal Engine helper
  const addJournalEntry = (entry, debitAccName, creditAccName, amount) => {
    setJournalEntries(prev => [entry, ...prev]);

    // Update Chart of Accounts balances live
    setChartOfAccounts(prevCoA => prevCoA.map(acc => {
      if (acc.name.includes(debitAccName) || debitAccName.includes(acc.name)) {
        return { ...acc, balance: acc.balance + amount };
      }
      if (acc.name.includes(creditAccName) || creditAccName.includes(acc.name)) {
        return { ...acc, balance: acc.balance + amount };
      }
      return acc;
    }));
  };

  // Payment Recording Engine
  const handleRecordPayment = (payDetails) => {
    const { docId, docType, contactName, paymentMethod, amount, notes } = payDetails;
    const payId = `PAY-2024-00${payments.length + 1}`;
    const jeId = `JE-PAY-00${payments.length + 1}`;

    const newPaymentObj = {
      id: payId,
      date: new Date().toISOString().split('T')[0],
      type: docType === 'Customer Invoice' ? 'Customer Payment' : 'Vendor Payment',
      docType,
      docId,
      contactName,
      method: paymentMethod,
      amount,
      notes
    };

    setPayments(prev => [newPaymentObj, ...prev]);

    let debitAcc = '';
    let creditAcc = '';

    if (docType === 'Customer Invoice') {
      // Customer payment received:
      // Debit: Cash or Bank Account
      // Credit: Accounts Receivable (Debtors)
      debitAcc = paymentMethod.includes('Bank') ? 'Bank Account (HDFC)' : 'Cash on Hand';
      creditAcc = 'Accounts Receivable (Debtors)';

      setInvoices(prevInvoices => prevInvoices.map(inv => {
        if (inv.id === docId) {
          const newPaid = Number(inv.paidAmount || 0) + amount;
          const newBal = Math.max(0, Number(inv.totalAmount || 0) - newPaid);
          const newStatus = newBal <= 0.01 ? 'Paid' : 'Partially Paid';
          return { ...inv, paidAmount: newPaid, balance: newBal, status: newStatus };
        }
        return inv;
      }));
    } else {
      // Vendor bill payment made:
      // Debit: Accounts Payable (Creditors)
      // Credit: Cash or Bank Account
      debitAcc = 'Accounts Payable (Creditors)';
      creditAcc = paymentMethod.includes('Bank') ? 'Bank Account (HDFC)' : 'Cash on Hand';

      setVendorBills(prevBills => prevBills.map(bill => {
        if (bill.id === docId) {
          const newPaid = Number(bill.paidAmount || 0) + amount;
          const newBal = Math.max(0, Number(bill.totalAmount || 0) - newPaid);
          const newStatus = newBal <= 0.01 ? 'Paid' : 'Partially Paid';
          return { ...bill, paidAmount: newPaid, balance: newBal, status: newStatus };
        }
        return bill;
      }));
    }

    // Auto-generate Double Entry for Payment
    const paymentJournalEntry = {
      id: jeId,
      date: newPaymentObj.date,
      reference: `${payId} against ${docId}`,
      journalType: paymentMethod.includes('Bank') ? 'Bank' : 'Cash',
      lines: [
        { account: debitAcc, debit: amount, credit: 0 },
        { account: creditAcc, debit: 0, credit: amount }
      ]
    };

    addJournalEntry(paymentJournalEntry, debitAcc, creditAcc, amount);
    showToast(`Payment of ₹${amount.toLocaleString('en-IN')} registered for ${docId}! Ledger updated.`);
  };

  const handleOpenPaymentForDoc = (doc, type) => {
    setPaymentTargetDoc({ ...doc, type });
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      {/* Main Wrapper */}
      <div className="lg:pl-64 flex-1 flex flex-col">
        <Navbar 
          setSidebarOpen={setSidebarOpen}
          userRole={userRole}
          setUserRole={setUserRole}
          onOpenNewInvoice={() => { setActiveTab('sales'); setShowCreateInvoiceModal(true); }}
          onOpenNewBill={() => { setActiveTab('purchases'); setShowCreatePOModal(true); }}
          onOpenPaymentModal={() => { setPaymentTargetDoc(null); setShowPaymentModal(true); }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* View Content Area */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Active Role Indicator */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-slate-900 capitalize tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab.startsWith('master') && 'Master Data Management'}
              {activeTab === 'purchases' && 'Purchases & Vendor Bills'}
              {activeTab === 'sales' && 'Sales Orders & Customer Invoices'}
              {activeTab === 'payments' && 'Payment Transactions Log'}
              {activeTab === 'journals' && 'General Ledger & Journal Entries'}
              {activeTab === 'reports' && 'Financial Reports & Statements'}
            </h1>
            <span className="text-xs bg-slate-200/70 text-slate-700 font-semibold px-3 py-1 rounded-full border border-slate-300/50">
              Active User: <strong className="text-slate-900">{userRole}</strong>
            </span>
          </div>

          {/* Module Switching */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              invoices={invoices}
              vendorBills={vendorBills}
              payments={payments}
              onOpenNewInvoice={() => { setActiveTab('sales'); setShowCreateInvoiceModal(true); }}
              onOpenNewBill={() => { setActiveTab('purchases'); setShowCreatePOModal(true); }}
              onOpenPaymentModal={() => { setPaymentTargetDoc(null); setShowPaymentModal(true); }}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab.startsWith('master') && (
            <MasterData 
              contacts={contacts}
              setContacts={setContacts}
              products={products}
              setProducts={setProducts}
              chartOfAccounts={chartOfAccounts}
              setChartOfAccounts={setChartOfAccounts}
              activeSubTab={masterSubTab}
              setActiveSubTab={setMasterSubTab}
            />
          )}

          {activeTab === 'purchases' && (
            <PurchaseFlow 
              purchaseOrders={purchaseOrders}
              setPurchaseOrders={setPurchaseOrders}
              vendorBills={vendorBills}
              setVendorBills={setVendorBills}
              contacts={contacts}
              products={products}
              addJournalEntry={addJournalEntry}
              onOpenPaymentModal={handleOpenPaymentForDoc}
              showCreateModal={showCreatePOModal}
              setShowCreateModal={setShowCreatePOModal}
            />
          )}

          {activeTab === 'sales' && (
            <SalesFlow 
              salesOrders={salesOrders}
              setSalesOrders={setSalesOrders}
              invoices={invoices}
              setInvoices={setInvoices}
              contacts={contacts}
              products={products}
              addJournalEntry={addJournalEntry}
              onOpenPaymentModal={handleOpenPaymentForDoc}
              showCreateModal={showCreateInvoiceModal}
              setShowCreateModal={setShowCreateInvoiceModal}
            />
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-sm">Payment History Log</span>
                </div>
                <button
                  onClick={() => { setPaymentTargetDoc(null); setShowPaymentModal(true); }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-xl text-xs shadow-sm"
                >
                  + Register Payment
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                      <th className="py-3.5 px-4">Payment ID</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Reference Doc</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Account Method</th>
                      <th className="py-3.5 px-4 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                        <td className="py-3.5 px-4 text-slate-500">{p.date}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.type === 'Customer Payment' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {p.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">{p.docId}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{p.contactName}</td>
                        <td className="py-3.5 px-4 text-slate-600">{p.method}</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                          ₹{Number(p.amount).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'journals' && (
            <JournalEntriesView journalEntries={journalEntries} />
          )}

          {activeTab === 'reports' && (
            <FinancialReports 
              chartOfAccounts={chartOfAccounts}
              invoices={invoices}
              vendorBills={vendorBills}
              payments={payments}
              journalEntries={journalEntries}
            />
          )}
        </main>
      </div>

      {/* Global Payment Drawer / Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        targetDoc={paymentTargetDoc}
        invoices={invoices}
        vendorBills={vendorBills}
        onRecordPayment={handleRecordPayment}
      />
    </div>
  );
}
