const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Professional endpoints
  getMyProfile: () => fetchWithAuth('/api/professionals/me'),
  
  updateProfile: (id: string, data: any) => 
    fetchWithAuth(`/api/professionals/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Leads endpoints
  getLeads: () => fetchWithAuth('/api/leads'),
  
  updateLeadStatus: (leadId: string, status: string) =>
    fetchWithAuth(`/api/leads/${leadId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  
  // Stats
  getDashboardStats: () => fetchWithAuth('/api/dashboard/stats'),
};
