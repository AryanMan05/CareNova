// CareNova Centralized REST API Client
// Connects to Node.js / Express backend with SQLite & Turso storage
// Lead Architect: Aryan More

const BACKEND_URL_KEY = 'carenova_backend_url';

export function getApiBaseUrl(): string {
  // 1. Manually saved backend URL in localStorage (persists across reloads/devices)
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(BACKEND_URL_KEY);
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
  }

  // 2. Build-time environment variable (configured in Netlify / Vite)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 3. Localhost development fallback
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }

  // 4. Default: empty string (relative path for Netlify reverse-proxy if configured)
  return '';
}

export function setApiBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    const clean = (url || '').trim().replace(/\/+$/, '');
    if (!clean) {
      localStorage.removeItem(BACKEND_URL_KEY);
    } else {
      localStorage.setItem(BACKEND_URL_KEY, clean);
    }
  }
}

export function isCustomBackendConfigured(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(BACKEND_URL_KEY));
}

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

  const baseUrl = getApiBaseUrl();
  const targetUrl = baseUrl ? `${baseUrl}${endpoint}` : endpoint;

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      ...options,
      headers,
    });
  } catch (networkErr: any) {
    console.error(`CareNova API network error [${targetUrl}]:`, networkErr);
    throw new Error(
      `Could not connect to backend at "${baseUrl || 'relative'}" (${networkErr.message || 'NetworkError'}). Please ensure your Render backend is running.`
    );
  }

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

  // AI Health Assistant
  ai: {
    async getStatus() {
      return request<{
        status: string;
        version: string;
        aiConfigured: boolean;
        provider: string;
        gemini: { detected: boolean; keyLength: number; keyPrefix: string | null; models: string[] };
        openai: { detected: boolean; keyLength: number };
      }>('/api/ai/status');
    },

    async chat(prompt: string, conversation: any[] = [], context: string = '') {
      return request<{ configured: boolean; reply: string; provider?: string }>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt, conversation, context }),
      });
    },
  },
};
