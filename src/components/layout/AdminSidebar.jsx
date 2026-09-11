import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Package, Home, Users, Map, Briefcase, HeartHandshake, MessageSquare, Settings, Tag } from 'lucide-react';

const AdminSidebar = () => {
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/offres', icon: <Tag size={18} />, label: 'Offres Catalogue' },
    { to: '/groupes', icon: <Package size={18} />, label: 'Gestion des Groupes' },
    { to: '/devis', icon: <FileText size={18} />, label: 'Demandes de Devis' },
    { to: '/hotels', icon: <Home size={18} />, label: 'Hôtels & Centres' },
    { to: '/sites', icon: <Map size={18} />, label: 'Sites Touristiques' },
    { to: '/services', icon: <Briefcase size={18} />, label: 'Services' },
    { to: '/partenaires', icon: <HeartHandshake size={18} />, label: 'Partenaires' },
    { to: '/testimonials', icon: <MessageSquare size={18} />, label: 'Témoignages' },
    { to: '/utilisateurs', icon: <Settings size={18} />, label: 'Admins' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen shrink-0">
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <img src="/logo-tourisme2e.jpg" alt="Tourisme 2E" className="h-10 w-auto rounded-md bg-white p-1" />
        <div>
          <h1 className="text-base font-bold text-white tracking-tight leading-tight">TOURISME 2E</h1>
          <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Administration</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-teal-600 text-white' : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        © 2026 Tourisme 2E
      </div>
    </aside>
  );
};

export default AdminSidebar;
