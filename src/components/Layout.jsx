import { useState, useEffect } from 'react';
import {
    Code,
    MapPin,
    Building2,
    Bell,
    HelpCircle,
    Home as HomeIcon,
    Package,
    Plus,
    LogOut,
    User,
    Settings,
    ChevronDown,
    KeySquare,
    Server,
    ChevronsRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';


import Sidebar from './layout/Sidebar';

export default function Layout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token } = useSelector(state => state.auth);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };
    
    const isAdmin = user?.is_admin || user?.isAdmin;


    const tabs = [
        { id: '/', label: 'Home', icon: HomeIcon },
        { id: '/layouts', label: 'Layout Editor', icon: Code },
        { id: '/geofence', label: 'Geofence', icon: MapPin },
        { id: '/company', label: 'Dados da Empresa', icon: Building2 },
        { id: '/services', label: 'Serviços', icon: Server },
        { id: '/users', label: 'Criar Usuário', icon: Plus, admin: true },
        { id: '/api-keys', label: 'API Private Key', icon: KeySquare, admin: true },
    ];

    const currentTab = tabs.find(t => t.id === location.pathname);

    return (
        <div className="flex h-screen w-full bg-background font-sans text-foreground">
            <Sidebar 
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                isAdmin={isAdmin}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
                handleLogout={handleLogout}
            />

            {/* Main Content */}
            <main 
                className="flex-1 flex flex-col overflow-hidden relative transition-[margin-left] duration-300 ease-in-out"
                style={{ marginLeft: sidebarOpen ? '266px' : '0' }}
            >
                {/* Floating Menu Toggle (Only when Sidebar is closed) */}
                {!sidebarOpen && (
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="absolute top-7.5 left-4 z-40 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer flex items-center justify-center bg-background border border-border"
                        title="Abrir menu"
                    >
                        <ChevronsRight className="w-5 h-5" />
                    </button>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-auto bg-background p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
