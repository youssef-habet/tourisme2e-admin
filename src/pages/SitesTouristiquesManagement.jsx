import React, { useState, useEffect } from 'react';
import { PlusCircle, Map, Edit, Trash2, Mountain, Waves, Sun, Building2, MapPin, Clock } from 'lucide-react';
import { sitesService } from '../services/sitesService';
import ImageUploader from '../components/ImageUploader';

const SitesTouristiquesManagement = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const initialFormState = {
    nom: '',
    categorie: 'VILLE',
    description: '',
    localisation: '',
    latitude: '',
    longitude: '',
    dureeRecommandee: '',
    meilleurePeriode: '',
    niveauDifficulte: 'FACILE',
    activitesPossibles: '',
    accessiblePmr: false,
    photosGalerie: '',
    statut: 'ACTIF'
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const data = await sitesService.getSites();
      setSites(data);
    } catch (err) {
      console.error(err);
      // Fallback empty array if API is not yet ready
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleEdit = (site) => {
    setFormData({
      nom: site.nom || '',
      categorie: site.categorie || 'VILLE',
      description: site.description || '',
      localisation: site.localisation || '',
      latitude: site.latitude || '',
      longitude: site.longitude || '',
      dureeRecommandee: site.dureeRecommandee || '',
      meilleurePeriode: site.meilleurePeriode || '',
      niveauDifficulte: site.niveauDifficulte || 'FACILE',
      activitesPossibles: site.activitesPossibles || '',
      accessiblePmr: site.accessiblePmr || false,
      photosGalerie: site.photosGalerie || '',
      statut: site.statut || 'ACTIF'
    });
    setCurrentId(site.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce site touristique ?")) {
      try {
        await sitesService.deleteSite(id);
        fetchSites();
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message;
        alert(`Erreur lors de la suppression : ${errorMessage}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nom: formData.nom,
        categorie: formData.categorie,
        descriptionDetaillee: formData.description,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        dureeVisiteRecommandee: formData.dureeRecommandee ? String(formData.dureeRecommandee) : null,
        meilleurePeriode: formData.meilleurePeriode,
        niveauDifficulte: formData.niveauDifficulte,
        activitesPossibles: formData.activitesPossibles,
        accessiblePmr: formData.accessiblePmr,
        galeriePhotos: formData.photosGalerie
      };

      if (isEditing) {
        await sitesService.updateSite(currentId, payload);
      } else {
        await sitesService.createSite(payload);
      }
      
      setShowForm(false);
      setIsEditing(false);
      setFormData(initialFormState);
      fetchSites();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      console.error("Erreur détaillée:", err.response?.data);
      alert(`Erreur: ${errorMsg}`);
    }
  };

  const getCategoryIcon = (categorie) => {
    switch(categorie) {
      case 'MONTAGNE': return <Mountain size={20} className="text-emerald-600" />;
      case 'MER': return <Waves size={20} className="text-blue-500" />;
      case 'DESERT': return <Sun size={20} className="text-amber-500" />;
      case 'VILLE': return <Building2 size={20} className="text-slate-600" />;
      default: return <Map size={20} className="text-teal-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sites Touristiques</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez la bibliothèque des sites et lieux à visiter</p>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setIsEditing(false);
            setFormData(initialFormState);
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <PlusCircle size={20} /> {showForm ? 'Annuler' : 'Ajouter un Site'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
            <Map size={20} className="text-teal-600" />
            {isEditing ? 'Modifier le site' : 'Nouveau Site Touristique'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Nom du Site</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Ex: Gorges de Toudgha" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Catégorie</label>
                <select name="categorie" value={formData.categorie} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                  <option value="VILLE">Ville / Urbain</option>
                  <option value="MONTAGNE">Montagne</option>
                  <option value="DESERT">Désert / Oasis</option>
                  <option value="MER">Mer / Plage</option>
                  <option value="FORET">Forêt / Nature</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Niveau de Difficulté</label>
                <select name="niveauDifficulte" value={formData.niveauDifficulte} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                  <option value="FACILE">Facile (Tout public)</option>
                  <option value="MOYEN">Moyen (Marche requise)</option>
                  <option value="DIFFICILE">Difficile (Sportif)</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Description Détaillée</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Localisation (Ville, Région)</label>
                <input type="text" name="localisation" value={formData.localisation} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Latitude (GPS)</label>
                <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Ex: 31.6295" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Longitude (GPS)</label>
                <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Ex: -7.9811" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Durée Recommandée (Heures)</label>
                <input type="number" step="0.5" name="dureeRecommandee" value={formData.dureeRecommandee} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Meilleure Période (Mois)</label>
                <input type="text" name="meilleurePeriode" value={formData.meilleurePeriode} onChange={handleChange} placeholder="Ex: Septembre à Mai" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Activités Possibles</label>
                <input type="text" name="activitesPossibles" value={formData.activitesPossibles} onChange={handleChange} placeholder="Randonnée, Baignade, Photos..." className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <input type="checkbox" id="accessiblePmrSite" name="accessiblePmr" checked={formData.accessiblePmr} onChange={handleChange} className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" />
                <label htmlFor="accessiblePmrSite" className="text-sm font-bold text-slate-700">Accessible PMR</label>
              </div>

              <div className="col-span-1 md:col-span-2 mt-2">
                <ImageUploader
                  label="Galerie Photos"
                  value={formData.photosGalerie}
                  onChange={(val) => setFormData(prev => ({ ...prev, photosGalerie: val }))}
                  maxImages={10}
                />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-10 text-center text-slate-500 font-bold">Chargement des sites...</div>
        ) : sites.length === 0 ? (
          <div className="col-span-full p-10 text-center text-slate-500 font-bold bg-white rounded-xl border border-slate-200 shadow-sm">Aucun site touristique enregistré.</div>
        ) : (
          sites.map(site => (
            <div key={site.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                      {getCategoryIcon(site.categorie)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 leading-tight">{site.nom}</h3>
                      <p className="text-xs font-bold text-slate-400">{site.categorie}</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                  {site.description || "Aucune description fournie."}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="truncate">{site.localisation || 'Localisation non définie'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock size={16} className="text-slate-400" />
                    <span>{site.dureeRecommandee ? `${site.dureeRecommandee}h recommandées` : 'Durée libre'}</span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-slate-100">
                  <button onClick={() => handleEdit(site)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-sm font-bold">
                    <Edit size={16} /> Modifier
                  </button>
                  <button onClick={() => handleDelete(site.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 text-sm font-bold">
                    <Trash2 size={16} /> Supprimer
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

export default SitesTouristiquesManagement;
