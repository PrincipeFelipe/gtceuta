import React from 'react';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminSettings from '../../components/admin/AdminSettings';

const AdminSettingsPage: React.FC = () => {
  return (
    <AdminLayout>
      <Helmet>
        <title>Configuración - Panel de Administración</title>
      </Helmet>
      <AdminSettings />
    </AdminLayout>
  );
};

export default AdminSettingsPage;