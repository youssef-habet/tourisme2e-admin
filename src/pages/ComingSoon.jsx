import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';

const ComingSoon = ({ title, description }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm text-center max-w-2xl mx-auto mt-10">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Fonctionnalité en attente</h2>
        
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left mb-6 text-sm text-slate-700 flex gap-3">
          <AlertCircle className="shrink-0 mt-0.5 text-blue-500" size={18} />
          <p>
            Cette interface graphique est prête, mais le <strong>Backend Java (API)</strong> correspondant n'a pas encore été développé.
            <br className="my-2"/>
            Dès que les développeurs Backend auront créé les contrôleurs nécessaires, cette fonctionnalité pourra être activée !
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
