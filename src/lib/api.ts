// CareNova Centralized REST API Client
// Connects to Node.js / Express backend with SQLite & Turso storage
// Lead Architect: Aryan More

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'carenova_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Authentication
  auth: {
    async signup(email: string, password: string, fullName: string) {
      const res = await request<{ token: string; user: any; profile: any }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
      });
      setAuthToken(res.token);
      return res;
    },

    async login(email: string, password: string) {
      const res = await request<{ token: string; user: any; profile: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(res.token);
      return res;
    },

    async getMe() {
      return request<{ user: any; profile: any }>('/api/auth/me');
    },

    async updateProfile(updates: any) {
      return request<{ profile: any }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    logout() {
      removeAuthToken();
    },
  },

  // Health Tracking
  health: {
    async getAll() {
      return request<any>('/api/health/all');
    },

    async logWater(glasses: number, log_date?: string) {
      return request<any>('/api/health/water', {
        method: 'POST',
        body: JSON.stringify({ glasses, log_date }),
      });
    },

    async logWeight(data: { weight: number; bmi?: number; notes?: string; log_date?: string }) {
      return request<any>('/api/health/weight', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async logSleep(data: { duration_hours: number; quality?: string; notes?: string; log_date?: string }) {
      return request<any>('/api/health/sleep', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async logExercise(data: { activity_type: string; duration_minutes: number; calories_burned?: number; intensity?: string; notes?: string; log_date?: string }) {
      return request<any>('/api/health/exercise', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async logSteps(step_count: number, log_date?: string) {
      return request<any>('/api/health/steps', {
        method: 'POST',
        body: JSON.stringify({ step_count, log_date }),
      });
    },

    async logBloodPressure(data: { systolic: number; diastolic: number; pulse?: number; category?: string; log_date?: string }) {
      return request<any>('/api/health/blood-pressure', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async logBloodGlucose(data: { glucose_mg_dl: number; timing?: string; notes?: string; log_date?: string }) {
      return request<any>('/api/health/blood-glucose', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async logHeartRate(data: { bpm: number; tag?: string; log_date?: string }) {
      return request<any>('/api/health/heart-rate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async addMedication(med: { name: string; dosage: string; frequency: string; reminder_time?: string | null; instructions?: string | null }) {
      return request<any>('/api/health/medications', {
        method: 'POST',
        body: JSON.stringify(med),
      });
    },

    async deleteMedication(id: string) {
      return request<any>(`/api/health/medications/${id}`, {
        method: 'DELETE',
      });
    },

    async logMedicationDose(medication_id: string, status = 'taken', log_date?: string) {
      return request<any>('/api/health/medication-logs', {
        method: 'POST',
        body: JSON.stringify({ medication_id, status, log_date }),
      });
    },
  },

  // Admin
  admin: {
    async getOverview() {
      return request<any>('/api/admin/overview');
    },

    async getUsers() {
      return request<{ users: any[] }>('/api/admin/users');
    },

    async updateUserRole(userId: string, role: 'user' | 'admin') {
      return request<any>(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
    },

    async addDisease(disease: any) {
      return request<any>('/api/admin/disease-library', {
        method: 'POST',
        body: JSON.stringify(disease),
      });
    },

    async deleteDisease(id: string) {
      return request<any>(`/api/admin/disease-library/${id}`, {
        method: 'DELETE',
      });
    },
  },
};
