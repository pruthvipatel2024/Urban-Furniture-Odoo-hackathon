export const initialContacts = [
  { id: 'CNT-001', name: 'Rahul Sharma', type: 'Vendor', email: 'rahul.sharma@furnituresupplies.com', phone: '+91 98765 43210', city: 'Mumbai', status: 'Active' },
  { id: 'CNT-002', name: 'Nimesh Pathak', type: 'Customer', email: 'nimesh.pathak@techspace.io', phone: '+91 98123 45678', city: 'Bengaluru', status: 'Active' },
  { id: 'CNT-003', name: 'Azure Furniture Pvt Ltd', type: 'Vendor', email: 'orders@azurefurniture.com', phone: '+91 97777 11223', city: 'Ahmedabad', status: 'Active' },
  { id: 'CNT-004', name: 'Modern Spaces Ltd', type: 'Customer', email: 'procurement@modernspaces.co', phone: '+91 99887 66554', city: 'Delhi', status: 'Active' },
  { id: 'CNT-005', name: 'Crafted Wood Co.', type: 'Both', email: 'info@craftedwood.in', phone: '+91 94444 33221', city: 'Pune', status: 'Active' }
];

export const initialProducts = [
  { id: 'PRD-101', name: 'Executive Ergonomic Chair', type: 'Goods', salesPrice: 14999, costPrice: 8500, category: 'Seating', stock: 45 },
  { id: 'PRD-102', name: 'Solid Teak Dining Table (6 Seater)', type: 'Goods', salesPrice: 42000, costPrice: 26000, category: 'Tables', stock: 12 },
  { id: 'PRD-103', name: 'Velvet Modular L-Shape Sofa', type: 'Goods', salesPrice: 68000, costPrice: 44000, category: 'Living', stock: 8 },
  { id: 'PRD-104', name: 'Scandinavian Minimalist Desk', type: 'Goods', salesPrice: 18500, costPrice: 11000, category: 'Office', stock: 24 },
  { id: 'PRD-105', name: 'On-site Furniture Assembly Service', type: 'Service', salesPrice: 2500, costPrice: 800, category: 'Services', stock: 999 }
];

export const initialChartOfAccounts = [
  // Assets
  { code: '1010', name: 'Cash on Hand', type: 'Asset', subCategory: 'Current Asset', balance: 18500 },
  { code: '1020', name: 'Bank Account (HDFC)', type: 'Asset', subCategory: 'Current Asset', balance: 145000 },
  { code: '1030', name: 'Accounts Receivable (Debtors)', type: 'Asset', subCategory: 'Current Asset', balance: 68500 },
  { code: '1040', name: 'Furniture Inventory', type: 'Asset', subCategory: 'Current Asset', balance: 320000 },
  
  // Liabilities
  { code: '2010', name: 'Accounts Payable (Creditors)', type: 'Liability', subCategory: 'Current Liability', balance: 42000 },
  { code: '2020', name: 'GST Payable', type: 'Liability', subCategory: 'Current Liability', balance: 16500 },

  // Capital / Equity
  { code: '3010', name: "Owner's Capital", type: 'Capital', subCategory: 'Equity', balance: 400000 },

  // Income
  { code: '4010', name: 'Sale Income', type: 'Income', subCategory: 'Direct Revenue', balance: 245000 },
  { code: '4020', name: 'Service Revenue', type: 'Income', subCategory: 'Indirect Revenue', balance: 12500 },

  // Expenses
  { code: '5010', name: 'Purchase Expense (COGS)', type: 'Expense', subCategory: 'Direct Expense', balance: 135000 },
  { code: '5020', name: 'Utility & Rent Expense', type: 'Expense', subCategory: 'Operating Expense', balance: 28500 }
];

export const initialPurchaseOrders = [
  {
    id: 'PO-2024-001',
    vendorId: 'CNT-001',
    vendorName: 'Rahul Sharma',
    date: '2026-08-20',
    status: 'Billed',
    items: [
      { productId: 'PRD-101', productName: 'Executive Ergonomic Chair', qty: 5, unitPrice: 8500, total: 42500 }
    ],
    totalAmount: 42500,
    billId: 'BILL-2024-001'
  },
  {
    id: 'PO-2024-002',
    vendorId: 'CNT-003',
    vendorName: 'Azure Furniture Pvt Ltd',
    date: '2026-08-28',
    status: 'Confirmed',
    items: [
      { productId: 'PRD-102', productName: 'Solid Teak Dining Table (6 Seater)', qty: 2, unitPrice: 26000, total: 52000 }
    ],
    totalAmount: 52000,
    billId: null
  }
];

