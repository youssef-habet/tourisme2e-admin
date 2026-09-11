import api from './api';

export const adminsService = {
  getAdmins: async () => {
    const response = await api.get('/admins');
    return response.data;
  },
  
  createAdmin: async (adminData) => {
    const response = await api.post('/admins', adminData);
    return response.data;
  },

  updateAdmin: async (id, adminData) => {
    const response = await api.put(`/admins/${id}`, adminData);
    return response.data;
  },

  suspendAdmin: async (id) => {
    const response = await api.patch(`/admins/${id}/suspendre`);
    return response.data;
  },

  assignRole: async (id, roleName) => {
    const response = await api.post(`/admins/${id}/roles`, { role: roleName });
    return response.data;
  }
};
