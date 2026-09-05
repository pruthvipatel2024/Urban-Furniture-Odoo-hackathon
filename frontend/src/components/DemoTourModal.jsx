import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Play,
  Layers,
  TrendingUp,
  ShoppingCart,
  Receipt,
  CreditCard,
  BookOpen,
  Scale,
  PackageCheck
} from 'lucide-react';

export default function DemoTourModal({ isOpen, onClose }) {
  const { setActiveTab } = useAccounting();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const demoSteps = [
    {
      title: 'Step 1 — Contact Master (Vendor Setup)',
      subtitle: 'Master Data Setup',
      icon: Layers,
      color: 'text-amber-400',
      description: 'Urban Furniture defines its vendors (e.g. Rahul Sharma, Azure Furniture) with full contact profiles, GST locations, and payment terms.',
      actionText: 'Go to Contacts Master',
      targetTab: 'master-contacts',
      expectedOutcome: 'Vendor profile created with status Active and ₹0 initial payable balance.'
    },
    {
      title: 'Step 2 — Product Master & Catalog',
      subtitle: 'Catalog & Costing',
      icon: Layers,
      color: 'text-indigo-400',
      description: 'Define furniture products (e.g. Executive Ergonomic Chair, Teak Table) with Goods/Service classification, purchase cost (₹3,000), and sales price (₹5,000).',
      actionText: 'Go to Products Catalog',
      targetTab: 'master-products',
      expectedOutcome: 'Item registered with real-time stock quantity and gross margin calculation.'
    },
    {
      title: 'Step 3 — Customer Setup',
      subtitle: 'Client Registration',
      icon: Layers,
      color: 'text-emerald-400',
      description: 'Register corporate clients (e.g. Nimesh Pathak / TechSpace IO) who purchase office seating and workstation furniture.',
      actionText: 'Go to Contacts Master',
      targetTab: 'master-contacts',
      expectedOutcome: 'Customer profile ready for quotation and sales order processing.'
    },
    {
      title: 'Step 4 — Purchase Order (PO)',
      subtitle: 'Procurement Workflow',
      icon: ShoppingCart,
      color: 'text-amber-400',
      description: 'Create a Purchase Order for 10x Executive Chairs from Vendor Rahul Sharma at ₹3,000 unit cost (Total: ₹30,000).',
      actionText: 'Open Purchase Orders',
      targetTab: 'purchases',
      expectedOutcome: 'PO-2026-001 created in Confirmed status.'
    },
    {
      title: 'Step 5 — Goods Received (Stock Increase)',
      subtitle: 'Inventory Inflow',
      icon: PackageCheck,
      color: 'text-emerald-400',
      description: 'Warehouse receives the 10 chairs. System automatically increases inventory stock count by +10 units.',
      actionText: 'View Purchase Flow',
      targetTab: 'purchases',
      expectedOutcome: 'Product stock increases from baseline, updating the Inventory Valuation asset.'
    },
    {
      title: 'Step 6 — Convert PO → Vendor Bill',
      subtitle: 'Billing & Accounting Trigger',
      icon: Receipt,
      color: 'text-amber-400',
      description: 'Convert the received PO into Vendor Bill BILL-2026-001. System automatically posts Double-Entry: Dr. Purchase Expense (COGS) ₹30,000 / Cr. Accounts Payable (Creditors) ₹30,000.',
      actionText: 'Inspect Vendor Bills',
      targetTab: 'purchases',
      expectedOutcome: 'Vendor payable ledger balance increases to ₹30,000 without manual journal math.'
    },
    {
      title: 'Step 7 — Vendor Payment Outflow',
      subtitle: 'Bank Settlement',
      icon: CreditCard,
      color: 'text-indigo-400',
      description: 'Urban Furniture pays Rahul Sharma ₹30,000 via HDFC Bank. Double-Entry: Dr. Accounts Payable ₹30,000 / Cr. Bank Account ₹30,000.',
      actionText: 'View Payments Register',
      targetTab: 'payments',
      expectedOutcome: 'Vendor balance becomes ₹0 and bank liquidity updates in real time.'
    },
    {
      title: 'Step 8 — Sales Order (SO)',
      subtitle: 'Customer Demand',
      icon: TrendingUp,
      color: 'text-emerald-400',
      description: 'Customer Nimesh Pathak orders 5x Executive Chairs at ₹5,000 each (Total: ₹25,000). Backend validates stock availability before confirmation.',
      actionText: 'Open Sales Orders',
      targetTab: 'sales',
      expectedOutcome: 'SO-2026-001 confirmed with stock availability check.'
    },
    {
      title: 'Step 9 — Deliver Goods (Stock Decrease)',
      subtitle: 'Fulfillment Outflow',
      icon: PackageCheck,
      color: 'text-amber-400',
      description: 'Fulfill order and dispatch 5 chairs. Inventory automatically decrements: 10 purchased − 5 sold = 5 remaining in warehouse.',
      actionText: 'View Sales Flow',
      targetTab: 'sales',
      expectedOutcome: 'Real-time stock decrement prevented negative inventory.'
    },
    {
      title: 'Step 10 — Generate Customer Invoice',
      subtitle: 'Revenue Recognition',
      icon: Receipt,
      color: 'text-emerald-400',
      description: 'Issue Customer Invoice INV-2026-001. Auto Double-Entry: Dr. Accounts Receivable (Debtors) ₹25,000 / Cr. Sale Income ₹25,000.',
      actionText: 'Inspect Invoices',
      targetTab: 'sales',
      expectedOutcome: 'Tax invoice printable PDF generated with customer ledger receivable balance.'
    },
    {
      title: 'Step 11 — Receive Customer Payment',
      subtitle: 'Cash Inflow Settlement',
      icon: CreditCard,
      color: 'text-emerald-400',
      description: 'Customer pays ₹25,000 online. Double-Entry: Dr. Bank Account (HDFC) ₹25,000 / Cr. Accounts Receivable (Debtors) ₹25,000.',
      actionText: 'View Payments Register',
      targetTab: 'payments',
      expectedOutcome: 'Customer outstanding balance becomes ₹0 and bank balance increments.'
    },
    {
      title: 'Step 12 — General Accounting Ledger',
      subtitle: 'Double-Entry Audit Trail',
      icon: BookOpen,
      color: 'text-indigo-400',
      description: 'Inspect the complete General Ledger and Trial Balance. Notice that every single transaction strictly satisfies Total Debits = Total Credits.',
      actionText: 'Open General Ledger',
      targetTab: 'journals',
      expectedOutcome: '0.00 discrepancy across all journal entries and account ledgers.'
    },
    {
      title: 'Step 13 — Real-Time Profit & Loss (P&L)',
      subtitle: 'Financial Performance',
      icon: TrendingUp,
      color: 'text-emerald-400',
      description: 'Review P&L Statement: Sales Income − Cost of Goods Sold − Operating Expenses = Net Profit.',
      actionText: 'Open P&L Report',
      targetTab: 'reports',
      expectedOutcome: 'Net profit matches mathematical calculations exactly.'
    },
    {
      title: 'Step 14 — Real-Time Balance Sheet',
      subtitle: 'Financial Health Snapshot',
      icon: Scale,
      color: 'text-indigo-400',
      description: 'Verify the golden accounting equation: Total Assets (Cash + Bank + Debtors + Inventory) = Total Liabilities + Capital (Owner Equity + Net Profit).',
      actionText: 'Open Balance Sheet',
      targetTab: 'reports',
      expectedOutcome: 'Balance sheet balances with 100% mathematical equality.'
    }
  ];

  const current = demoSteps[currentStep];
  const StepIcon = current.icon;

  const handleGoToTab = () => {
    setActiveTab(current.targetTab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-indigo-500/30 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100">End-to-End Accounting Demo Story</h2>
              <p className="text-xs text-indigo-300">Guided Walkthrough for Hackathon Judges & Evaluators</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {demoSteps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 flex-1 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-indigo-500 shadow-md shadow-indigo-500/50'
                  : idx < currentStep
                  ? 'bg-emerald-500/60'
                  : 'bg-slate-800'
              }`}
              title={s.title}
            ></button>
          ))}
        </div>

        {/* Step Card Body */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/50">
              {current.subtitle} • Step {currentStep + 1} of {demoSteps.length}
            </span>
            <StepIcon className={`w-6 h-6 ${current.color}`} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-100">{current.title}</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">{current.description}</p>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1 text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Business Logic Outcome</span>
            <p className="text-emerald-400 font-semibold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{current.expectedOutcome}</span>
            </p>
          </div>
        </div>

        {/* Navigation & Jump Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              className={`p-2.5 rounded-xl border border-slate-800 text-xs font-semibold flex items-center space-x-1 ${
                currentStep === 0 ? 'text-slate-600 bg-slate-900 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Prev Step</span>
            </button>

            <button
              disabled={currentStep === demoSteps.length - 1}
              onClick={() => setCurrentStep(prev => Math.min(demoSteps.length - 1, prev + 1))}
              className={`p-2.5 rounded-xl border border-slate-800 text-xs font-semibold flex items-center space-x-1 ${
                currentStep === demoSteps.length - 1 ? 'text-slate-600 bg-slate-900 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleGoToTab}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{current.actionText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
