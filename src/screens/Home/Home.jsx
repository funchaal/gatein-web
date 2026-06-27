import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useGetCompanyInfoQuery } from '@/services/api';
import {
  Users, MapPin, Layout, Building, Settings, Key, Ticket
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { colors } from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import ShortcutCard from './components/ShortcutCard';

export default function Home() {
  const { data: companyInfo } = useGetCompanyInfoQuery();
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const { can, isAdmin, isTerminal } = usePermissions();
  const { isDark } = useTheme();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = user?.name?.split(' ')[0] || 'usuário';

  // Build shortcuts dynamically based on permissions
  const allShortcuts = [
    {
      id: 'layouts',
      title: isTerminal ? 'Appointment Layouts' : 'Trip Layouts',
      description: 'Personalize a aparência do aplicativo e dos cards',
      icon: Layout,
      path: '/layouts',
      permission: isTerminal ? 'appointment_layouts' : 'trip_layouts',
    },
    {
      id: 'ticket-layouts',
      title: 'Ticket Layouts',
      description: 'Personalize a aparência dos tickets gerados no check-in',
      icon: Ticket,
      path: '/ticket-layouts',
      permission: 'ticket_layouts',
    },
    {
      id: 'geofence',
      title: 'Geofences',
      description: 'Configure as áreas de geolocalização e perímetros',
      icon: MapPin,
      path: '/geofence',
      permission: 'geofence',
    },
    {
      id: 'company',
      title: 'Empresa',
      description: 'Atualize os dados e informações da empresa',
      icon: Building,
      path: '/company',
      permission: 'company_information',
    },
    {
      id: 'services',
      title: 'Serviços',
      description: 'Administre as integrações e configurações de serviços',
      icon: Settings,
      path: '/services',
      permission: 'services',
    },
    {
      id: 'users',
      title: 'Usuários',
      description: 'Gerencie o acesso e permissões dos usuários',
      icon: Users,
      path: '/users',
      permission: 'users',
      adminOnly: true,
    },
    {
      id: 'api-keys',
      title: 'API Keys',
      description: 'Gerencie as chaves de API e integrações externas',
      icon: Key,
      path: '/api-keys',
      permission: 'api_keys',
      adminOnly: true,
    },
  ];

  const shortcuts = allShortcuts.filter(s => {
    if (s.adminOnly && !isAdmin) return false;
    return can(s.permission, 'read');
  });

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '24px',
      }}
    >
      {/* Header aligned with Login page style */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: isDark ? '#fafafa' : '#171717',
          letterSpacing: '-0.02em',
          marginBottom: '8px',
        }}>
          {greeting}, {firstName}
        </h1>
        <p style={{
          fontSize: '15px',
          color: isDark ? '#a3a3a3' : '#737373',
          lineHeight: 1.5,
        }}>
          O que você gostaria de configurar hoje no Painel {companyInfo?.name || (<span>Gate<span style={{opacity: 0.7}}>In</span></span>)}?
        </p>
      </div>

      {/* Cards grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {shortcuts.map((shortcut) => (
          <ShortcutCard 
            key={shortcut.id} 
            shortcut={shortcut} 
            navigate={navigate} 
            isDark={isDark} 
          />
        ))}
      </div>

      {/* Styles */}
      <style>{`
        .home-card:focus-visible {
          outline: 2px solid ${colors.primary};
          outline-offset: 2px;
        }

        @media (max-width: 640px) {
          .home-card {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
