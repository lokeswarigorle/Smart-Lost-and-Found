import axios from 'axios';

export const API_BASE_URL = 'http://127.0.0.1:8000/api';
export const MEDIA_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth APIs ---
export const authService = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (data) => api.post('/auth/logout/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => {
    const isForm = data instanceof FormData;
    return api.patch('/auth/profile/', data, {
      headers: isForm ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },
  changePassword: (data) => api.put('/auth/change-password/', data),
  getUsers: () => api.get('/auth/users/'),
};

// --- Items APIs ---
export const itemService = {
  getLostItems: (params) => api.get('/lost-items/', { params }),
  getLostItem: (id) => api.get(`/lost-items/${id}/`),
  createLostItem: (formData) => api.post('/lost-items/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateLostItem: (id, formData) => api.patch(`/lost-items/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteLostItem: (id) => api.delete(`/lost-items/${id}/`),

  getFoundItems: (params) => api.get('/found-items/', { params }),
  getFoundItem: (id) => api.get(`/found-items/${id}/`),
  createFoundItem: (formData) => api.post('/found-items/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateFoundItem: (id, formData) => api.patch(`/found-items/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteFoundItem: (id) => api.delete(`/found-items/${id}/`),
};

// --- Matching APIs ---
export const matchingService = {
  getMatches: (params) => api.get('/matches/', { params }),
  getMatch: (id) => api.get(`/matches/${id}/`),
  generateMatches: (data) => api.post('/matches/generate/', data),
  respondToMatch: (id, data) => api.post(`/matches/${id}/respond/`, data),
};

// --- Location & Nearby Items ---
export const locationService = {
  getNearbyItems: (params) => api.get('/items/nearby/', { params }),
};

// --- Notifications APIs ---
export const notificationService = {
  getNotifications: () => api.get('/notifications/'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read/`),
  markAllAsRead: () => api.post('/notifications/mark-all-read/'),
};

// --- Claims APIs ---
export const claimService = {
  getClaims: (params) => api.get('/claims/', { params }),
  getClaim: (id) => api.get(`/claims/${id}/`),
  createClaim: (formData) => api.post('/claims/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateClaimStatus: (id, data) => api.patch(`/claims/${id}/status/`, data),
};

// --- Dashboard Statistics ---
export const dashboardService = {
  getUserStats: () => api.get('/dashboard/user/'),
  getAdminStats: () => api.get('/dashboard/admin/'),
};

export default api;
