import {
  Code,
  MapPin,
  Building2,
  Server,
  Home as HomeIcon,
  Package,
  Plus,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Route,
  ChevronsLeft,
  Sun,
  Moon,
  Bell,
  Ticket,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import SidebarItem from './SidebarItem';
import { usePermissions } from '../../hooks/usePermissions';
import { logout } from '../../store/slices/authSlice';
import { colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Sidebar({ sidebarOpen, setSidebarOpen, showUserMenu, setShowUserMenu }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const activeTab = location.pathname;
  const { isDark, toggleTheme } = useTheme();

  const { can, isAdmin, isTerminal, isTruckingCompany } = usePermissions();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside
      className={`bg-white dark:bg-[#0D0D0D] border-r pt-8 border-gray-200 dark:border-[#1F1F1F] flex flex-col transition-transform duration-300 ease-in-out shadow-none flex-shrink-0 absolute z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-[266px] h-full`}
    >
      {/* Logo */}
      <div className="flex mb-7 items-center justify-between pl-6 pr-3.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl text-gray-900 dark:text-gray-100 tracking-tight">Gate<span style={{ color: colors.primary }}>In</span></span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          title="Fechar menu"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 mb-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Menu Principal
        </div>

        <SidebarItem icon={HomeIcon} label="Home" to="/" active={activeTab === '/'} />

        {/* Schemas: terminal vê appointment_layouts, trucking vê trip_layouts */}
        {(can('appointment_layouts', 'read') || can('trip_layouts', 'read')) && (
          <SidebarItem
            icon={Code}
            label={isTerminal ? 'Appointment Layouts' : 'Trip Layouts'}
            to="/layouts"
            active={activeTab === '/layouts'}
          />
        )}

        {can('ticket_layouts', 'read') && (
          <SidebarItem
            icon={Ticket}
            label="Ticket Layouts"
            to="/ticket-layouts"
            active={activeTab === '/ticket-layouts'}
          />
        )}

        {/* Geofence: exclusivo terminal */}
        {can('geofence', 'read') && (
          <SidebarItem icon={MapPin} label="Geofence" to="/geofence" active={activeTab === '/geofence'} />
        )}

        {can('company_information', 'read') && (
          <SidebarItem icon={Building2} label="Dados da Empresa" to="/company" active={activeTab === '/company'} />
        )}

        {can('services', 'read') && (
          <SidebarItem icon={Server} label="Serviços" to="/services" active={activeTab === '/services'} />
        )}

        {can('announcements', 'read') && (
          <SidebarItem icon={Bell} label="Avisos" to="/announcements" active={activeTab === '/announcements'} />
        )}

        {/* Seção admin */}
        {isAdmin && (
          <>
            <div className="px-3 mt-6 mb-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Administração
            </div>
            <SidebarItem icon={Plus} label="Usuários" to="/users" active={activeTab === '/users'} />
            <SidebarItem icon={Package} label="API Keys" to="/api-keys" active={activeTab === '/api-keys'} />
          </>
        )}
      </nav>

      {/* Dark Mode Toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
          title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Sun className={`w-[18px] h-[18px] absolute transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
            <Moon className={`w-[18px] h-[18px] absolute transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
          </div>
          <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
        </button>
      </div>

      {/* User Section */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-[#1F1F1F] flex-shrink-0">
        {/* User Info */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#151515] transition-colors group cursor-pointer"
          >
            <div
              className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-sm tracking-wide transition-all duration-300 group-hover:scale-105 shadow-sm border border-transparent"
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, #ff8f00 100%)`,
                color: '#ffffff',
              }}
            >
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-gray-950 dark:group-hover:text-white transition-colors truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.username}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-300 ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/95 backdrop-blur-xl dark:bg-[#0a0a0a]/95 rounded-xl shadow-xl shadow-black/5 dark:shadow-black/40 border border-gray-200/60 dark:border-white/5 p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 font-medium transition-all duration-200 rounded-lg cursor-pointer group"
                >
                  <LogOut className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
                  <span>Sair</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}