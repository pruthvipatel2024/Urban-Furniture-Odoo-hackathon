const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  Contact,
  Product,
  ChartOfAccount,
  Journal,
  JournalEntry,
  JournalItem,
  AnalyticAccount,
  Budget,
} = require('../models');
const { ensureDatabaseExists } = require('../config/database');

async function seedDatabase() {
  try {
    // eslint-disable-next-line no-console
    console.log('[Seed] Ensuring database exists and tables are synchronized...');
    await ensureDatabaseExists();
    await sequelize.sync({ alter: false });

    // 1. Seed Chart of Accounts
    const defaultCoa = [
      { account_name: 'Cash', account_type: 'asset' },
      { account_name: 'Bank', account_type: 'asset' },
      { account_name: 'Debtors', account_type: 'asset' },
      { account_name: 'Creditors', account_type: 'liability' },
      { account_name: 'Owner Capital', account_type: 'capital' },
      { account_name: 'Sale Income', account_type: 'income' },
      { account_name: 'Purchase Expense', account_type: 'expense' },
    ];

    const coaMap = {};
    for (const item of defaultCoa) {
      let [acc] = await ChartOfAccount.findOrCreate({
        where: { account_name: item.account_name },
        defaults: item,
      });
      coaMap[item.account_name] = acc;
    }
    // eslint-disable-next-line no-console
    console.log('[Seed] Chart of Accounts verified/seeded.');

    // 2. Seed Journals
    const defaultJournals = [
      { name: 'Sales Journal', type: 'sales', default_account_id: coaMap['Sale Income']?.id },
      { name: 'Purchase Journal', type: 'purchase', default_account_id: coaMap['Purchase Expense']?.id },
      { name: 'Bank Journal', type: 'bank', default_account_id: coaMap['Bank']?.id },
      { name: 'Cash Journal', type: 'cash', default_account_id: coaMap['Cash']?.id },
    ];

    for (const j of defaultJournals) {
      await Journal.findOrCreate({
        where: { type: j.type },
        defaults: j,
      });
    }
    // eslint-disable-next-line no-console
    console.log('[Seed] Default Journals verified/seeded.');

    // 3. Seed Sample Contacts
    const [vendorRahul] = await Contact.findOrCreate({
      where: { email: 'rahul.sharma@azurefurniture.in' },
      defaults: {
        name: 'Rahul Sharma (Azure Furniture)',
        type: 'vendor',
        email: 'rahul.sharma@azurefurniture.in',
        mobile: '+91 98201 44552',
        address_city: 'Mumbai',
        address_state: 'Maharashtra',
        address_pincode: '400013',
        profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
    });

    const [customerNimesh] = await Contact.findOrCreate({
      where: { email: 'nimesh.pathak@techspace.io' },
      defaults: {
        name: 'Nimesh Pathak (TechSpace Corp)',
        type: 'customer',
        email: 'nimesh.pathak@techspace.io',
        mobile: '+91 98334 11223',
        address_city: 'Mumbai',
        address_state: 'Maharashtra',
        address_pincode: '400051',
        profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      },
    });

    // eslint-disable-next-line no-console
    console.log('[Seed] Default Contacts verified/seeded.');

    // 4. Seed Sample Products
    const defaultProducts = [
      {
        name: 'Executive Ergonomic Chair',
        type: 'goods',
        sales_price: 5000.0,
        cost_price: 3000.0,
        category: 'Office Seating',
        stock_quantity: 25.0,
      },
      {
        name: 'Solid Teak Work Desk (160x80)',
        type: 'goods',
        sales_price: 18000.0,
        cost_price: 11000.0,
        category: 'Desks & Tables',
        stock_quantity: 12.0,
      },
      {
        name: 'L-Shaped Velvet Sectional Sofa',
        type: 'goods',
        sales_price: 45000.0,
        cost_price: 28000.0,
        category: 'Living Room',
        stock_quantity: 8.0,
      },
      {
        name: 'Furniture Installation & Assembly',
        type: 'service',
        sales_price: 1500.0,
        cost_price: 500.0,
        category: 'Services',
        stock_quantity: 0,
      },
    ];

    for (const p of defaultProducts) {
      await Product.findOrCreate({
        where: { name: p.name },
        defaults: p,
      });
    }
    // eslint-disable-next-line no-console
    console.log('[Seed] Default Products verified/seeded.');

    // 5. Seed Users (Admin, Accountant, Contact)
    const salt = await bcrypt.genSalt(10);

    // Admin
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    await User.findOrCreate({
      where: { email: 'admin@urbanfurniture.com' },
      defaults: {
        name: 'Urban Admin',
        email: 'admin@urbanfurniture.com',
        password_hash: adminPasswordHash,
        role: 'admin',
        is_active: true,
      },
    });

    // Accountant
    const accountantPasswordHash = await bcrypt.hash('accountant123', salt);
    await User.findOrCreate({
      where: { email: 'accountant@urbanfurniture.com' },
      defaults: {
        name: 'Pooja Mehta (Lead Accountant)',
        email: 'accountant@urbanfurniture.com',
        password_hash: accountantPasswordHash,
        role: 'accountant',
        is_active: true,
      },
    });

    // Customer User
    const customerPasswordHash = await bcrypt.hash('contact123', salt);
    await User.findOrCreate({
      where: { email: 'nimesh.pathak@techspace.io' },
      defaults: {
        name: 'Nimesh Pathak',
        email: 'nimesh.pathak@techspace.io',
        password_hash: customerPasswordHash,
        role: 'contact',
        contact_id: customerNimesh.id,
        is_active: true,
      },
    });

    // eslint-disable-next-line no-console
    console.log('[Seed] Default Users created:');
    // eslint-disable-next-line no-console
    console.log('   - Admin: admin@urbanfurniture.com / admin123');
    // eslint-disable-next-line no-console
    console.log('   - Accountant: accountant@urbanfurniture.com / accountant123');
    // eslint-disable-next-line no-console
    console.log('   - Contact: nimesh.pathak@techspace.io / contact123');

    // 6. Seed Analytic Accounts & Budgets
    const [marketingAnalytic] = await AnalyticAccount.findOrCreate({
      where: { name: 'Operations & Procurement' },
      defaults: { name: 'Operations & Procurement', type: 'expense' },
    });

    await Budget.findOrCreate({
      where: { name: 'Q1 FY26 Furniture Procurement Budget' },
      defaults: {
        name: 'Q1 FY26 Furniture Procurement Budget',
        period_start: '2026-01-01',
        period_end: '2026-03-31',
        responsible_person: 'Rahul Sharma',
        planned_amount: 500000.0,
        analytic_account_id: marketingAnalytic.id,
      },
    });

    // 7. Seed Initial Capital & Liquidity Entry if not present
    const existingCapitalEntry = await JournalEntry.findOne({
      where: { reference: 'OPENING_BALANCE_FY26' },
    });

    const bankJournal = await Journal.findOne({ where: { type: 'bank' } });
    const cashAcc = coaMap['Cash'] || await ChartOfAccount.findOne({ where: { account_name: 'Cash' } });
    const bankAcc = coaMap['Bank'] || await ChartOfAccount.findOne({ where: { account_name: 'Bank' } });
    const capitalAcc = coaMap['Owner Capital'] || await ChartOfAccount.findOne({ where: { account_name: 'Owner Capital' } });

    if (!existingCapitalEntry) {
      if (bankJournal && cashAcc && bankAcc && capitalAcc) {
        const capitalEntry = await JournalEntry.create({
          journal_id: bankJournal.id,
          entry_date: '2026-01-01',
          reference: 'OPENING_BALANCE_FY26',
        });

        await JournalItem.bulkCreate([
          {
            journal_entry_id: capitalEntry.id,
            account_id: cashAcc.id,
            debit: 500000.0,
            credit: 0,
            description: 'Opening Cash Reserve',
          },
          {
            journal_entry_id: capitalEntry.id,
            account_id: bankAcc.id,
            debit: 1000000.0,
            credit: 0,
            description: 'Opening Bank Balance (HDFC Bank)',
          },
          {
            journal_entry_id: capitalEntry.id,
            account_id: capitalAcc.id,
            debit: 0,
            credit: 1500000.0,
            description: 'Initial Equity Contribution',
          },
        ]);
        // eslint-disable-next-line no-console
        console.log('[Seed] Initial Capital & Liquidity Entry created (Dr Cash ₹500k, Dr Bank ₹1M, Cr Equity ₹1.5M).');
      }
    } else if (cashAcc && bankAcc && capitalAcc) {
      // Ensure existing opening balance has adequate reserves
      await JournalItem.update({ debit: 500000.0 }, { where: { journal_entry_id: existingCapitalEntry.id, account_id: cashAcc.id } });
      await JournalItem.update({ debit: 1000000.0 }, { where: { journal_entry_id: existingCapitalEntry.id, account_id: bankAcc.id } });
      await JournalItem.update({ credit: 1500000.0 }, { where: { journal_entry_id: existingCapitalEntry.id, account_id: capitalAcc.id } });
    }

    // eslint-disable-next-line no-console
    console.log('[Seed] Database seeding completed successfully!');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Seed Error]:', err);
    throw err;
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedDatabase };
