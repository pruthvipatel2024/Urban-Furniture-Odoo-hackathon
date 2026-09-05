# Urban Furniture — Production ERP & Double-Entry Accounting Backend

A complete, production-ready **Node.js + Express.js + MySQL + Sequelize ORM + JWT** accounting and inventory management backend built for the **Urban Furniture Odoo Hackathon**.

The database layer strictly adheres to the authoritative schema defined in `database/schema.sql`.

---

## 🏛️ System Architecture

```text
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MySQL Sequelize connection with XAMPP auto-create support
│   │   ├── env.js               # Environment variables configuration
│   │   └── swagger.js           # Swagger OpenAPI 3.0 specification
│   │
│   ├── models/                  # 16 Sequelize Models matching schema.sql
│   │   ├── index.js             # Model associations & foreign key mappings
│   │   ├── User.js              # users table (admin, accountant, contact)
│   │   ├── Contact.js           # contacts table (customer, vendor, both)
│   │   ├── Product.js           # products table (goods, service, combo)
│   │   ├── ChartOfAccount.js    # chart_of_accounts (asset, liability, expense, income, capital)
│   │   ├── Journal.js           # journals (sales, purchase, bank, cash)
│   │   ├── AnalyticAccount.js   # analytic_accounts (income, expense)
│   │   ├── Budget.js            # budgets table
│   │   ├── PurchaseOrder.js     # purchase_orders (draft, confirmed, billed, cancelled)
│   │   ├── PurchaseOrderItem.js # purchase_order_items
│   │   ├── VendorBill.js        # vendor_bills (unpaid, partially_paid, paid)
│   │   ├── SalesOrder.js        # sales_orders (draft, confirmed, invoiced, cancelled)
│   │   ├── SalesOrderItem.js    # sales_order_items
│   │   ├── CustomerInvoice.js   # customer_invoices (unpaid, partially_paid, paid)
│   │   ├── Payment.js           # payments (cash, bank)
│   │   ├── JournalEntry.js      # journal_entries (immutable double-entry header)
│   │   ├── JournalItem.js       # journal_items (debit/credit lines)
│   │   └── AuditLog.js          # audit_logs table
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT authentication & user lookup
│   │   ├── role.middleware.js   # RBAC ('admin', 'accountant', 'contact')
│   │   ├── ownership.middleware.js # Object-level authorization for contact role
│   │   ├── validation.middleware.js# Request validation
│   │   ├── error.middleware.js  # Centralized error handler
│   │   └── audit.middleware.js  # Audit logging helper
│   │
│   ├── services/
│   │   ├── accounting.service.js# Central double-entry engine (Dr = Cr validation, ledger)
│   │   ├── sales.service.js     # Sales order, stock decrement, auto-invoice posting
│   │   ├── purchase.service.js  # PO, goods receipt, stock increment, vendor bills
│   │   ├── payment.service.js   # Transactional payment settling & overpayment guard
│   │   ├── inventory.service.js # Real-time stock movement tracking
│   │   ├── report.service.js    # P&L, Balance Sheet (Assets = Liab + Cap), Stock, Trial Balance
│   │   └── dashboard.service.js # 100% dynamic live KPI aggregates from MySQL
│   │
│   ├── controllers/             # Express controllers for each domain
│   ├── routes/                  # RESTful routes mounted on `/api`
│   ├── utils/                   # Decimal arithmetic, seeders, response formatters
│   ├── app.js                   # Express app with Helmet, CORS, Swagger, Error Handling
│   └── server.js                # Server entry point with graceful shutdown
│
├── tests/                       # Automated Jest & Supertest integration test suites
│   ├── auth.test.js
│   ├── accounting.test.js
│   ├── sales.test.js
│   ├── purchases.test.js
│   └── reports.test.js
│
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Getting Started with XAMPP / MySQL

### 1. Prerequisites
- **Node.js** v18+ (Tested on v24.x)
- **XAMPP** (Start **Apache** and **MySQL** modules from the XAMPP Control Panel)

### 2. Setup Environment Variables
Create `.env` in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development

# MySQL / XAMPP Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=urban_furniture
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=urban_furniture_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Run Seed Data & Start Server
```bash
# Seed default Chart of Accounts, Journals, Admin, and test contacts
npm run seed

# Start server in development mode (with nodemon)
npm run dev
```

Server will run at `http://localhost:5000`.

---

## 🔑 Default Seed Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@urbanfurniture.com` | `admin123` | Full access to master data, users, accounting, reports, audit logs |
| **Accountant** | `accountant@urbanfurniture.com` | `accountant123` | Day-to-day operations: SO, PO, Invoices, Bills, Payments, Reports |
| **Contact (Customer)** | `nimesh.pathak@techspace.io` | `contact123` | External Portal: View own invoices, orders, and make online payments |

---

## 📖 Swagger / OpenAPI API Documentation

Interactive API documentation is available at:
👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

---

## 🛡️ Key Accounting & Business Engine Rules

1. **Strict Double-Entry Invariant**:
   - Every journal entry strictly enforces `SUM(Debit) == SUM(Credit)`.
   - Each journal item is either Debit or Credit (never both, never zero).
   - Journal entries are immutable once posted.

2. **Automated Transactional Posting**:
   - **Customer Invoicing**: `Dr. Debtors (Asset)` / `Cr. Sale Income (Income)` & Decrements physical inventory stock.
   - **Vendor Billing (Goods Receipt)**: `Dr. Purchase Expense (Expense)` / `Cr. Creditors (Liability)` & Increments physical inventory stock.
   - **Customer Payment**: `Dr. Bank/Cash (Asset)` / `Cr. Debtors (Asset)`.
   - **Vendor Payment**: `Dr. Creditors (Liability)` / `Cr. Bank/Cash (Asset)`.

3. **Overpayment Protection**:
   - Server-side validation rejects payments exceeding the outstanding balance (`total_amount - amount_paid`).

4. **Object-Level Contact Isolation**:
   - Contacts can only view and pay their own invoices and bills. Access to other contacts' records is blocked at the database query level.

5. **Real-Time Financial Reports**:
   - **Profit & Loss**: `Total Income - Total Expenses = Net Profit`.
   - **Balance Sheet**: Strictly validates `Total Assets = Total Liabilities + Total Capital + Retained Net Profit`.
   - **Trial Balance**: Verifies `Total Debits == Total Credits`.
   - **Zero Mock Data**: All metrics, dashboard numbers, and ledgers are computed dynamically from MySQL.

---

## 🧪 Running Automated Tests

Run the full integration test suite covering Auth, Double-Entry Accounting, Sales Flow, Purchase Flow, and Financial Reports:

```bash
npm test
```
