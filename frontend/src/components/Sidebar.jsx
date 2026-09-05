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
  UserCheck
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
    
    // Master Data
    { id: 'master-contacts', label: 'Contacts Master', icon: Users, category: 'Master Data', roles: ['Admin', 'Accountant'] },
    { id: 'master-products', label: 'Products & Stock', icon: Package, category: 'Master Data', roles: ['Admin', 'Accountant'] },
    { id: 'master-coa', label: 'Chart of Accounts', icon: BookOpen, category: 'Master Data', roles: ['Admin', 'Accountant'] },
    { id: 'master-journals', label: 'Journals Master', icon: Layers, category: 'Master Data', roles: ['Admin'] },
    
    // Transactions
    { id: 'purchases', label: 'Purchases & Bills', icon: ShoppingCart, category: 'Transactions', roles: ['Admin', 'Accountant'] },
    { id: 'sales', label: 'Sales & Invoices', icon: TrendingUp, category: 'Transactions', roles: ['Admin', 'Accountant'] },
    { id: 'payments', label: 'Payments Register', icon: CreditCard, category: 'Transactions', roles: ['Admin', 'Accountant'] },
    
    // Accounting
    { id: 'journals', label: 'General Ledger', icon: ListOrdered, category: 'Accounting', roles: ['Admin', 'Accountant'] },
    { id: 'budgets', label: 'Department Budgets', icon: PieChart, category: 'Accounting', roles: ['Admin', 'Accountant'] },
    { id: 'reports', label: 'Financial Reports', icon: FileText, category: 'Accounting', roles: ['Admin', 'Accountant'] },

    // External Portal
    { id: 'portal', label: 'My Invoices & Ledger', icon: UserCheck, category: 'Client Portal', roles: ['Contact'] }
  ];

  const categories = userRole === 'Contact'
    ? ['Client Portal']
    : ['Main', 'Master Data', 'Transactions', 'Accounting'];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white text-slate-700 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-slate-200 shadow-xs ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-slate-200 shrink-0">
              <img
                src="/logo.png"
                alt="Urban Furniture Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-slate-900 tracking-tight text-sm leading-tight">
                Urban Furniture
              </h1>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider font-mono">
                ERP Accounting
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {categories.map((category) => {
            const items = navItems.filter(item => item.category === category && item.roles.includes(userRole));
            if (items.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {category}
                </p>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id || (item.id.startsWith('master') && activeTab.startsWith('master') && activeTab === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#C6E7FF] text-slate-900 shadow-xs font-bold border border-[#9BD5FF]/40'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-[#D4F6FF]/40'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 bg-[#FBFBFB] text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center border border-slate-200 shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">Urban Furniture Ltd.</p>
              <p className="text-[10px] text-slate-500 font-mono">FY 2026-2027 • Double-Entry</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
