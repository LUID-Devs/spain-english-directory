import axiosClient from './axiosClient';

export const jobApplicationApiService = {
  /**
   * Get all job applications for the current user
   * @param {Object} filters - Optional filters (status, search, sort)
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await axiosClient.get(`/job-applications?${params.toString()}`);
      const payload = response.data.data || response.data;
      const applications = payload.applications || payload;
      return { success: true, data: applications };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load job applications'
      };
    }
  },

  /**
   * Get a single job application by ID
   * @param {string} applicationId
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  getById: async (applicationId) => {
    try {
      const response = await axiosClient.get(`/job-applications/${applicationId}`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load job application'
      };
    }
  },

  /**
   * Create a new job application
   * @param {Object} applicationData
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  create: async (applicationData) => {
    try {
      const response = await axiosClient.post('/job-applications', applicationData);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create job application'
      };
    }
  },

  /**
   * Update a job application
   * @param {string} applicationId
   * @param {Object} updates
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  update: async (applicationId, updates) => {
    try {
      const response = await axiosClient.put(`/job-applications/${applicationId}`, updates);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update job application'
      };
    }
  },

  /**
   * Delete a job application
   * @param {string} applicationId
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  delete: async (applicationId) => {
    try {
      await axiosClient.delete(`/job-applications/${applicationId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete job application'
      };
    }
  },

  /**
   * Update application status
   * @param {string} applicationId
   * @param {string} status - One of: applied, screen, interview, offer, rejected
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  updateStatus: async (applicationId, status) => {
    try {
      const response = await axiosClient.put(`/job-applications/${applicationId}`, { status });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update status'
      };
    }
  },

  /**
   * Add a note/activity to an application
   * @param {string} applicationId
   * @param {Object} note - { content, type, date }
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  addNote: async (applicationId, note) => {
    try {
      const response = await axiosClient.post(`/job-applications/${applicationId}/notes`, note);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add note'
      };
    }
  },

  /**
   * Delete a note from an application
   * @param {string} applicationId
   * @param {string} noteId
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  deleteNote: async (applicationId, noteId) => {
    try {
      await axiosClient.delete(`/job-applications/${applicationId}/notes/${noteId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete note'
      };
    }
  },

  /**
   * Get application statistics
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  getStats: async () => {
    try {
      const response = await axiosClient.get('/job-applications/stats');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load statistics'
      };
    }
  },

  /**
   * Bulk update applications
   * @param {Array<string>} applicationIds
   * @param {Object} updates
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  bulkUpdate: async (applicationIds, updates) => {
    try {
      const response = await axiosClient.post('/job-applications/bulk', {
        applicationIds,
        updates
      });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to bulk update applications'
      };
    }
  },

  /**
   * Bulk delete applications
   * @param {Array<string>} applicationIds
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  bulkDelete: async (applicationIds) => {
    try {
      const response = await axiosClient.post('/job-applications/bulk-delete', {
        applicationIds
      });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to bulk delete applications'
      };
    }
  }
};
