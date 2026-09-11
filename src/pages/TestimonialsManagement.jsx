import React, { useState, useEffect } from 'react';
import { PlusCircle, MessageSquare, Edit, Trash2, Star, User, Globe, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { testimonialsService } from '../services/testimonialsService';

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const initialFormState = {
    nomAuteur: '',
    organisme: '',
    pays: '',
    texteAvis: '',
    noteEtoiles: 5,
    photoAuteurUrl: '',
    statut: 'EN_ATTENTE',
    afficherAccueil: false
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const data = await testimonialsService.getTestimonials();
      setTestimonials(data);
    } catch (err) {
      console.error(err);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleEdit = (testimonial) => {
    setFormData({
      nomAuteur: testimonial.nomAuteur || '',
      organisme: testimonial.organisme || '',
      pays: testimonial.pays || '',
      texteAvis: testimonial.texteAvis || '',
      noteEtoiles: testimonial.noteEtoiles || 5,
      photoAuteurUrl: testimonial.photoAuteurUrl || '',
      statut: testimonial.statut || 'EN_ATTENTE',
      afficherAccueil: testimonial.afficherAccueil || false
    });
    setCurrentId(testimonial.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
      try {
        await testimonialsService.deleteTestimonial(id);
        fetchTestimonials();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleStatusChange = async (testimonial, newStatut) => {
    try {
      await testimonialsService.updateTestimonial(testimonial.id, { ...testimonial, statut: newStatut });
      fetchTestimonials();
    } catch (err) {
      alert("Erreur lors du changement de statut.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        noteEtoiles: parseInt(formData.noteEtoiles)
      };

      if (isEditing) {
        await testimonialsService.updateTestimonial(currentId, payload);
      } else {
        await testimonialsService.createTestimonial(payload);
      }
      
      setShowForm(false);
      setIsEditing(false);
      setFormData(initialFormState);
      fetchTestimonials();
    } catch (err) {
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const getStatusBadge = (statut) => {
    switch(statut) {
      case 'APPROUVE': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><ThumbsUp size={12} /> Approuvé</span>;
      case 'REFUSE': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><ThumbsDown size={12} /> Refusé</span>;
      default: return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> En attente</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Témoignages & Avis</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez et modérez les retours de vos clients</p>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setIsEditing(false);
            setFormData(initialFormState);
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <PlusCircle size={20} /> {showForm ? 'Annuler' : 'Ajouter un Avis'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
            <MessageSquare size={20} className="text-teal-600" />
            {isEditing ? 'Modifier le témoignage' : 'Nouveau Témoignage'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nom de l'auteur</label>
                <input type="text" name="nomAuteur" value={formData.nomAuteur} onChange={handleChange} placeholder="Ex: Jean Dupont" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Organisme / Entreprise (Optionnel)</label>
                <input type="text" name="organisme" value={formData.organisme} onChange={handleChange} placeholder="Ex: Amicale des retraités" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Pays / Ville</label>
                <input type="text" name="pays" value={formData.pays} onChange={handleChange} placeholder="Ex: France, Paris" className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Note (Étoiles)</label>
                <select name="noteEtoiles" value={formData.noteEtoiles} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white" required>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Étoile{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Texte de l'avis</label>
                <textarea name="texteAvis" value={formData.texteAvis} onChange={handleChange} rows="4" placeholder="Le client a adoré son séjour..." className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" required />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Photo de l'auteur (URL)</label>
                <input type="url" name="photoAuteurUrl" value={formData.photoAuteurUrl} onChange={handleChange} placeholder="https://..." className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Statut de Modération</label>
                <select name="statut" value={formData.statut} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white" required>
                  <option value="EN_ATTENTE">En attente de révision</option>
                  <option value="APPROUVE">Approuvé (Publié)</option>
                  <option value="REFUSE">Refusé (Masqué)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 mt-7">
                <input type="checkbox" id="afficherAccueil" name="afficherAccueil" checked={formData.afficherAccueil} onChange={handleChange} className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500" />
                <label htmlFor="afficherAccueil" className="text-sm font-bold text-slate-700">Mettre en avant sur la page d'accueil</label>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-10 text-center text-slate-500 font-bold">Chargement des témoignages...</div>
        ) : testimonials.length === 0 ? (
          <div className="col-span-full p-10 text-center text-slate-500 font-bold bg-white rounded-xl border border-slate-200 shadow-sm">Aucun témoignage enregistré.</div>
        ) : (
          testimonials.map(t => (
            <div key={t.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {t.photoAuteurUrl ? (
                      <img src={t.photoAuteurUrl} alt={t.nomAuteur} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={24} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-800 leading-tight">{t.nomAuteur}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Globe size={12} /> {t.pays || t.organisme || 'Client'}
                      </p>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(t.statut)}
                  </div>
                </div>
                
                <div className="flex text-amber-500 mb-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={14} fill={i < t.noteEtoiles ? "currentColor" : "none"} className={i >= t.noteEtoiles ? "text-slate-300" : ""} />
                  ))}
                </div>

                <div className="relative">
                  <MessageSquare size={24} className="text-slate-100 absolute -top-2 -left-2 transform -scale-x-100" />
                  <p className="text-sm text-slate-600 italic relative z-10 pl-4 border-l-2 border-teal-100 mb-4 line-clamp-4">
                    "{t.texteAvis}"
                  </p>
                </div>
                
                {t.afficherAccueil && (
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded w-max mb-4">
                    ⭐ À la une (Accueil)
                  </span>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-auto">
                  <div className="flex gap-1">
                    {t.statut !== 'APPROUVE' && (
                      <button onClick={() => handleStatusChange(t, 'APPROUVE')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approuver">
                        <ThumbsUp size={16} />
                      </button>
                    )}
                    {t.statut !== 'REFUSE' && (
                      <button onClick={() => handleStatusChange(t, 'REFUSE')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Refuser">
                        <ThumbsDown size={16} />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(t)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Modifier">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Supprimer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TestimonialsManagement;
