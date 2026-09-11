import React, { useState, useEffect } from 'react';
import { PlusCircle, Briefcase, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { servicesTouristiquesService } from '../services/servicesTouristiquesService';

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const initialFormState = {
    nom: '',
    description: '',
    tarif: '',
    actif: true
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await servicesTouristiquesService.getServices();
      setServices(data);
    } catch (err) {
      console.error(err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleEdit = (service) => {
    setFormData({
      nom: service.nom || '',
      description: service.description || '',
      tarif: service.tarif || '',
      actif: service.actif !== undefined ? service.actif : true
    });
    setCurrentId(service.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      try {
        await servicesTouristiquesService.deleteService(id);
        fetchServices();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tarif: parseFloat(formData.tarif)
      };

      if (isEditing) {
        await servicesTouristiquesService.updateService(currentId, payload);
      } else {
        await servicesTouristiquesService.createService(payload);
      }
      
      setShowForm(false);
      setIsEditing(false);
      setFormData(initialFormState);
      fetchServices();
    } catch (err) {
      alert("Erreur lors de l'enregistrement.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Catalogue des Services</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez les services optionnels (Transferts, guides, assurances...)</p>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setIsEditing(false);
            setFormData(initialFormState);
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <PlusCircle size={20} /> {showForm ? 'Annuler' : 'Nouveau Service'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
            <Briefcase size={20} className="text-teal-600" />
            {isEditing ? 'Modifier le service' : 'Ajouter un service'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Nom du service</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Ex: Transfert Aéroport aller-retour" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Détails du service..." className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tarif (MAD)</label>
                <input type="number" step="0.01" name="tarif" value={formData.tarif} onChange={handleChange} placeholder="Ex: 350.00" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>

              <div className="flex items-center space-x-2 mt-7">
                <input type="checkbox" id="actifService" name="actif" checked={formData.actif} onChange={handleChange} className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" />
                <label htmlFor="actifService" className="text-sm font-bold text-slate-700">Service disponible (Actif)</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100">
                Annuler
              </button>
              <button type="submit" className="bg-teal-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-teal-700 shadow-sm">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Service</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-right">Tarif</th>
              <th className="p-4 text-center">Statut</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="p-4 text-center text-slate-500 font-bold">Chargement...</td></tr>
            ) : services.length === 0 ? (
              <tr><td colSpan="5" className="p-4 text-center text-slate-500 font-bold">Aucun service enregistré.</td></tr>
            ) : (
              services.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{s.nom}</td>
                  <td className="p-4 text-sm text-slate-600 max-w-xs truncate" title={s.description}>
                    {s.description || '-'}
                  </td>
                  <td className="p-4 text-right font-bold text-teal-600">{s.tarif} MAD</td>
                  <td className="p-4 text-center">
                    {s.actif ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        <CheckCircle size={12} /> Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                        <XCircle size={12} /> Inactif
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-2 transition-colors" title="Modifier">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Supprimer">
                      <Trash2 size={18} />
                    </button>
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

export default ServicesManagement;
