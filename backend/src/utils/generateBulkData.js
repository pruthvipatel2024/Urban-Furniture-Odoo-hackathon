const { sequelize, Contact, Product, AnalyticAccount, SalesOrder, SalesOrderItem, PurchaseOrder, PurchaseOrderItem, CustomerInvoice, VendorBill, User } = require('../models');
const { add, multiply, round } = require('./decimal');

async function generateBulkData() {
  console.log('====================================================');
  console.log('   Urban Furniture ERP — Diverse Real Data Seeder   ');
  console.log('====================================================');

  const t = await sequelize.transaction();

  try {
    const adminUser = await User.findOne({ where: { role: 'admin' }, transaction: t });
    const adminId = adminUser ? adminUser.id : 1;

    // 1. Ensure Analytic Accounts
    const analyticAccountsData = [
      { name: 'Operations & Procurement', type: 'expense' },
      { name: 'Corporate Fitout Projects', type: 'income' },
      { name: 'Hospitality & Luxury Suites', type: 'income' },
      { name: 'Retail & Showroom Sales', type: 'income' },
      { name: 'Warehouse & Logistics', type: 'expense' }
    ];

    const analyticAccounts = [];
    for (const aa of analyticAccountsData) {
      let [acc] = await AnalyticAccount.findOrCreate({
        where: { name: aa.name },
        defaults: { type: aa.type },
        transaction: t
      });
      analyticAccounts.push(acc);
    }

    // 2. Comprehensive Realistic Vendors (30 Distinct Suppliers & Mills)
    const vendorTemplates = [
      { name: 'Timber Kraft Woods Ltd.', email: 'procurement@timberkraft.in', mobile: '+91 98201 11223', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
      { name: 'Godrej Matrix Metal Supplies', email: 'sales@godrejmatrix.com', mobile: '+91 98334 22334', city: 'Mumbai', state: 'Maharashtra', pincode: '400079' },
      { name: 'Nilkamal Polymer & Upholstery', email: 'orders@nilkamalpolymers.in', mobile: '+91 97245 33445', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009' },
      { name: 'Featherlite Hardware & Fixtures', email: 'hardware@featherlite.co.in', mobile: '+91 94440 44556', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
      { name: 'Century Plywood & Laminates', email: 'b2b@centuryply.in', mobile: '+91 93310 55667', city: 'Kolkata', state: 'West Bengal', pincode: '700001' },
      { name: 'Asian Paints Coating Solutions', email: 'finishes@asiancoatings.com', mobile: '+91 98220 66778', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
      { name: 'Greenpanel Industries', email: 'orders@greenpanelwoods.in', mobile: '+91 98110 77889', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
      { name: 'Sleek Hardware Importers', email: 'imports@sleekhardware.in', mobile: '+91 98490 88990', city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
      { name: 'Kurl-on Foam & Cushioning', email: 'industrial@kurlonfoam.com', mobile: '+91 98450 99001', city: 'Bengaluru', state: 'Karnataka', pincode: '560025' },
      { name: 'Stanley Foam & Leatherette', email: 'sales@stanleyleather.in', mobile: '+91 98250 12345', city: 'Surat', state: 'Gujarat', pincode: '395001' },
      { name: 'Royal Oak Assembly Parts', email: 'spares@royaloakparts.in', mobile: '+91 94140 23456', city: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
      { name: 'Durian Raw Veneers', email: 'veneers@durianwoods.com', mobile: '+91 98980 34567', city: 'Vadodara', state: 'Gujarat', pincode: '390001' },
      { name: 'Jindal Stainless Steel Sheets', email: 'b2b@jindalstainless.in', mobile: '+91 98120 45678', city: 'Hisar', state: 'Haryana', pincode: '125001' },
      { name: 'Hettich Kitchen & Drawer Runners', email: 'sales@hettichhardware.in', mobile: '+91 98260 56789', city: 'Vadodara', state: 'Gujarat', pincode: '390010' },
      { name: 'Merino Laminates & Surfaces', email: 'orders@merinolaminates.com', mobile: '+91 98101 67890', city: 'Hapur', state: 'Uttar Pradesh', pincode: '245101' },
      { name: 'Bloomfield Engineered Timber', email: 'timber@bloomfieldwoods.in', mobile: '+91 94470 78901', city: 'Kozhikode', state: 'Kerala', pincode: '673001' },
      { name: 'Supreme Moulded Polymers', email: 'industrial@supremepolymers.in', mobile: '+91 98231 89012', city: 'Jalgaon', state: 'Maharashtra', pincode: '425001' },
      { name: 'Hafele Architectural Hardware', email: 'supplies@hafeleindia.in', mobile: '+91 98202 90123', city: 'Mumbai', state: 'Maharashtra', pincode: '400093' },
      { name: 'Sleepwell High-Density PU Foam', email: 'commercial@sleepwellfoam.in', mobile: '+91 98111 01234', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
      { name: 'Saint-Gobain Toughened Glass', email: 'orders@saintgobainglass.in', mobile: '+91 94441 12345', city: 'Sriperumbudur', state: 'Tamil Nadu', pincode: '602105' },
      { name: 'D Decor Upholstery Fabrics', email: 'textiles@ddecorfabrics.com', mobile: '+91 98221 23456', city: 'Tarapur', state: 'Maharashtra', pincode: '401506' },
      { name: 'Action TESA Particle Boards', email: 'boards@actiontesa.in', mobile: '+91 98130 34567', city: 'Sitarganj', state: 'Uttarakhand', pincode: '262405' },
      { name: 'Hindware Powder Coatings', email: 'finishes@hindwarecoatings.in', mobile: '+91 98121 45678', city: 'Bahadurgarh', state: 'Haryana', pincode: '124507' },
      { name: 'Ebony Teak Timber Loggers', email: 'logs@ebonyteak.in', mobile: '+91 98270 56789', city: 'Jabalpur', state: 'Madhya Pradesh', pincode: '482001' },
      { name: 'Ebco Hardware & Drawer Slides', email: 'hardware@ebcoslides.in', mobile: '+91 98203 67890', city: 'Vasai', state: 'Maharashtra', pincode: '401208' },
      { name: 'Century MDF & Pre-Lam Mills', email: 'mdf@centurypanel.in', mobile: '+91 94451 78901', city: 'Chennai', state: 'Tamil Nadu', pincode: '600018' },
      { name: 'Kaff Industrial Fasteners', email: 'fasteners@kaffhardware.in', mobile: '+91 98181 89012', city: 'Gurugram', state: 'Haryana', pincode: '122018' },
      { name: 'Armstrong Ceiling & Acoustic Panels', email: 'acoustics@armstrongpanels.in', mobile: '+91 98222 90123', city: 'Pune', state: 'Maharashtra', pincode: '411014' },
      { name: 'Rajasthan Marble Tops & Surfaces', email: 'stones@makranamarbles.in', mobile: '+91 94141 01234', city: 'Makrana', state: 'Rajasthan', pincode: '341505' },
      { name: 'Ozone Glass Hardware & Fittings', email: 'fittings@ozonehardware.in', mobile: '+91 98102 12345', city: 'New Delhi', state: 'Delhi', pincode: '110020' },
    ];

    const vendors = [];
    for (const v of vendorTemplates) {
      const [contact] = await Contact.findOrCreate({
        where: { email: v.email },
        defaults: {
          name: v.name,
          type: 'vendor',
          mobile: v.mobile,
          address_city: v.city,
          address_state: v.state,
          address_pincode: v.pincode,
          is_archived: false,
        },
        transaction: t,
      });
      vendors.push(contact);
    }
    console.log(`[OK] Verified / Seeded ${vendors.length} Unique Vendors.`);

    // 3. Comprehensive Realistic Customers (40 Distinct Clients, Studios, & Companies)
    const customerTemplates = [
      { name: 'TechCorp Co-working Spaces', email: 'facilities@techcorp.io', mobile: '+91 98800 11221', city: 'Bengaluru', state: 'Karnataka', pincode: '560100' },
      { name: 'Nexus Global IT Hub', email: 'infrastructure@nexusglobal.com', mobile: '+91 98480 22332', city: 'Hyderabad', state: 'Telangana', pincode: '500081' },
      { name: 'Horizon Architects & Interiors', email: 'projects@horizonstudio.in', mobile: '+91 98200 33443', city: 'Mumbai', state: 'Maharashtra', pincode: '400051' },
      { name: 'Apex Luxury Living Suites', email: 'hospitality@apexluxury.com', mobile: '+91 98100 44554', city: 'New Delhi', state: 'Delhi', pincode: '110016' },
      { name: 'CyberCity Tech Solutions', email: 'admin@cybercitytech.in', mobile: '+91 98230 55665', city: 'Pune', state: 'Maharashtra', pincode: '411057' },
      { name: 'Skylark Coworking Networks', email: 'workspaces@skylarkcowork.com', mobile: '+91 98180 66776', city: 'Gurugram', state: 'Haryana', pincode: '122002' },
      { name: 'Zen Spaces Interior Studio', email: 'design@zenspaces.in', mobile: '+91 98240 77887', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
      { name: 'BlueStone FinTech Campus', email: 'operations@bluestonefin.io', mobile: '+91 94450 88998', city: 'Chennai', state: 'Tamil Nadu', pincode: '600096' },
      { name: 'Trident Commercial Realty', email: 'developments@tridentrealty.in', mobile: '+91 93300 99009', city: 'Kolkata', state: 'West Bengal', pincode: '700091' },
      { name: 'Oasis Wellness & Spa Resorts', email: 'estates@oasisresorts.com', mobile: '+91 98221 12340', city: 'Panaji', state: 'Goa', pincode: '403001' },
      { name: 'Vantage Media Studios', email: 'production@vantagestudios.in', mobile: '+91 98112 23451', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
      { name: 'Stellar Academic University', email: 'procurement@stellaruni.edu.in', mobile: '+91 98720 34562', city: 'Chandigarh', state: 'Punjab', pincode: '160017' },
      { name: 'Meridian Healthcare Clinics', email: 'facilities@meridianhealth.in', mobile: '+91 98260 45673', city: 'Indore', state: 'Madhya Pradesh', pincode: '452001' },
      { name: 'Prism Cloud Technologies', email: 'infra@prismcloud.tech', mobile: '+91 94470 56784', city: 'Kochi', state: 'Kerala', pincode: '682030' },
      { name: 'DLF CyberPark Corporate Wing', email: 'realestate@dlfcyberpark.in', mobile: '+91 98103 67895', city: 'Gurugram', state: 'Haryana', pincode: '122008' },
      { name: 'Infosys Development Campus', email: 'procurement@infosyscampus.com', mobile: '+91 98801 78906', city: 'Mysuru', state: 'Karnataka', pincode: '570027' },
      { name: 'Oberoi Realty Executive Lounge', email: 'hospitality@oberoirealty.in', mobile: '+91 98204 89017', city: 'Mumbai', state: 'Maharashtra', pincode: '400063' },
      { name: 'TCS Innovation Hub Tower', email: 'facilities@tcstower.com', mobile: '+91 98251 90128', city: 'Gandhinagar', state: 'Gujarat', pincode: '382007' },
      { name: 'Marriott Heritage Boutique Suites', email: 'estates@marriottheritage.in', mobile: '+91 94142 01239', city: 'Jaipur', state: 'Rajasthan', pincode: '302005' },
      { name: 'WeWork Prime Spaces', email: 'admin@weworkspaces.in', mobile: '+91 98802 12340', city: 'Bengaluru', state: 'Karnataka', pincode: '560066' },
      { name: 'Zomato Operations Central', email: 'workspaces@zomatocentral.io', mobile: '+91 98182 23451', city: 'Gurugram', state: 'Haryana', pincode: '122001' },
      { name: 'Apollo Medical Research Institute', email: 'infra@apolloresearch.in', mobile: '+91 98481 34562', city: 'Hyderabad', state: 'Telangana', pincode: '500033' },
      { name: 'Reliance Retail Corporate Tower', email: 'facilities@relianceretail.com', mobile: '+91 98205 45673', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400701' },
      { name: 'Mahindra Logistics Park', email: 'operations@mahindralogistics.in', mobile: '+91 98223 56784', city: 'Pune', state: 'Maharashtra', pincode: '410501' },
      { name: 'Byjus Creative Studios', email: 'procurement@byjustechnology.in', mobile: '+91 98803 67895', city: 'Bengaluru', state: 'Karnataka', pincode: '560034' },
      { name: 'Taj Coromandel Executive Wing', email: 'concierge@tajcoromandel.in', mobile: '+91 94442 78906', city: 'Chennai', state: 'Tamil Nadu', pincode: '600034' },
      { name: 'Godrej Signature Properties', email: 'spaces@godrejsignature.in', mobile: '+91 98206 89017', city: 'Thane', state: 'Maharashtra', pincode: '400607' },
      { name: 'Ashoka University Design School', email: 'admin@ashokaeducation.edu.in', mobile: '+91 98122 90128', city: 'Sonipat', state: 'Haryana', pincode: '131029' },
      { name: 'KPMG Advisory BKC Headquarters', email: 'workplace@kpmgbkc.com', mobile: '+91 98207 01239', city: 'Mumbai', state: 'Maharashtra', pincode: '400051' },
      { name: 'Adobe R&D Innovation Campus', email: 'facilities@adobelabs.in', mobile: '+91 98113 12340', city: 'Noida', state: 'Uttar Pradesh', pincode: '201305' },
      { name: 'Flipkart Logistics Fulfillment Office', email: 'admin@flipkartsupply.in', mobile: '+91 98208 23451', city: 'Bhiwandi', state: 'Maharashtra', pincode: '421302' },
      { name: 'Paytm Fintech Headquarters', email: 'infrastructure@paytmfirm.in', mobile: '+91 98183 34562', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
      { name: 'Swiggy Corporate Hub', email: 'spaces@swiggyhq.io', mobile: '+91 98804 45673', city: 'Bengaluru', state: 'Karnataka', pincode: '560095' },
      { name: 'HDFC Capital Towers', email: 'estates@hdfctowers.in', mobile: '+91 98209 56784', city: 'Mumbai', state: 'Maharashtra', pincode: '400013' },
      { name: 'L&T Metro Rail Corporate Station', email: 'procurement@ltmetrorail.in', mobile: '+91 98482 67895', city: 'Hyderabad', state: 'Telangana', pincode: '500038' },
      { name: 'ITC Grand Hospitality Chola', email: 'projects@itchospitality.in', mobile: '+91 94443 78906', city: 'Chennai', state: 'Tamil Nadu', pincode: '600032' },
      { name: 'Dr Reddys Global Research Lab', email: 'facilities@drreddyslab.in', mobile: '+91 98483 89017', city: 'Hyderabad', state: 'Telangana', pincode: '500034' },
      { name: 'Nykaa Retail Flagship Experience', email: 'storeops@nykaaretail.in', mobile: '+91 98104 90128', city: 'New Delhi', state: 'Delhi', pincode: '110049' },
      { name: 'Zerodha Financial Tech Hub', email: 'operations@zerodhaspaces.in', mobile: '+91 98805 01239', city: 'Bengaluru', state: 'Karnataka', pincode: '560078' },
      { name: 'Mindtree Global Village Office', email: 'infra@mindtreevillage.com', mobile: '+91 98806 12340', city: 'Bengaluru', state: 'Karnataka', pincode: '560059' },
    ];

    const customers = [];
    for (const c of customerTemplates) {
      const [contact] = await Contact.findOrCreate({
        where: { email: c.email },
        defaults: {
          name: c.name,
          type: 'customer',
          mobile: c.mobile,
          address_city: c.city,
          address_state: c.state,
          address_pincode: c.pincode,
          is_archived: false,
        },
        transaction: t,
      });
      customers.push(contact);
    }
    console.log(`[OK] Verified / Seeded ${customers.length} Unique Customers.`);

    // 4. Products Catalog Expansion (30 Diverse Products)
    const productCatalog = [
      { name: 'Executive Ergonomic Chair', type: 'goods', sales_price: 5000, cost_price: 3000, category: 'Chairs', stock_quantity: 45 },
      { name: 'Solid Teak Work Desk (160x80)', type: 'goods', sales_price: 18000, cost_price: 11000, category: 'Desks', stock_quantity: 28 },
      { name: 'L-Shaped Velvet Sectional Sofa', type: 'goods', sales_price: 45000, cost_price: 28000, category: 'Sofas', stock_quantity: 15 },
      { name: 'Furniture Installation & Assembly', type: 'service', sales_price: 1500, cost_price: 500, category: 'Services', stock_quantity: 999 },
      { name: 'Minimalist Oak Coffee Table', type: 'goods', sales_price: 8500, cost_price: 5200, category: 'Tables', stock_quantity: 34 },
      { name: 'Ergonomic Mesh Task Chair', type: 'goods', sales_price: 7200, cost_price: 4500, category: 'Chairs', stock_quantity: 50 },
      { name: '6-Seater Walnut Dining Table', type: 'goods', sales_price: 32000, cost_price: 20000, category: 'Tables', stock_quantity: 20 },
      { name: 'Industrial Steel Bookcase', type: 'goods', sales_price: 12500, cost_price: 7800, category: 'Storage', stock_quantity: 38 },
      { name: 'Acoustic Office Privacy Pod', type: 'goods', sales_price: 85000, cost_price: 54000, category: 'Workspaces', stock_quantity: 8 },
      { name: 'Motorized Standing Desk', type: 'goods', sales_price: 26000, cost_price: 16500, category: 'Desks', stock_quantity: 22 },
      { name: 'King Size Upholstered Bed Frame', type: 'goods', sales_price: 38000, cost_price: 24000, category: 'Bedroom', stock_quantity: 12 },
      { name: '3-Drawer Locking Mobile Pedestal', type: 'goods', sales_price: 4800, cost_price: 2900, category: 'Storage', stock_quantity: 60 },
      { name: 'High-Back Leather Boss Chair', type: 'goods', sales_price: 16500, cost_price: 10200, category: 'Chairs', stock_quantity: 25 },
      { name: 'Velvet Lounge Accent Armchair', type: 'goods', sales_price: 14000, cost_price: 8800, category: 'Chairs', stock_quantity: 30 },
      { name: '4-Person Modular Linear Workstation', type: 'goods', sales_price: 42000, cost_price: 26500, category: 'Workspaces', stock_quantity: 16 },
      { name: '10-Seater Boardroom Conference Table', type: 'goods', sales_price: 68000, cost_price: 42000, category: 'Tables', stock_quantity: 10 },
      { name: '3-Seater Chesterfield Leather Sofa', type: 'goods', sales_price: 58000, cost_price: 36000, category: 'Sofas', stock_quantity: 14 },
      { name: 'Round Glass-Top Meeting Table', type: 'goods', sales_price: 15000, cost_price: 9200, category: 'Tables', stock_quantity: 24 },
      { name: 'Tambour Door Metal Storage Cabinet', type: 'goods', sales_price: 19500, cost_price: 12000, category: 'Storage', stock_quantity: 30 },
      { name: '6-Door Employee Locker System', type: 'goods', sales_price: 28000, cost_price: 17500, category: 'Storage', stock_quantity: 18 },
      { name: 'Queen Size Solid Wood Platform Bed', type: 'goods', sales_price: 31000, cost_price: 19500, category: 'Bedroom', stock_quantity: 15 },
      { name: 'Acoustic Fabric Wall Baffle Panel', type: 'goods', sales_price: 3200, cost_price: 1900, category: 'Workspaces', stock_quantity: 80 },
      { name: 'High-Top Cafeteria Bar Table', type: 'goods', sales_price: 11500, cost_price: 7000, category: 'Tables', stock_quantity: 25 },
      { name: 'Modern Minimalist Fabric Loveseat', type: 'goods', sales_price: 22000, cost_price: 13500, category: 'Sofas', stock_quantity: 20 },
      { name: 'Solid Sheesham Display Credenza', type: 'goods', sales_price: 24000, cost_price: 15000, category: 'Storage', stock_quantity: 14 },
      { name: 'Ergonomic Workplace Consultation', type: 'service', sales_price: 5000, cost_price: 1500, category: 'Services', stock_quantity: 999 },
      { name: 'Commercial On-Site Wood Polish Care', type: 'service', sales_price: 3500, cost_price: 1000, category: 'Services', stock_quantity: 999 },
      { name: 'Stackable Conference Polymer Chair', type: 'goods', sales_price: 2400, cost_price: 1450, category: 'Chairs', stock_quantity: 120 },
      { name: 'Heavy-Duty Industrial Draftsman Stool', type: 'goods', sales_price: 1800, cost_price: 1050, category: 'Chairs', stock_quantity: 75 },
      { name: 'Executive L-Shaped Manager Desk', type: 'goods', sales_price: 34000, cost_price: 21000, category: 'Desks', stock_quantity: 15 },
    ];

    const products = [];
    for (const p of productCatalog) {
      const [prod] = await Product.findOrCreate({
        where: { name: p.name },
        defaults: {
          type: p.type,
          sales_price: p.sales_price,
          cost_price: p.cost_price,
          category: p.category,
          stock_quantity: p.stock_quantity,
          is_archived: false,
        },
        transaction: t,
      });
      products.push(prod);
    }
    console.log(`[OK] Verified / Seeded ${products.length} Unique Products.`);

    // 5. Clean up duplicate unlinked POs and SOs (Preserving those with Invoices / Bills)
    const activeInvoices = await CustomerInvoice.findAll({ attributes: ['sales_order_id'], transaction: t });
    const protectedSOIds = new Set(activeInvoices.map(i => i.sales_order_id).filter(Boolean));

    const activeBills = await VendorBill.findAll({ attributes: ['purchase_order_id'], transaction: t });
    const protectedPOIds = new Set(activeBills.map(b => b.purchase_order_id).filter(Boolean));

    // Also protect the first 5 base orders
    for (let id = 1; id <= 5; id++) {
      protectedSOIds.add(id);
      protectedPOIds.add(id);
    }

    console.log(`[Protection] Preserving ${protectedSOIds.size} SOs and ${protectedPOIds.size} POs linked to accounting records.`);

    // Delete unlinked SO items & SOs
    const allSOs = await SalesOrder.findAll({ transaction: t });
    for (const so of allSOs) {
      if (!protectedSOIds.has(so.id)) {
        await SalesOrderItem.destroy({ where: { sales_order_id: so.id }, transaction: t });
        await so.destroy({ transaction: t });
      }
    }

    // Delete unlinked PO items & POs
    const allPOs = await PurchaseOrder.findAll({ transaction: t });
    for (const po of allPOs) {
      if (!protectedPOIds.has(po.id)) {
        await PurchaseOrderItem.destroy({ where: { purchase_order_id: po.id }, transaction: t });
        await po.destroy({ transaction: t });
      }
    }

    console.log('[Cleanup] Cleaned up repetitive unlinked orders.');

    // Update existing/preserved POs with unique vendors & clean sequence numbers
    const preservedPOs = await PurchaseOrder.findAll({ transaction: t });
    for (let idx = 0; idx < preservedPOs.length; idx++) {
      const po = preservedPOs[idx];
      const vendor = vendors[idx % vendors.length];
      const orderNum = po.order_number && po.order_number.startsWith('PO-2026-') ? po.order_number : `PO-2026-${String(idx + 1).padStart(5, '0')}`;
      await po.update({
        vendor_id: vendor.id,
        order_number: orderNum,
      }, { transaction: t });

      const bill = await VendorBill.findOne({ where: { purchase_order_id: po.id }, transaction: t });
      if (bill) {
        await bill.update({ vendor_id: vendor.id }, { transaction: t });
      }
    }

    // Update existing/preserved SOs with unique customers & clean sequence numbers
    const preservedSOs = await SalesOrder.findAll({ transaction: t });
    for (let idx = 0; idx < preservedSOs.length; idx++) {
      const so = preservedSOs[idx];
      const customer = customers[idx % customers.length];
      const orderNum = so.order_number && so.order_number.startsWith('SO-2026-') ? so.order_number : `SO-2026-${String(idx + 1).padStart(5, '0')}`;
      await so.update({
        customer_id: customer.id,
        order_number: orderNum,
      }, { transaction: t });

      const invoice = await CustomerInvoice.findOne({ where: { sales_order_id: so.id }, transaction: t });
      if (invoice) {
        await invoice.update({ customer_id: customer.id }, { transaction: t });
      }
    }

    // 6. Generate 100+ Unique, Highly Varied Purchase Orders
    const currentPOCount = await PurchaseOrder.count({ transaction: t });
    const poTargetTotal = 105;
    const poToGenerate = Math.max(0, poTargetTotal - currentPOCount);

    console.log(`[Generating] Generating ${poToGenerate} distinct, diversified Purchase Orders...`);

    const poStatuses = ['confirmed', 'confirmed', 'draft', 'confirmed', 'billed', 'draft', 'confirmed', 'confirmed'];
    const poNotesTemplates = [
      'Quarterly factory procurement contract for engineered timber and kiln-dried hardwoods.',
      'Urgent procurement of high-density PU foam batch for ongoing modular sofa production.',
      'Bulk hardware shipment: soft-close runners, hydraulic hinges, and locking mechanisms.',
      'Imported architectural stainless steel sheets and structural square tubing supply.',
      'Eco-friendly pre-laminated MDF boards for corporate linear workstation series.',
      'Batch supply of premium top-grain leather hides and stain-resistant velvet textiles.',
      'Scheduled warehouse delivery for heavy-duty locking casters and aluminum swivel bases.',
      'High-durability powder coating polymers and industrial lacquer finishing supplies.',
      'Procurement of custom CNC-cut tempered glass tops for boardroom conference tables.',
      'Acoustic PET felt panels and sound-dampening insulation for privacy pod line.',
      'Direct timber mill sourcing of Grade-A Indian Sheesham logs with moisture certification.',
      'Industrial assembly fasteners, threaded inserts, and precision Allen bolts delivery.',
      'Annual raw material quota replenishment under vendor long-term supply agreement.',
      'Emergency restock of ergonomic gas-lift cylinders Class-4 for task chair batch.',
      'Solid surface acrylic tops and marble veneers for executive credenza line.'
    ];

    let vendorIndex = 0;
    for (let i = 1; i <= poToGenerate; i++) {
      const seq = currentPOCount + i;
      const orderNumber = `PO-2026-${String(seq).padStart(5, '0')}`;
      
      // Rotate through 30 unique vendors evenly
      const vendor = vendors[vendorIndex % vendors.length];
      vendorIndex++;

      const status = poStatuses[i % poStatuses.length];
      const note = poNotesTemplates[i % poNotesTemplates.length];
      const analyticAcc = analyticAccounts[i % analyticAccounts.length];

      // Date spread: spread between Jan 02, 2026 and Sep 05, 2026
      const daysOffset = Math.floor((240 / poToGenerate) * (poToGenerate - i)) + (i % 3);
      const orderDateObj = new Date(2026, 8, 5);
      orderDateObj.setDate(orderDateObj.getDate() - daysOffset);
      const orderDate = orderDateObj.toISOString().split('T')[0];

      const po = await PurchaseOrder.create({
        vendor_id: vendor.id,
        order_date: orderDate,
        status,
        notes: `${note} — Order Ref: ${orderNumber}`,
        created_by: adminId,
        order_number: orderNumber,
        analytic_account_id: analyticAcc.id,
      }, { transaction: t });

      // Pick 1 to 4 distinct products with varied quantities and pricing
      const lineCount = 1 + ((i * 3) % 4); // 1, 2, 3, or 4 lines
      const productStartIdx = (i * 2) % products.length;
      const selectedProducts = [];
      for (let p = 0; p < lineCount; p++) {
        selectedProducts.push(products[(productStartIdx + p) % products.length]);
      }

      for (let pIdx = 0; pIdx < selectedProducts.length; pIdx++) {
        const prod = selectedProducts[pIdx];
        const qty = 2 + ((i + pIdx * 4) % 18); // 2 to 20 qty
        const costVariation = 0.94 + (((i + pIdx) % 12) * 0.01); // 94% to 105%
        const unitPrice = round(Number(prod.cost_price) * costVariation, 2);
        const lineTotal = round(qty * unitPrice, 2);

        await PurchaseOrderItem.create({
          purchase_order_id: po.id,
          product_id: prod.id,
          quantity: qty,
          unit_price: unitPrice,
          line_total: lineTotal,
        }, { transaction: t });
      }
    }

    const finalPOCount = await PurchaseOrder.count({ transaction: t });
    console.log(`[OK] Total Purchase Orders in DB: ${finalPOCount}`);

    // 7. Generate 100+ Unique, Highly Varied Sales Orders
    const currentSOCount = await SalesOrder.count({ transaction: t });
    const soTargetTotal = 105;
    const soToGenerate = Math.max(0, soTargetTotal - currentSOCount);

    console.log(`[Generating] Generating ${soToGenerate} distinct, diversified Sales Orders...`);

    const soStatuses = ['confirmed', 'confirmed', 'draft', 'confirmed', 'invoiced', 'draft', 'confirmed', 'confirmed'];
    const soNotesTemplates = [
      'Turnkey executive workspace fit-out for corporate headquarters Expansion Wing.',
      'Comprehensive ergonomic seating and height-adjustable desks for engineering lab.',
      'Full floor boardroom and conference center fitment with integrated cable routing.',
      'Co-working flex-pod fitment including acoustic phone booths and lounge seating.',
      'Luxury hospitality suite refurbishment: King bed frames and bespoke solid wood desks.',
      'Campus-wide library and academic seminar hall seating upgrade project Phase I.',
      'High-density open office linear workstations with acoustic privacy baffles.',
      'Client executive lounge makeover with Chesterfield leather sofas and oak tables.',
      'Flagship retail experience center showroom fitment with display credenzas.',
      'Multi-city satellite office ergonomic furniture deployment under master contract.',
      'Medical clinic waiting room reception seating and doctor consult desks.',
      'Tech startup headquarters inaugural fit-out package: desks, chairs, and booths.',
      'Fintech trading floor heavy-duty dual monitor motorized desks fitment.',
      'Corporate cafeteria high-top bar tables and stackable conference chair supply.',
      'Annual facility ergonomic refresh program order with priority site assembly.'
    ];

    const taxTierOptions = [18, 18, 18, 12, 18, 5, 18, 0];

    let customerIndex = 0;
    for (let i = 1; i <= soToGenerate; i++) {
      const seq = currentSOCount + i;
      const orderNumber = `SO-2026-${String(seq).padStart(5, '0')}`;

      // Rotate through 40 unique customers evenly
      const customer = customers[customerIndex % customers.length];
      customerIndex++;

      const status = soStatuses[i % soStatuses.length];
      const note = soNotesTemplates[i % soNotesTemplates.length];
      const analyticAcc = analyticAccounts[i % analyticAccounts.length];

      // Date spread: spread between Jan 04, 2026 and Sep 05, 2026
      const daysOffset = Math.floor((240 / soToGenerate) * (soToGenerate - i)) + (i % 3);
      const orderDateObj = new Date(2026, 8, 5);
      orderDateObj.setDate(orderDateObj.getDate() - daysOffset);
      const orderDate = orderDateObj.toISOString().split('T')[0];

      const so = await SalesOrder.create({
        customer_id: customer.id,
        order_date: orderDate,
        status,
        notes: `${note} — Order Ref: ${orderNumber}`,
        created_by: adminId,
        order_number: orderNumber,
        analytic_account_id: analyticAcc.id,
      }, { transaction: t });

      // Pick 1 to 5 distinct products with varied quantities and pricing
      const lineCount = 1 + ((i * 2) % 5); // 1, 2, 3, 4, or 5 lines
      const productStartIdx = (i * 3) % products.length;
      const selectedProducts = [];
      for (let p = 0; p < lineCount; p++) {
        selectedProducts.push(products[(productStartIdx + p) % products.length]);
      }

      for (let pIdx = 0; pIdx < selectedProducts.length; pIdx++) {
        const prod = selectedProducts[pIdx];
        const qty = 1 + ((i + pIdx * 3) % 15); // 1 to 15 qty
        const priceVariation = 0.95 + (((i + pIdx) % 10) * 0.01); // 95% to 104%
        const unitPrice = round(Number(prod.sales_price) * priceVariation, 2);
        const taxPercent = taxTierOptions[(i + pIdx) % taxTierOptions.length];

        const subtotal = multiply(qty, unitPrice);
        const taxAmount = multiply(subtotal, taxPercent / 100);
        const lineTotal = round(add(subtotal, taxAmount), 2);

        await SalesOrderItem.create({
          sales_order_id: so.id,
          product_id: prod.id,
          quantity: qty,
          unit_price: unitPrice,
          tax_percent: taxPercent,
          line_total: lineTotal,
        }, { transaction: t });
      }
    }

    const finalSOCount = await SalesOrder.count({ transaction: t });
    console.log(`[OK] Total Sales Orders in DB: ${finalSOCount}`);

    await t.commit();
    console.log('====================================================');
    console.log('   All 100+ Unique POs and SOs Successfully Seeded! ');
    console.log('====================================================');
  } catch (err) {
    await t.rollback();
    console.error('[Bulk Generation Error]:', err);
    throw err;
  }
}

if (require.main === module) {
  generateBulkData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { generateBulkData };

