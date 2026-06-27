export const MODULES_BY_TYPE = {
  terminal: [
    { key: 'geofence',              label: 'Geofence' },
    { key: 'appointment_layouts',   label: 'Appointment Layouts' },
    { key: 'ticket_layouts',        label: 'Ticket Layouts' },
    { key: 'services',              label: 'Serviços' },
    { key: 'company_information',   label: 'Dados da Empresa' },
    { key: 'announcements',         label: 'Avisos' },
  ],
  trucking_company: [
    { key: 'trip_layouts',          label: 'Trip Layouts' },
    { key: 'services',              label: 'Serviços' },
    { key: 'company_information',   label: 'Dados da Empresa' },
    { key: 'announcements',         label: 'Avisos' },
  ],
};

export const PERMISSION_OPTIONS = [
  { value: 'none',       label: 'Nenhuma' },
  { value: 'read',       label: 'Visualizar' },
  { value: 'write',      label: 'Editar' },
  { value: 'read/write', label: 'Visualizar e Editar' },
];

export function buildDefaultPermissions(modules) {
  return Object.fromEntries(modules.map((m) => [m.key, 'none']));
}
