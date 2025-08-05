import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    phone?: string;
    department?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    return response.data;
  }
};

// Dashboard API calls
export const dashboardAPI = {
  getOverview: async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },
  
  getMyTasks: async () => {
    const response = await api.get('/dashboard/my-tasks');
    return response.data;
  }
};

// Audit API calls
export const auditAPI = {
  getPlans: async (params?: { year?: number; status?: string }) => {
    const response = await api.get('/audits/plans', { params });
    return response.data;
  },
  
  createPlan: async (planData: {
    title: string;
    description: string;
    year: number;
  }) => {
    const response = await api.post('/audits/plans', planData);
    return response.data;
  },
  
  getEngagements: async (params?: { 
    status?: string; 
    year?: number; 
    plan_id?: number; 
  }) => {
    const response = await api.get('/audits/engagements', { params });
    return response.data;
  },
  
  createEngagement: async (engagementData: {
    title: string;
    objective: string;
    scope: string;
    audit_plan_id?: number;
    risk_assessment_id?: number;
    lead_auditor: number;
    planned_start_date: string;
    planned_end_date: string;
    budgeted_hours: number;
  }) => {
    const response = await api.post('/audits/engagements', engagementData);
    return response.data;
  },
  
  getWorkingPapers: async (engagementId: number) => {
    const response = await api.get(`/audits/engagements/${engagementId}/working-papers`);
    return response.data;
  },
  
  createWorkingPaper: async (engagementId: number, wpData: {
    title: string;
    description: string;
    wp_reference: string;
  }) => {
    const response = await api.post(`/audits/engagements/${engagementId}/working-papers`, wpData);
    return response.data;
  },
  
  getFindings: async (engagementId: number) => {
    const response = await api.get(`/audits/engagements/${engagementId}/findings`);
    return response.data;
  },
  
  createFinding: async (engagementId: number, findingData: {
    title: string;
    condition: string;
    criteria: string;
    cause: string;
    effect: string;
    recommendation: string;
    severity: string;
    assigned_to?: number;
    target_date?: string;
  }) => {
    const response = await api.post(`/audits/engagements/${engagementId}/findings`, findingData);
    return response.data;
  }
};

// Risk API calls
export const riskAPI = {
  getAssessments: async (params?: { risk_level?: string; area?: string }) => {
    const response = await api.get('/risks', { params });
    return response.data;
  },
  
  createAssessment: async (riskData: {
    title: string;
    description: string;
    area_assessed: string;
    inherent_risk_score: number;
    residual_risk_score: number;
    risk_factors: string;
    controls_identified: string;
    assessment_date: string;
    next_review_date: string;
  }) => {
    const response = await api.post('/risks', riskData);
    return response.data;
  },
  
  getHeatmap: async () => {
    const response = await api.get('/risks/heatmap');
    return response.data;
  },
  
  getAssessment: async (id: number) => {
    const response = await api.get(`/risks/${id}`);
    return response.data;
  },
  
  updateAssessment: async (id: number, riskData: Record<string, unknown>) => {
    const response = await api.put(`/risks/${id}`, riskData);
    return response.data;
  }
};

// User API calls
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateProfile: async (profileData: {
    first_name: string;
    last_name: string;
    phone?: string;
    department?: string;
    certifications?: string[];
  }) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
  
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  updateUserStatus: async (userId: number, status: string) => {
    const response = await api.put(`/users/${userId}/status`, { status });
    return response.data;
  }
};