import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, UserCircle } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <h2 className="text-sm font-bold text-slate-700">Espace Back-Office</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
              <UserCircle size={20} className="text-teal-600" />
              <span>Admin System</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors">
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
