export const initialContacts = [
  {
    id: 'CNT-001',
    name: 'Rahul Sharma',
    type: 'Vendor',
    email: 'rahul.sharma@furnituresupplies.in',
    mobile: '+91 98765 43210',
    address: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    isArchived: false,
    notes: 'Primary supplier for ergonomic seating and steel mechanisms.'
  },
  {
    id: 'CNT-002',
    name: 'Nimesh Pathak',
    type: 'Customer',
    email: 'nimesh.pathak@techspace.io',
    mobile: '+91 98123 45678',
    address: { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    isArchived: false,
    notes: 'Key corporate client for IT workspace furnishing.'
  },
  {
    id: 'CNT-003',
    name: 'Azure Furniture Ltd',
    type: 'Vendor',
    email: 'procurement@azurefurniture.com',
    mobile: '+91 97777 11223',
    address: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    isArchived: false,
    notes: 'Premium teak wood supplier and bulk board manufacturer.'
  },
  {
    id: 'CNT-004',
    name: 'Modern Spaces Co.',
    type: 'Customer',
    email: 'contact@modernspaces.co',
    mobile: '+91 99887 66554',
    address: { city: 'Delhi', state: 'Delhi NCR', pincode: '110001' },
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    isArchived: false,
    notes: 'Interior design studio ordering living room sofas and custom desks.'
  },
  {
    id: 'CNT-005',
    name: 'Crafted Woodworks',
    type: 'Both',
    email: 'info@craftedwood.in',
    mobile: '+91 94444 33221',
    address: { city: 'Pune', state: 'Maharashtra', pincode: '411004' },
    profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
    isArchived: false,
    notes: 'Both vendor for raw components and client for finished catalog.'
  }
];

export const initialProducts = [
  {
    id: 'PRD-101',
    name: 'Executive Ergonomic Chair',
    type: 'Goods',
    salesPrice: 5000,
    costPrice: 3000,
    category: 'Office Seating',
    stock: 45,
    reorderLevel: 10,
    isArchived: false,
    description: 'High-back mesh ergonomic chair with lumbar support and 3D armrests.'
  },
  {
    id: 'PRD-102',
    name: 'Solid Teak Dining Table (6-Seater)',
    type: 'Goods',
    salesPrice: 35000,
    costPrice: 22000,
    category: 'Dining Furniture',
    stock: 12,
    reorderLevel: 3,
    isArchived: false,
    description: '100% natural seasoned teak wood dining table with matte PU polish.'
  },
  {
    id: 'PRD-103',
    name: 'Modular Velvet L-Shape Sofa',
    type: 'Goods',
    salesPrice: 48000,
    costPrice: 31000,
    category: 'Living Room',
    stock: 8,
    reorderLevel: 2,
    isArchived: false,
    description: 'High-density foam 5-seater corner sectional in stain-resistant velvet.'
  },
  {
    id: 'PRD-104',
    name: 'Scandinavian Minimalist Study Desk',
    type: 'Goods',
    salesPrice: 14500,
    costPrice: 8500,
    category: 'Office Furniture',
    stock: 24,
    reorderLevel: 5,
    isArchived: false,
    description: 'Engineered oak top study table with concealed cable management.'
  },
  {
    id: 'PRD-105',
    name: 'Professional Assembly & Installation Service',
    type: 'Service',
    salesPrice: 2500,
    costPrice: 900,
    category: 'Services',
    stock: 999,
    reorderLevel: 0,
    isArchived: false,
    description: 'On-site white-glove assembly, leveling, and testing by certified technician.'
  },
  {
    id: 'PRD-106',
    name: 'Executive Workstation Suite (Combo)',
    type: 'Combo',
    salesPrice: 18000,
    costPrice: 11000,
    category: 'Combos',
    stock: 15,
    reorderLevel: 4,
    isArchived: false,
    description: 'Bundle containing 1x Executive Ergonomic Chair + 1x Scandinavian Desk.'
  }
];

export const initialChartOfAccounts = [
  // ASSETS (Normal Balance: Debit)
  { id: 'COA-1010', code: '1010', name: 'Cash on Hand', type: 'Asset', subCategory: 'Current Asset', balance: 25000 },
  { id: 'COA-1020', code: '1020', name: 'Bank Account (HDFC)', type: 'Asset', subCategory: 'Current Asset', balance: 400000 },
  { id: 'COA-1030', code: '1030', name: 'Accounts Receivable (Debtors)', type: 'Asset', subCategory: 'Current Asset', balance: 75000 },
  { id: 'COA-1040', code: '1040', name: 'Furniture Inventory (Stock)', type: 'Asset', subCategory: 'Current Asset', balance: 125000 },

  // LIABILITIES (Normal Balance: Credit)
  { id: 'COA-2010', code: '2010', name: 'Accounts Payable (Creditors)', type: 'Liability', subCategory: 'Current Liability', balance: 125000 },
  { id: 'COA-2020', code: '2020', name: 'GST Output Tax Payable', type: 'Liability', subCategory: 'Current Liability', balance: 0 },

  // CAPITAL / EQUITY (Normal Balance: Credit)
  { id: 'COA-3010', code: '3010', name: "Owner's Capital", type: 'Capital', subCategory: 'Equity', balance: 500000 },
  { id: 'COA-3020', code: '3020', name: 'Retained Earnings', type: 'Capital', subCategory: 'Equity', balance: 0 },

  // INCOME (Normal Balance: Credit)
  { id: 'COA-4010', code: '4010', name: 'Sale Income', type: 'Income', subCategory: 'Operating Revenue', balance: 25000 },
  { id: 'COA-4020', code: '4020', name: 'Service Revenue', type: 'Income', subCategory: 'Operating Revenue', balance: 0 },

  // EXPENSES (Normal Balance: Debit)
  { id: 'COA-5010', code: '5010', name: 'Purchase Expense (COGS)', type: 'Expense', subCategory: 'Direct Cost', balance: 30000 },
  { id: 'COA-5020', code: '5020', name: 'Marketing & Advertising Expense', type: 'Expense', subCategory: 'Operating Expense', balance: 15000 },
  { id: 'COA-5030', code: '5030', name: 'Showroom & Utilities Expense', type: 'Expense', subCategory: 'Operating Expense', balance: 10000 }
];

export const initialJournals = [
  {
    id: 'JRN-01',
    name: 'Sales Journal',
    type: 'Sales',
    defaultDebitAccountId: 'COA-1030', // Accounts Receivable (Debtors)
    defaultCreditAccountId: 'COA-4010', // Sale Income
    description: 'Records customer sales invoices and trade receivables.'
  },
  {
    id: 'JRN-02',
    name: 'Purchase Journal',
    type: 'Purchase',
    defaultDebitAccountId: 'COA-5010', // Purchase Expense (COGS)
    defaultCreditAccountId: 'COA-2010', // Accounts Payable (Creditors)
    description: 'Records vendor bills and trade payables.'
  },
  {
    id: 'JRN-03',
    name: 'Bank Journal',
    type: 'Bank',
    defaultDebitAccountId: 'COA-1020', // Bank Account (HDFC)
    defaultCreditAccountId: 'COA-1020',
    description: 'Records all bank settlements, wire transfers, and digital receipts.'
  },
  {
    id: 'JRN-04',
    name: 'Cash Journal',
    type: 'Cash',
    defaultDebitAccountId: 'COA-1010', // Cash on Hand
    defaultCreditAccountId: 'COA-1010',
    description: 'Records petty cash inflows and outflows.'
  },
  {
    id: 'JRN-05',
    name: 'General Journal',
    type: 'General',
    defaultDebitAccountId: 'COA-3010',
    defaultCreditAccountId: 'COA-3010',
    description: 'Manual adjusting entries, depreciation, and opening capital.'
  }
];

export const initialAnalyticAccounts = [
  {
    id: 'ANA-01',
    name: 'Showroom Flagship (Mumbai)',
    type: 'Expense',
    code: 'SHOWROOM-MUM',
    description: 'Retail showroom operational costs, rent, display furnishings.'
  },
  {
    id: 'ANA-02',
    name: 'Central Warehouse (Bhiwandi)',
    type: 'Expense',
    code: 'WAREHOUSE-BHW',
    description: 'Logistics, storage, and material handling expenses.'
  },
  {
    id: 'ANA-03',
    name: 'Online Sales & Direct-to-Consumer',
    type: 'Income',
    code: 'ECOMM-INCOME',
    description: 'E-commerce channel revenue and digital fulfillment.'
  },
  {
    id: 'ANA-04',
    name: '2026 Marketing & Brand Campaign',
    type: 'Expense',
    code: 'MKTG-2026',
    description: 'Advertising, influencer campaigns, and promotional events.'
  },
  {
    id: 'ANA-05',
    name: 'Corporate Projects & B2B Fitouts',
    type: 'Income',
    code: 'CORP-B2B',
    description: 'Large turnkey office furnishing and enterprise contracts.'
  }
];

export const initialBudgets = [
  {
    id: 'BDG-2026-01',
    name: '2026 Furniture Marketing & Branding',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    responsiblePerson: 'Pooja Verma (Marketing Lead)',
    plannedAmount: 100000,
    analyticAccountId: 'ANA-04',
    analyticAccountName: '2026 Marketing & Brand Campaign',
    actualAmount: 75000,
    status: 'Active'
  },
  {
    id: 'BDG-2026-02',
    name: 'Showroom Operational Budget Q3',
    periodStart: '2026-07-01',
    periodEnd: '2026-09-30',
    responsiblePerson: 'Rajesh Nair (Showroom Manager)',
    plannedAmount: 150000,
    analyticAccountId: 'ANA-01',
    analyticAccountName: 'Showroom Flagship (Mumbai)',
    actualAmount: 110000,
    status: 'Active'
  },
  {
    id: 'BDG-2026-03',
    name: 'Warehouse Logistics & Packaging',
    periodStart: '2026-09-01',
    periodEnd: '2026-12-31',
    responsiblePerson: 'Vikram Singh (Logistics Head)',
    plannedAmount: 80000,
    analyticAccountId: 'ANA-02',
    analyticAccountName: 'Central Warehouse (Bhiwandi)',
    actualAmount: 45000,
    status: 'Active'
  }
];

export const initialPurchaseOrders = [
  {
    id: 'PO-2026-001',
    vendorId: 'CNT-001',
    vendorName: 'Rahul Sharma',
    date: '2026-08-20',
    status: 'Billed', // 'Draft' | 'Confirmed' | 'Goods Received' | 'Billed'
    goodsReceived: true,
    goodsReceivedDate: '2026-08-20',
    items: [
      {
        productId: 'PRD-101',
        productName: 'Executive Ergonomic Chair',
        qty: 10,
        unitPrice: 3000,
        taxPercent: 0,
        taxAmount: 0,
        total: 30000
      }
    ],
    subtotal: 30000,
    taxTotal: 0,
    totalAmount: 30000,
    billId: 'BILL-2026-001',
    analyticAccountId: 'ANA-02',
    notes: 'Initial batch of 10 ergonomic chairs for warehouse stock.'
  },
  {
    id: 'PO-2026-002',
    vendorId: 'CNT-003',
    vendorName: 'Azure Furniture Ltd',
    date: '2026-09-01',
    status: 'Goods Received',
    goodsReceived: true,
    goodsReceivedDate: '2026-09-02',
    items: [
      {
        productId: 'PRD-102',
        productName: 'Solid Teak Dining Table (6-Seater)',
        qty: 3,
        unitPrice: 22000,
        taxPercent: 0,
        taxAmount: 0,
        total: 66000
      }
    ],
    subtotal: 66000,
    taxTotal: 0,
    totalAmount: 66000,
    billId: null,
    analyticAccountId: 'ANA-01',
    notes: 'Solid teak batch received at showroom dock.'
  }
];

export const initialVendorBills = [
  {
    id: 'BILL-2026-001',
    poRef: 'PO-2026-001',
    vendorId: 'CNT-001',
    vendorName: 'Rahul Sharma',
    date: '2026-08-21',
    dueDate: '2026-09-20',
    items: [
      {
        productId: 'PRD-101',
        productName: 'Executive Ergonomic Chair',
        qty: 10,
        unitPrice: 3000,
        total: 30000
      }
    ],
    subtotal: 30000,
    tax: 0,
    totalAmount: 30000,
    paidAmount: 30000,
    balance: 0,
    status: 'Paid', // 'Unpaid' | 'Partially Paid' | 'Paid'
    journalEntryId: 'JE-PO-001',
    analyticAccountId: 'ANA-02'
  },
  {
    id: 'BILL-2026-002',
    poRef: 'Direct Vendor Bill',
    vendorId: 'CNT-003',
    vendorName: 'Azure Furniture Ltd',
    date: '2026-09-02',
    dueDate: '2026-10-02',
    items: [
      {
        productId: 'PRD-103',
        productName: 'Modular Velvet L-Shape Sofa',
        qty: 4,
        unitPrice: 31000,
        total: 124000
      }
    ],
    subtotal: 124000,
    tax: 1000,
    totalAmount: 125000,
    paidAmount: 0,
    balance: 125000,
    status: 'Unpaid',
    journalEntryId: 'JE-PO-002',
    analyticAccountId: 'ANA-01'
  }
];

export const initialSalesOrders = [
  {
    id: 'SO-2026-001',
    customerId: 'CNT-002',
    customerName: 'Nimesh Pathak',
    date: '2026-08-25',
    status: 'Invoiced', // 'Draft' | 'Confirmed' | 'Delivered' | 'Invoiced'
    delivered: true,
    deliveredDate: '2026-08-25',
    items: [
      {
        productId: 'PRD-101',
        productName: 'Executive Ergonomic Chair',
        qty: 5,
        unitPrice: 5000,
        taxPercent: 0,
        taxAmount: 0,
        total: 25000
      }
    ],
    subtotal: 25000,
    taxTotal: 0,
    totalAmount: 25000,
    invoiceId: 'INV-2026-001',
    analyticAccountId: 'ANA-05',
    notes: '5 office chairs supplied for TechSpace workspace expansion.'
  },
  {
    id: 'SO-2026-002',
    customerId: 'CNT-004',
    customerName: 'Modern Spaces Co.',
    date: '2026-09-03',
    status: 'Confirmed',
    delivered: false,
    deliveredDate: null,
    items: [
      {
        productId: 'PRD-103',
        productName: 'Modular Velvet L-Shape Sofa',
        qty: 1,
        unitPrice: 48000,
        taxPercent: 18,
        taxAmount: 8640,
        total: 56640
      }
    ],
    subtotal: 48000,
    taxTotal: 8640,
    totalAmount: 56640,
    invoiceId: null,
    analyticAccountId: 'ANA-03',
    notes: 'Living room sectional order confirmed awaiting delivery dispatch.'
  }
];

export const initialInvoices = [
  {
    id: 'INV-2026-001',
    soRef: 'SO-2026-001',
    customerId: 'CNT-002',
    customerName: 'Nimesh Pathak',
    customerEmail: 'nimesh.pathak@techspace.io',
    customerAddress: 'Bengaluru, Karnataka - 560001',
    date: '2026-08-26',
    dueDate: '2026-09-25',
    items: [
      {
        productId: 'PRD-101',
        productName: 'Executive Ergonomic Chair',
        qty: 5,
        unitPrice: 5000,
        total: 25000
      }
    ],
    subtotal: 25000,
    taxRate: 0,
    tax: 0,
    totalAmount: 25000,
    paidAmount: 25000,
    balance: 0,
    status: 'Paid', // 'Unpaid' | 'Partially Paid' | 'Paid'
    journalEntryId: 'JE-INV-001',
    analyticAccountId: 'ANA-05'
  },
  {
    id: 'INV-2026-002',
    soRef: 'Direct Sales Invoice',
    customerId: 'CNT-004',
    customerName: 'Modern Spaces Co.',
    customerEmail: 'contact@modernspaces.co',
    customerAddress: 'Delhi, Delhi NCR - 110001',
    date: '2026-09-04',
    dueDate: '2026-10-04',
    items: [
      {
        productId: 'PRD-104',
        productName: 'Scandinavian Minimalist Study Desk',
        qty: 4,
        unitPrice: 14500,
        total: 58000
      },
      {
        productId: 'PRD-105',
        productName: 'Professional Assembly & Installation Service',
        qty: 4,
        unitPrice: 2500,
        total: 10000
      }
    ],
    subtotal: 68000,
    taxRate: 0,
    tax: 0,
    totalAmount: 75000,
    paidAmount: 0,
    balance: 75000,
    status: 'Unpaid',
    journalEntryId: 'JE-INV-002',
    analyticAccountId: 'ANA-03'
  }
];

export const initialJournalEntries = [
  {
    id: 'JE-INIT-001',
    date: '2026-08-01',
    reference: 'Capital Seed Equity & Opening Balance',
    journalType: 'General',
    journalName: 'General Journal',
    analyticAccountId: null,
    lines: [
      { accountId: 'COA-1020', account: 'Bank Account (HDFC)', debit: 400000, credit: 0 },
      { accountId: 'COA-1010', account: 'Cash on Hand', debit: 25000, credit: 0 },
      { accountId: 'COA-1040', account: 'Furniture Inventory (Stock)', debit: 75000, credit: 0 },
      { accountId: 'COA-3010', account: "Owner's Capital", debit: 0, credit: 500000 }
    ]
  },
  {
    id: 'JE-PO-001',
    date: '2026-08-21',
    reference: 'BILL-2026-001 (Rahul Sharma - 10x Office Chairs)',
    journalType: 'Purchase',
    journalName: 'Purchase Journal',
    analyticAccountId: 'ANA-02',
    lines: [
      { accountId: 'COA-5010', account: 'Purchase Expense (COGS)', debit: 30000, credit: 0 },
      { accountId: 'COA-2010', account: 'Accounts Payable (Creditors)', debit: 0, credit: 30000 }
    ]
  },
  {
    id: 'JE-PAY-001',
    date: '2026-08-22',
    reference: 'PAY-2026-001 to Rahul Sharma for BILL-2026-001',
    journalType: 'Bank',
    journalName: 'Bank Journal',
    analyticAccountId: 'ANA-02',
    lines: [
      { accountId: 'COA-2010', account: 'Accounts Payable (Creditors)', debit: 30000, credit: 0 },
      { accountId: 'COA-1020', account: 'Bank Account (HDFC)', debit: 0, credit: 30000 }
    ]
  },
  {
    id: 'JE-INV-001',
    date: '2026-08-26',
    reference: 'INV-2026-001 (Nimesh Pathak - 5x Office Chairs)',
    journalType: 'Sales',
    journalName: 'Sales Journal',
    analyticAccountId: 'ANA-05',
    lines: [
      { accountId: 'COA-1030', account: 'Accounts Receivable (Debtors)', debit: 25000, credit: 0 },
      { accountId: 'COA-4010', account: 'Sale Income', debit: 0, credit: 25000 }
    ]
  },
  {
    id: 'JE-PAY-002',
    date: '2026-08-27',
    reference: 'PAY-2026-002 from Nimesh Pathak for INV-2026-001',
    journalType: 'Bank',
    journalName: 'Bank Journal',
    analyticAccountId: 'ANA-05',
    lines: [
      { accountId: 'COA-1020', account: 'Bank Account (HDFC)', debit: 25000, credit: 0 },
      { accountId: 'COA-1030', account: 'Accounts Receivable (Debtors)', debit: 0, credit: 25000 }
    ]
  },
  {
    id: 'JE-PO-002',
    date: '2026-09-02',
    reference: 'BILL-2026-002 (Azure Furniture Ltd - 4x Velvet Sofas)',
    journalType: 'Purchase',
    journalName: 'Purchase Journal',
    analyticAccountId: 'ANA-01',
    lines: [
      { accountId: 'COA-5010', account: 'Purchase Expense (COGS)', debit: 125000, credit: 0 },
      { accountId: 'COA-2010', account: 'Accounts Payable (Creditors)', debit: 0, credit: 125000 }
    ]
  },
  {
    id: 'JE-INV-002',
    date: '2026-09-04',
    reference: 'INV-2026-002 (Modern Spaces Co. - Desks & Installation)',
    journalType: 'Sales',
    journalName: 'Sales Journal',
    analyticAccountId: 'ANA-03',
    lines: [
      { accountId: 'COA-1030', account: 'Accounts Receivable (Debtors)', debit: 75000, credit: 0 },
      { accountId: 'COA-4010', account: 'Sale Income', debit: 0, credit: 75000 }
    ]
  }
];

export const initialPayments = [
  {
    id: 'PAY-2026-001',
    date: '2026-08-22',
    type: 'Vendor Payment',
    docType: 'Vendor Bill',
    docId: 'BILL-2026-001',
    contactName: 'Rahul Sharma',
    method: 'Bank Account (HDFC)',
    amount: 30000,
    journalEntryId: 'JE-PAY-001',
    notes: 'Full payment cleared via HDFC RTGS (UTR #9821389123).'
  },
  {
    id: 'PAY-2026-002',
    date: '2026-08-27',
    type: 'Customer Payment',
    docType: 'Customer Invoice',
    docId: 'INV-2026-001',
    contactName: 'Nimesh Pathak',
    method: 'Bank Account (HDFC)',
    amount: 25000,
    journalEntryId: 'JE-PAY-002',
    notes: 'Online payment received via UPI/Netbanking for 5 chairs.'
  }
];
