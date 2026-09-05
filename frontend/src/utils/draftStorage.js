/**
 * Urban Furniture ERP — Form Draft Persistence Utility
 * Safely persists uncommitted form inputs to localStorage with 7-day expiration
 */

const DRAFT_PREFIX = 'uf_draft_';
const DRAFT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const getDraftKey = (entity, mode = 'create', recordId = 'new') => {
  const cleanId = recordId || 'new';
  return `${DRAFT_PREFIX}${entity}_${mode}_${cleanId}`;
};

export const saveDraft = (entity, mode, recordId, data) => {
  try {
    if (!data || typeof data !== 'object') return;
    // Strip non-serializable properties (Files, DOM elements, functions)
    const safeData = {};
    for (const [key, val] of Object.entries(data)) {
      if (typeof val === 'function') continue;
      if (typeof File !== 'undefined' && val instanceof File) continue;
      safeData[key] = val;
    }
    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      data: safeData,
    };
    const key = getDraftKey(entity, mode, recordId);
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Fail gracefully if quota exceeded or storage disabled
  }
};

export const getDraft = (entity, mode, recordId) => {
  try {
    const key = getDraftKey(entity, mode, recordId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data || !parsed.savedAt) {
      localStorage.removeItem(key);
      return null;
    }
    const age = Date.now() - new Date(parsed.savedAt).getTime();
    if (age > DRAFT_EXPIRY_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
};

export const clearDraft = (entity, mode, recordId) => {
  try {
    const key = getDraftKey(entity, mode, recordId);
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
};
