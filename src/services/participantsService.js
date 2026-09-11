import api from './api';

export const participantsService = {
  getParticipantsAdmin: async (groupeId) => {
    const response = await api.get(`/groupes/${groupeId}/participants/admin`);
    return response.data.contenu || response.data;
  },
  
  confirmerParticipant: async (id) => {
    const response = await api.patch(`/participants/${id}/confirmer`);
    return response.data;
  },

  refuserParticipant: async (id) => {
    const response = await api.patch(`/participants/${id}/refuser`);
    return response.data;
  }
};
