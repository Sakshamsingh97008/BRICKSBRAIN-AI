import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)    => api.post('/auth/register', data),
  login:    (data)    => api.post('/auth/login',    data),
  me:       ()        => api.get('/auth/me'),
  update:   (data)    => api.put('/auth/update',    data),
};

// ── Properties ───────────────────────────────────────────────────────────────
export const propertiesAPI = {
  list:       (params) => api.get('/properties',       { params }),
  get:        (id)     => api.get(`/properties/${id}`),
  create:     (data)   => api.post('/properties',      data),
  update:     (id, d)  => api.put(`/properties/${id}`, d),
  delete:     (id)     => api.delete(`/properties/${id}`),
  search:     (q)      => api.get('/properties/search', { params: { q } }),
  featured:   ()       => api.get('/properties/featured'),
  save:       (id)     => api.post(`/properties/${id}/save`),
  unsave:     (id)     => api.delete(`/properties/${id}/save`),
  contact:    (id, d)  => api.post(`/properties/${id}/contact`, d),
};

// ── ML / Predict ─────────────────────────────────────────────────────────────
export const predictAPI = {
  price:        (data)   => api.post('/predict/price',        data),
  construction: (data)   => api.post('/predict/construction', data),
  forecast:     (params) => api.get('/predict/forecast',      { params }),
  recommend:    (data)   => api.post('/predict/recommend',    data),
  rank:         (ids)    => api.post('/predict/rank',         { ids }),
};

// ── Area Intelligence ─────────────────────────────────────────────────────────
export const areaAPI = {
  intel:      (locality, city) => api.get('/area/intel', { params: { locality, city } }),
  distances:  (origin, dests)  => api.post('/area/distances', { origin, destinations: dests }),
  circleRate: (locality, city) => api.get('/area/circle-rate', { params: { locality, city } }),
  pollution:  (lat, lng)       => api.get('/area/pollution',  { params: { lat, lng } }),
};

// ── Loans ─────────────────────────────────────────────────────────────────────
export const loansAPI = {
  match:  (profile) => api.post('/loans/match', profile),
  banks:  ()        => api.get('/loans/banks'),
  apply:  (data)    => api.post('/loans/apply', data),
};

// ── Legal / RERA ──────────────────────────────────────────────────────────────
export const legalAPI = {
  check:  (address)    => api.get('/legal/check',  { params: { address } }),
  rera:   (reraId)     => api.get('/legal/rera',   { params: { reraId  } }),
  report: (propertyId) => api.get(`/legal/report/${propertyId}`, { responseType: 'blob' }),
};

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatAPI = {
  send: (messages) => api.post('/chat', { messages }),
};

// ── Payment ───────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createOrder:  (data) => api.post('/payment/order',   data),
  verify:       (data) => api.post('/payment/verify',  data),
  plans:        ()     => api.get('/payment/plans'),
  subscription: ()     => api.get('/payment/subscription'),
};

// ── Agent ─────────────────────────────────────────────────────────────────────
export const agentAPI = {
  leads:      ()       => api.get('/agent/leads'),
  addLead:    (data)   => api.post('/agent/leads', data),
  updateLead: (id, d)  => api.put(`/agent/leads/${id}`, d),
  stats:      ()       => api.get('/agent/stats'),
  profile:    ()       => api.get('/agent/profile'),
};

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportAPI = {
  compare:    (ids)  => api.post('/reports/compare',  { ids }, { responseType: 'blob' }),
  loanEMI:    (data) => api.post('/reports/loan-emi', data,   { responseType: 'blob' }),
  areaIntel:  (data) => api.post('/reports/area',     data,   { responseType: 'blob' }),
};

export default api;
