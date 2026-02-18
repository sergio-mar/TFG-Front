import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// ===============================
//  INSTANCIA AXIOS
// ===============================
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ===============================
//  TOKEN MANAGEMENT
// ===============================
export const setToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

// ===============================
//  REQUEST INTERCEPTOR
// ===============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
//  RESPONSE INTERCEPTOR
// ===============================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Token expirado o inválido
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // No redirigimos directamente para no romper React
      // Devolvemos un error especial para que App.js lo maneje
      return Promise.reject({ unauthorized: true });
    }

    return Promise.reject(error);
  }
);

// ===============================
//  AUTH
// ===============================
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });

  if (response.data.token) {
    setToken(response.data.token);
  }

  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const register = (userData) => api.post('/auth/register', userData);

// ===============================
//  USERS
// ===============================
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// ===============================
//  SERVICES
// ===============================
export const getServices = () => api.get('/services');
export const getServiceById = (id) => api.get(`/services/${id}`);
export const createService = (serviceData) => api.post('/services', serviceData);
export const updateService = (id, serviceData) => api.put(`/services/${id}`, serviceData);
export const deleteService = (id) => api.delete(`/services/${id}`);
export const getServicesByProfessional = (professionalId) =>
  api.get(`/services/professional/${professionalId}`);
export const getServicesByCategory = (category) =>
  api.get(`/services/category/${category}`);

// ===============================
//  BOOKINGS
// ===============================
export const getBookings = () => api.get('/bookings');
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const createBooking = (bookingData) => api.post('/bookings', bookingData);
export const updateBookingStatus = (id, status) =>
  api.put(`/bookings/${id}/status`, { status });
export const getBookingsByClient = (clientId) =>
  api.get(`/bookings/client/${clientId}`);
export const getBookingsByProfessional = (professionalId) =>
  api.get(`/bookings/professional/${professionalId}`);

// ===============================
//  COMPLAINTS
// ===============================
export const getComplaints = () => api.get('/complaints');
export const createComplaint = (complaintData) => api.post('/complaints', complaintData);

export default api;
