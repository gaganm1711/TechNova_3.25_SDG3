/**
 * API Service for Smart Ambulance Backend
 * Handles all communication with FastAPI server
 */

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8002";

// Auth token storage
let authToken = localStorage.getItem("adminToken") || null;

export const setAuthToken = (token) => {
  authToken = token;
  localStorage.setItem("adminToken", token);
};

export const getAuthToken = () => authToken;

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem("adminToken");
};

/**
 * Generic fetch wrapper
 */
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add auth token if available
  if (authToken && !options.noAuth) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearAuthToken();
        throw new Error("Session expired. Please login again.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * AUTHENTICATION
 */
export async function adminLogin(username, password) {
  const data = await apiCall("/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    noAuth: true,
  });
  setAuthToken(data.access_token);
  return data;
}

/**
 * EMERGENCY ENDPOINTS
 */
export async function requestAmbulance(name, age, condition, latitude, longitude) {
  return apiCall("/emergency/request", {
    method: "POST",
    body: JSON.stringify({
      name,
      age: age ? parseInt(age) : null,
      condition,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    }),
    noAuth: true,
  });
}

export async function getEmergencyStatus(patientId) {
  return apiCall(`/emergency/status/${patientId}`, { noAuth: true });
}

/**
 * MAP & TRACKING
 */
export async function getMapState() {
  return apiCall("/map/state", { noAuth: true });
}

/**
 * ADMIN ENDPOINTS
 */
export async function getAdminDashboard() {
  return apiCall("/admin/dashboard");
}

export async function dispatchAllAmbulances() {
  return apiCall("/admin/dispatchAll", { method: "POST" });
}

export async function releaseAllAmbulances() {
  return apiCall("/admin/releaseAll", { method: "POST" });
}

export async function markPatientReached(patientId) {
  return apiCall(`/admin/markReached?patient_id=${patientId}`, {
    method: "POST",
  });
}

/**
 * AMBULANCE ENDPOINTS
 */
export async function getAmbulanceList() {
  return apiCall("/ambulances/list", { noAuth: true });
}

export async function getAmbulanceDetails(ambulanceId) {
  return apiCall(`/ambulance/${ambulanceId}`, { noAuth: true });
}

/**
 * HOSPITAL ENDPOINTS
 */
export async function getHospitalList() {
  return apiCall("/hospitals/list", { noAuth: true });
}

export async function getHospitalDetails(hospitalId) {
  return apiCall(`/hospital/${hospitalId}`, { noAuth: true });
}

/**
 * SYSTEM ENDPOINTS
 */
export async function getSystemLogs(limit = 50) {
  return apiCall(`/logs?limit=${limit}`, { noAuth: true });
}

export async function getHealthCheck() {
  return apiCall("/", { noAuth: true });
}
