-- ============================================================
--  URBAN FURNITURE — ACCOUNTING SYSTEM
--  PostgreSQL Database Schema
--  Version : 1.1
--  Source   : PRD Appendix A (with enhancements)
-- ============================================================
-- Usage:
--   psql -U <user> -d <dbname> -f schema.sql
-- Or paste directly into pgAdmin / TablePlus query window.
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for gen_random_uuid() if ever needed


-- ============================================================
-- 1. HELPER — auto-update "updated_at" timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 2. USERS & ROLES
-- ============================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150)  NOT NULL,
    email           VARCHAR(150)  UNIQUE NOT NULL,
    password_hash   TEXT          NOT NULL,
    role            VARCHAR(20)   NOT NULL
                        CHECK (role IN ('admin', 'accountant', 'contact')),
    contact_id      INTEGER,          -- populated when role = 'contact'
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 3. MASTER DATA
-- ============================================================

-- 3.1 Contacts (Customers / Vendors / Both)
CREATE TABLE contacts (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(150)  NOT NULL,
    type                VARCHAR(10)   NOT NULL
                            CHECK (type IN ('customer', 'vendor', 'both')),
    email               VARCHAR(150),
    mobile              VARCHAR(20),
    address_city        VARCHAR(100),
    address_state       VARCHAR(100),
    address_pincode     VARCHAR(20),
    profile_image       TEXT,         -- URL or base-64 string
    is_archived         BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Back-fill FK from users -> contacts
ALTER TABLE users
    ADD CONSTRAINT fk_users_contact
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
    ON DELETE SET NULL;


-- 3.2 Products
CREATE TABLE products (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150)  NOT NULL,
    type            VARCHAR(10)   NOT NULL
                        CHECK (type IN ('goods', 'service', 'combo')),
    sales_price     NUMERIC(12,2) NOT NULL CHECK (sales_price >= 0),
    cost_price      NUMERIC(12,2) NOT NULL CHECK (cost_price >= 0),
    category        VARCHAR(100),
    stock_quantity  NUMERIC(10,2) NOT NULL DEFAULT 0,  -- inventory tracking (stretch goal)
    is_archived     BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- 3.3 Chart of Accounts (CoA)
CREATE TABLE chart_of_accounts (
    id              SERIAL PRIMARY KEY,
    account_name    VARCHAR(150)  NOT NULL,
    account_type    VARCHAR(20)   NOT NULL
                        CHECK (account_type IN ('asset', 'liability', 'expense', 'income', 'capital')),
    is_archived     BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_coa_updated_at
    BEFORE UPDATE ON chart_of_accounts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- 3.4 Journals
CREATE TABLE journals (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(100)  NOT NULL,
    type                VARCHAR(20)   NOT NULL
                            CHECK (type IN ('sales', 'purchase', 'bank', 'cash')),
    default_account_id  INTEGER
                            REFERENCES chart_of_accounts(id)
                            ON DELETE SET NULL,
    created_at          TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_journals_updated_at
    BEFORE UPDATE ON journals
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 4. STRETCH-GOAL MASTER DATA
-- ============================================================

-- 4.1 Analytic Accounts
CREATE TABLE analytic_accounts (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150)  NOT NULL,
    type            VARCHAR(10)   NOT NULL
                        CHECK (type IN ('income', 'expense')),
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_analytic_accounts_updated_at
    BEFORE UPDATE ON analytic_accounts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- 4.2 Budgets
CREATE TABLE budgets (
    id                      SERIAL PRIMARY KEY,
    name                    VARCHAR(150)  NOT NULL,
    period_start            DATE          NOT NULL,
    period_end              DATE          NOT NULL,
    responsible_person      VARCHAR(150),
    planned_amount          NUMERIC(14,2) NOT NULL CHECK (planned_amount >= 0),
    analytic_account_id     INTEGER
                                REFERENCES analytic_accounts(id)
                                ON DELETE SET NULL,
    created_at              TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_budget_dates CHECK (period_end >= period_start)
);

CREATE TRIGGER trg_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 5. PURCHASE FLOW
-- ============================================================

-- 5.1 Purchase Orders
CREATE TABLE purchase_orders (
    id              SERIAL PRIMARY KEY,
    vendor_id       INTEGER       NOT NULL
                        REFERENCES contacts(id)
                        ON DELETE RESTRICT,
    order_date      DATE          NOT NULL DEFAULT CURRENT_DATE,
    status          VARCHAR(20)   NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'confirmed', 'billed', 'cancelled')),
    notes           TEXT,
    created_by      INTEGER       REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- 5.2 Purchase Order Line Items
CREATE TABLE purchase_order_items (
    id                  SERIAL PRIMARY KEY,
    purchase_order_id   INTEGER       NOT NULL
                            REFERENCES purchase_orders(id)
                            ON DELETE CASCADE,
    product_id          INTEGER       NOT NULL
                            REFERENCES products(id)
                            ON DELETE RESTRICT,
    quantity            NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    unit_price          NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    line_total          NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);


-- 5.3 Vendor Bills
CREATE TABLE vendor_bills (
    id                  SERIAL PRIMARY KEY,
    purchase_order_id   INTEGER       NOT NULL
                            REFERENCES purchase_orders(id)
                            ON DELETE RESTRICT,
    vendor_id           INTEGER       NOT NULL
                            REFERENCES contacts(id)
                            ON DELETE RESTRICT,
    invoice_date        DATE          NOT NULL,
    due_date            DATE,
    total_amount        NUMERIC(14,2) NOT NULL CHECK (total_amount >= 0),
    amount_paid         NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
    payment_status      VARCHAR(20)   NOT NULL DEFAULT 'unpaid'
                            CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid')),
    notes               TEXT,
    created_at          TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_bill_amount_paid CHECK (amount_paid <= total_amount)
);

CREATE TRIGGER trg_vendor_bills_updated_at
    BEFORE UPDATE ON vendor_bills
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 6. SALES FLOW
-- ============================================================

-- 6.1 Sales Orders
CREATE TABLE sales_orders (
    id              SERIAL PRIMARY KEY,
    customer_id     INTEGER       NOT NULL
                        REFERENCES contacts(id)
                        ON DELETE RESTRICT,
    order_date      DATE          NOT NULL DEFAULT CURRENT_DATE,
    status          VARCHAR(20)   NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'confirmed', 'invoiced', 'cancelled')),
    notes           TEXT,
    created_by      INTEGER       REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_sales_orders_updated_at
    BEFORE UPDATE ON sales_orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- 6.2 Sales Order Line Items
CREATE TABLE sales_order_items (
    id                  SERIAL PRIMARY KEY,
    sales_order_id      INTEGER       NOT NULL
                            REFERENCES sales_orders(id)
                            ON DELETE CASCADE,
    product_id          INTEGER       NOT NULL
                            REFERENCES products(id)
                            ON DELETE RESTRICT,
    quantity            NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    unit_price          NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    tax_percent         NUMERIC(5,2)  NOT NULL DEFAULT 0
                            CHECK (tax_percent >= 0 AND tax_percent <= 100),
    line_total          NUMERIC(14,2) GENERATED ALWAYS AS
                            (quantity * unit_price * (1 + tax_percent / 100)) STORED
);


-- 6.3 Customer Invoices
CREATE TABLE customer_invoices (
    id                  SERIAL PRIMARY KEY,
    sales_order_id      INTEGER       NOT NULL
                            REFERENCES sales_orders(id)
                            ON DELETE RESTRICT,
    customer_id         INTEGER       NOT NULL
                            REFERENCES contacts(id)
                            ON DELETE RESTRICT,
    invoice_date        DATE          NOT NULL,
    due_date            DATE,
    total_amount        NUMERIC(14,2) NOT NULL CHECK (total_amount >= 0),
    amount_paid         NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
    payment_status      VARCHAR(20)   NOT NULL DEFAULT 'unpaid'
                            CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid')),
    notes               TEXT,
    created_at          TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_invoice_amount_paid CHECK (amount_paid <= total_amount)
);

CREATE TRIGGER trg_customer_invoices_updated_at
    BEFORE UPDATE ON customer_invoices
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 7. PAYMENTS
-- ============================================================
CREATE TABLE payments (
    id                      SERIAL PRIMARY KEY,
    payment_date            DATE          NOT NULL DEFAULT CURRENT_DATE,
    amount                  NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    method                  VARCHAR(10)   NOT NULL
                                CHECK (method IN ('cash', 'bank')),
    -- Exactly ONE of the two FKs below must be set
    vendor_bill_id          INTEGER       REFERENCES vendor_bills(id)      ON DELETE RESTRICT,
    customer_invoice_id     INTEGER       REFERENCES customer_invoices(id) ON DELETE RESTRICT,
    notes                   TEXT,
    created_by              INTEGER       REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_payment_source CHECK (
        (vendor_bill_id IS NOT NULL AND customer_invoice_id IS NULL) OR
        (vendor_bill_id IS NULL     AND customer_invoice_id IS NOT NULL)
    )
);

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
-- 8. JOURNAL ENTRIES & ITEMS (Core Accounting Engine)
-- ============================================================

-- 8.1 Journal Entry Header
CREATE TABLE journal_entries (
    id              SERIAL PRIMARY KEY,
    journal_id      INTEGER       NOT NULL
                        REFERENCES journals(id)
                        ON DELETE RESTRICT,
    entry_date      DATE          NOT NULL DEFAULT CURRENT_DATE,
    -- Reference to source document e.g. "VendorBill#12", "CustomerInvoice#7", "Payment#5"
    reference       VARCHAR(150)  NOT NULL,
    created_by      INTEGER       REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
    -- Journal entries are IMMUTABLE once posted; no updated_at intentionally
);


-- 8.2 Journal Entry Line Items (must always balance: SUM(debit) = SUM(credit) per entry)
CREATE TABLE journal_items (
    id                  SERIAL PRIMARY KEY,
    journal_entry_id    INTEGER       NOT NULL
                            REFERENCES journal_entries(id)
                            ON DELETE CASCADE,
    account_id          INTEGER       NOT NULL
                            REFERENCES chart_of_accounts(id)
                            ON DELETE RESTRICT,
    debit               NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (debit  >= 0),
    credit              NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (credit >= 0),
    description         TEXT,
    -- Each line is either a debit or a credit, never both
    CONSTRAINT chk_journal_item_side CHECK (
        (debit > 0 AND credit = 0) OR
        (credit > 0 AND debit = 0)
    )
);


-- ============================================================
-- 9. INDEXES
-- ============================================================
-- Contacts
CREATE INDEX idx_contacts_type       ON contacts(type);

-- Products
CREATE INDEX idx_products_category   ON products(category);

-- Chart of Accounts
CREATE INDEX idx_coa_account_type    ON chart_of_accounts(account_type);

-- Purchase Orders
CREATE INDEX idx_po_vendor           ON purchase_orders(vendor_id);
CREATE INDEX idx_po_status           ON purchase_orders(status);

-- Purchase Order Items
CREATE INDEX idx_poi_order           ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_poi_product         ON purchase_order_items(product_id);

-- Vendor Bills
CREATE INDEX idx_vb_vendor           ON vendor_bills(vendor_id);
CREATE INDEX idx_vb_po               ON vendor_bills(purchase_order_id);
CREATE INDEX idx_vb_payment_status   ON vendor_bills(payment_status);

-- Sales Orders
CREATE INDEX idx_so_customer         ON sales_orders(customer_id);
CREATE INDEX idx_so_status           ON sales_orders(status);

-- Sales Order Items
CREATE INDEX idx_soi_order           ON sales_order_items(sales_order_id);
CREATE INDEX idx_soi_product         ON sales_order_items(product_id);

-- Customer Invoices
CREATE INDEX idx_ci_customer         ON customer_invoices(customer_id);
CREATE INDEX idx_ci_so               ON customer_invoices(sales_order_id);
CREATE INDEX idx_ci_payment_status   ON customer_invoices(payment_status);

-- Payments
CREATE INDEX idx_pay_vb              ON payments(vendor_bill_id);
CREATE INDEX idx_pay_ci              ON payments(customer_invoice_id);
CREATE INDEX idx_pay_date            ON payments(payment_date);

-- Journal Entries & Items
CREATE INDEX idx_je_journal          ON journal_entries(journal_id);
CREATE INDEX idx_je_date             ON journal_entries(entry_date);
CREATE INDEX idx_ji_entry            ON journal_items(journal_entry_id);
CREATE INDEX idx_ji_account          ON journal_items(account_id);


-- ============================================================
-- 10. SEED DATA — Default Chart of Accounts
-- ============================================================
INSERT INTO chart_of_accounts (account_name, account_type) VALUES
    ('Cash',             'asset'),
    ('Bank',             'asset'),
    ('Debtors',          'asset'),
    ('Creditors',        'liability'),
    ('Owner Capital',    'capital'),
    ('Sale Income',      'income'),
    ('Purchase Expense', 'expense');


-- ============================================================
-- 11. SEED DATA — Default Journals
--     (run AFTER chart_of_accounts insert above)
-- ============================================================
INSERT INTO journals (name, type, default_account_id)
SELECT 'Sales Journal',    'sales',    id FROM chart_of_accounts WHERE account_name = 'Sale Income';

INSERT INTO journals (name, type, default_account_id)
SELECT 'Purchase Journal', 'purchase', id FROM chart_of_accounts WHERE account_name = 'Purchase Expense';

INSERT INTO journals (name, type, default_account_id)
SELECT 'Bank Journal',     'bank',     id FROM chart_of_accounts WHERE account_name = 'Bank';

INSERT INTO journals (name, type, default_account_id)
SELECT 'Cash Journal',     'cash',     id FROM chart_of_accounts WHERE account_name = 'Cash';


-- ============================================================
-- 12. SAMPLE REPORTING QUERIES (for reference / backend use)
-- ============================================================

-- 12.1 Balance Sheet (as of a given date)
-- Replace :as_of_date with an actual date, e.g. '2024-12-31'
/*
SELECT
    coa.account_type,
    coa.account_name,
    COALESCE(SUM(ji.debit), 0) - COALESCE(SUM(ji.credit), 0) AS balance
FROM chart_of_accounts coa
LEFT JOIN journal_items    ji  ON ji.account_id     = coa.id
LEFT JOIN journal_entries  je  ON je.id             = ji.journal_entry_id
WHERE coa.account_type IN ('asset', 'liability', 'capital')
  AND coa.is_archived = FALSE
  AND (je.entry_date <= :as_of_date OR je.entry_date IS NULL)
GROUP BY coa.account_type, coa.account_name
ORDER BY coa.account_type, coa.account_name;
*/


-- 12.2 Profit & Loss (for a date range)
-- Replace :period_start / :period_end with actual dates
/*
SELECT
    coa.account_type,
    coa.account_name,
    COALESCE(SUM(ji.credit), 0) - COALESCE(SUM(ji.debit), 0) AS amount
FROM chart_of_accounts coa
LEFT JOIN journal_items    ji  ON ji.account_id     = coa.id
LEFT JOIN journal_entries  je  ON je.id             = ji.journal_entry_id
WHERE coa.account_type IN ('income', 'expense')
  AND coa.is_archived = FALSE
  AND je.entry_date BETWEEN :period_start AND :period_end
GROUP BY coa.account_type, coa.account_name
ORDER BY coa.account_type, coa.account_name;
*/


-- 12.3 Example — Insert a balanced journal entry (Customer Invoice Rs.5,000)
/*
BEGIN;

INSERT INTO journal_entries (journal_id, entry_date, reference)
VALUES (
    (SELECT id FROM journals WHERE type = 'sales' LIMIT 1),
    CURRENT_DATE,
    'CustomerInvoice#7'
)
RETURNING id;  -- assume returned id = 101

INSERT INTO journal_items (journal_entry_id, account_id, debit, credit) VALUES
    (101, (SELECT id FROM chart_of_accounts WHERE account_name = 'Debtors'),     5000,    0),
    (101, (SELECT id FROM chart_of_accounts WHERE account_name = 'Sale Income'),    0, 5000);

COMMIT;
*/


-- 12.4 Example — Register a payment against a Vendor Bill (Rs.3,000 cash)
/*
BEGIN;

-- 1. Insert payment record
INSERT INTO payments (payment_date, amount, method, vendor_bill_id, created_by)
VALUES (CURRENT_DATE, 3000, 'cash', <vendor_bill_id>, <user_id>)
RETURNING id;  -- assume id = 55

-- 2. Update bill paid amount + status
UPDATE vendor_bills
SET
    amount_paid    = amount_paid + 3000,
    payment_status = CASE
        WHEN amount_paid + 3000 >= total_amount THEN 'paid'
        ELSE 'partially_paid'
    END
WHERE id = <vendor_bill_id>;

-- 3. Auto-generate balanced journal entry
INSERT INTO journal_entries (journal_id, entry_date, reference)
VALUES (
    (SELECT id FROM journals WHERE type = 'cash' LIMIT 1),
    CURRENT_DATE,
    'Payment#55'
)
RETURNING id;  -- assume id = 102

INSERT INTO journal_items (journal_entry_id, account_id, debit, credit) VALUES
    (102, (SELECT id FROM chart_of_accounts WHERE account_name = 'Creditors'), 3000,    0),
    (102, (SELECT id FROM chart_of_accounts WHERE account_name = 'Cash'),         0, 3000);

COMMIT;
*/
