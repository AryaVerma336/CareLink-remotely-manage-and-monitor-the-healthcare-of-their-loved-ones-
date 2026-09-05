/**
 * CareLink Frontend API Client & Service Wrapper
 * Handles seamless communication with Express backend REST endpoints and Socket.io real-time server.
 */

const API_BASE_URL = window.location.origin.includes('5000') 
  ? '/api/v1' 
  : 'http://localhost:5000/api/v1';

class CareLinkAPIClient {
  constructor() {
    this.token = localStorage.getItem('carelink_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('carelink_token', token);
    } else {
      localStorage.removeItem('carelink_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'API Request failed');
      }
      return data;
    } catch (err) {
      console.warn(`[CareLink API] Request to ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  // Auth APIs
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.data?.token) {
      this.setToken(data.data.token);
    }
    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.data?.token) {
      this.setToken(data.data.token);
    }
    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Appointments
  async getHospitals(city) {
    const query = city ? `?city=${encodeURIComponent(city)}` : '';
    return this.request(`/appointments/hospitals${query}`);
  }

  async getDoctors(hospitalId, specialization) {
    let query = '?';
    if (hospitalId) query += `hospital_id=${encodeURIComponent(hospitalId)}&`;
    if (specialization) query += `specialization=${encodeURIComponent(specialization)}`;
    return this.request(`/appointments/doctors${query}`);
  }

  async getAppointments() {
    return this.request('/appointments');
  }

  async createAppointment(appointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  // Medicines & Orders
  async searchMedicines(searchTerm) {
    const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    return this.request(`/medicines${query}`);
  }

  async getExpiryDashboard() {
    return this.request('/medicines/expiry-dashboard');
  }

  async placeMedicineOrder(orderData) {
    return this.request('/medicines/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return this.request('/medicines/orders');
  }

  // Transport & Trips
  async getTrips() {
    return this.request('/trips');
  }

  async createTripRequest(tripData) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  }

  // Emergency SOS
  async triggerSOS(locationData) {
    return this.request('/emergency/sos', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  // Admin Analytics
  async getAdminStats() {
    return this.request('/admin/stats');
  }
}

window.careLinkAPI = new CareLinkAPIClient();
