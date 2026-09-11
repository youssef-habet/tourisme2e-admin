import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Users, RefreshCw, FileText, CheckSquare, Info } from 'lucide-react';
import { groupesService } from '../services/groupesService';
import ParticipantsModal from '../components/groupes/ParticipantsModal';
import { generateDevisPDF } from '../utils/pdfGenerator';

const GroupesManagement = () => {
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [selectedGroupe, setSelectedGroupe] = useState(null);
  const [expandedGroupeId, setExpandedGroupeId] = useState(null);

  const fetchGroupes = async () => {
    setLoading(true);
    try {
      const data = await groupesService.getGroupesAdmin();
      setGroupes(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des groupes');
      console.error('Fetch Groupes Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupes();
  }, []);

  const handleValider = async (id) => {
    if (window.confirm('Valider ce groupe ouvert ?')) {
      try {
        await groupesService.validerGroupe(id);
        fetchGroupes();
      } catch (err) {
        alert('Erreur lors de la validation');
      }
    }
  };

  const handleConfirmerDevis = async (id) => {
    if (window.confirm('Le client a-t-il bien validé ce devis ?')) {
      try {
        await groupesService.confirmerDevis(id);
        fetchGroupes();
      } catch (err) {
        alert('Erreur lors de la confirmation du devis');
      }
    }
  };

  const handleManageParticipants = (groupe) => {
    setSelectedGroupe(groupe);
    setIsParticipantsModalOpen(true);
  };

  const toggleExpand = (id) => {
    setExpandedGroupeId(expandedGroupeId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-800">Gestion des Groupes</h1>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3">Nom du Groupe</th>
                <th className="p-3">Type</th>
                <th className="p-3">Statut & Validation</th>
                <th className="p-3">Capacité</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-500">
                    <RefreshCw size={20} className="animate-spin inline-block mr-2" /> Chargement...
                  </td>
                </tr>
              ) : groupes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-500">Aucun groupe trouvé.</td>
                </tr>
              ) : (
                groupes.map((groupe) => (
                  <React.Fragment key={groupe.id}>
                    <tr className="hover:bg-slate-50/50 cursor-pointer" onClick={() => toggleExpand(groupe.id)}>
                      <td className="p-3 font-medium text-slate-800">
                        {groupe.titre}
                        {groupe.numeroDevis && <span className="ml-2 text-xs text-slate-400 font-normal">#{groupe.numeroDevis}</span>}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${groupe.typeGroupe === 'FERME' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {groupe.typeGroupe}
                        </span>
                      </td>
                      <td className="p-3 flex flex-col items-start gap-1">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${groupe.statut === 'ACTIF' || groupe.statut === 'COMPLET' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                          {groupe.statut}
                        </span>
                        {groupe.typeGroupe === 'OUVERT' && groupe.placesVersSeuilValidation > 0 && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">
                            Encore {groupe.placesVersSeuilValidation} places pour valider
                          </span>
                        )}
                        {groupe.typeGroupe === 'OUVERT' && groupe.placesVersSeuilValidation <= 0 && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                            Seuil atteint (Validé)
                          </span>
                        )}
                      </td>
                      <td className="p-3">{groupe.nbParticipantsConfirmes} / {groupe.capaciteMax} pers.</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleManageParticipants(groupe)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Gérer participants">
                            <Users size={18} />
                          </button>
                          
                          {/* Admin valider le groupe (ouvert) */}
                          {groupe.typeGroupe === 'OUVERT' && (groupe.statut === 'EN_ATTENTE_VALIDATION' || groupe.statut === 'EN_FORMATION') && (
                            <button onClick={() => handleValider(groupe.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Valider le groupe">
                              <CheckCircle size={18} />
                            </button>
                          )}
                          
                          {/* Générer devis (fermé) */}
                          {groupe.typeGroupe === 'FERME' && (
                            <button onClick={() => generateDevisPDF(groupe)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="Générer Devis PDF">
                              <FileText size={18} />
                            </button>
                          )}

                          {/* Confirmer devis (fermé) */}
                          {groupe.typeGroupe === 'FERME' && groupe.statut === 'DEVIS_ENVOYE' && (
                            <button onClick={() => handleConfirmerDevis(groupe.id)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded" title="Confirmer Devis">
                              <CheckSquare size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* EXPANDED ROW FOR DEVIS DETAILS */}
                    {expandedGroupeId === groupe.id && groupe.typeGroupe === 'FERME' && (
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <td colSpan="5" className="p-4">
                          <div className="bg-white p-4 rounded-lg shadow-inner border border-slate-200">
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <Info size={16} className="text-blue-500" />
                              Détails du Devis
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">N° Devis</p>
                                <p className="font-bold text-slate-800">{groupe.numeroDevis || 'Non généré'}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Date Devis</p>
                                <p className="font-bold text-slate-800">{groupe.dateDevis || '-'}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Acompte Réglé</p>
                                <p className={`font-bold ${groupe.acompteRegle ? 'text-green-600' : 'text-orange-500'}`}>
                                  {groupe.acompteRegle ? 'Oui' : 'Non / En attente'}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Limite Solde</p>
                                <p className="font-bold text-slate-800">{groupe.dateLimiteSolde || '-'}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isParticipantsModalOpen && selectedGroupe && (
        <ParticipantsModal 
          groupe={selectedGroupe} 
          onClose={() => setIsParticipantsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default GroupesManagement;
