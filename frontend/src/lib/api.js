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

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data?.message;
    const error = new Error(message || 'Có lỗi xảy ra');
    error.status = response.status;
    error.data = data;
    throw error;
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
  verifyOtp: (email, token) => apiRequest('/auth/verify', {
    method: 'POST',
    body: { email, token },
  }),
  resendOtp: (email) => apiRequest('/auth/resend-otp', {
    method: 'POST',
    body: { email },
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

export const usersApi = {
  getPublicProfile: (id) => apiRequest(`/users/${id}/profile`),
  createPost: (data) => apiRequest('/users/me/posts', {
    method: 'POST',
    body: data,
  }),
  updatePost: (id, data) => apiRequest(`/users/me/posts/${id}`, {
    method: 'PATCH',
    body: data,
  }),
  deletePost: (id) => apiRequest(`/users/me/posts/${id}`, {
    method: 'DELETE',
  }),
};

export const hotelsApi = {
  getAll: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/hotels${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/hotels/${id}`),
};

export const ownerApi = {
  getMyApplication: () => apiRequest('/owner/applications/me'),
  createApplication: (data) => apiRequest('/owner/applications', {
    method: 'POST',
    body: data,
  }),
  getStats: () => apiRequest('/owner/stats'),
  getHotels: () => apiRequest('/owner/hotels'),
  createHotel: (data) => apiRequest('/owner/hotels', {
    method: 'POST',
    body: data,
  }),
  updateHotel: (id, data) => apiRequest(`/owner/hotels/${id}`, {
    method: 'PATCH',
    body: data,
  }),
  archiveHotel: (id) => apiRequest(`/owner/hotels/${id}`, {
    method: 'DELETE',
  }),
  getTours: () => apiRequest('/owner/tours'),
  createTour: (data) => apiRequest('/owner/tours', {
    method: 'POST',
    body: data,
  }),
  updateTour: (id, data) => apiRequest(`/owner/tours/${id}`, {
    method: 'PATCH',
    body: data,
  }),
  archiveTour: (id) => apiRequest(`/owner/tours/${id}`, {
    method: 'DELETE',
  }),
  getRooms: (hotelId) => apiRequest(`/owner/hotels/${hotelId}/rooms`),
  createRoom: (hotelId, data) => apiRequest(`/owner/hotels/${hotelId}/rooms`, {
    method: 'POST',
    body: data,
  }),
  updateRoom: (hotelId, roomId, data) => apiRequest(`/owner/hotels/${hotelId}/rooms/${roomId}`, {
    method: 'PATCH',
    body: data,
  }),
  deleteRoom: (hotelId, roomId) => apiRequest(`/owner/hotels/${hotelId}/rooms/${roomId}`, {
    method: 'DELETE',
  }),
  getBookings: () => apiRequest('/owner/bookings'),
  updateBookingStatus: (id, status) => apiRequest(`/owner/bookings/${id}/status`, {
    method: 'PATCH',
    body: { status },
  }),
};

export const toursApi = {
  getAll: (params) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
      else if (value !== undefined && value !== null && value !== '') query.set(key, value);
    });
    return apiRequest(`/tours${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiRequest(`/tours/${id}`),
};

export const blogApi = {
  getAll: () => apiRequest('/blog'),
  getById: (id) => apiRequest(`/blog/${id}`),
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
  getBookingStatus: (bookingId) => apiRequest(`/payments/status/${bookingId}`),
  getSepayPaymentInfo: (bookingId) => apiRequest(`/payments/sepay/info/${bookingId}`),
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
  uploadImages: (files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    return apiRequest('/upload/images', {
      method: 'POST',
      body: formData,
    });
  },
};

export const adminApi = {
  getStats: () => apiRequest('/admin/stats'),
  getOwnerApplications: () => apiRequest('/admin/owner-applications'),
  updateOwnerApplicationStatus: (id, status, rejectionReason) => apiRequest(`/admin/owner-applications/${id}/status`, {
    method: 'PATCH',
    body: { status, rejectionReason },
  }),
  // Bookings
  getAllBookings: () => apiRequest('/admin/bookings'),
  updateBookingStatus: (id, status) => apiRequest(`/admin/bookings/${id}/status`, {
    method: 'PATCH',
    body: { status },
  }),
  // Users
  getUsers: () => apiRequest('/admin/users'),
  createUser: (data) => apiRequest('/admin/users', { method: 'POST', body: data }),
  updateUser: (id, data) => apiRequest(`/admin/users/${id}`, { method: 'PATCH', body: data }),
  deleteUser: (id) => apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),
  updateUserRole: (id, role) => apiRequest(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: { role },
  }),
  // Tours CRUD
  getAllTours: () => apiRequest('/admin/tours'),
  createTour: (data) => apiRequest('/admin/tours', { method: 'POST', body: data }),
  updateTour: (id, data) => apiRequest(`/admin/tours/${id}`, { method: 'PATCH', body: data }),
  deleteTour: (id) => apiRequest(`/admin/tours/${id}`, { method: 'DELETE' }),
  updateTourApproval: (id, status, note) => apiRequest(`/admin/tours/${id}/approval`, {
    method: 'PATCH',
    body: { status, note },
  }),
  // Hotels/Homestays CRUD
  getAllHotels: () => apiRequest('/admin/hotels'),
  createHotel: (data) => apiRequest('/admin/hotels', { method: 'POST', body: data }),
  updateHotel: (id, data) => apiRequest(`/admin/hotels/${id}`, { method: 'PATCH', body: data }),
  deleteHotel: (id) => apiRequest(`/admin/hotels/${id}`, { method: 'DELETE' }),
  updateHotelApproval: (id, status, note) => apiRequest(`/admin/hotels/${id}/approval`, {
    method: 'PATCH',
    body: { status, note },
  }),
};

export const chatApi = {
  getConversations: () => apiRequest('/chat/conversations'),
  createConversation: (participantId) => apiRequest('/chat/conversations', {
    method: 'POST',
    body: { participantId },
  }),
  getMessages: (conversationId, skip = 0) => apiRequest(`/chat/conversations/${conversationId}/messages?take=50&skip=${skip}`),
  getUnreadCount: () => apiRequest('/chat/unread'),
  searchUsers: (q) => apiRequest(`/chat/users/search?q=${encodeURIComponent(q)}`),
};
