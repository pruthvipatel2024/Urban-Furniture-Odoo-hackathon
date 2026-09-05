const { AuditLog } = require('../models');

async function logAudit({ req, userId = null, action, entity, entityId = null, oldValue = null, newValue = null }) {
  try {
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || null;
    const userAgent = req?.headers['user-agent'] || null;
    const resolvedUserId = userId || req?.user?.id || null;

    await AuditLog.create({
      user_id: resolvedUserId,
      action,
      entity,
      entity_id: entityId ? String(entityId) : null,
      old_value: oldValue,
      new_value: newValue,
      ip_address: ipAddress ? String(ipAddress).substring(0, 45) : null,
      user_agent: userAgent,
    });
  } catch (err) {
    // Non-blocking logging failure
    // eslint-disable-next-line no-console
    console.error('[AuditLog Error]:', err.message);
  }
}

module.exports = {
  logAudit,
};
