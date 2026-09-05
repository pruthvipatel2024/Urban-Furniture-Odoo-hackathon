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

      if (req.user.role === 'contact') {
        where.id = req.user.contact_id;
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

      if (req.user.role === 'contact' && Number(contact.id) !== Number(req.user.contact_id)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view this contact profile.');
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
      const { name, type, email, mobile, phone, address_city, address_state, address_pincode, profile_image } = req.body;

      if (!name || !type) {
        if (req.uploadedFile?.filepath) {
          try { require('fs').unlinkSync(req.uploadedFile.filepath); } catch (_) {}
        }
        return ApiResponse.badRequest(res, 'Name and contact type (customer, vendor, both) are required.');
      }

      const normType = (type || '').trim().toLowerCase();
      if (!['customer', 'vendor', 'both'].includes(normType)) {
        if (req.uploadedFile?.filepath) {
          try { require('fs').unlinkSync(req.uploadedFile.filepath); } catch (_) {}
        }
        return ApiResponse.badRequest(res, 'Contact type must be "customer", "vendor", or "both".');
      }

      const photoUrl = req.uploadedFile ? req.uploadedFile.url : (profile_image || null);

      let contact;
      try {
        contact = await Contact.create({
          name: name.trim(),
          type: normType,
          email,
          mobile: mobile || phone || null,
          address_city,
          address_state,
          address_pincode,
          profile_image: photoUrl,
          is_archived: false,
        });
      } catch (dbErr) {
        // If DB insert fails after a new file was uploaded, delete the new file to prevent orphaned files
        if (req.uploadedFile?.filepath) {
          try { require('fs').unlinkSync(req.uploadedFile.filepath); } catch (_) {}
        }
        throw dbErr;
      }

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
        if (req.uploadedFile?.filepath) {
          try { require('fs').unlinkSync(req.uploadedFile.filepath); } catch (_) {}
        }
        return ApiResponse.notFound(res, `Contact with ID ${req.params.id} not found.`);
      }

      // Stale edit protection: optimistic concurrency check if client sends updated_at
      const clientUpdatedAt = req.body.last_updated_at || req.body.updated_at;
      if (clientUpdatedAt && contact.updated_at) {
        const clientTime = new Date(clientUpdatedAt).getTime();
        const dbTime = new Date(contact.updated_at).getTime();
        if (dbTime - clientTime > 2000) {
          if (req.uploadedFile?.filepath) {
            try { require('fs').unlinkSync(req.uploadedFile.filepath); } catch (_) {}
          }
          return ApiResponse.conflict(res, 'This record was modified by another operation. Please reload before saving.');
        }
      }

      const oldVal = contact.toJSON();
      const oldImage = contact.profile_image;
      const { name, type, email, mobile, phone, address_city, address_state, address_pincode } = req.body;

      if (name) contact.name = name.trim();
      if (type) {
        const normType = type.trim().toLowerCase();
        if (['customer', 'vendor', 'both'].includes(normType)) contact.type = normType;
      }
      if (email !== undefined) contact.email = email;
      if (mobile !== undefined) contact.mobile = mobile;
      else if (phone !== undefined) contact.mobile = phone;
      if (address_city !== undefined) contact.address_city = address_city;
      if (address_state !== undefined) contact.address_state = address_state;
      if (address_pincode !== undefined) contact.address_pincode = address_pincode;

      let newPhotoUploaded = false;
      if (req.uploadedFile) {
        contact.profile_image = req.uploadedFile.url;
        newPhotoUploaded = true;
      } else if (req.body.profile_image !== undefined) {
        contact.profile_image = req.body.profile_image;
      }

      try {
        await contact.save();
      } catch (saveErr) {
        // If DB update fails after a new file was uploaded, delete the new file to prevent orphaned files
        if (req.uploadedFile?.filepath) {
          try { require('fs').unlinkSync(req.uploadedFile.filepath); } catch (_) {}
        }
        throw saveErr;
      }

      // Best effort cleanup of previous local photo only AFTER successful DB update
      if (newPhotoUploaded && oldImage && oldImage.startsWith('/uploads/contacts/')) {
        try {
          const path = require('path');
          const fs = require('fs');
          const oldFilePath = path.join(__dirname, '../../', oldImage);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (cleanupErr) {
          console.warn('[Contact Photo Cleanup Warning]: Could not unlink old file:', cleanupErr.message);
        }
      }

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

      if (req.user.role === 'contact' && Number(contact.id) !== Number(req.user.contact_id)) {
        return ApiResponse.forbidden(res, 'You do not have permission to view this contact ledger history.');
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
