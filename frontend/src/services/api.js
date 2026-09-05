/**
 * Urban Furniture ERP — Frontend API Service Client
 * Connects frontend to the Node.js / Express / MySQL backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
  static getToken() {
    return localStorage.getItem('uf_auth_token') || '';
  }

  static setToken(token) {
    if (token) {
      localStorage.setItem('uf_auth_token', token);
    } else {
      localStorage.removeItem('uf_auth_token');
    }
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = ApiClient.getToken();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({
        success: false,
        message: `HTTP Error ${response.status}: ${response.statusText}`,
      }));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.code = data.code || 'API_ERROR';
        error.errors = data.errors || null;
        throw error;
      }

      return data;
    } catch (err) {
      // Catch network / server down errors
      if (!err.status) {
        err.isNetworkError = true;
        err.message = err.message || 'Unable to connect to backend server. Ensure MySQL and backend are running.';
      }
      throw err;
    }
  }

  // HTTP Shortcuts
  static get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return ApiClient.request(fullEndpoint, { method: 'GET' });
  }

  static post(endpoint, body = {}) {
    return ApiClient.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static put(endpoint, body = {}) {
    return ApiClient.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static delete(endpoint) {
    return ApiClient.request(endpoint, { method: 'DELETE' });
  }
}

// -------------------------------------------------------------
// DOMAIN-SPECIFIC API ENDPOINTS
// -------------------------------------------------------------

export const api = {
  getToken: () => ApiClient.getToken(),
  setToken: (token) => ApiClient.setToken(token),

  // System Health
  health: Object.assign(() => ApiClient.get('/health'), {
    check: () => ApiClient.get('/health'),
  }),

  // Auth
  auth: {
    login: async (identifier, password) => {
      const res = await ApiClient.post('/auth/login', { loginId: identifier, email: identifier, password });
      if (res.data?.token) {
        ApiClient.setToken(res.data.token);
      }
      return res;
    },
    register: async (data) => {
      const res = await ApiClient.post('/auth/register', data);
      if (res.data?.token) {
        ApiClient.setToken(res.data.token);
      }
      return res;
    },
    forgotPassword: (identifier) => ApiClient.post('/auth/forgot-password', { identifier }),
    resetPassword: (data) => ApiClient.post('/auth/reset-password', data),
    me: () => ApiClient.get('/auth/me'),
    changePassword: (oldPassword, newPassword) => ApiClient.post('/auth/change-password', { oldPassword, newPassword }),
    logout: async () => {
      try {
        await ApiClient.post('/auth/logout');
      } finally {
        ApiClient.setToken('');
      }
    },
  },

  // Users
  users: {
    getAll: (params) => ApiClient.get('/users', params),
    getById: (id) => ApiClient.get(`/users/${id}`),
    create: (data) => ApiClient.post('/users', data),
    update: (id, data) => ApiClient.put(`/users/${id}`, data),
  },

  // Contacts (Customers & Vendors)
  contacts: {
    getAll: (params) => ApiClient.get('/contacts', params),
    getById: (id) => ApiClient.get(`/contacts/${id}`),
    create: (data) => ApiClient.post('/contacts', data),
    update: (id, data) => ApiClient.put(`/contacts/${id}`, data),
    archive: (id) => ApiClient.delete(`/contacts/${id}`),
    getLedgerHistory: (id) => ApiClient.get(`/contacts/${id}/ledger-history`),
  },

  // Products & Stock
  products: {
    getAll: (params) => ApiClient.get('/products', params),
    getById: (id) => ApiClient.get(`/products/${id}`),
    create: (data) => ApiClient.post('/products', data),
    update: (id, data) => ApiClient.put(`/products/${id}`, data),
    archive: (id) => ApiClient.delete(`/products/${id}`),
    adjustStock: (id, quantityDelta, reason) => ApiClient.post(`/products/${id}/adjust-stock`, { quantityDelta, reason }),
  },

  // Chart of Accounts & Journals
  accounts: {
    getAll: (params) => ApiClient.get('/accounts', params),
    getById: (id) => ApiClient.get(`/accounts/${id}`),
    create: (data) => ApiClient.post('/accounts', data),
    update: (id, data) => ApiClient.put(`/accounts/${id}`, data),
    archive: (id) => ApiClient.delete(`/accounts/${id}`),
    getLedger: (id, params) => ApiClient.get(`/accounts/${id}/ledger`, params),
  },

  journals: {
    getAll: () => ApiClient.get('/journals'),
    create: (data) => ApiClient.post('/journals', data),
    getEntries: (params) => ApiClient.get('/journals/entries', params),
    createManualEntry: (data) => ApiClient.post('/journals/entries', data),
  },

  // Sales Flow (SO & Invoices)
  sales: {
    getAll: (params) => ApiClient.get('/sales-orders', params),
    getById: (id) => ApiClient.get(`/sales-orders/${id}`),
    create: (data) => ApiClient.post('/sales-orders', data),
    confirm: (id) => ApiClient.post(`/sales-orders/${id}/confirm`),
    cancel: (id) => ApiClient.post(`/sales-orders/${id}/cancel`),
  },

  invoices: {
    getAll: (params) => ApiClient.get('/invoices', params),
    getById: (id) => ApiClient.get(`/invoices/${id}`),
    generateFromSO: (salesOrderId, data = {}) => ApiClient.post('/invoices/generate-from-so', { salesOrderId, ...data }),
  },

  // Purchase Flow (PO & Vendor Bills)
  purchases: {
    getAll: (params) => ApiClient.get('/purchase-orders', params),
    getById: (id) => ApiClient.get(`/purchase-orders/${id}`),
    create: (data) => ApiClient.post('/purchase-orders', data),
    confirm: (id) => ApiClient.post(`/purchase-orders/${id}/confirm`),
    cancel: (id) => ApiClient.post(`/purchase-orders/${id}/cancel`),
  },

  bills: {
    getAll: (params) => ApiClient.get('/bills', params),
    getById: (id) => ApiClient.get(`/bills/${id}`),
    generateFromPO: (purchaseOrderId, data = {}) => ApiClient.post('/bills/generate-from-po', { purchaseOrderId, ...data }),
  },

  // Payments (Customer Receipts & Vendor Payouts)
  payments: {
    getAll: (params) => ApiClient.get('/payments', params),
    getById: (id) => ApiClient.get(`/payments/${id}`),
    record: (data) => ApiClient.post('/payments', data),
  },

  // Budgets & Analytics
  budgets: {
    getAll: () => ApiClient.get('/budgets'),
    getById: (id) => ApiClient.get(`/budgets/${id}`),
    create: (data) => ApiClient.post('/budgets', data),
    update: (id, data) => ApiClient.put(`/budgets/${id}`, data),
    confirm: (id) => ApiClient.post(`/budgets/${id}/confirm`),
    cancel: (id) => ApiClient.post(`/budgets/${id}/cancel`),
    revise: (id, data) => ApiClient.post(`/budgets/${id}/revise`, data),
    getTransactions: (id) => ApiClient.get(`/budgets/${id}/transactions`),
    delete: (id) => ApiClient.delete(`/budgets/${id}`),
    getAnalytics: () => ApiClient.get('/budgets/analytic-accounts'),
    createAnalytic: (data) => ApiClient.post('/budgets/analytic-accounts', data),
  },

  // Real-time Financial Reports
  reports: {
    getProfitLoss: (params) => ApiClient.get('/reports/profit-loss', params),
    getBalanceSheet: (params) => ApiClient.get('/reports/balance-sheet', params),
    getStock: () => ApiClient.get('/reports/stock'),
    getBudget: () => ApiClient.get('/reports/budget'),
    getTrialBalance: (params) => ApiClient.get('/reports/trial-balance', params),
  },

  // Live Dynamic Dashboard
  dashboard: {
    getSummary: () => ApiClient.get('/dashboard/summary'),
  },

  // Audit Logs
  audit: {
    getAll: (params) => ApiClient.get('/audit', params),
  },
};

export default api;
