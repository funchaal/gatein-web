import { useSelector } from 'react-redux';

/**
 * Módulos permitidos por tipo de empresa.
 * Espelha exatamente o COMPANY_TYPE_MODULES do backend.
 */
const COMPANY_TYPE_MODULES = {
  terminal: new Set([
    'geofence',
    'appointment_layouts',
    'ticket_layouts',
    'services',
    'company_information',
    'users',
    'api_keys',
  ]),
  trucking_company: new Set([
    'trip_layouts',
    'services',
    'company_information',
    'users',
    'api_keys',
  ]),
};

/**
 * usePermissions()
 *
 * Retorna helpers de permissão baseados no usuário autenticado.
 *
 * can(module, action?)   → boolean  (action padrão: 'write')
 * isAdmin                → boolean
 * companyType            → 'terminal' | 'trucking_company' | null
 * isTerminal             → boolean
 * isTruckingCompany      → boolean
 */
export function usePermissions() {
  const { user } = useSelector((state) => state.auth);

  const companyType = user?.company_type ?? null;
  const isAdmin = user?.is_admin ?? false;
  const permissions = user?.permissions ?? {};

  function moduleAllowed(module) {
    if (!companyType) return false;
    return COMPANY_TYPE_MODULES[companyType]?.has(module) ?? false;
  }

  function can(module, action = 'write') {
    // 1. Restrição estrutural — bloqueia mesmo admin
    if (!moduleAllowed(module)) return false;

    // 2. Admin passa em tudo que a empresa suporta
    if (isAdmin) return true;

    // 3. Permissão granular
    const perm = permissions[module] ?? 'none';
    if (action === 'read') return ['read', 'write', 'read/write'].includes(perm);
    if (action === 'write') return ['write', 'read/write'].includes(perm);
    return false;
  }

  return {
    can,
    isAdmin,
    companyType,
    isTerminal: companyType === 'terminal',
    isTruckingCompany: companyType === 'trucking_company',
  };
}