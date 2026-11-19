const API_BASE = '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('mediguide_token');
}

export function setStoredToken(token: string) {
  localStorage.setItem('mediguide_token', token);
}

export function removeStoredToken() {
  localStorage.removeItem('mediguide_token');
  localStorage.removeItem('mediguide_user');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'A network or server error occurred.');
  }

  return data;
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<any>('/auth/me'),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
  updateProfile: (body: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  forgotPassword: (email: string) => request<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyResetCode: (email: string, code: string) => request<any>('/auth/verify-reset-code', { method: 'POST', body: JSON.stringify({ email, code }) }),
  resetPassword: (body: any) => request<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

  // Facilities Search & Details
  searchFacilities: (params: Record<string, string | number | boolean | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return request<any>(`/facilities/search?${query.toString()}`);
  },
  getLocations: () => request<any>('/facilities/locations'),
  getPublicStats: () => request<any>('/facilities/summary-stats'),
  getFacilityDetails: (id: number, lat?: number, lng?: number) => {
    const query = new URLSearchParams();
    if (lat !== undefined && lng !== undefined) {
      query.append('lat', String(lat));
      query.append('lng', String(lng));
    }
    return request<any>(`/facilities/${id}?${query.toString()}`);
  },

  // Services
  getServices: () => request<any>('/services'),
  createService: (body: any) => request<any>('/services', { method: 'POST', body: JSON.stringify(body) }),
  updateService: (id: number, body: any) => request<any>(`/services/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteService: (id: number) => request<any>(`/services/${id}`, { method: 'DELETE' }),

  // Costs
  compareCosts: (facilityIds: number[], serviceId?: number) => {
    const query = new URLSearchParams({
      facility_ids: facilityIds.join(','),
    });
    if (serviceId) query.append('service_id', String(serviceId));
    return request<any>(`/costs/compare?${query.toString()}`);
  },
  compareByService: (params: {
    service_id?: number;
    service_query?: string;
    city?: string;
    locality?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    facility_type?: string;
    min_price?: number;
    max_price?: number;
    verified_only?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.service_id) query.append('service_id', String(params.service_id));
    if (params.service_query) query.append('service_query', params.service_query);
    if (params.city) query.append('city', params.city);
    if (params.locality) query.append('locality', params.locality);
    if (params.lat !== undefined) query.append('lat', String(params.lat));
    if (params.lng !== undefined) query.append('lng', String(params.lng));
    if (params.radius !== undefined) query.append('radius', String(params.radius));
    if (params.facility_type) query.append('facility_type', params.facility_type);
    if (params.min_price !== undefined) query.append('min_price', String(params.min_price));
    if (params.max_price !== undefined) query.append('max_price', String(params.max_price));
    if (params.verified_only !== undefined) query.append('verified_only', String(params.verified_only));
    if (params.sort) query.append('sort', params.sort);
    if (params.page !== undefined) query.append('page', String(params.page));
    if (params.limit !== undefined) query.append('limit', String(params.limit));
    return request<any>(`/costs/compare-service?${query.toString()}`);
  },
  submitCost: (body: any) => request<any>('/costs/submit', { method: 'POST', body: JSON.stringify(body) }),

  // Saved Facilities
  getSavedFacilities: () => request<any>('/saved-facilities'),
  saveFacility: (facilityId: number) => request<any>(`/saved-facilities/${facilityId}`, { method: 'POST' }),
  removeSavedFacility: (facilityId: number) => request<any>(`/saved-facilities/${facilityId}`, { method: 'DELETE' }),

  // Appointments
  bookAppointment: (body: any) => request<any>('/appointments', { method: 'POST', body: JSON.stringify(body) }),
  getMyAppointments: () => request<any>('/appointments/my-appointments'),
  getFacilityAppointments: (facilityId: number) => request<any>(`/appointments/facility/${facilityId}`),
  updateAppointmentStatus: (id: number, body: any) => request<any>(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
  cancelAppointment: (id: number) => request<any>(`/appointments/${id}`, { method: 'DELETE' }),

  // Pharmacy Medicine Orders
  createPharmacyOrder: (body: any) => request<any>('/pharmacy-orders', { method: 'POST', body: JSON.stringify(body) }),
  getMyPharmacyOrders: () => request<any>('/pharmacy-orders/my-orders'),
  updatePharmacyOrderStatus: (id: number, body: any) => request<any>(`/pharmacy-orders/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),

  // Reports
  submitReport: (body: any) => request<any>('/reports', { method: 'POST', body: JSON.stringify(body) }),
  getMyReports: () => request<any>('/reports/my-reports'),

  // Facility Representative
  getRepDashboard: () => request<any>('/rep/dashboard'),
  proposeRepUpdate: (body: any) => request<any>('/rep/propose-update', { method: 'POST', body: JSON.stringify(body) }),
  addRepService: (service_id: number) => request<any>('/rep/services', { method: 'POST', body: JSON.stringify({ service_id }) }),
  removeRepService: (service_id: number) => request<any>(`/rep/services/${service_id}`, { method: 'DELETE' }),
  getRepRevisions: () => request<any>('/rep/revisions'),

  // Admin
  getAdminStats: () => request<any>('/admin/statistics'),
  getAdminUsers: (params?: { role?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any>(`/admin/users?${q}`);
  },
  updateUserStatus: (userId: number, status: string) =>
    request<any>(`/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  assignRepresentative: (userId: number, facility_id: number | null) =>
    request<any>(`/admin/users/${userId}/assign-facility`, { method: 'PUT', body: JSON.stringify({ facility_id }) }),

  getAdminFacilities: (params?: { status?: string; type?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any>(`/admin/facilities?${q}`);
  },
  createFacility: (body: any) => request<any>('/admin/facilities', { method: 'POST', body: JSON.stringify(body) }),
  updateFacility: (id: number, body: any) => request<any>(`/admin/facilities/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  verifyFacility: (id: number, action: 'APPROVE' | 'REJECT') =>
    request<any>(`/admin/facilities/${id}/verify`, { method: 'PUT', body: JSON.stringify({ action }) }),
  deleteFacility: (id: number, archiveOnly = false) =>
    request<any>(`/admin/facilities/${id}?archive_only=${archiveOnly}`, { method: 'DELETE' }),

  getVerificationQueue: () => request<any>('/admin/verification-queue'),
  reviewRevision: (id: number, action: 'APPROVE' | 'REJECT' | 'CORRECTION_REQUESTED', review_notes?: string) =>
    request<any>(`/admin/revisions/${id}/review`, { method: 'PUT', body: JSON.stringify({ action, review_notes }) }),

  getAdminCosts: (params?: { status?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any>(`/admin/costs?${q}`);
  },
  verifyCostRecord: (id: number, action: 'APPROVE' | 'REJECT') =>
    request<any>(`/admin/costs/${id}/verify`, { method: 'PUT', body: JSON.stringify({ action }) }),

  getAdminReports: (params?: { status?: string; category?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any>(`/admin/reports?${q}`);
  },
  updateReportStatus: (id: number, status: string, admin_notes?: string) =>
    request<any>(`/admin/reports/${id}`, { method: 'PUT', body: JSON.stringify({ status, admin_notes }) }),
  registerFacility: (body: any) => request<any>('/auth/register-facility', { method: 'POST', body: JSON.stringify(body) }),
  rescheduleAppointment: (id: number, body: any) => request<any>(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
  getFacilityAppointmentsForRep: (facilityId: number) => request<any>(`/appointments/facility/${facilityId}`),

  getAdminAuditLogs: (params?: { limit?: number; offset?: number; action?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any>(`/admin/audit-logs?${q}`);
  },
};
