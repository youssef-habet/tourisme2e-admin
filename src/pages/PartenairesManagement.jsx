import React, { useState, useEffect } from 'react';
import { PlusCircle, HeartHandshake, Edit, Trash2, Globe, Building, CheckCircle, XCircle } from 'lucide-react';
import { partenairesService } from '../services/partenairesService';

const PartenairesManagement = () => {
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const initialFormState = {
    nom: '',
    type: 'AGENCE',
    description: '',
    logoUrl: '',
    siteWeb: '',
    actif: true
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchPartenaires = async () => {
    setLoading(true);
    try {
      const data = await partenairesService.getPartenaires();
      setPartenaires(data);
    } catch (err) {
      console.error(err);
      setPartenaires([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartenaires();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleEdit = (partenaire) => {
    setFormData({
      nom: partenaire.nom || '',
      type: partenaire.type || 'AGENCE',
      description: partenaire.description || '',
      logoUrl: partenaire.logoUrl || '',
      siteWeb: partenaire.siteWeb || '',
      actif: partenaire.actif !== undefined ? partenaire.actif : true
    });
    setCurrentId(partenaire.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) {
      try {
        await partenairesService.deletePartenaire(id);
        fetchPartenaires();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await partenairesService.updatePartenaire(currentId, formData);
      } else {
        await partenairesService.createPartenaire(formData);
      }
      
      setShowForm(false);
      setIsEditing(false);
      setFormData(initialFormState);
      fetchPartenaires();
    } catch (err) {
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      HOTEL: "Hôtellerie",
      TRANSPORT: "Transport",
      RESTAURATION: "Restauration",
      AGENCE: "Agence de Voyage",
      ASSOCIATION: "Association",
      AUTRE: "Autre"
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Partenaires</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez le réseau de partenaires affiché sur la plateforme</p>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setIsEditing(false);
            setFormData(initialFormState);
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <PlusCircle size={20} /> {showForm ? 'Annuler' : 'Ajouter un Partenaire'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
            <HeartHandshake size={20} className="text-teal-600" />
            {isEditing ? 'Modifier le partenaire' : 'Nouveau Partenaire'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Nom du Partenaire</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Ex: Royal Air Maroc" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Type de Partenaire</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                  <option value="HOTEL">Hôtellerie</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="RESTAURATION">Restauration</option>
                  <option value="AGENCE">Agence de Voyage</option>
                  <option value="ASSOCIATION">Association</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Site Web (Optionnel)</label>
                <input type="url" name="siteWeb" value={formData.siteWeb} onChange={handleChange} placeholder="https://..." className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">URL du Logo</label>
                <input type="url" name="logoUrl" value={formData.logoUrl} onChange={handleChange} placeholder="https://..." className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Présentation rapide du partenariat..." className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div className="flex items-center space-x-2 mt-2">
                <input type="checkbox" id="actifPartenaire" name="actif" checked={formData.actif} onChange={handleChange} className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" />
                <label htmlFor="actifPartenaire" className="text-sm font-bold text-slate-700">Partenaire Actif (Affiché publiquement)</label>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full p-10 text-center text-slate-500 font-bold">Chargement des partenaires...</div>
        ) : partenaires.length === 0 ? (
          <div className="col-span-full p-10 text-center text-slate-500 font-bold bg-white rounded-xl border border-slate-200 shadow-sm">Aucun partenaire enregistré.</div>
        ) : (
          partenaires.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow relative">
              <div className="h-32 bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-center">
                {p.logoUrl ? (
                  <img src={p.logoUrl} alt={p.nom} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                ) : (
                  <Building size={48} className="text-slate-300" />
                )}
              </div>
              
              <div className="absolute top-3 right-3">
                {p.actif ? (
                  <span className="w-3 h-3 bg-green-500 rounded-full inline-block shadow-sm" title="Actif"></span>
                ) : (
                  <span className="w-3 h-3 bg-red-400 rounded-full inline-block shadow-sm" title="Inactif"></span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 text-lg mb-1 truncate">{p.nom}</h3>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded w-max mb-3 uppercase tracking-wider">
                  {getTypeLabel(p.type)}
                </span>
                
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                  {p.description || "Aucune description."}
                </p>
                
                {p.siteWeb && (
                  <a href={p.siteWeb} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-4 w-max">
                    <Globe size={14} /> Site web
                  </a>
                )}
                
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-auto">
                  <button onClick={() => handleEdit(p)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PartenairesManagement;
