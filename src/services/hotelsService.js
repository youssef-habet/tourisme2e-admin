import api from './api';

export const hotelsService = {
  getHotels: async () => {
    const response = await api.get('/hotels-centres');
    return response.data;
  },

  getHotelById: async (id) => {
    const response = await api.get(`/hotels-centres/${id}`);
    return response.data;
  },

  createHotel: async (hotelData) => {
    const response = await api.post('/hotels-centres', hotelData);
    return response.data;
  },

  updateHotel: async (id, hotelData) => {
    const response = await api.put(`/hotels-centres/${id}`, hotelData);
    return response.data;
  },

  deleteHotel: async (id) => {
    const response = await api.delete(`/hotels-centres/${id}`);
    return response.data;
  }
};
