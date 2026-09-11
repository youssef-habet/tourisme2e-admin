import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, MapPin, Briefcase, FileText, CheckCircle, Clock, Info } from 'lucide-react';
import { devisService } from '../../services/devisService';

const DevisDetailsModal = ({ devisId, isOpen, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && devisId) {
      fetchDetails();
    }
  }, [isOpen, devisId]);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await devisService.getDevisById(devisId);
      setDetails(data);
    } catch (err) {
      setError("Impossible de charger les détails du devis.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Détails de la demande #{devisId}</h2>
            {details && (
              <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${details.segment === 'SENIOR' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {details.segment === 'SENIOR' ? 'Pack Oriental Senior' : 'Pack Oriental Pro / MICE'}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-teal-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 font-medium py-8">{error}</div>
          ) : details ? (
            <div className="space-y-8">
              
              {/* Informations Client */}
              <section>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users size={16} /> Client
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Nom & Prénom</div>
                    <div className="font-medium text-slate-800">{details.clientNom} {details.clientPrenom}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Organisation / Association</div>
                    <div className="font-medium text-slate-800">{details.organisation || 'N/A'}</div>
                  </div>
                  {details.paysOrigine && (
                    <div>
                      <div className="text-xs text-slate-500">Pays d'origine</div>
                      <div className="font-medium text-slate-800 flex items-center gap-1"><MapPin size={14} className="text-slate-400"/> {details.paysOrigine}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-slate-500">Email (Contact)</div>
                    <div className="font-medium text-blue-600">{details.clientEmail || 'N/A'}</div>
                  </div>
                </div>
              </section>

              {/* Détails du Séjour */}
              <section>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Calendar size={16} /> Séjour & Logistique
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Date souhaitée</div>
                    <div className="font-medium text-slate-800">{new Date(details.dateSouhaitee).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Nombre de participants</div>
                    <div className="font-medium text-slate-800">{details.nbParticipants || details.nombreParticipants} personnes</div>
                  </div>
                  {details.dureeJours && (
                    <div>
                      <div className="text-xs text-slate-500">Durée (MICE)</div>
                      <div className="font-medium text-slate-800">{details.dureeJours} jour(s)</div>
                    </div>
                  )}
                  {details.budget && (
                    <div>
                      <div className="text-xs text-slate-500">Budget estimatif</div>
                      <div className="font-medium text-slate-800">{details.budget} MAD</div>
                    </div>
                  )}
                </div>
              </section>

              {/* Besoins Spécifiques (différenciés) */}
              {(details.besoinsSpecifiques || (details.equipementRequis && details.equipementRequis.length > 0)) && (
                <section>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Briefcase size={16} /> Besoins & Équipements
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {details.besoinsSpecifiques && (
                      <div className="mb-3 last:mb-0">
                        <div className="text-xs text-slate-500 mb-1">Besoins spécifiques (Accessibilité, repas...)</div>
                        <div className="text-sm text-slate-800 leading-relaxed bg-white p-3 rounded border border-slate-200">
                          {details.besoinsSpecifiques}
                        </div>
                      </div>
                    )}
                    
                    {details.equipementRequis && details.equipementRequis.length > 0 && (
                      <div className="mb-3 last:mb-0">
                        <div className="text-xs text-slate-500 mb-2">Équipement requis (Salle)</div>
                        <div className="flex flex-wrap gap-2">
                          {details.equipementRequis.map((eq, i) => (
                            <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 shadow-sm">
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Message */}
              {details.message && (
                <section>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText size={16} /> Message / Note
                  </h3>
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-sm text-slate-800 italic leading-relaxed">
                    "{details.message}"
                  </div>
                </section>
              )}

            </div>
          ) : (
            <div className="text-center text-slate-500">Aucune donnée.</div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

export default DevisDetailsModal;