export const initialVendorBills = [
  {
    id: 'BILL-2024-001',
    poRef: 'PO-2024-001',
    vendorId: 'CNT-001',
    vendorName: 'Rahul Sharma',
    date: '2026-08-21',
    dueDate: '2026-09-20',
    totalAmount: 42500,
    paidAmount: 42500,
    balance: 0,
    status: 'Paid',
    journalEntryId: 'JE-PO-001'
  },
  {
    id: 'BILL-2024-002',
    poRef: 'Manual Bill',
    vendorId: 'CNT-003',
    vendorName: 'Azure Furniture Pvt Ltd',
    date: '2026-09-01',
    dueDate: '2026-09-30',
    totalAmount: 26000,
    paidAmount: 10000,
    balance: 16000,
    status: 'Partially Paid',
    journalEntryId: 'JE-PO-002'
  }
];

export const initialSalesOrders = [
  {
    id: 'SO-2024-001',
    customerId: 'CNT-002',
    customerName: 'Nimesh Pathak',
    date: '2026-08-25',
    status: 'Invoiced',
    items: [
      { productId: 'PRD-101', productName: 'Executive Ergonomic Chair', qty: 2, unitPrice: 14999, total: 29998 }
    ],
    totalAmount: 29998,
    invoiceId: 'INV-2024-001'
  },
  {
    id: 'SO-2024-002',
    customerId: 'CNT-004',
    customerName: 'Modern Spaces Ltd',
    date: '2026-09-02',
    status: 'Confirmed',
    items: [
      { productId: 'PRD-103', productName: 'Velvet Modular L-Shape Sofa', qty: 1, unitPrice: 68000, total: 68000 }
    ],
    totalAmount: 68000,
    invoiceId: null
  }
];

export const initialInvoices = [
  {
    id: 'INV-2024-001',
    soRef: 'SO-2024-001',
    customerId: 'CNT-002',
    customerName: 'Nimesh Pathak',
    date: '2026-08-26',
    dueDate: '2026-09-26',
    subtotal: 29998,
    tax: 5399.64,
    totalAmount: 35397.64,
    paidAmount: 35397.64,
    balance: 0,
    status: 'Paid',
    journalEntryId: 'JE-INV-001'
  },
  {
    id: 'INV-2024-002',
    soRef: 'Direct Sales',
    customerId: 'CNT-004',
    customerName: 'Modern Spaces Ltd',
    date: '2026-09-03',
    dueDate: '2026-10-03',
    subtotal: 37000,
    tax: 6660,
    totalAmount: 43660,
    paidAmount: 15000,
    balance: 28660,
    status: 'Partially Paid',
    journalEntryId: 'JE-INV-002'
  }
];

export const initialJournalEntries = [
  {
    id: 'JE-INIT-001',
    date: '2026-08-01',
    reference: 'Capital Seed',
    journalType: 'General',
    lines: [
      { account: 'Bank Account (HDFC)', debit: 400000, credit: 0 },
      { account: "Owner's Capital", debit: 0, credit: 400000 }
    ]
  },
  {
    id: 'JE-PO-001',
    date: '2026-08-21',
    reference: 'BILL-2024-001 (Rahul Sharma)',
    journalType: 'Purchase',
    lines: [
      { account: 'Purchase Expense (COGS)', debit: 42500, credit: 0 },
      { account: 'Accounts Payable (Creditors)', debit: 0, credit: 42500 }
    ]
  },
  {
    id: 'JE-INV-001',
    date: '2026-08-26',
    reference: 'INV-2024-001 (Nimesh Pathak)',
    journalType: 'Sales',
    lines: [
      { account: 'Accounts Receivable (Debtors)', debit: 35397.64, credit: 0 },
      { account: 'Sale Income', debit: 0, credit: 35397.64 }
    ]
  },
  {
    id: 'JE-PAY-001',
    date: '2026-08-27',
    reference: 'PAY-2024-001 against INV-2024-001',
    journalType: 'Bank',
    lines: [
      { account: 'Bank Account (HDFC)', debit: 35397.64, credit: 0 },
      { account: 'Accounts Receivable (Debtors)', debit: 0, credit: 35397.64 }
    ]
  }
];

export const initialPayments = [
  {
    id: 'PAY-2024-001',
    date: '2026-08-27',
    type: 'Customer Payment',
    docType: 'Invoice',
    docId: 'INV-2024-001',
    contactName: 'Nimesh Pathak',
    method: 'Bank Account (HDFC)',
    amount: 35397.64,
    notes: 'Full payment received online'
  },
  {
    id: 'PAY-2024-002',
    date: '2026-08-28',
    type: 'Vendor Payment',
    docType: 'Vendor Bill',
    docId: 'BILL-2024-001',
    contactName: 'Rahul Sharma',
    method: 'Bank Account (HDFC)',
    amount: 42500,
    notes: 'Vendor payment cleared'
  }
];
