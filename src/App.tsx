import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUIStore } from './store/uiStore';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Exercises from './pages/Exercises';
import PatientExams from './pages/PatientExams';
import PatientProfile from './pages/PatientProfile';
import Evolucao from './pages/Evolucao';
import Settings from './pages/Settings';
import AdminProfessionals from './pages/AdminProfessionals';
import AdminGlobalExercises from './pages/AdminGlobalExercises';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const RootRoute = () => {
  const { session, role, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  
  if (role === 'client' || role === 'patient') return <Navigate to="/rotina" replace />;
  if (role === 'super_admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
};

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { session, role, loading } = useAuth();
  
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  
  // Normalizar roles e permitir hierarquia (super_admin acessa tudo de admin)
  const currentRole = role === 'client' ? 'patient' : role;
  
  // Se for super_admin, ele sempre pode acessar rotas de admin
  const isAuthorized =
    allowedRoles?.includes(currentRole as any) ||
    allowedRoles?.includes(role as any) ||
    (currentRole === 'super_admin' && allowedRoles?.includes('admin'));
  
  if (allowedRoles && !isAuthorized) {
    console.warn("[Auth] Unauthorized access attempt", { role, currentRole, allowedRoles });
    if (currentRole === 'patient') return <Navigate to="/rotina" replace />;
    if (currentRole === 'super_admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

function ScrollToTop() {
  const { pathname } = useLocation();
  const { activePatientId } = useUIStore();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, activePatientId]);
  return null;
}

function AppContent() {
  const { theme } = useUIStore();

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RootRoute />} />
        
        {/* Super Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminProfessionals />
          </ProtectedRoute>
        } />
        <Route path="/admin/exercises" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminGlobalExercises />
          </ProtectedRoute>
        } />
        
        {/* Professional Routes (Admin / Super Admin) */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/patients" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Patients />
          </ProtectedRoute>
        } />
        <Route path="/exercises" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Exercises />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Settings />
          </ProtectedRoute>
        } />

        {/* Patient Routes (Client only) */}
        <Route path="/rotina" element={
          <ProtectedRoute allowedRoles={['client']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/prontuario" element={
          <ProtectedRoute allowedRoles={['client']}>
            <PatientExams />
          </ProtectedRoute>
        } />
        <Route path="/perfil" element={
          <ProtectedRoute allowedRoles={['client']}>
            <PatientProfile />
          </ProtectedRoute>
        } />
        <Route path="/evolucao" element={
          <ProtectedRoute allowedRoles={['client']}>
            <Evolucao />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <DeleteConfirmModal />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}