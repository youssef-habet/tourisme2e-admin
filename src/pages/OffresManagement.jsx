import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Tag, Image, Clock, FileText } from 'lucide-react';
import { offresService } from '../services/offresService';
import { sitesService } from '../services/sitesService';
import { hotelsService } from '../services/hotelsService';
import ImageUploader from '../components/ImageUploader';

const getFirstImageSrc = (value) => {
  const firstImage = Array.isArray(value)
    ? value.find(Boolean)
    : String(value || '')
        .split(',')
        .map(item => item.trim())
        .find(Boolean);

  if (!firstImage) return '';
  if (firstImage.startsWith('http') || firstImage.startsWith('data:')) return firstImage;

  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
  if (firstImage.startsWith('/api/v1')) return firstImage;
  return `${baseUrl}${firstImage.startsWith('/') ? firstImage : `/${firstImage}`}`;
};

const OffresManagement = () => {
  const [offres, setOffres] = useState([]);
  const [sites, setSites] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const initialFormState = {
    titre: '',
    descriptionCourte: '',
    descriptionLongue: '',
    segment: 'SENIOR',
    typeGroupe: 'OUVERT',
    dateDebut: '',
    dateFin: '',
    capaciteMin: 10,
    capaciteMax: 20,
    prixBase: '',
    prixIndicatif: '',
    duree: '',
    photos: '',
    siteTouristiqueIds: [],
    activitesIncluses: '',
    servicesAdditionnels: '',
    hotelId: '',
    niveauConfort: 3,
    pension: 'PETIT_DEJEUNER',
    statut: 'ACTIF'
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [offresData, sitesData, hotelsData] = await Promise.all([
        offresService.getOffres(),
        sitesService.getSites(),
        hotelsService.getHotels()
      ]);
      setOffres(offresData.content || offresData); // Handle PageResponse
      setSites(sitesData);
      setHotels(hotelsData);
    } catch (err) {
      console.error("Erreur lors du chargement des données :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({ ...prev, siteTouristiqueIds: value }));
  };

  const handleEdit = (offre) => {
    setFormData({
      titre: offre.titre || '',
      descriptionCourte: offre.descriptionCourte || '',
      descriptionLongue: offre.descriptionLongue || '',
      segment: offre.segment || 'SENIOR',
      typeGroupe: offre.typeGroupe || 'OUVERT',
      dateDebut: offre.dateDebut ? offre.dateDebut.split('T')[0] : '',
      dateFin: offre.dateFin ? offre.dateFin.split('T')[0] : '',
      capaciteMin: offre.capaciteMin || 10,
      capaciteMax: offre.capaciteMax || 20,
      prixBase: offre.prixBase || '',
      prixIndicatif: offre.prixIndicatif || '',
      duree: offre.duree || '',
      photos: offre.photos || '',
      siteTouristiqueIds: offre.siteTouristiqueIds || (offre.sites ? offre.sites.map(s => s.id) : []),
      activitesIncluses: offre.activitesIncluses || '',
      servicesAdditionnels: offre.servicesAdditionnels || '',
      hotelId: offre.hotelId || '',
      niveauConfort: offre.niveauConfort || 3,
      pension: offre.pension || 'PETIT_DEJEUNER',
      statut: offre.statut || 'ACTIF'
    });
    setCurrentId(offre.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      try {
        await offresService.deleteOffre(id);
        fetchData();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleChangeStatut = async (id, nouveauStatut) => {
    try {
      await offresService.changerStatut(id, nouveauStatut);
      fetchData();
    } catch (err) {
      alert("Erreur lors du changement de statut.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        prixBase: formData.prixBase ? parseFloat(formData.prixBase) : null,
        prixIndicatif: parseFloat(formData.prixIndicatif),
        duree: parseInt(formData.duree),
        capaciteMin: parseInt(formData.capaciteMin),
        capaciteMax: parseInt(formData.capaciteMax),
        niveauConfort: parseInt(formData.niveauConfort),
        hotelCentreId: formData.hotelId ? parseInt(formData.hotelId) : null,
        sitesTouristiquesIds: formData.siteTouristiqueIds
      };

      if (isEditing) {
        await offresService.updateOffre(currentId, payload);
      } else {
        await offresService.createOffre(payload);
      }
      
      setShowForm(false);
      setIsEditing(false);
      setFormData(initialFormState);
      fetchData();
    } catch (err) {
      alert("Erreur lors de l'enregistrement de l'offre.");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des Offres Catalogue</h1>
          <p className="text-sm text-slate-500 mt-1">Créez et gérez les offres publiques du site</p>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setIsEditing(false);
            setFormData(initialFormState);
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <PlusCircle size={20} /> {showForm ? 'Annuler' : 'Nouvelle Offre'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
            <Tag size={20} className="text-teal-600" />
            {isEditing ? 'Modifier l\'offre' : 'Créer une nouvelle offre'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations Générales */}
            <div className="bg-slate-50 p-4 rounded-lg space-y-4 border border-slate-100">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Informations Générales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Titre de l'offre</label>
                  <input type="text" name="titre" value={formData.titre} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Description Courte</label>
                  <input type="text" name="descriptionCourte" value={formData.descriptionCourte} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Description Longue</label>
                  <textarea name="descriptionLongue" value={formData.descriptionLongue} onChange={handleChange} rows="4" className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Segment</label>
                  <select name="segment" value={formData.segment} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white" required>
                    <option value="SENIOR">Senior</option>
                    <option value="MICE">MICE (Entreprise)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Type de Groupe</label>
                  <select name="typeGroupe" value={formData.typeGroupe} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                    <option value="OUVERT">Groupe Ouvert</option>
                    <option value="FERME">Groupe Fermé</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dates et Capacité */}
            <div className="bg-slate-50 p-4 rounded-lg space-y-4 border border-slate-100">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Dates & Capacité</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Date Début</label>
                  <input type="date" name="dateDebut" value={formData.dateDebut} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Date Fin</label>
                  <input type="date" name="dateFin" value={formData.dateFin} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Capacité Min</label>
                  <input type="number" name="capaciteMin" value={formData.capaciteMin} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Capacité Max</label>
                  <input type="number" name="capaciteMax" value={formData.capaciteMax} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Programme et Services */}
            <div className="bg-slate-50 p-4 rounded-lg space-y-4 border border-slate-100">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Programme & Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Sites Touristiques (Maintenez Ctrl pour sélectionner plusieurs)</label>
                  <select multiple name="siteTouristiqueIds" value={formData.siteTouristiqueIds} onChange={handleMultiSelectChange} className="w-full p-2 border border-slate-300 rounded-lg h-32 bg-white">
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>{s.nom} ({s.categorie})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Activités Incluses</label>
                  <textarea name="activitesIncluses" value={formData.activitesIncluses} onChange={handleChange} rows="4" placeholder="Séparées par des virgules..." className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Services Additionnels</label>
                  <input type="text" name="servicesAdditionnels" value={formData.servicesAdditionnels} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Hébergement et Prix */}
            <div className="bg-slate-50 p-4 rounded-lg space-y-4 border border-slate-100">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Hébergement & Tarifs</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Hôtel / Centre d'estivage</label>
                  <select name="hotelId" value={formData.hotelId} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                    <option value="">-- Non défini --</option>
                    {hotels.map(h => (
                      <option key={h.id} value={h.id}>{h.nom} ({h.typeHebergement})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Confort (Étoiles)</label>
                  <select name="niveauConfort" value={formData.niveauConfort} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                    {[2,3,4,5].map(n => <option key={n} value={n}>{n} Étoiles</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Pension</label>
                  <select name="pension" value={formData.pension} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                    <option value="PETIT_DEJEUNER">Petit-déjeuner</option>
                    <option value="DEMI_PENSION">Demi-pension</option>
                    <option value="PENSION_COMPLETE">Pension Complète</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Prix de Base (MAD)</label>
                  <input type="number" name="prixBase" value={formData.prixBase} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Prix Indicatif (MAD)</label>
                  <input type="number" name="prixIndicatif" value={formData.prixIndicatif} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Durée (Jours)</label>
                  <input type="number" name="duree" value={formData.duree} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Statut</label>
                  <select name="statut" value={formData.statut} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white" required>
                    <option value="ACTIF">Publiée</option>
                    <option value="INACTIF">Brouillon</option>
                    <option value="COMPLET">Complet</option>
                    <option value="ARCHIVE">Archivé</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Médias */}
            <div className="bg-slate-50 p-4 rounded-lg space-y-4 border border-slate-100">
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Médias — Photos de l'offre</h3>
              <ImageUploader
                label="Photos de l'offre"
                value={formData.photos}
                onChange={(val) => setFormData(prev => ({ ...prev, photos: val }))}
                maxImages={8}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100">
                Annuler
              </button>
              <button type="submit" className="bg-teal-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-teal-700 shadow-sm">
                {isEditing ? 'Mettre à jour l\'offre' : 'Créer l\'offre'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-10 text-center text-slate-500 font-bold">Chargement des offres...</div>
        ) : offres.length === 0 ? (
          <div className="col-span-full p-10 text-center text-slate-500 font-bold bg-white rounded-xl border border-slate-200 shadow-sm">Aucune offre catalogue trouvée.</div>
        ) : (
          offres.map(offre => (
            <div key={offre.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              {getFirstImageSrc(offre.photos) ? (
                <div className="h-48 w-full overflow-hidden relative bg-slate-100">
                  <img 
                    src={getFirstImageSrc(offre.photos)} 
                    alt={offre.titre} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'; 
                    }}
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm ${offre.segment === 'SENIOR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {offre.segment}
                    </span>
                    {offre.typeGroupe && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full shadow-sm bg-white text-slate-700">
                        {offre.typeGroupe === 'OUVERT' ? 'Public' : 'Privé'}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                    <select 
                      value={offre.statut} 
                      onChange={(e) => handleChangeStatut(offre.id, e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm border-0 cursor-pointer ${
                        offre.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 
                        offre.statut === 'COMPLET' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <option value="ACTIF">Actif</option>
                      <option value="INACTIF">Inactif</option>
                      <option value="COMPLET">Complet</option>
                      <option value="ARCHIVE">Archivé</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="h-48 w-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 relative">
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm ${offre.segment === 'SENIOR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {offre.segment}
                    </span>
                  </div>
                  <Image size={40} className="mb-2" />
                  <span className="text-sm font-medium">Sans image</span>
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-1">{offre.titre}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                  {offre.descriptionCourte || offre.description || "Aucune description."}
                </p>
                
                {offre.sites && offre.sites.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sites Inclus</p>
                    <div className="flex flex-wrap gap-1">
                      {offre.sites.map(s => (
                        <span key={s.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{s.nom}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-700 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1"><Clock size={16} className="text-slate-400" /> {offre.duree} Jours</div>
                  <div className="flex items-center gap-1"><FileText size={16} className="text-slate-400" /> {offre.capaciteMin}-{offre.capaciteMax} pers.</div>
                  <div className="text-teal-600 ml-auto text-lg">{offre.prixIndicatif} MAD</div>
                </div>
                
                <div className="flex justify-end gap-2 mt-auto pt-2">
                  <button onClick={() => handleEdit(offre)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-sm font-bold transition-colors">
                    <Edit size={16} /> Modifier
                  </button>
                  <button onClick={() => handleDelete(offre.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 text-sm font-bold transition-colors">
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

export default OffresManagement;
