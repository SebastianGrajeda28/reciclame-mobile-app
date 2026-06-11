declare global {
  interface Window {
    __forceSessionExpired?: () => void;
  }
}
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserProvider } from './shared/context/UserContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import TitleSetter from './shared/components/TittleSetter';
import Header from './shared/components/Header';
import Footer from './shared/components/Footer';
import SessionExpiredModal from './shared/modals/SessionExpiredModal';
import { Toaster } from 'sonner';

import Home from './shared/pages/Home';
import Login from './shared/pages/Login';
import Logout from './shared/pages/Logout';
import AuthCallback from './shared/pages/AuthCallback';
import AdminPanel from './shared/pages/AdminPanel';
import ManagerPanel from './shared/pages/ManagerPanel';
import ViewerPanel from './shared/pages/ViewerPanel';
import UsersPage from './modules/admin/pages/UsersPage';
import AdminConfigPage from './modules/admin/pages/AdminConfigPage';
import ForgotPassword from './shared/pages/ForgotPassword';
import ResetPassword from './shared/pages/ResetPassword';
import MetricsDashboard from './shared/pages/MetricsDashboard';
import { useUser } from './shared/context/UserContext';

function RootEntry() {
  const { account, loading } = useUser();

  if (loading) return <div className="p-6">Cargando...</div>;
  if (!account) return <Navigate to="/login" replace />;
  return <Navigate to="/metrics" replace />;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { account, loading } = useUser();

  if (loading) return <div className="p-6">Cargando...</div>;
  if (account) return <Navigate to="/metrics" replace />;
  return <>{children}</>;
}

function AppShell() {
  const [sessionExpired, setSessionExpired] = useState(false);
  const location = useLocation();
  const isAuthRoute = ["/login", "/forgot-password", "/reset-password", "/auth/callback"].includes(location.pathname);

  useEffect(() => {
    window.__forceSessionExpired = () => setSessionExpired(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <SessionExpiredModal open={sessionExpired} />
      <TitleSetter />
      <Header />
      <main className={`flex-1 pt-20`}>
        <Routes>

          {/* ── Rutas públicas ── */}
          <Route path="/" element={<RootEntry />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
          <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

          <Route element={<ProtectedRoute allowedRoles={['VIEWER', 'MANAGER', 'ADMIN']} />}>
            <Route path="/metrics" element={<MetricsDashboard />} />
          </Route>

          {/* ── VIEWER ── */}
          <Route element={<ProtectedRoute allowedRoles={['VIEWER']} />}>
            <Route path="/viewer" element={<ViewerPanel />} />
          </Route>

          {/* ── MANAGER ── */}
          <Route element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']} />}>
            <Route path="/manager" element={<ManagerPanel />} />
          </Route>

          {/* ── ADMIN ── */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/accounts" element={<UsersPage />} />
            <Route path="/admin/config" element={<AdminConfigPage />} />
          </Route>

          <Route path="/unauthorized" element={<p>Acceso denegado. No tienes permisos para ver esta página.</p>} />
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>
      {!isAuthRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Router>
        <AppShell />
      </Router>
      <Toaster richColors />
    </UserProvider>
  );
}
