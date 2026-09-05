-- ============================================================
--  URBAN FURNITURE — ACCOUNTING SYSTEM
--  MySQL Database Schema
--  Version : 1.2  (converted from PostgreSQL → MySQL)
--  Engine  : InnoDB (required for FK constraints & transactions)
--  Charset : utf8mb4 (full Unicode including emoji support)
-- ============================================================
-- Usage:
--   mysql -u <user> -p <dbname> < schema.sql
-- Or paste directly into MySQL Workbench / TablePlus query window.
--
-- Requirements: MySQL 8.0+ (for enforced CHECK constraints
--               and expression defaults like DEFAULT (CURDATE()))
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+05:30';
SET FOREIGN_KEY_CHECKS = 0;  -- disable during schema creation to allow forward-references


-- ============================================================
-- 2. USERS & ROLES
-- NOTE: MySQL DATETIME supports ON UPDATE CURRENT_TIMESTAMP
--       natively — no separate trigger function needed.
-- ============================================================
CREATE TABLE users (
    id              INT           NOT NULL AUTO_INCREMENT,
    name            VARCHAR(150)  NOT NULL,
    email           VARCHAR(150)  NOT NULL,
    password_hash   TEXT          NOT NULL,
    role            VARCHAR(20)   NOT NULL,
    contact_id      INT           DEFAULT NULL,  -- populated when role = 'contact'
    is_active       TINYINT(1)    NOT NULL DEFAULT 1,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uq_users_email  (email),
    CONSTRAINT chk_users_role CHECK (role IN ('admin', 'accountant', 'contact'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 3. MASTER DATA
-- ============================================================

-- 3.1 Contacts (Customers / Vendors / Both)
CREATE TABLE contacts (
    id                  INT           NOT NULL AUTO_INCREMENT,
    name                VARCHAR(150)  NOT NULL,
    type                VARCHAR(10)   NOT NULL,
    email               VARCHAR(150)  DEFAULT NULL,
    mobile              VARCHAR(20)   DEFAULT NULL,
    address_city        VARCHAR(100)  DEFAULT NULL,
    address_state       VARCHAR(100)  DEFAULT NULL,
    address_pincode     VARCHAR(20)   DEFAULT NULL,
    profile_image       TEXT          DEFAULT NULL,  -- URL or base-64 string
    is_archived         TINYINT(1)    NOT NULL DEFAULT 0,
    created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT chk_contacts_type CHECK (type IN ('customer', 'vendor', 'both'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FK: users -> contacts  (added here, after contacts table exists)
ALTER TABLE users
    ADD CONSTRAINT fk_users_contact
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
    ON DELETE SET NULL;


-- 3.2 Products
CREATE TABLE products (
    id              INT            NOT NULL AUTO_INCREMENT,
    name            VARCHAR(150)   NOT NULL,
    type            VARCHAR(10)    NOT NULL,
    sales_price     DECIMAL(12,2)  NOT NULL,
    cost_price      DECIMAL(12,2)  NOT NULL,
    category        VARCHAR(100)   DEFAULT NULL,
    stock_quantity  DECIMAL(10,2)  NOT NULL DEFAULT 0.00,  -- inventory tracking (stretch goal)
    is_archived     TINYINT(1)     NOT NULL DEFAULT 0,
    created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT chk_products_type       CHECK (type       IN ('goods', 'service', 'combo')),
    CONSTRAINT chk_products_sales_price CHECK (sales_price >= 0),
    CONSTRAINT chk_products_cost_price  CHECK (cost_price  >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 3.3 Chart of Accounts (CoA)
CREATE TABLE chart_of_accounts (
    id              INT           NOT NULL AUTO_INCREMENT,
    account_name    VARCHAR(150)  NOT NULL,
    account_type    VARCHAR(20)   NOT NULL,
    is_archived     TINYINT(1)    NOT NULL DEFAULT 0,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT chk_coa_account_type CHECK (account_type IN ('asset', 'liability', 'expense', 'income', 'capital'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 3.4 Journals
CREATE TABLE journals (
    id                  INT           NOT NULL AUTO_INCREMENT,
    name                VARCHAR(100)  NOT NULL,
    type                VARCHAR(20)   NOT NULL,
    default_account_id  INT           DEFAULT NULL,
    created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_journals_account  FOREIGN KEY (default_account_id) REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    CONSTRAINT chk_journals_type    CHECK (type IN ('sales', 'purchase', 'bank', 'cash'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 4. STRETCH-GOAL MASTER DATA
-- ============================================================

-- 4.1 Analytic Accounts
CREATE TABLE analytic_accounts (
    id              INT           NOT NULL AUTO_INCREMENT,
    name            VARCHAR(150)  NOT NULL,
    type            VARCHAR(10)   NOT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT chk_analytic_type CHECK (type IN ('income', 'expense'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 4.2 Budgets
CREATE TABLE budgets (
    id                      INT            NOT NULL AUTO_INCREMENT,
    name                    VARCHAR(150)   NOT NULL,
    period_start            DATE           NOT NULL,
    period_end              DATE           NOT NULL,
    responsible_person      VARCHAR(150)   DEFAULT NULL,
    planned_amount          DECIMAL(14,2)  NOT NULL,
    analytic_account_id     INT            DEFAULT NULL,
    created_at              DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_budgets_analytic   FOREIGN KEY (analytic_account_id) REFERENCES analytic_accounts(id) ON DELETE SET NULL,
    CONSTRAINT chk_budget_dates      CHECK (period_end >= period_start),
    CONSTRAINT chk_budget_planned    CHECK (planned_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 5. PURCHASE FLOW
-- ============================================================

-- 5.1 Purchase Orders
CREATE TABLE purchase_orders (
    id              INT           NOT NULL AUTO_INCREMENT,
    vendor_id       INT           NOT NULL,
    order_date      DATE          NOT NULL DEFAULT (CURDATE()),
    status          VARCHAR(20)   NOT NULL DEFAULT 'draft',
    notes           TEXT          DEFAULT NULL,
    created_by      INT           DEFAULT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_po_vendor     FOREIGN KEY (vendor_id)   REFERENCES contacts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_po_created_by FOREIGN KEY (created_by)  REFERENCES users(id)    ON DELETE SET NULL,
    CONSTRAINT chk_po_status    CHECK (status IN ('draft', 'confirmed', 'billed', 'cancelled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 5.2 Purchase Order Line Items
--     GENERATED ALWAYS AS ... STORED supported in MySQL 5.7+
CREATE TABLE purchase_order_items (
    id                  INT            NOT NULL AUTO_INCREMENT,
    purchase_order_id   INT            NOT NULL,
    product_id          INT            NOT NULL,
    quantity            DECIMAL(10,2)  NOT NULL,
    unit_price          DECIMAL(12,2)  NOT NULL,
    line_total          DECIMAL(14,2)  GENERATED ALWAYS AS (quantity * unit_price) STORED,
    PRIMARY KEY (id),
    CONSTRAINT fk_poi_order   FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_poi_product FOREIGN KEY (product_id)        REFERENCES products(id)        ON DELETE RESTRICT,
    CONSTRAINT chk_poi_qty    CHECK (quantity   > 0),
    CONSTRAINT chk_poi_price  CHECK (unit_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 5.3 Vendor Bills
CREATE TABLE vendor_bills (
    id                  INT            NOT NULL AUTO_INCREMENT,
    purchase_order_id   INT            NOT NULL,
    vendor_id           INT            NOT NULL,
    invoice_date        DATE           NOT NULL,
    due_date            DATE           DEFAULT NULL,
    total_amount        DECIMAL(14,2)  NOT NULL,
    amount_paid         DECIMAL(14,2)  NOT NULL DEFAULT 0.00,
    payment_status      VARCHAR(20)    NOT NULL DEFAULT 'unpaid',
    notes               TEXT           DEFAULT NULL,
    created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_vb_po             FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE RESTRICT,
    CONSTRAINT fk_vb_vendor         FOREIGN KEY (vendor_id)         REFERENCES contacts(id)        ON DELETE RESTRICT,
    CONSTRAINT chk_vb_status        CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid')),
    CONSTRAINT chk_vb_total         CHECK (total_amount  >= 0),
    CONSTRAINT chk_vb_paid          CHECK (amount_paid   >= 0),
    CONSTRAINT chk_vb_paid_lte_total CHECK (amount_paid  <= total_amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 6. SALES FLOW
-- ============================================================

-- 6.1 Sales Orders
CREATE TABLE sales_orders (
    id              INT           NOT NULL AUTO_INCREMENT,
    customer_id     INT           NOT NULL,
    order_date      DATE          NOT NULL DEFAULT (CURDATE()),
    status          VARCHAR(20)   NOT NULL DEFAULT 'draft',
    notes           TEXT          DEFAULT NULL,
    created_by      INT           DEFAULT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_so_customer    FOREIGN KEY (customer_id) REFERENCES contacts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_so_created_by  FOREIGN KEY (created_by)  REFERENCES users(id)    ON DELETE SET NULL,
    CONSTRAINT chk_so_status     CHECK (status IN ('draft', 'confirmed', 'invoiced', 'cancelled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 6.2 Sales Order Line Items
--     MySQL requires explicit DECIMAL cast for division to avoid integer truncation
CREATE TABLE sales_order_items (
    id                  INT            NOT NULL AUTO_INCREMENT,
    sales_order_id      INT            NOT NULL,
    product_id          INT            NOT NULL,
    quantity            DECIMAL(10,2)  NOT NULL,
    unit_price          DECIMAL(12,2)  NOT NULL,
    tax_percent         DECIMAL(5,2)   NOT NULL DEFAULT 0.00,
    line_total          DECIMAL(14,2)  GENERATED ALWAYS AS
                            (quantity * unit_price * (1 + tax_percent / 100.0)) STORED,
    PRIMARY KEY (id),
    CONSTRAINT fk_soi_order   FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_soi_product FOREIGN KEY (product_id)     REFERENCES products(id)     ON DELETE RESTRICT,
    CONSTRAINT chk_soi_qty    CHECK (quantity    > 0),
    CONSTRAINT chk_soi_price  CHECK (unit_price  >= 0),
    CONSTRAINT chk_soi_tax    CHECK (tax_percent >= 0 AND tax_percent <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 6.3 Customer Invoices
CREATE TABLE customer_invoices (
    id                  INT            NOT NULL AUTO_INCREMENT,
    sales_order_id      INT            NOT NULL,
    customer_id         INT            NOT NULL,
    invoice_date        DATE           NOT NULL,
    due_date            DATE           DEFAULT NULL,
    total_amount        DECIMAL(14,2)  NOT NULL,
    amount_paid         DECIMAL(14,2)  NOT NULL DEFAULT 0.00,
    payment_status      VARCHAR(20)    NOT NULL DEFAULT 'unpaid',
    notes               TEXT           DEFAULT NULL,
    created_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_ci_so              FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE RESTRICT,
    CONSTRAINT fk_ci_customer        FOREIGN KEY (customer_id)    REFERENCES contacts(id)     ON DELETE RESTRICT,
    CONSTRAINT chk_ci_status         CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid')),
    CONSTRAINT chk_ci_total          CHECK (total_amount  >= 0),
    CONSTRAINT chk_ci_paid           CHECK (amount_paid   >= 0),
    CONSTRAINT chk_ci_paid_lte_total CHECK (amount_paid   <= total_amount)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 7. PAYMENTS
-- ============================================================
CREATE TABLE payments (
    id                      INT            NOT NULL AUTO_INCREMENT,
    payment_date            DATE           NOT NULL DEFAULT (CURDATE()),
    amount                  DECIMAL(14,2)  NOT NULL,
    method                  VARCHAR(10)    NOT NULL,
    -- Exactly ONE of the two FKs below must be set
    vendor_bill_id          INT            DEFAULT NULL,
    customer_invoice_id     INT            DEFAULT NULL,
    notes                   TEXT           DEFAULT NULL,
    created_by              INT            DEFAULT NULL,
    created_at              DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_pay_vb         FOREIGN KEY (vendor_bill_id)      REFERENCES vendor_bills(id)      ON DELETE RESTRICT,
    CONSTRAINT fk_pay_ci         FOREIGN KEY (customer_invoice_id) REFERENCES customer_invoices(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pay_created_by FOREIGN KEY (created_by)          REFERENCES users(id)             ON DELETE SET NULL,
    CONSTRAINT chk_pay_method    CHECK (method IN ('cash', 'bank')),
    CONSTRAINT chk_pay_amount    CHECK (amount > 0),
    -- Exactly one source document
    CONSTRAINT chk_pay_source    CHECK (
        (vendor_bill_id IS NOT NULL AND customer_invoice_id IS NULL) OR
        (vendor_bill_id IS NULL     AND customer_invoice_id IS NOT NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 8. JOURNAL ENTRIES & ITEMS (Core Accounting Engine)
-- ============================================================

-- 8.1 Journal Entry Header
--     IMMUTABLE once posted — no updated_at column intentionally
CREATE TABLE journal_entries (
    id              INT           NOT NULL AUTO_INCREMENT,
    journal_id      INT           NOT NULL,
    entry_date      DATE          NOT NULL DEFAULT (CURDATE()),
    -- Reference to source document e.g. 'VendorBill#12', 'CustomerInvoice#7', 'Payment#5'
    reference       VARCHAR(150)  NOT NULL,
    created_by      INT           DEFAULT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_je_journal    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE RESTRICT,
    CONSTRAINT fk_je_created_by FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 8.2 Journal Entry Line Items
--     Business rule: SUM(debit) must equal SUM(credit) per journal_entry_id
--     (enforced at application layer — MySQL cannot enforce aggregate checks natively)
CREATE TABLE journal_items (
    id                  INT            NOT NULL AUTO_INCREMENT,
    journal_entry_id    INT            NOT NULL,
    account_id          INT            NOT NULL,
    debit               DECIMAL(14,2)  NOT NULL DEFAULT 0.00,
    credit              DECIMAL(14,2)  NOT NULL DEFAULT 0.00,
    description         TEXT           DEFAULT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_ji_entry   FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)    ON DELETE CASCADE,
    CONSTRAINT fk_ji_account FOREIGN KEY (account_id)       REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
    -- Each line is either a debit or a credit, never both
    CONSTRAINT chk_ji_debit  CHECK (debit  >= 0),
    CONSTRAINT chk_ji_credit CHECK (credit >= 0),
    CONSTRAINT chk_ji_side   CHECK (
        (debit > 0 AND credit = 0) OR
        (credit > 0 AND debit = 0)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 9. INDEXES
-- ============================================================
-- Contacts
CREATE INDEX idx_contacts_type        ON contacts(type);

-- Products
CREATE INDEX idx_products_category    ON products(category);

-- Chart of Accounts
CREATE INDEX idx_coa_account_type     ON chart_of_accounts(account_type);

-- Purchase Orders
CREATE INDEX idx_po_vendor            ON purchase_orders(vendor_id);
CREATE INDEX idx_po_status            ON purchase_orders(status);

-- Purchase Order Items
CREATE INDEX idx_poi_order            ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_poi_product          ON purchase_order_items(product_id);

-- Vendor Bills
CREATE INDEX idx_vb_vendor            ON vendor_bills(vendor_id);
CREATE INDEX idx_vb_po                ON vendor_bills(purchase_order_id);
CREATE INDEX idx_vb_payment_status    ON vendor_bills(payment_status);

-- Sales Orders
CREATE INDEX idx_so_customer          ON sales_orders(customer_id);
CREATE INDEX idx_so_status            ON sales_orders(status);

-- Sales Order Items
CREATE INDEX idx_soi_order            ON sales_order_items(sales_order_id);
CREATE INDEX idx_soi_product          ON sales_order_items(product_id);

-- Customer Invoices
CREATE INDEX idx_ci_customer          ON customer_invoices(customer_id);
CREATE INDEX idx_ci_so                ON customer_invoices(sales_order_id);
CREATE INDEX idx_ci_payment_status    ON customer_invoices(payment_status);

-- Payments
CREATE INDEX idx_pay_vb               ON payments(vendor_bill_id);
CREATE INDEX idx_pay_ci               ON payments(customer_invoice_id);
CREATE INDEX idx_pay_date             ON payments(payment_date);

-- Journal Entries & Items
CREATE INDEX idx_je_journal           ON journal_entries(journal_id);
CREATE INDEX idx_je_date              ON journal_entries(entry_date);
CREATE INDEX idx_ji_entry             ON journal_items(journal_entry_id);
CREATE INDEX idx_ji_account           ON journal_items(account_id);


SET FOREIGN_KEY_CHECKS = 1;  -- re-enable FK checks


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
--     (runs AFTER chart_of_accounts insert above)
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
--     Note: MySQL uses ? for positional params in prepared stmts
--           or named params via your ORM/driver.
-- ============================================================

-- 12.1 Balance Sheet (as of a given date)
-- Replace '2024-12-31' with your target date
/*
SELECT
    coa.account_type,
    coa.account_name,
    COALESCE(SUM(ji.debit), 0) - COALESCE(SUM(ji.credit), 0) AS balance
FROM chart_of_accounts coa
LEFT JOIN journal_items    ji  ON ji.account_id     = coa.id
LEFT JOIN journal_entries  je  ON je.id             = ji.journal_entry_id
WHERE coa.account_type IN ('asset', 'liability', 'capital')
  AND coa.is_archived = 0
  AND (je.entry_date <= '2024-12-31' OR je.entry_date IS NULL)
GROUP BY coa.account_type, coa.account_name
ORDER BY coa.account_type, coa.account_name;
*/


-- 12.2 Profit & Loss (for a date range)
-- Replace '2024-01-01' and '2024-12-31' with your period
/*
SELECT
    coa.account_type,
    coa.account_name,
    COALESCE(SUM(ji.credit), 0) - COALESCE(SUM(ji.debit), 0) AS amount
FROM chart_of_accounts coa
LEFT JOIN journal_items    ji  ON ji.account_id     = coa.id
LEFT JOIN journal_entries  je  ON je.id             = ji.journal_entry_id
WHERE coa.account_type IN ('income', 'expense')
  AND coa.is_archived = 0
  AND je.entry_date BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY coa.account_type, coa.account_name
ORDER BY coa.account_type, coa.account_name;
*/


-- 12.3 Example — Insert a balanced journal entry (Customer Invoice Rs.5,000)
--     MySQL does NOT support RETURNING; use LAST_INSERT_ID() instead
/*
START TRANSACTION;

INSERT INTO journal_entries (journal_id, entry_date, reference)
VALUES (
    (SELECT id FROM journals WHERE type = 'sales' LIMIT 1),
    CURDATE(),
    'CustomerInvoice#7'
);

SET @je_id = LAST_INSERT_ID();  -- capture the generated journal_entry id

INSERT INTO journal_items (journal_entry_id, account_id, debit, credit) VALUES
    (@je_id, (SELECT id FROM chart_of_accounts WHERE account_name = 'Debtors'),     5000, 0),
    (@je_id, (SELECT id FROM chart_of_accounts WHERE account_name = 'Sale Income'),    0, 5000);

COMMIT;
*/


-- 12.4 Example — Register a payment against a Vendor Bill (Rs.3,000 cash)
/*
START TRANSACTION;

-- 1. Insert payment record
INSERT INTO payments (payment_date, amount, method, vendor_bill_id, created_by)
VALUES (CURDATE(), 3000, 'cash', <vendor_bill_id>, <user_id>);

SET @payment_id = LAST_INSERT_ID();

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
    CURDATE(),
    CONCAT('Payment#', @payment_id)
);

SET @je_id = LAST_INSERT_ID();

INSERT INTO journal_items (journal_entry_id, account_id, debit, credit) VALUES
    (@je_id, (SELECT id FROM chart_of_accounts WHERE account_name = 'Creditors'), 3000,    0),
    (@je_id, (SELECT id FROM chart_of_accounts WHERE account_name = 'Cash'),         0, 3000);

COMMIT;
*/
