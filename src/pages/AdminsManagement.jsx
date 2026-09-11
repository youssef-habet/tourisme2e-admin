import React, { useState, useEffect } from 'react';
import { Shield, PlusCircle, Edit, ShieldAlert, CheckCircle, ShieldOff, Save } from 'lucide-react';
import { adminsService } from '../services/adminsService';

const AdminsManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const initialFormState = {
    username: '',
    email: '',
    password: '',
    roles: ['ROLE_ADMIN'] // Just for local state
  };
  
  const [formData, setFormData] = useState(initialFormState);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await adminsService.getAdmins();
      setAdmins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (admin) => {
    setFormData({
      username: admin.username || '',
      email: admin.email || '',
      password: '', // do not populate password
      roles: admin.roles ? admin.roles.map(r => r.name) : []
    });
    setCurrentId(admin.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSuspend = async (id, isSuspended) => {
    const action = isSuspended ? 'réactiver' : 'suspendre';
    if(window.confirm(`Voulez-vous vraiment ${action} cet administrateur ?`)) {
      try {
        await adminsService.suspendAdmin(id);
        fetchAdmins();
      } catch (err) {
        alert("Erreur lors de l'opération.");
      }
    }
  };

  const handleAssignRole = async (id, currentRole) => {
    const newRole = currentRole === 'ROLE_SUPER_ADMIN' ? 'ROLE_ADMIN' : 'ROLE_SUPER_ADMIN';
    if(window.confirm(`Changer le rôle en ${newRole} ?`)) {
      try {
        await adminsService.assignRole(id, newRole);
        fetchAdmins();
      } catch (err) {
        alert("Erreur lors de l'assignation du rôle.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Don't send empty password on update
        await adminsService.updateAdmin(currentId, payload);
      } else {
        await adminsService.createAdmin(formData);
      }
      setShowForm(false);
      setIsEditing(false);
      setFormData(initialFormState);
      fetchAdmins();
    } catch (err) {
      alert("Erreur lors de l'enregistrement de l'administrateur.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des Administrateurs</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez les accès, rôles et suspendez les comptes si besoin</p>
        </div>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setIsEditing(false);
            setFormData(initialFormState);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
        >
          <PlusCircle size={20} /> {showForm ? 'Annuler' : 'Ajouter Administrateur'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
            <Shield size={20} className="text-indigo-600" />
            {isEditing ? 'Modifier Administrateur' : 'Nouvel Administrateur'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nom d'utilisateur</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mot de passe {isEditing && <span className="text-xs font-normal text-slate-400">(Laisser vide pour ne pas modifier)</span>}</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" required={!isEditing} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2">
                <Save size={18} /> {isEditing ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Utilisateur</th>
                <th className="p-4">Email</th>
                <th className="p-4">Rôles</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-500">Chargement...</td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-500">Aucun administrateur trouvé.</td>
                </tr>
              ) : (
                admins.map(admin => {
                  const isSuspended = !admin.active;
                  const mainRole = admin.roles && admin.roles.length > 0 ? admin.roles[0].name : 'ROLE_ADMIN';
                  
                  return (
                    <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{admin.username}</div>
                      </td>
                      <td className="p-4 text-slate-600">{admin.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${mainRole === 'ROLE_SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {mainRole.replace('ROLE_', '')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center gap-1 text-xs font-bold ${isSuspended ? 'text-red-600' : 'text-green-600'}`}>
                          {isSuspended ? <><ShieldOff size={14}/> Suspendu</> : <><CheckCircle size={14}/> Actif</>}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(admin)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Modifier">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleAssignRole(admin.id, mainRole)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded" title="Changer Rôle">
                            <Shield size={18} />
                          </button>
                          <button onClick={() => handleSuspend(admin.id, isSuspended)} className={`p-1.5 rounded ${isSuspended ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`} title={isSuspended ? "Réactiver" : "Suspendre"}>
                            <ShieldAlert size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminsManagement;
