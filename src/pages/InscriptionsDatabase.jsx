import React from 'react';
import { Users, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const InscriptionsDatabase = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Base de Données des Inscriptions</h1>
          <p className="text-sm text-slate-500 mt-1">Consultez et gérez toutes les inscriptions</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm text-center max-w-2xl mx-auto mt-10">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Vue globale non disponible</h2>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-6 text-sm text-amber-800 flex gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <p>
            L'API backend actuelle (<code>tourisme2ee</code>) ne possède pas d'endpoint permettant de récupérer l'ensemble des inscriptions de manière globale. Elle requiert obligatoirement l'identifiant d'un groupe spécifique.
          </p>
        </div>

        <p className="text-slate-600 mb-8">
          Pour gérer les inscriptions (confirmer ou refuser des participants), veuillez vous rendre dans la gestion des groupes et cliquer sur l'icône "Utilisateurs" du groupe concerné.
        </p>

        <Link 
          to="/groupes" 
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
        >
          Aller à la Gestion des Groupes <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default InscriptionsDatabase;
