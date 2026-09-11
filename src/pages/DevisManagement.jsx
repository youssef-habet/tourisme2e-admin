import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, FileOutput, Clock } from 'lucide-react';
import { devisService } from '../services/devisService';
import { groupesService } from '../services/groupesService';
import { generateDevisPDF } from '../utils/pdfGenerator';

const DevisManagement = () => {
  const [devisList, setDevisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedGroupe, setSelectedGroupe] = useState(null);
  const [devisForm, setDevisForm] = useState({
    montantHebergement: 0,
    montantRestauration: 0,
    montantTransport: 0,
    montantServices: 0,
    montantReductions: 0
  });

  const fetchDevis = async () => {
    setLoading(true);
    try {
      const devisData = await devisService.getAllDevis();
      const groupesData = await groupesService.getGroupesAdmin();
      
      const formattedGroupes = groupesData
        .filter(g => g.typeGroupe === 'FERME')
        .map(g => ({
          id: `GF-${g.id}`, // prefix to avoid ID collision
          realId: g.id,
          isGroupeFerme: true,
          offreTitre: g.titre,
          besoinsSpecifiques: g.message || 'Demande de création de Groupe Fermé',
          dateSouhaitee: g.dateDebut,
          nbParticipants: g.capaciteMax,
          statut: g.statut,
          pdfUrl: g.devisPdfUrl
        }));

      setDevisList([...devisData, ...formattedGroupes]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevis();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      if (typeof id === 'string' && id.startsWith('GF-')) {
        // Here we could add a call to groupesService to update the status of the groupe ferme
        // if the backend supported it, but for now we just show an alert or let it be
        alert("La mise à jour de statut pour les Groupes Fermés se fait depuis la page 'Gestion des Groupes' (Validation).");
      } else {
        await devisService.updateDevisStatus(id, status);
        fetchDevis();
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleGeneratePDF = async (devis) => {
    if (devis.isGroupeFerme) {
      if (devis.statut === 'DEVIS_ENVOYE' || devis.statut === 'ACTIF') {
        try {
          const blob = await groupesService.telechargerDevisPdf(devis.realId);
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (err) {
          console.error("Erreur téléchargement PDF", err);
          alert("Erreur lors du téléchargement du PDF. Veuillez réessayer.");
        }
      } else {
        setSelectedGroupe(devis);
        setDevisForm({ montantHebergement: 0, montantRestauration: 0, montantTransport: 0, montantServices: 0, montantReductions: 0 });
        setShowGenerateModal(true);
      }
    } else {
      generateDevisPDF(devis);
      if (devis.statut === 'EN_ATTENTE') {
        handleUpdateStatus(devis.id, 'EN_TRAITEMENT');
      }
    }
  };

  const handleDevisSubmit = async (e) => {
    e.preventDefault();
    try {
      await groupesService.genererDevis(selectedGroupe.realId, devisForm);
      setShowGenerateModal(false);
      fetchDevis();
      alert("Devis généré avec succès ! Le PDF a été créé et envoyé au client.");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du devis: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des Devis</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez les demandes de devis des groupes fermés</p>
        </div>
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Générer Devis - {selectedGroupe?.offreTitre}</h2>
            <form onSubmit={handleDevisSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Montant Hébergement (MAD)</label>
                <input type="number" value={devisForm.montantHebergement} onChange={e => setDevisForm({...devisForm, montantHebergement: parseFloat(e.target.value)})} className="w-full p-2 border border-slate-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Montant Restauration (MAD)</label>
                <input type="number" value={devisForm.montantRestauration} onChange={e => setDevisForm({...devisForm, montantRestauration: parseFloat(e.target.value)})} className="w-full p-2 border border-slate-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Montant Transport (MAD)</label>
                <input type="number" value={devisForm.montantTransport} onChange={e => setDevisForm({...devisForm, montantTransport: parseFloat(e.target.value)})} className="w-full p-2 border border-slate-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Montant Services Add. (MAD)</label>
                <input type="number" value={devisForm.montantServices} onChange={e => setDevisForm({...devisForm, montantServices: parseFloat(e.target.value)})} className="w-full p-2 border border-slate-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Montant Réductions Manuelles (MAD)</label>
                <input type="number" value={devisForm.montantReductions} onChange={e => setDevisForm({...devisForm, montantReductions: parseFloat(e.target.value)})} className="w-full p-2 border border-slate-300 rounded-lg" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowGenerateModal(false)} className="px-4 py-2 font-bold text-slate-600">Annuler</button>
                <button type="submit" className="bg-teal-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-teal-700">Générer & Envoyer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4">N°</th>
              <th className="p-4">Offre / Groupe</th>
              <th className="p-4">Date Souhaitée</th>
              <th className="p-4">Participants</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="p-4 text-center text-slate-500">Chargement...</td></tr>
            ) : devisList.length === 0 ? (
              <tr><td colSpan="6" className="p-4 text-center text-slate-500">Aucune demande de devis.</td></tr>
            ) : (
              devisList.map(devis => (
                <tr key={devis.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-700">#{devis.id}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{devis.offreTitre}</p>
                    <p className="text-xs text-slate-500 truncate max-w-xs">{devis.besoinsSpecifiques}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {devis.dateSouhaitee ? new Date(devis.dateSouhaitee).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-700">
                    {devis.nbParticipants} pers.
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full 
                      ${(devis.statut === 'VALIDE' || devis.statut === 'ACTIF') ? 'bg-green-100 text-green-700' : 
                        devis.statut === 'DEVIS_ENVOYE' ? 'bg-blue-100 text-blue-700' : 
                        (devis.statut === 'EN_ATTENTE' || devis.statut === 'BROUILLON') ? 'bg-amber-100 text-amber-700' : 
                        'bg-slate-100 text-slate-700'}`}>
                      {devis.statut}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleGeneratePDF(devis)} 
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded flex items-center gap-1 text-xs font-bold" 
                        title={(devis.isGroupeFerme && (devis.statut === 'DEVIS_ENVOYE' || devis.statut === 'ACTIF')) ? "Télécharger PDF" : "Générer PDF"}
                      >
                        <FileOutput size={16} /> {(devis.isGroupeFerme && (devis.statut === 'DEVIS_ENVOYE' || devis.statut === 'ACTIF')) ? 'Télécharger' : 'PDF'}
                      </button>
                      
                      {devis.statut === 'EN_ATTENTE' && (
                        <button onClick={() => handleUpdateStatus(devis.id, 'EN_TRAITEMENT')} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Marquer en traitement">
                          <Clock size={18} />
                        </button>
                      )}
                      
                      {devis.statut !== 'VALIDE' && (
                        <button onClick={() => handleUpdateStatus(devis.id, 'VALIDE')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Valider le devis">
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DevisManagement;
