import React, { useState, useEffect } from 'react';
import { Users, FileText, AlertTriangle, TrendingUp, DollarSign, Clock, Activity, Target } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="mt-auto">
      <h3 className="text-2xl font-black text-slate-800 mb-1">{value}</h3>
      <p className="text-[13px] font-bold text-slate-600 leading-tight">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState({
    demandesEnAttenteValidation: 0,
    groupesActifs: 0,
    groupesActifsFermes: 0,
    groupesActifsOuverts: 0,
    revenusDuMois: 0,
    tauxRemplissageMoyen: 0,
    nouveauxUtilisateurs: 0,
    alertes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await dashboardService.getDashboardStats();
        setData(stats);
      } catch (err) {
        console.error("Erreur lors de la récupération du dashboard :", err);
        setError("Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-slate-500">Chargement des statistiques...</div>;
  if (error) return <div className="p-10 text-center font-bold text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tableau de Bord</h1>
          <p className="text-sm text-slate-500 mt-1">Aperçu de l'activité globale</p>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          Aujourd'hui : {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Demandes en attente" 
          value={data.demandesEnAttenteValidation || 0} 
          subtitle="de validation" 
          icon={FileText} 
          colorClass="bg-orange-100 text-orange-600" 
        />
        <StatCard 
          title="Groupes actifs" 
          value={data.groupesActifs || 0} 
          subtitle={`(${data.groupesActifsFermes || 0} fermés, ${data.groupesActifsOuverts || 0} ouverts)`} 
          icon={Users} 
          colorClass="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          title="Revenus du mois" 
          value={`${data.revenusDuMois || 0} MAD`} 
          subtitle="Chiffre d'affaires" 
          icon={DollarSign} 
          colorClass="bg-green-100 text-green-600" 
        />
        <StatCard 
          title="Taux de remplissage" 
          value={`${data.tauxRemplissageMoyen || 0}%`} 
          subtitle="Moyenne" 
          icon={TrendingUp} 
          colorClass="bg-teal-100 text-teal-600" 
        />
        <StatCard 
          title="Nouveaux utilisateurs" 
          value={data.nouveauxUtilisateurs || 0} 
          subtitle="Ce mois" 
          icon={Activity} 
          colorClass="bg-purple-100 text-purple-600" 
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            Alertes Prioritaires
          </h2>
          <div className="space-y-4">
            {(!data.alertes || data.alertes.length === 0) ? (
              <p className="text-sm text-slate-500">Aucune alerte prioritaire pour le moment.</p>
            ) : (
              data.alertes.map((alerte, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-orange-50/50 rounded-lg border border-orange-100 hover:bg-orange-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{alerte}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
