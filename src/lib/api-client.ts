/**
 * API Client para Polaris Hub
 *
 * Cliente TypeScript para consumir la API REST de Polaris Hub
 * con autenticación JWT y manejo de tokens.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://your-domain.vercel.app/api";

/**
 * Storage keys for tokens
 */
const TOKEN_KEYS = {
  ACCESS: "polaris_access_token",
  REFRESH: "polaris_refresh_token",
};

/**
 * API Response type
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Get stored access token
 */
function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.ACCESS);
}

/**
 * Get stored refresh token
 */
function getRefreshToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.REFRESH);
}

/**
 * Set tokens in storage
 */
function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
  localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
}

/**
 * Clear tokens from storage
 */
function clearTokens() {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
}

/**
 * Make API request with automatic token refresh
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const accessToken = getAccessToken();

  // Add authorization header if token exists
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken && !endpoint.startsWith("/auth/")) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    // If unauthorized and not already refreshing, try to refresh token
    if (response.status === 401 && !endpoint.includes("/auth/refresh")) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry original request with new token
          return apiRequest<T>(endpoint, options);
        }
      }
      // If refresh fails, clear tokens and throw error
      clearTokens();
      throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
    }

    return data;
  } catch (error: any) {
    console.error("API request error:", error);
    throw error;
  }
}

/**
 * Refresh access token
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (data.success && data.data.accessToken) {
      localStorage.setItem(TOKEN_KEYS.ACCESS, data.data.accessToken);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Token refresh error:", error);
    return false;
  }
}

/**
 * Auth API
 */
export const authApi = {
  /**
   * Login
   */
  async login(email: string, password: string) {
    const response = await apiRequest<{
      accessToken: string;
      refreshToken: string;
      user: { id: string; email: string };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  },

  /**
   * Register
   */
  async register(email: string, password: string) {
    const response = await apiRequest<{
      accessToken: string;
      refreshToken: string;
      user: { id: string; email: string };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  },

  /**
   * Logout
   */
  logout() {
    clearTokens();
  },

  /**
   * Get current user
   */
  async me() {
    return apiRequest("/auth/me");
  },
};

/**
 * Data API
 */
export const dataApi = {
  /**
   * Get all company data
   */
  async getAll() {
    return apiRequest("/data");
  },

  /**
   * Update all company data
   */
  async updateAll(data: any) {
    return apiRequest("/data", {
      method: "PUT",
      body: JSON.stringify({ data }),
    });
  },
};

/**
 * Settings API
 */
export const settingsApi = {
  /**
   * Get settings
   */
  async get() {
    return apiRequest("/settings");
  },

  /**
   * Update settings
   */
  async update(settings: Partial<any>) {
    return apiRequest("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  },
};

/**
 * Sales API
 */
export const salesApi = {
  /**
   * List sales
   */
  async list(params?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/sales${query ? `?${query}` : ""}`);
  },

  /**
   * Get sale by ID
   */
  async get(id: string) {
    return apiRequest(`/sales/${id}`);
  },

  /**
   * Create sale
   */
  async create(sale: any) {
    return apiRequest("/sales", {
      method: "POST",
      body: JSON.stringify(sale),
    });
  },

  /**
   * Update sale
   */
  async update(id: string, sale: Partial<any>) {
    return apiRequest(`/sales/${id}`, {
      method: "PUT",
      body: JSON.stringify(sale),
    });
  },

  /**
   * Delete sale
   */
  async delete(id: string) {
    return apiRequest(`/sales/${id}`, {
      method: "DELETE",
    });
  },
};

/**
 * Expenses API
 */
export const expensesApi = {
  async list(params?: any) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/expenses${query ? `?${query}` : ""}`);
  },
  async get(id: string) {
    return apiRequest(`/expenses/${id}`);
  },
  async create(expense: any) {
    return apiRequest("/expenses", {
      method: "POST",
      body: JSON.stringify(expense),
    });
  },
  async update(id: string, expense: Partial<any>) {
    return apiRequest(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(expense),
    });
  },
  async delete(id: string) {
    return apiRequest(`/expenses/${id}`, {
      method: "DELETE",
    });
  },
};

/**
 * Products API
 */
export const productsApi = {
  async list(params?: { category?: string; lowStock?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/products${query ? `?${query}` : ""}`);
  },
  async get(id: string) {
    return apiRequest(`/products/${id}`);
  },
  async create(product: any) {
    return apiRequest("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  },
  async update(id: string, product: Partial<any>) {
    return apiRequest(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    });
  },
  async delete(id: string) {
    return apiRequest(`/products/${id}`, {
      method: "DELETE",
    });
  },
};

/**
 * Clients API
 */
export const clientsApi = {
  async list(params?: { type?: "cliente" | "proveedor" }) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/clients${query ? `?${query}` : ""}`);
  },
  async get(id: string) {
    return apiRequest(`/clients/${id}`);
  },
  async create(client: any) {
    return apiRequest("/clients", {
      method: "POST",
      body: JSON.stringify(client),
    });
  },
  async update(id: string, client: Partial<any>) {
    return apiRequest(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(client),
    });
  },
  async delete(id: string) {
    return apiRequest(`/clients/${id}`, {
      method: "DELETE",
    });
  },
};

/**
 * Services API
 */
export const servicesApi = {
  async list() {
    return apiRequest("/services");
  },
  async get(id: string) {
    return apiRequest(`/services/${id}`);
  },
  async create(service: any) {
    return apiRequest("/services", {
      method: "POST",
      body: JSON.stringify(service),
    });
  },
  async update(id: string, service: Partial<any>) {
    return apiRequest(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(service),
    });
  },
  async delete(id: string) {
    return apiRequest(`/services/${id}`, {
      method: "DELETE",
    });
  },
};

/**
 * Example usage:
 *
 * // Login
 * const loginResult = await authApi.login('user@example.com', 'password123');
 *
 * // Get sales
 * const salesResult = await salesApi.list({ category: 'Alimentos', limit: 10 });
 *
 * // Create sale
 * const newSale = await salesApi.create({
 *   date: '2026-02-09',
 *   amount: 150.50,
 *   category: 'Alimentos',
 *   description: 'Venta de productos'
 * });
 *
 * // Update settings
 * await settingsApi.update({
 *   businessName: 'Mi Nueva Empresa',
 *   currency: 'EUR'
 * });
 */
