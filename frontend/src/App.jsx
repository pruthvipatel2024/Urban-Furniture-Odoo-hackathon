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
import LoginPage from './components/LoginPage';

import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

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
    isAuthenticated,
    authLoading
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

  // Helper for SalesFlow sub-tab extraction
  const getSalesSubTab = () => {
    if (activeTab === 'sales-orders') return 'orders';
    if (activeTab === 'sales-receipts') return 'receipts';
    return 'invoices';
  };

  // Helper for PurchaseFlow sub-tab extraction
  const getPurchaseSubTab = () => {
    if (activeTab === 'purchase-orders') return 'orders';
    if (activeTab === 'purchase-payments') return 'payments';
    return 'bills';
  };

  // Helper for FinancialReports sub-tab extraction
  const getReportSubTab = () => {
    if (activeTab === 'reports-pnl') return 'pnl';
    if (activeTab === 'reports-budget') return 'budget';
    if (activeTab === 'reports-stock') return 'stock';
    if (activeTab === 'reports-trial-balance') return 'trial-balance';
    return 'balance-sheet';
  };

  // 1. Initial Loading Splash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center space-y-4 font-sans text-[#17212B]">
        <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-sm border border-[#E3E7EA] flex items-center justify-center">
          <img src="/logo.png" alt="Urban Furniture Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex items-center space-x-2.5 text-xs text-[#667482] font-medium">
          <Loader2 className="w-4 h-4 text-[#0B2A4A] animate-spin" />
          <span>Starting Urban Furniture ERP Workspace...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated -> Show Clean Login Page
  if (!isAuthenticated) {
    return (
      <>
        {toast && (
          <div className="fixed top-5 right-5 z-50 bg-white text-[#17212B] px-4 py-3 rounded-2xl shadow-lg flex items-center space-x-3 text-xs border border-[#E3E7EA] animate-in fade-in slide-in-from-top-3 max-w-md">
            {toast.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-[#B42318] shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#18794E] shrink-0" />
            )}
            <span className="font-semibold">{toast.message}</span>
          </div>
        )}
        <LoginPage />
      </>
    );
  }

  // 3. Authenticated -> Clean Unified Top Navigation ERP Layout
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#17212B] flex flex-col font-sans selection:bg-[#F8F0E6] selection:text-[#0B2A4A]">
      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-white text-[#17212B] px-4 py-3 rounded-2xl shadow-lg flex items-center space-x-3 text-xs border border-[#E3E7EA] animate-in fade-in slide-in-from-top-3 max-w-md">
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-[#B42318] shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#18794E] shrink-0" />
          )}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Mobile Drawer (Only visible on mobile when toggled) */}
      <Sidebar />

      {/* Main Full-Width Header */}
      <Navbar
        onOpenNewInvoice={() => {
          setActiveTab('sales-orders');
          setShowCreateInvoiceModal(true);
        }}
        onOpenNewBill={() => {
          setActiveTab('purchase-orders');
          setShowCreatePOModal(true);
        }}
        onOpenPaymentModal={() => {
          setPaymentTargetDoc(null);
          setShowPaymentModal(true);
        }}
      />

      {/* View Content Area (Full-Width, Centered, Spacious, max-w-[1500px]) */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 space-y-8 lg:space-y-10">
        {/* Module Views */}
        {activeTab === 'dashboard' && (
          <Dashboard
            onOpenNewInvoice={() => {
              setActiveTab('sales-orders');
              setShowCreateInvoiceModal(true);
            }}
            onOpenNewBill={() => {
              setActiveTab('purchase-orders');
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

        {activeTab.startsWith('purchase') && (
          <PurchaseFlow
            initialSubTab={getPurchaseSubTab()}
            showCreateModal={showCreatePOModal}
            setShowCreateModal={setShowCreatePOModal}
          />
        )}

        {activeTab.startsWith('sales') && (
          <SalesFlow
            initialSubTab={getSalesSubTab()}
            showCreateModal={showCreateInvoiceModal}
            setShowCreateModal={setShowCreateInvoiceModal}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentRegister />
        )}

        {(activeTab === 'journal-entries' || activeTab === 'journals') && (
          <JournalEntriesView />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView />
        )}

        {activeTab.startsWith('reports') && (
          <FinancialReports initialReport={getReportSubTab()} />
        )}

        {activeTab === 'portal' && (
          <ContactPortal />
        )}
      </main>

      {/* Global Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        targetDoc={paymentTargetDoc}
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
