import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  LayoutDashboard,
  Users,
  Package,
  BookOpen,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  FileText,
  ListOrdered,
  Layers,
  PieChart,
  UserCheck,
  FolderTree,
  Scale,
  X
} from 'lucide-react';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    userRole
  } = useAccounting();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Main', roles: ['Admin', 'Accountant'] },
    
    // Sales
    { id: 'sales-orders', label: 'Sales Orders', icon: TrendingUp, category: 'Sales', roles: ['Admin', 'Accountant'] },
    { id: 'sales-invoices', label: 'Sale Invoices', icon: FileText, category: 'Sales', roles: ['Admin', 'Accountant'] },
    { id: 'sales-receipts', label: 'Customer Receipts', icon: CreditCard, category: 'Sales', roles: ['Admin', 'Accountant'] },

    // Purchases
    { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart, category: 'Purchases', roles: ['Admin', 'Accountant'] },
    { id: 'purchase-bills', label: 'Purchase Bills', icon: FileText, category: 'Purchases', roles: ['Admin', 'Accountant'] },
    { id: 'purchase-payments', label: 'Vendor Payments', icon: CreditCard, category: 'Purchases', roles: ['Admin', 'Accountant'] },

    // Master Data
    { id: 'master-contacts', label: 'Contacts', icon: Users, category: 'Master Data', roles: ['Admin', 'Accountant'] },
    { id: 'master-products', label: 'Products', icon: Package, category: 'Master Data', roles: ['Admin', 'Accountant'] },
    { id: 'master-analytics', label: 'Analytic Accounts', icon: FolderTree, category: 'Master Data', roles: ['Admin', 'Accountant'] },
    { id: 'master-coa', label: 'Chart of Accounts', icon: BookOpen, category: 'Master Data', roles: ['Admin', 'Accountant'] },
    { id: 'master-journals', label: 'Journals Master', icon: Layers, category: 'Master Data', roles: ['Admin'] },
    
    // Accounting & Budgets
    { id: 'budgets', label: 'Budgets', icon: PieChart, category: 'Accounting', roles: ['Admin', 'Accountant'] },
    { id: 'journal-entries', label: 'Journal Entries', icon: ListOrdered, category: 'Accounting', roles: ['Admin', 'Accountant'] },
    
    // Reports
    { id: 'reports-balancesheet', label: 'Balance Sheet', icon: Scale, category: 'Reports', roles: ['Admin', 'Accountant'] },
    { id: 'reports-pnl', label: 'Profit and Loss', icon: TrendingUp, category: 'Reports', roles: ['Admin', 'Accountant'] },
    { id: 'reports-budget', label: 'Budget Report', icon: PieChart, category: 'Reports', roles: ['Admin', 'Accountant'] },

    // External Portal
    { id: 'portal', label: 'My Invoices & Dues', icon: UserCheck, category: 'Client Portal', roles: ['Contact'] }
  ];

  const categories = userRole === 'Contact'
    ? ['Client Portal']
    : ['Main', 'Sales', 'Purchases', 'Master Data', 'Accounting', 'Reports'];

  if (!sidebarOpen) return null;

  return (
    <div className="lg:hidden">
      {/* Mobile Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-[#0B2A4A]/40 z-40 backdrop-blur-xs transition-opacity"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Slide-out Mobile Menu */}
      <aside
        className="fixed top-0 bottom-0 left-0 z-50 w-72 bg-white text-[#17212B] flex flex-col shadow-2xl border-r border-[#E3E7EA] transition-transform duration-200 ease-in-out"
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#E3E7EA] bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-[#E3E7EA] shrink-0">
              <img
                src="/logo.png"
                alt="Urban Furniture Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <h1 className="font-sans font-bold text-[#0B2A4A] tracking-tight text-sm leading-tight">
                Urban Furniture
              </h1>
              <span className="text-[10px] text-[#667482] font-semibold uppercase tracking-wider font-mono">
                ERP Accounting
              </span>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 text-[#667482] hover:text-[#0B2A4A] rounded-lg hover:bg-[#EEF4F8] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {categories.map((category) => {
            const items = navItems.filter(item => item.category === category && item.roles.includes(userRole));
            if (items.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-[#8A96A3] uppercase tracking-wider font-mono">
                  {category}
                </p>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#EEF4F8] text-[#0B2A4A] font-bold border border-[#0B2A4A]/20 shadow-xs'
                          : 'text-[#667482] hover:text-[#0B2A4A] hover:bg-[#EEF4F8]/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B2A4A]' : 'text-[#667482]'}`} />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C98232]" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
