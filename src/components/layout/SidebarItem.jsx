import { NavLink } from 'react-router-dom';
import { colors } from '@/constants/colors';

export default function SidebarItem({ icon: Icon, label, to, badge }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 my-1.5 rounded-lg cursor-pointer transition-all ${
                isActive
                    ? ''
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                }`
            }
            style={({ isActive }) =>
                isActive
                    ? {
                          backgroundColor: colors.primary,
                          color: '#ffffff',
                      }
                    : {}
            }
        >
            {({ isActive }) => (
                <>
                    {Icon && (
                        <Icon
                            className={`w-5 h-5 mr-3 transition-colors duration-300 ${
                                isActive ? '' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                            }`}
                            style={isActive ? { color: '#ffffff' } : {}}
                        />
                    )}
                    <span className="text-sm flex-1 tracking-wide">{label}</span>
                    {badge && (
                        <span 
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={isActive 
                                ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }
                                : { backgroundColor: '#e5e7eb', color: '#4b5563' } // bg-gray-200 text-gray-600
                            }
                        >
                            {badge}
                        </span>
                    )}
                </>
            )}
        </NavLink>
    );
}
