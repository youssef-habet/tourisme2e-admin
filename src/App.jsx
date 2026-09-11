import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import GroupesManagement from './pages/GroupesManagement'
import OffresManagement from './pages/OffresManagement'
import HotelsManagement from './pages/HotelsManagement'
import SitesTouristiquesManagement from './pages/SitesTouristiquesManagement'
import ServicesManagement from './pages/ServicesManagement'
import PartenairesManagement from './pages/PartenairesManagement'
import TestimonialsManagement from './pages/TestimonialsManagement'
import InscriptionsDatabase from './pages/InscriptionsDatabase'
import DevisManagement from './pages/DevisManagement'

import Login from './pages/Login'
import AdminsManagement from './pages/AdminsManagement'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="offres" element={<OffresManagement />} />
        <Route path="groupes" element={<GroupesManagement />} />
        <Route path="hotels" element={<HotelsManagement />} />
        <Route path="sites" element={<SitesTouristiquesManagement />} />
        <Route path="inscriptions" element={<InscriptionsDatabase />} />
        <Route path="devis" element={<DevisManagement />} />
        
        <Route path="services" element={<ServicesManagement />} />
        <Route path="partenaires" element={<PartenairesManagement />} />
        <Route path="testimonials" element={<TestimonialsManagement />} />
        <Route path="utilisateurs" element={<AdminsManagement />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
