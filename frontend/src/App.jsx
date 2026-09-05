import React, { useState } from 'react';
import { AccountingProvider, useAccounting } from './context/AccountingContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import MasterData from './components/MasterData';
import PurchaseFlow from './components/PurchaseFlow';
import SalesFlow from './components/SalesFlow';
import PaymentRegister from './components/PaymentRegister';
import JournalEntriesView from './components/JournalEntriesView';
import BudgetsView from './components/BudgetsView';
import FinancialReports from './components/FinancialReports';
import ContactPortal from './components/ContactPortal';
import PaymentModal from './components/PaymentModal';
import DemoTourModal from './components/DemoTourModal';

import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    userRole,
    toast,
    showPaymentModal,
    setShowPaymentModal,
    paymentTargetDoc,
    setPaymentTargetDoc,
    showDemoTourModal,
    setShowDemoTourModal
  } = useAccounting();

  // Create Modal triggers for child components
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showCreatePOModal, setShowCreatePOModal] = useState(false);

  // Helper for MasterData sub-tab extraction
  const getMasterSubTab = () => {
    if (activeTab === 'master-products') return 'products';
    if (activeTab === 'master-coa') return 'coa';
    if (activeTab === 'master-journals') return 'journals';
    if (activeTab === 'master-analytics') return 'analytics';
    return 'contacts';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 glass-dropdown text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs border border-slate-700 animate-in fade-in slide-in-from-top-3 max-w-md">
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Wrapper */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenNewInvoice={() => {
            setActiveTab('sales');
            setShowCreateInvoiceModal(true);
          }}
          onOpenNewBill={() => {
            setActiveTab('purchases');
            setShowCreatePOModal(true);
          }}
          onOpenPaymentModal={() => {
            setPaymentTargetDoc(null);
            setShowPaymentModal(true);
          }}
        />

        {/* View Content Area */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Active View Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 capitalize tracking-tight flex items-center space-x-2">
              <span>
                {activeTab === 'dashboard' && 'Executive Accounting Dashboard'}
                {activeTab.startsWith('master') && 'Master Data Management'}
                {activeTab === 'purchases' && 'Purchases & Vendor Bills'}
                {activeTab === 'sales' && 'Sales Orders & Customer Invoices'}
                {activeTab === 'payments' && 'Payment Transactions Register'}
                {activeTab === 'journals' && 'Double-Entry General Ledger'}
                {activeTab === 'budgets' && 'Department Budgets & Variance'}
                {activeTab === 'reports' && 'Real-Time Financial Reports'}
                {activeTab === 'portal' && 'Customer & Vendor Self-Service Portal'}
              </span>
            </h1>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] bg-slate-800/80 text-slate-300 font-semibold px-3 py-1 rounded-full border border-slate-700">
                Operating Role: <strong className="text-indigo-400">{userRole}</strong>
              </span>
            </div>
          </div>

          {/* Module Views */}
          {activeTab === 'dashboard' && (
            <Dashboard
              onOpenNewInvoice={() => {
                setActiveTab('sales');
                setShowCreateInvoiceModal(true);
              }}
              onOpenNewBill={() => {
                setActiveTab('purchases');
                setShowCreatePOModal(true);
              }}
              onOpenPaymentModal={() => {
                setPaymentTargetDoc(null);
                setShowPaymentModal(true);
              }}
            />
          )}

          {activeTab.startsWith('master') && (
            <MasterData
              activeSubTab={getMasterSubTab()}
              setActiveSubTab={(sub) => setActiveTab(`master-${sub}`)}
            />
          )}

          {activeTab === 'purchases' && (
            <PurchaseFlow
              showCreateModal={showCreatePOModal}
              setShowCreateModal={setShowCreatePOModal}
            />
          )}

          {activeTab === 'sales' && (
            <SalesFlow
              showCreateModal={showCreateInvoiceModal}
              setShowCreateModal={setShowCreateInvoiceModal}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentRegister />
          )}

          {activeTab === 'journals' && (
            <JournalEntriesView />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView />
          )}

          {activeTab === 'reports' && (
            <FinancialReports />
          )}

          {activeTab === 'portal' && (
            <ContactPortal />
          )}
        </main>
      </div>

      {/* Global Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        targetDoc={paymentTargetDoc}
      />

      {/* 14-Step Demo Tour Modal */}
      <DemoTourModal
        isOpen={showDemoTourModal}
        onClose={() => setShowDemoTourModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AccountingProvider>
      <AppContent />
    </AccountingProvider>
  );
}
