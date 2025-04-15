import React from 'react';
import SponsorsAdmin from '../../components/admin/SponsorsAdmin';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminSponsorsPage: React.FC = () => {
  return (
    <AdminLayout>
      <Helmet>
        <title>Gestión de Patrocinadores - Panel de Administración</title>
      </Helmet>
      
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-8">Gestión de Patrocinadores y Colaboradores</h1>
        <SponsorsAdmin />
      </div>
    </AdminLayout>
  );
};

export default AdminSponsorsPage;