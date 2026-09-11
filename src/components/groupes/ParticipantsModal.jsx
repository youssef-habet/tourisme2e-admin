import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { participantsService } from '../../services/participantsService';

const ParticipantsModal = ({ groupe, onClose }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const data = await participantsService.getParticipantsAdmin(groupe.id);
      setParticipants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [groupe.id]);

  const handleConfirmer = async (id) => {
    try {
      await participantsService.confirmerParticipant(id);
      fetchParticipants();
    } catch (err) {
      alert('Erreur lors de la confirmation');
    }
  };

  const handleRefuser = async (id) => {
    try {
      await participantsService.refuserParticipant(id);
      fetchParticipants();
    } catch (err) {
      alert('Erreur lors du refus');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Participants - {groupe.nom}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-grow">
          {loading ? (
            <div className="text-center p-4 text-slate-500">Chargement...</div>
          ) : participants.length === 0 ? (
            <div className="text-center p-4 text-slate-500">Aucun participant pour ce groupe.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3">Nom complet</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((p) => (
                  <tr key={p.id}>
                    <td className="p-3 text-sm">{p.prenom} {p.nom}</td>
                    <td className="p-3 text-sm">{p.email}</td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${p.statut === 'CONFIRME' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {p.statut}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {p.statut !== 'CONFIRME' && (
                        <button onClick={() => handleConfirmer(p.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Confirmer">
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {p.statut !== 'REFUSE' && (
                        <button onClick={() => handleRefuser(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Refuser">
                          <XCircle size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantsModal;
