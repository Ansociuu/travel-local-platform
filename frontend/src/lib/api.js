const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, ...rest } = options;

  const isFormData = typeof window !== 'undefined' && body instanceof FormData;
  
  const defaultHeaders = {
    ...headers,
  };

  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Add token if exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: defaultHeaders,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    ...rest,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra');
  }

  return data;
}

export const authApi = {
  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  }),
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: userData,
  }),
  getMe: () => apiRequest('/auth/me'),
  updateMe: (userData) => apiRequest('/users/me', {
    method: 'PATCH',
    body: userData,
  }),
  changePassword: (passwordData) => apiRequest('/users/change-password', {
    method: 'PATCH',
    body: passwordData,
  }),
  getStats: () => apiRequest('/users/stats'),
};

export const hotelsApi = {
  getAll: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/hotels${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/hotels/${id}`),
};

export const toursApi = {
  getAll: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/tours${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/tours/${id}`),
};

export const bookingsApi = {
  create: (bookingData) => apiRequest('/bookings', {
    method: 'POST',
    body: bookingData,
  }),
  getMyBookings: () => apiRequest('/bookings/me'),
  cancel: (id) => apiRequest(`/bookings/${id}/cancel`, {
    method: 'PATCH',
  }),
};

export const reviewsApi = {
  create: (reviewData) => apiRequest('/reviews', {
    method: 'POST',
    body: reviewData,
  }),
  getMyReviews: () => apiRequest('/reviews/me'),
  getByHotel: (id) => apiRequest(`/reviews/hotel/${id}`),
  getByTour: (id) => apiRequest(`/reviews/tour/${id}`),
};

export const wishlistApi = {
  toggle: (data) => apiRequest('/wishlist/toggle', {
    method: 'POST',
    body: data,
  }),
  getMyWishlist: () => apiRequest('/wishlist/me'),
};

export const paymentsApi = {
  createVNPayUrl: (bookingId) => apiRequest('/payments/vnpay/create-url', {
    method: 'POST',
    body: { bookingId },
  }),
  verifyVNPayReturn: (queryString) => apiRequest(`/payments/vnpay/vnpay_return?${queryString}`),
};

export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/upload/image', {
      method: 'POST',
      body: formData,
    });
  },
};

export const adminApi = {
  getStats: () => apiRequest('/admin/stats'),
  // Bookings
  getAllBookings: () => apiRequest('/admin/bookings'),
  updateBookingStatus: (id, status) => apiRequest(`/admin/bookings/${id}/status`, {
    method: 'PATCH',
    body: { status },
  }),
  // Users
  getAllUsers: () => apiRequest('/admin/users'),
  updateUserRole: (id, role) => apiRequest(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: { role },
  }),
  // Tours CRUD
  getAllTours: () => apiRequest('/admin/tours'),
  createTour: (data) => apiRequest('/admin/tours', { method: 'POST', body: data }),
  updateTour: (id, data) => apiRequest(`/admin/tours/${id}`, { method: 'PATCH', body: data }),
  deleteTour: (id) => apiRequest(`/admin/tours/${id}`, { method: 'DELETE' }),
  // Hotels/Homestays CRUD
  getAllHotels: () => apiRequest('/admin/hotels'),
  createHotel: (data) => apiRequest('/admin/hotels', { method: 'POST', body: data }),
  updateHotel: (id, data) => apiRequest(`/admin/hotels/${id}`, { method: 'PATCH', body: data }),
  deleteHotel: (id) => apiRequest(`/admin/hotels/${id}`, { method: 'DELETE' }),
};

