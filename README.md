# 🏢 Urban Furniture — ERP Accounting & Operational System
> **Full-Stack Double-Entry Enterprise ERP Solution** developed for the **Odoo Hackathon**. Built with high-fidelity accounting rigor, real-time MySQL persistence, GAAP/GST compliance, and modern responsive user experience.

---

## 🌟 Executive Overview
**Urban Furniture ERP** is an end-to-end Enterprise Resource Planning (ERP) platform designed specifically for furniture manufacturing, commercial showroom retail, and B2B corporate interior fit-out operations.

### Key Highlights
- ⚖️ **Double-Entry General Ledger**: Enforces the invariant $\text{Total Debits} = \text{Total Credits}$ across all journal postings.
- 🔄 **In-Place CRUD Updates**: Updating records modifies existing database rows without creating duplicates.
- 📦 **Automated Inventory Valuation**: Live stock replenishment and deduction with weighted average costing.
- 📊 **Dynamic Budget Variance Analytics**: Real-time tracking of Committed vs. Achieved expenditure against analytic accounts.
- 🧾 **Standard GST Tax Billing**: Itemized Central & State GST (0%, 5%, 12%, 18%, 28%) with printable showroom Tax Invoices.
- ⚡ **Seamless State Synchronization**: Full refresh-persistence backed by Node.js, Express, Sequelize ORM, and MySQL.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js, Sequelize ORM |
| **Database** | MySQL 8.x / MariaDB (Strict Foreign Keys & Decimal Precision) |
| **File Handling** | Multer Storage Engine |
| **State Management** | React Context API with Optimistic Locking & Toast Notifications |

---

## 🏗️ System Architecture

```
urban-furniture-erp/
├── backend/
│   ├── src/
│   │   ├── config/             # Database connection & Sequelize config
│   │   ├── controllers/        # Express REST API controllers
│   │   ├── middleware/         # Auth, error handling & upload middlewares
│   │   ├── models/             # Sequelize data models with validations
│   │   ├── routes/             # Modular API routes
│   │   ├── services/           # Authoritative business logic & transactions
│   │   └── utils/              # Decimal math utils, bulk generators & seeders
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Dashboard, SalesFlow, PurchaseFlow, Budgets, Reports
│   │   ├── context/            # Central AccountingContext
│   │   ├── services/           # Axios API client
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

---

## 🚀 Key Business Workflows

### 1. Sales & Revenue Cycle
1. **Sales Order (SO)**: Select client, analytic cost center, and product lines with custom tax rates.
2. **Delivery / Confirmation**: Order lines generate authoritative line totals and reserve warehouse stock.
3. **Customer Invoice**: Issues formal GST Tax Invoice, auto-generating Journal Entry:
   - Debit: Accounts Receivable (1010)
   - Credit: Sales Revenue (4010)
   - Credit: GST Output Tax Payable (2020)
4. **Customer Payment**: Settle via Bank or Cash with real-time balance reconciliation.
5. **Print Tax Bill**: Formatted PDF-ready Tax Invoice with company CIN, GSTIN, and itemized tax breakdown.

### 2. Procurement & Vendor Cycle
1. **Purchase Order (PO)**: Issue procurement orders to verified raw material suppliers.
2. **Material Receipt**: Increments on-hand inventory quantity and calculates inventory valuation.
3. **Vendor Bill**: Confirms payable obligations, auto-generating Journal Entry:
   - Debit: Cost of Goods Sold / Purchase Expense (5010)
   - Credit: Accounts Payable (2010)
4. **Vendor Payment**: Outflow register posting bank debits/credits.

### 3. Budget Control & Variance Reports
- Multi-period planning (Monthly, Quarterly, Annual).
- Automatic tracking of **Planned**, **Committed**, and **Achieved** amounts.
- Color-coded variance KPIs: On Track ($\le 75\%$), Warning ($75\% - 95\%$), and Exceeded ($> 100\%$).

---

## 📡 API Endpoints Reference

### 👥 Contacts & CRM
- `GET /api/contacts` — Fetch all customers and vendors
- `POST /api/contacts` — Create new partner profile (with photo upload)
- `PUT /api/contacts/:id` — In-place update partner profile
- `DELETE /api/contacts/:id` — Archive or delete partner

### 🛒 Sales Orders & Invoices
- `GET /api/sales/orders` — List all sales orders
- `POST /api/sales/orders` — Create new sales order
- `PUT /api/sales/orders/:id` — In-place edit sales order
- `GET /api/sales/invoices` — List customer invoices

### 📦 Purchase Orders & Bills
- `GET /api/purchase/orders` — List all purchase orders
- `POST /api/purchase/orders` — Create new purchase order
- `PUT /api/purchase/orders/:id` — In-place edit purchase order
- `GET /api/purchase/bills` — List vendor bills

### 📊 Accounting & Reports
- `GET /api/accounts/coa` — Chart of Accounts hierarchy & live balances
- `GET /api/journals/entries` — Double-entry general ledger
- `GET /api/budgets/reports/variance` — Real-time budget variance report
- `POST /api/payments` — Register bank / cash transaction

---

## ⚙️ Quick Start Installation

### Prerequisites
- **Node.js**: `v18.x` or higher
- **MySQL Server**: `v8.0+` (or XAMPP / MariaDB on port `3306`)

### 1. Database Setup
```sql
CREATE DATABASE urban_furniture CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds initial CoA, journals, and core records
npm run dev      # Starts Express API server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔒 Security & Data Integrity
- **Database Transactions**: All financial entries and multi-table updates are wrapped in ACID-compliant Sequelize transactions with automatic rollback on error.
- **Foreign Key Constraints**: Strict cascading protections prevent orphan lines or invalid contact deletions.
- **Authoritative Server Calculations**: All line totals, GST additions, and grand totals are validated and calculated authoritatively on the backend.

---

## 📄 License
This project is open-source and created for the **Urban Furniture Odoo Hackathon**.
