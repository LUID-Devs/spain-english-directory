import axiosClient from './axiosClient';

export const resumeApiService = {
  /**
   * Get all resumes for the current user
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  getAll: async () => {
    try {
      const response = await axiosClient.get('/resumes');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load resumes'
      };
    }
  },

  /**
   * Get a single resume by ID
   * @param {string} resumeId
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  getById: async (resumeId) => {
    try {
      const response = await axiosClient.get(`/resumes/${resumeId}`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load resume'
      };
    }
  }
};
