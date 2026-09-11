import React, { useState, useEffect } from 'react';
import { PlusCircle, Hotel, Edit, Trash2, MapPin, Star, Users, CreditCard } from 'lucide-react';
import { hotelsService } from '../services/hotelsService';
import ImageUploader from '../components/ImageUploader';

const HotelsManagement = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const initialFormState = {
    nom: '',
    type: 'HOTEL',
    localisation: '',
    classement: 3,
    capaciteLits: '',
    tarifJourPersonne: '',
    disponibiliteDebut: '',
    disponibiliteFin: '',
    equipements: '',
    accessiblePmr: false,
    typeCuisine: 'MAROCAINE',
    commissionPourcentage: '',
    conventionPdfUrl: '',
    photosGalerie: '',
    statut: 'ACTIF' // for compatibility with older pavillon if needed
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const data = await hotelsService.getHotels();
      setHotels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleEdit = (hotel) => {
    setFormData({
      nom: hotel.nom || '',
      type: hotel.type || 'HOTEL',
      localisation: hotel.localisation || '',
      classement: hotel.classement || 3,
      capaciteLits: hotel.capaciteLits || hotel.capaciteMax || '',
      tarifJourPersonne: hotel.tarifJourPersonne || '',
      disponibiliteDebut: hotel.disponibiliteDebut ? hotel.disponibiliteDebut.split('T')[0] : '',
      disponibiliteFin: hotel.disponibiliteFin ? hotel.disponibiliteFin.split('T')[0] : '',
      equipements: hotel.equipements || '',
      accessiblePmr: hotel.accessiblePmr || false,
      typeCuisine: hotel.typeCuisine || 'MAROCAINE',
      commissionPourcentage: hotel.commissionPourcentage || '',
      conventionPdfUrl: hotel.conventionPdfUrl || '',
      photosGalerie: hotel.photosGalerie || '',
      statut: hotel.statut || 'ACTIF'
    });
    setCurrentId(hotel.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet établissement ?")) {
      try {
        await hotelsService.deleteHotel(id);
        fetchHotels();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nom: formData.nom,
        type: formData.type,
        typeHebergement: formData.type === 'CENTRE_ESTIVAGE' ? 'CENTRE_ESTIVAGE' : 'HOTEL',
        localisation: formData.localisation,
        classement: parseInt(formData.classement) || 3,
        capaciteLits: parseInt(formData.capaciteLits) || 0,
        tarifJourPersonne: formData.tarifJourPersonne ? parseFloat(formData.tarifJourPersonne) : 0,
        disponibiliteDebut: formData.disponibiliteDebut || null,
        disponibiliteFin: formData.disponibiliteFin || null,
        equipements: formData.equipements,
        accessiblePmr: formData.accessiblePmr,
        typeCuisine: formData.typeCuisine,
        commissionPourcentage: formData.commissionPourcentage ? parseFloat(formData.commissionPourcentage) : 0,
        conventionPdfUrl: formData.conventionPdfUrl,
        photosGalerie: formData.photosGalerie
      };

      if (isEditing) {
        await hotelsService.updateHotel(currentId, payload);
      } else {
        await hotelsService.createHotel(payload);
      }
      
      setShowForm(false);
      setIsEditing(false);
      setFormData(initialFormState);
      fetchHotels();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      console.error("Erreur détaillée:", err.response?.data);
      alert(`Erreur: ${errorMsg}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hôtels & Centres d'Estivage</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez les hébergements disponibles pour les offres</p>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setIsEditing(false);
            setFormData(initialFormState);
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <PlusCircle size={20} /> {showForm ? 'Annuler' : 'Ajouter un Hébergement'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
            <Hotel size={20} className="text-teal-600" />
            {isEditing ? 'Modifier l\'établissement' : 'Nouvel Établissement'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Nom de l'établissement</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Type d'établissement</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                  <option value="HOTEL">Hôtel</option>
                  <option value="CENTRE_ESTIVAGE">Centre d'Estivage</option>
                  <option value="MAISON_HOTES">Maison d'Hôtes</option>
                  <option value="RIAD">Riad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Classement (Étoiles)</label>
                <select name="classement" value={formData.classement} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Étoiles</option>)}
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Localisation (Adresse, Ville)</label>
                <input type="text" name="localisation" value={formData.localisation} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Capacité (Nombre de lits)</label>
                <input type="number" name="capaciteLits" value={formData.capaciteLits} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tarif Jour / Personne (MAD)</label>
                <input type="number" name="tarifJourPersonne" value={formData.tarifJourPersonne} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Disponibilité : Début</label>
                <input type="date" name="disponibiliteDebut" value={formData.disponibiliteDebut} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Disponibilité : Fin</label>
                <input type="date" name="disponibiliteFin" value={formData.disponibiliteFin} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Équipements</label>
                <input type="text" name="equipements" value={formData.equipements} onChange={handleChange} placeholder="Wifi, Piscine, Parking..." className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <input type="checkbox" id="accessiblePmr" name="accessiblePmr" checked={formData.accessiblePmr} onChange={handleChange} className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" />
                <label htmlFor="accessiblePmr" className="text-sm font-bold text-slate-700">Accessible PMR (Personnes à Mobilité Réduite)</label>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Type de Cuisine</label>
                <select name="typeCuisine" value={formData.typeCuisine} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                  <option value="MAROCAINE">Marocaine</option>
                  <option value="INTERNATIONALE">Internationale</option>
                  <option value="MIXTE">Mixte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Commission Tourisme 2E (%)</label>
                <input type="number" name="commissionPourcentage" value={formData.commissionPourcentage} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Lien de la Convention (PDF)</label>
                <input type="text" name="conventionPdfUrl" value={formData.conventionPdfUrl} onChange={handleChange} placeholder="https://..." className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div className="col-span-1 md:col-span-2">
                <ImageUploader
                  label="Photos (Galerie)"
                  value={formData.photosGalerie}
                  onChange={(val) => setFormData(prev => ({ ...prev, photosGalerie: val }))}
                  maxImages={8}
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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Établissement</th>
              <th className="p-4">Localisation</th>
              <th className="p-4">Capacité / Tarif</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="4" className="p-4 text-center text-slate-500 font-bold">Chargement...</td></tr>
            ) : hotels.length === 0 ? (
              <tr><td colSpan="4" className="p-4 text-center text-slate-500 font-bold">Aucun établissement enregistré.</td></tr>
            ) : (
              hotels.map(h => (
                <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                        <Hotel size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{h.nom}</p>
                        <div className="flex items-center gap-1 mt-1 text-amber-500 text-xs">
                          {Array(h.classement || 3).fill(0).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                          <span className="text-slate-500 ml-1 font-medium">{h.type || 'Hôtel'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-slate-400" />
                      {h.localisation || 'Non définie'}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      <Users size={14} className="text-slate-400" /> {h.capaciteLits || h.capaciteMax} lits
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <CreditCard size={14} className="text-slate-400" /> {h.tarifJourPersonne ? `${h.tarifJourPersonne} MAD/j` : 'N/A'}
                    </p>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(h)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mr-2 transition-colors" title="Modifier">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(h.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Supprimer">
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

export default HotelsManagement;
