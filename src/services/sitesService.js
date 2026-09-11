import api from './api';

export const sitesService = {
  getSites: async () => {
    // Expected endpoint based on backend updates
    const response = await api.get('/sites-touristiques');
    return response.data;
  },

  getSiteById: async (id) => {
    const response = await api.get(`/sites-touristiques/${id}`);
    return response.data;
  },

  createSite: async (siteData) => {
    const response = await api.post('/sites-touristiques', siteData);
    return response.data;
  },

  updateSite: async (id, siteData) => {
    const response = await api.put(`/sites-touristiques/${id}`, siteData);
    return response.data;
  },

  deleteSite: async (id) => {
    const response = await api.delete(`/sites-touristiques/${id}`);
    return response.data;
  }
};
