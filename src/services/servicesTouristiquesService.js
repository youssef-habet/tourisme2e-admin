import api from './api';

export const servicesTouristiquesService = {
  getServices: async () => {
    const response = await api.get('/services-touristiques');
    return response.data;
  },

  getServiceById: async (id) => {
    const response = await api.get(`/services-touristiques/${id}`);
    return response.data;
  },

  createService: async (serviceData) => {
    const response = await api.post('/services-touristiques', serviceData);
    return response.data;
  },

  updateService: async (id, serviceData) => {
    const response = await api.put(`/services-touristiques/${id}`, serviceData);
    return response.data;
  },

  deleteService: async (id) => {
    const response = await api.delete(`/services-touristiques/${id}`);
    return response.data;
  }
};
