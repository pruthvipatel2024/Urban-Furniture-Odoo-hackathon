const http = require('http');
const fs = require('fs');
const path = require('path');

let authToken = '';

function request(options, data, isMultipart = false, boundary = '') {
  return new Promise((resolve, reject) => {
    options.headers = options.headers || {};
    if (authToken && !options.headers['Authorization']) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, headers: res.headers, data: json, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      if (Buffer.isBuffer(data)) {
        req.write(data);
      } else if (typeof data === 'string') {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('========================================================');
  console.log('   URBAN FURNITURE ERP — AUTOMATED E2E VERIFICATION     ');
  console.log('========================================================\n');

  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passCount++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failCount++;
    }
  }

  try {
    // 1. Health & Auth
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.status === 200, 'Backend is healthy on port 5000');

    const loginRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@urbanfurniture.com',
      password: 'admin123'
    });
    assert(loginRes.status === 200, 'Admin login succeeded');
    authToken = loginRes.data?.data?.token;
    assert(!!authToken, 'Auth token acquired');

    // 2. CONTACT CRUD & PHOTO UPLOAD
    console.log('\n--- 1. CONTACT CRUD & PHOTO UPLOAD PIPELINE ---');
    const initialContactsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/contacts',
      method: 'GET'
    });
    assert(initialContactsRes.status === 200, 'GET /api/contacts returned 200');
    const contactsList = initialContactsRes.data?.data?.contacts || initialContactsRes.data?.data || [];
    const initialCount = contactsList.length;
    console.log(`Initial contacts count in DB: ${initialCount}`);

    // Create a 1x1 test png buffer for photo upload test
    const testPngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

    let body = [];
    body.push(`--${boundary}\r\nContent-Disposition: form-data; name="name"\r\n\r\nTest Vendor InPlace\r\n`);
    body.push(`--${boundary}\r\nContent-Disposition: form-data; name="type"\r\n\r\nvendor\r\n`);
    body.push(`--${boundary}\r\nContent-Disposition: form-data; name="email"\r\n\r\ntestvendor@example.com\r\n`);
    body.push(`--${boundary}\r\nContent-Disposition: form-data; name="mobile"\r\n\r\n9876543210\r\n`);
    body.push(`--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="test_logo.png"\r\nContent-Type: image/png\r\n\r\n`);
    
    const preBuffer = Buffer.from(body.join(''), 'utf8');
    const postBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    const multipartData = Buffer.concat([preBuffer, testPngBuffer, postBuffer]);

    const createContactRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/contacts',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': multipartData.length
      }
    }, multipartData);

    assert(createContactRes.status === 201 || createContactRes.status === 200, 'POST /api/contacts created contact with photo');
    const createdContact = createContactRes.data?.data || createContactRes.data;
    const contactId = createdContact.id;
    console.log(`Created Contact ID: ${contactId}, photo URL: ${createdContact.profile_image}`);
    assert(contactId != null, 'Created contact has valid database ID');
    assert(!!createdContact.profile_image, 'Contact has uploaded photo path stored in DB');

    // Verify static route serving uploaded image
    const photoPath = createdContact.profile_image;
    if (photoPath) {
      const imgRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: photoPath,
        method: 'GET'
      });
      assert(imgRes.status === 200, `Uploaded photo is accessible via static GET ${photoPath}`);
    }

    // Verify DB count increased by exactly 1
    const afterCreateContacts = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/contacts',
      method: 'GET'
    });
    const afterCreateList = afterCreateContacts.data?.data?.contacts || afterCreateContacts.data?.data || [];
    assert(afterCreateList.length === initialCount + 1, 'Exactly ONE contact added to DB');

    // PUT /api/contacts/:id - update name and phone without changing photo
    const updateJson = {
      name: 'Test Vendor InPlace Pvt Ltd',
      mobile: '1122334455'
    };
    const updateContactRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/contacts/${contactId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, updateJson);

    assert(updateContactRes.status === 200, `PUT /api/contacts/${contactId} returned 200`);
    const updatedContact = updateContactRes.data?.data || updateContactRes.data;
    assert(updatedContact.id === contactId, `Updated contact preserved exact same ID (${contactId})`);
    assert(updatedContact.name === 'Test Vendor InPlace Pvt Ltd', 'Updated contact has new name');
    assert(updatedContact.mobile === '1122334455', 'Updated contact has new phone');
    assert(updatedContact.profile_image === photoPath, 'Existing photo preserved when updating without new photo');

    // Verify COUNT(*) is unchanged after edit
    const afterEditContacts = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/contacts',
      method: 'GET'
    });
    const afterEditList = afterEditContacts.data?.data?.contacts || afterEditContacts.data?.data || [];
    assert(afterEditList.length === afterCreateList.length, `In-place edit did NOT create duplicate record (count before: ${afterCreateList.length}, count after: ${afterEditList.length})`);

    // 3. CHART OF ACCOUNTS IN-PLACE EDIT
    console.log('\n--- 2. CHART OF ACCOUNTS IN-PLACE UPDATE ---');
    const coaListRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/accounts',
      method: 'GET'
    });
    const accounts = coaListRes.data?.data || [];
    assert(accounts.length > 0, 'Chart of accounts fetched from /api/accounts');
    const testAccount = accounts[0];
    const initialAccName = testAccount.name;
    const testAccId = testAccount.id;

    const updateAccRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/accounts/${testAccId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: `${initialAccName} (Verified InPlace)`,
      code: testAccount.code,
      type: testAccount.type
    });

    assert(updateAccRes.status === 200, `PUT /api/accounts/${testAccId} returned 200`);
    const updatedAcc = updateAccRes.data?.data || updateAccRes.data;
    assert(updatedAcc.id === testAccId, `Account updated in-place with exact ID ${testAccId}`);
    assert((updatedAcc.name || updatedAcc.account_name) === `${initialAccName} (Verified InPlace)`, 'Account name updated in MySQL');

    // Restore original account name
    await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/accounts/${testAccId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: initialAccName,
      code: testAccount.code,
      type: testAccount.type
    });

    // 4. JOURNAL IN-PLACE EDIT
    console.log('\n--- 3. JOURNAL IN-PLACE UPDATE ---');
    const journalsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/journals',
      method: 'GET'
    });
    const journals = journalsRes.data?.data || [];
    assert(journals.length > 0, 'Journals fetched from /api/journals');
    const testJournal = journals[0];
    const initialJName = testJournal.name;
    const testJId = testJournal.id;

    const updateJournalRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/journals/${testJId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: `${initialJName} (InPlace)`,
      type: testJournal.type
    });
    assert(updateJournalRes.status === 200, `PUT /api/journals/${testJId} returned 200`);
    const updatedJournal = updateJournalRes.data?.data || updateJournalRes.data;
    assert(updatedJournal.id === testJId, `Journal updated in-place with exact ID ${testJId}`);

    // Restore original journal
    await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/journals/${testJId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: initialJName,
      type: testJournal.type
    });

    // 5. ANALYTIC ACCOUNT IN-PLACE EDIT
    console.log('\n--- 4. ANALYTIC ACCOUNT IN-PLACE UPDATE ---');
    const analyticRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/budgets/analytic-accounts',
      method: 'GET'
    });
    const analyticAccounts = analyticRes.data?.data || [];
    assert(analyticAccounts.length > 0, 'Analytic accounts fetched from /api/budgets/analytic-accounts');
    const testAnalytic = analyticAccounts[0];
    const testAnId = testAnalytic.id;
    const initialAnName = testAnalytic.name;

    const updateAnRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/budgets/analytic-accounts/${testAnId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: `${initialAnName} (InPlace)`,
      code: testAnalytic.code,
      type: testAnalytic.type
    });
    assert(updateAnRes.status === 200, `PUT /api/budgets/analytic-accounts/${testAnId} returned 200`);
    const updatedAn = updateAnRes.data?.data || updateAnRes.data;
    assert(updatedAn.id === testAnId, `Analytic account updated in-place with exact ID ${testAnId}`);

    // Restore original analytic account
    await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/budgets/analytic-accounts/${testAnId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    }, {
      name: initialAnName,
      code: testAnalytic.code,
      type: testAnalytic.type
    });

    // 6. BUDGET WORKFLOW (Create Draft -> Edit Draft -> Confirm -> Revise -> Cancel)
    console.log('\n--- 5. BUDGET STATE MACHINE & REVISION WORKFLOW ---');
    const createBudgetRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/budgets',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'FY26 R&D Budget Test',
      period_start: '2026-01-01',
      period_end: '2026-12-31',
      planned_amount: 150000,
      analytic_account_id: testAnId,
      status: 'draft'
    });

    assert(createBudgetRes.status === 201 || createBudgetRes.status === 200, 'POST /api/budgets created draft budget');
    const createdBudget = createBudgetRes.data?.data || createBudgetRes.data;
    const budgetId = createdBudget.id;
    assert(createdBudget.status.toLowerCase() === 'draft', 'Newly created budget starts as draft');

    // In-place edit of Draft Budget
    const editDraftBudgetRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/budgets/${budgetId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'FY26 R&D Budget Test (Updated Limit)',
      period_start: '2026-01-01',
      period_end: '2026-12-31',
      planned_amount: 175000,
      analytic_account_id: testAnId
    });
    assert(editDraftBudgetRes.status === 200, `PUT /api/budgets/${budgetId} returned 200`);
    const updatedDraftBudget = editDraftBudgetRes.data?.data || editDraftBudgetRes.data;
    assert(updatedDraftBudget.id === budgetId, `Draft budget preserved exact ID ${budgetId} on update`);
    assert(Number(updatedDraftBudget.planned_amount || updatedDraftBudget.plannedAmount) === 175000, 'Budget planned amount updated to 175000');

    // Confirm Budget: Draft -> Confirmed (In-place update)
    const confirmBudgetRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/budgets/${budgetId}/confirm`,
      method: 'POST'
    });
    assert(confirmBudgetRes.status === 200, `POST /api/budgets/${budgetId}/confirm returned 200`);
    const confirmedBudget = confirmBudgetRes.data?.data || confirmBudgetRes.data;
    assert(confirmedBudget.id === budgetId, `Confirmed budget preserved exact ID ${budgetId}`);
    assert(confirmedBudget.status.toLowerCase() === 'confirmed', 'Budget status is now confirmed');

    // Revise Confirmed Budget: Creates new revision, links revision_of_id, original marked as 'revised'
    const reviseBudgetRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/budgets/${budgetId}/revise`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      new_planned_amount: 200000
    });
    assert(reviseBudgetRes.status === 201 || reviseBudgetRes.status === 200, `POST /api/budgets/${budgetId}/revise created revision`);
    const revisionBudget = reviseBudgetRes.data?.data || reviseBudgetRes.data;
    assert(revisionBudget.id !== budgetId, `Revision created new version ID ${revisionBudget.id}`);
    assert(revisionBudget.revision_of_id === budgetId, `Revision correctly linked to original via revision_of_id = ${budgetId}`);
    assert(Number(revisionBudget.planned_amount || revisionBudget.plannedAmount) === 200000, 'Revision has updated planned amount 200000');

    // Verify original budget status is now 'revised'
    const origBudgetRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/budgets/${budgetId}`,
      method: 'GET'
    });
    const origBudgetAfterRev = origBudgetRes.data?.data || origBudgetRes.data;
    assert(origBudgetAfterRev.status.toLowerCase() === 'revised', 'Original budget status is now revised in MySQL');

    // Cancel Revision Budget: In-place update to 'cancelled'
    const cancelBudgetRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/budgets/${revisionBudget.id}/cancel`,
      method: 'POST'
    });
    assert(cancelBudgetRes.status === 200, `POST /api/budgets/${revisionBudget.id}/cancel returned 200`);
    const cancelledBudget = cancelBudgetRes.data?.data || cancelBudgetRes.data;
    assert(cancelledBudget.id === revisionBudget.id, `Cancelled budget preserved ID ${revisionBudget.id}`);
    assert(cancelledBudget.status.toLowerCase() === 'cancelled', 'Budget status is now cancelled');

    // 7. SALES ORDER IN-PLACE EDIT & CHILD LINE RECONCILIATION
    console.log('\n--- 6. SALES ORDER IN-PLACE EDIT & LINE RECONCILIATION ---');
    const productsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
      method: 'GET'
    });
    const products = productsRes.data?.data?.products || productsRes.data?.data || [];
    assert(products.length >= 2, 'At least 2 products available in database');
    const p1 = products[0];
    const p2 = products[1];

    // Create a Customer Contact for SO
    const createCustomerRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/contacts',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Test Customer InPlace',
      type: 'customer',
      email: 'testcustomer@example.com',
      mobile: '9988776655'
    });
    const customerId = (createCustomerRes.data?.data || createCustomerRes.data)?.id;
    assert(customerId != null, 'Customer contact created for Sales Order test');

    // Create Sales Order with 2 line items
    const createSoRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/sales-orders',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      customerId: customerId,
      date: '2026-03-01',
      items: [
        { productId: p1.id, qty: 2, unitPrice: 500, taxPercent: 18 },
        { productId: p2.id, qty: 1, unitPrice: 1000, taxPercent: 18 }
      ]
    });
    assert(createSoRes.status === 201 || createSoRes.status === 200, 'POST /api/sales-orders created sales order');
    const createdSo = createSoRes.data?.data || createSoRes.data;
    const soId = createdSo.id;
    console.log(`Created SO ID: ${soId}`);

    // Fetch SO detail with lines
    const soDetailRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/sales-orders/${soId}`,
      method: 'GET'
    });
    const fetchedSo = soDetailRes.data?.data || soDetailRes.data;
    const initialLines = fetchedSo.items || fetchedSo.order_lines || [];
    assert(initialLines.length === 2, `Sales order has 2 initial line items`);
    const line1 = initialLines[0];
    const line2 = initialLines[1];

    // IN-PLACE UPDATE: Update line 1 qty from 2 to 5, keep line 1 id, remove line 2, and add a new line 3
    const updateSoRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/sales-orders/${soId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      customerId: customerId,
      date: '2026-03-02',
      notes: 'Updated via test suite',
      items: [
        { id: line1.id, productId: p1.id, qty: 5, unitPrice: 500, taxPercent: 18 }, // update line 1
        { productId: p2.id, qty: 3, unitPrice: 1000, taxPercent: 18 } // new line
        // line 2 omitted -> deleted
      ]
    });

    assert(updateSoRes.status === 200, `PUT /api/sales-orders/${soId} returned 200`);
    const updatedSo = updateSoRes.data?.data || updateSoRes.data;
    assert(updatedSo.id === soId, `Sales order updated in-place with exact ID ${soId}`);

    // Verify lines reconciliation
    const soAfterReconcile = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/sales-orders/${soId}`,
      method: 'GET'
    });
    const reconLines = (soAfterReconcile.data?.data || soAfterReconcile.data)?.items || [];
    assert(reconLines.length === 2, `Reconciled SO has exactly 2 lines`);
    const updatedLine1 = reconLines.find(l => l.id === line1.id);
    assert(!!updatedLine1, `Existing line item with ID ${line1.id} was updated in-place`);
    assert(Number(updatedLine1.quantity || updatedLine1.qty) === 5, 'Line 1 quantity updated to 5');
    const oldLine2 = reconLines.find(l => l.id === line2.id);
    assert(!oldLine2, `Removed line item with ID ${line2.id} was deleted from database`);

    // FOREIGN CHILD ITEM TEST: Sending a child line ID that does not belong to this SO
    const foreignLineRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/sales-orders/${soId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      customerId: customerId,
      date: '2026-03-02',
      items: [
        { id: 999999, productId: p1.id, qty: 1, unitPrice: 500 }
      ]
    });
    assert(foreignLineRes.status === 400, 'Foreign child line ID returns 400 Bad Request');

    // 8. PURCHASE ORDER IN-PLACE EDIT & LINE RECONCILIATION
    console.log('\n--- 7. PURCHASE ORDER IN-PLACE EDIT & LINE RECONCILIATION ---');
    const createPoRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/purchase-orders',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      vendorId: contactId,
      date: '2026-03-01',
      items: [
        { productId: p1.id, qty: 10, unitPrice: 200 }
      ]
    });
    assert(createPoRes.status === 201 || createPoRes.status === 200, 'POST /api/purchase-orders created PO');
    const createdPo = createPoRes.data?.data || createPoRes.data;
    const poId = createdPo.id;
    console.log(`Created PO ID: ${poId}`);

    const poDetailRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/purchase-orders/${poId}`,
      method: 'GET'
    });
    const fetchedPo = poDetailRes.data?.data || poDetailRes.data;
    const poInitialLines = fetchedPo.items || fetchedPo.lines || fetchedPo.purchase_order_lines || [];
    assert(poInitialLines.length === 1, 'PO has 1 initial line item');
    const poLine1 = poInitialLines[0];

    // In-place edit PO: update line 1 qty from 10 to 15, add line 2
    const updatePoRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/purchase-orders/${poId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      vendorId: contactId,
      date: '2026-03-02',
      paymentTerms: '30 Days',
      items: [
        { id: poLine1.id, productId: p1.id, qty: 15, unitPrice: 200 },
        { productId: p2.id, qty: 5, unitPrice: 400 }
      ]
    });
    assert(updatePoRes.status === 200, `PUT /api/purchase-orders/${poId} returned 200`);
    const updatedPo = updatePoRes.data?.data || updatePoRes.data;
    assert(updatedPo.id === poId, `PO updated in-place with exact ID ${poId}`);

    const poAfterReconcile = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/purchase-orders/${poId}`,
      method: 'GET'
    });
    const poReconLines = (poAfterReconcile.data?.data || poAfterReconcile.data)?.items || [];
    assert(poReconLines.length === 2, 'Reconciled PO has 2 line items');
    const updatedPoLine1 = poReconLines.find(l => l.id === poLine1.id);
    assert(!!updatedPoLine1, `PO line 1 with ID ${poLine1.id} updated in-place`);
    assert(Number(updatedPoLine1.quantity || updatedPoLine1.qty) === 15, 'PO line 1 quantity updated to 15');

    // Foreign child line check on PO
    const foreignPoLineRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/purchase-orders/${poId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, {
      vendorId: contactId,
      items: [
        { id: 888888, productId: p1.id, qty: 1, unitPrice: 100 }
      ]
    });
    assert(foreignPoLineRes.status === 400, 'Foreign child line ID on PO returns 400 Bad Request');

    console.log('\n========================================================');
    console.log(`VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('========================================================\n');

    if (failCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
