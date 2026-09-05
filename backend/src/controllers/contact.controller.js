const { Op } = require('sequelize');
const { Contact, CustomerInvoice, VendorBill, Payment, SalesOrder, PurchaseOrder } = require('../models');
const ApiResponse = require('../utils/response');
const { logAudit } = require('../middleware/audit.middleware');
const { add, subtract } = require('../utils/decimal');

class ContactController {
  /**
   * GET /api/contacts
   */
  static async getContacts(req, res, next) {
    try {
      const { type, search, includeArchived = 'false', page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const where = {};
      if (includeArchived !== 'true') {
        where.is_archived = false;
      }
      if (type && ['customer', 'vendor', 'both'].includes(type)) {
        where.type = [type, 'both'];
      }
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { mobile: { [Op.like]: `%${search}%` } },
          { address_city: { [Op.like]: `%${search}%` } },
        ];
      }

      const { count, rows } = await Contact.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['name', 'ASC']],
      });

      return ApiResponse.success(res, 'Contacts retrieved successfully', {
        total: count,
        page: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        contacts: rows,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/contacts/:id
   */
  static async getContactById(req, res, next) {
    try {
      const contact = await Contact.findByPk(req.params.id);
      if (!contact) {
        return ApiResponse.notFound(res, `Contact with ID ${req.params.id} not found.`);
      }

      return ApiResponse.success(res, 'Contact retrieved successfully', contact);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/contacts
   */
  static async createContact(req, res, next) {
    try {
      const { name, type, email, mobile, address_city, address_state, address_pincode, profile_image } = req.body;

      if (!name || !type) {
        return ApiResponse.badRequest(res, 'Name and contact type (customer, vendor, both) are required.');
      }

      if (!['customer', 'vendor', 'both'].includes(type)) {
        return ApiResponse.badRequest(res, 'Contact type must be "customer", "vendor", or "both".');
      }

      const contact = await Contact.create({
        name,
        type,
        email,
        mobile,
        address_city,
        address_state,
        address_pincode,
        profile_image,
        is_archived: false,
      });

      await logAudit({
        req,
        action: 'CREATE_CONTACT',
        entity: 'Contact',
        entityId: contact.id,
        newValue: contact.toJSON(),
      });

      return ApiResponse.created(res, 'Contact created successfully', contact);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/contacts/:id
   */
  static async updateContact(req, res, next) {
    try {
      const contact = await Contact.findByPk(req.params.id);
      if (!contact) {
        return ApiResponse.notFound(res, `Contact with ID ${req.params.id} not found.`);
      }

      const oldVal = contact.toJSON();
      const { name, type, email, mobile, address_city, address_state, address_pincode, profile_image } = req.body;

      if (name) contact.name = name;
      if (type && ['customer', 'vendor', 'both'].includes(type)) contact.type = type;
      if (email !== undefined) contact.email = email;
      if (mobile !== undefined) contact.mobile = mobile;
      if (address_city !== undefined) contact.address_city = address_city;
      if (address_state !== undefined) contact.address_state = address_state;
      if (address_pincode !== undefined) contact.address_pincode = address_pincode;
      if (profile_image !== undefined) contact.profile_image = profile_image;

      await contact.save();

      await logAudit({
        req,
        action: 'UPDATE_CONTACT',
        entity: 'Contact',
        entityId: contact.id,
        oldValue: oldVal,
        newValue: contact.toJSON(),
      });

      return ApiResponse.success(res, 'Contact updated successfully', contact);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/contacts/:id (Archive)
   */
  static async archiveContact(req, res, next) {
    try {
      const contact = await Contact.findByPk(req.params.id);
      if (!contact) {
        return ApiResponse.notFound(res, `Contact with ID ${req.params.id} not found.`);
      }

      contact.is_archived = true;
      await contact.save();

      await logAudit({
        req,
        action: 'ARCHIVE_CONTACT',
        entity: 'Contact',
        entityId: contact.id,
      });

      return ApiResponse.success(res, `Contact "${contact.name}" archived successfully`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/contacts/:id/ledger-history
   */
  static async getContactLedgerHistory(req, res, next) {
    try {
      const contact = await Contact.findByPk(req.params.id);
      if (!contact) {
        return ApiResponse.notFound(res, `Contact with ID ${req.params.id} not found.`);
      }

      // Customer Invoices & Receivables
      const invoices = await CustomerInvoice.findAll({
        where: { customer_id: contact.id },
        include: [{ model: Payment, as: 'payments' }],
        order: [['invoice_date', 'DESC']],
      });

      let totalInvoiced = 0;
      let totalCustomerPaid = 0;
      let totalReceivable = 0;

      for (const inv of invoices) {
        const tot = Number(inv.total_amount);
        const pd = Number(inv.amount_paid);
        totalInvoiced = add(totalInvoiced, tot);
        totalCustomerPaid = add(totalCustomerPaid, pd);
        totalReceivable = add(totalReceivable, subtract(tot, pd));
      }

      // Vendor Bills & Payables
      const vendorBills = await VendorBill.findAll({
        where: { vendor_id: contact.id },
        include: [{ model: Payment, as: 'payments' }],
        order: [['invoice_date', 'DESC']],
      });

      let totalBilled = 0;
      let totalVendorPaid = 0;
      let totalPayable = 0;

      for (const b of vendorBills) {
        const tot = Number(b.total_amount);
        const pd = Number(b.amount_paid);
        totalBilled = add(totalBilled, tot);
        totalVendorPaid = add(totalVendorPaid, pd);
        totalPayable = add(totalPayable, subtract(tot, pd));
      }

      return ApiResponse.success(res, `Ledger history for "${contact.name}"`, {
        contact: {
          id: contact.id,
          name: contact.name,
          type: contact.type,
          email: contact.email,
          mobile: contact.mobile,
        },
        financialSummary: {
          totalInvoiced,
          totalCustomerPaid,
          outstandingReceivable: totalReceivable,
          totalBilled,
          totalVendorPaid,
          outstandingPayable: totalPayable,
          netPosition: subtract(totalReceivable, totalPayable),
        },
        invoices,
        vendorBills,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ContactController;
