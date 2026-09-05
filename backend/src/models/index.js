const { sequelize } = require('../config/database');
const User = require('./User');
const Contact = require('./Contact');
const Product = require('./Product');
const ChartOfAccount = require('./ChartOfAccount');
const Journal = require('./Journal');
const AnalyticAccount = require('./AnalyticAccount');
const Budget = require('./Budget');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderItem = require('./PurchaseOrderItem');
const VendorBill = require('./VendorBill');
const SalesOrder = require('./SalesOrder');
const SalesOrderItem = require('./SalesOrderItem');
const CustomerInvoice = require('./CustomerInvoice');
const Payment = require('./Payment');
const JournalEntry = require('./JournalEntry');
const JournalItem = require('./JournalItem');
const AuditLog = require('./AuditLog');

// 1. Users & Contacts
User.belongsTo(Contact, { foreignKey: 'contact_id', as: 'contact' });
Contact.hasMany(User, { foreignKey: 'contact_id', as: 'users' });

// 2. Chart of Accounts & Journals
Journal.belongsTo(ChartOfAccount, { foreignKey: 'default_account_id', as: 'defaultAccount' });
ChartOfAccount.hasMany(Journal, { foreignKey: 'default_account_id', as: 'journals' });

// 3. Analytic Accounts & Budgets
Budget.belongsTo(AnalyticAccount, { foreignKey: 'analytic_account_id', as: 'analyticAccount' });
AnalyticAccount.hasMany(Budget, { foreignKey: 'analytic_account_id', as: 'budgets' });

// 4. Purchase Flow Associations
PurchaseOrder.belongsTo(Contact, { foreignKey: 'vendor_id', as: 'vendor' });
Contact.hasMany(PurchaseOrder, { foreignKey: 'vendor_id', as: 'purchaseOrders' });

PurchaseOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchase_order_id', as: 'items', onDelete: 'CASCADE' });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });

PurchaseOrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(PurchaseOrderItem, { foreignKey: 'product_id', as: 'purchaseOrderItems' });

VendorBill.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });
PurchaseOrder.hasOne(VendorBill, { foreignKey: 'purchase_order_id', as: 'vendorBill' });

VendorBill.belongsTo(Contact, { foreignKey: 'vendor_id', as: 'vendor' });
Contact.hasMany(VendorBill, { foreignKey: 'vendor_id', as: 'vendorBills' });

// 5. Sales Flow Associations
SalesOrder.belongsTo(Contact, { foreignKey: 'customer_id', as: 'customer' });
Contact.hasMany(SalesOrder, { foreignKey: 'customer_id', as: 'salesOrders' });

SalesOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
SalesOrder.hasMany(SalesOrderItem, { foreignKey: 'sales_order_id', as: 'items', onDelete: 'CASCADE' });
SalesOrderItem.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'salesOrder' });

SalesOrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(SalesOrderItem, { foreignKey: 'product_id', as: 'salesOrderItems' });

CustomerInvoice.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'salesOrder' });
SalesOrder.hasOne(CustomerInvoice, { foreignKey: 'sales_order_id', as: 'invoice' });

CustomerInvoice.belongsTo(Contact, { foreignKey: 'customer_id', as: 'customer' });
Contact.hasMany(CustomerInvoice, { foreignKey: 'customer_id', as: 'invoices' });

// 6. Payments Associations
Payment.belongsTo(VendorBill, { foreignKey: 'vendor_bill_id', as: 'vendorBill' });
VendorBill.hasMany(Payment, { foreignKey: 'vendor_bill_id', as: 'payments' });

Payment.belongsTo(CustomerInvoice, { foreignKey: 'customer_invoice_id', as: 'customerInvoice' });
CustomerInvoice.hasMany(Payment, { foreignKey: 'customer_invoice_id', as: 'payments' });

Payment.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// 7. Core Accounting Engine: Journal Entries & Items
JournalEntry.belongsTo(Journal, { foreignKey: 'journal_id', as: 'journal' });
Journal.hasMany(JournalEntry, { foreignKey: 'journal_id', as: 'entries' });

JournalEntry.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

JournalEntry.hasMany(JournalItem, { foreignKey: 'journal_entry_id', as: 'items', onDelete: 'CASCADE' });
JournalItem.belongsTo(JournalEntry, { foreignKey: 'journal_entry_id', as: 'journalEntry' });

JournalItem.belongsTo(ChartOfAccount, { foreignKey: 'account_id', as: 'account' });
ChartOfAccount.hasMany(JournalItem, { foreignKey: 'account_id', as: 'journalItems' });

// 8. Audit Trail
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Contact,
  Product,
  ChartOfAccount,
  Journal,
  AnalyticAccount,
  Budget,
  PurchaseOrder,
  PurchaseOrderItem,
  VendorBill,
  SalesOrder,
  SalesOrderItem,
  CustomerInvoice,
  Payment,
  JournalEntry,
  JournalItem,
  AuditLog,
};
