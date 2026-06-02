import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

/**
 * ProtectedRoute
 *
 * Props:
 *   requireAuth     (default true)  — redireciona para /login se não autenticado
 *   requireAdmin    (default false) — redireciona para / se não for admin
 *   module          (string)        — se informado, verifica can(module, action)
 *   action          (string)        — ação para checar junto com module (default 'read')
 *   redirectTo      (string)        — destino em caso de negação (default '/')
 */
export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  module = null,
  action = 'read',
  redirectTo = '/',
}) {
  const { isAuthenticated, isAppLoading } = useSelector((state) => state.auth);
  const { can, isAdmin } = usePermissions();
  const location = useLocation();

  // Aguarda o restore de sessão para não piscar o redirect
  if (isAppLoading) return null;

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  if (module && !can(module, action)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}