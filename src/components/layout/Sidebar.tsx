import React from 'react';
import { BookOpen, Users, Building2, Contact2, HelpCircle, DollarSign, LayoutDashboard, UserCog, Wrench } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../hooks/useLocation';

const getNavigation = (hasPermission: (permission: string) => boolean) => [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  ...(hasPermission('view:hotels') ? [{ name: 'Hotels', icon: Building2, href: '/hotels' }] : []),
  ...(hasPermission('view:contacts') ? [{ name: 'Contacts', icon: Contact2, href: '/contacts' }] : []),
  ...(hasPermission('view:bookings') ? [{ name: 'Bookings', icon: BookOpen, href: '/bookings' }] : []),
  ...(hasPermission('view:guests') ? [{ name: 'Guests', icon: Users, href: '/guests' }] : []),
  ...(hasPermission('view:finance') ? [{ name: 'Finance', icon: DollarSign, href: '/finance' }] : []),
  ...(hasPermission('view:tickets') ? [{ name: 'Support', icon: HelpCircle, href: '/tickets' }] : []),
  ...(hasPermission('manage:users') ? [{ name: 'Users', icon: UserCog, href: '/users' }] : []),
  ...(hasPermission('admin') ? [{ name: 'Tools', icon: Wrench, href: '/tools' }] : []),
];

export default function Sidebar() {
  const { hasPermission } = useAuth();
  const { pathname: currentPath, navigate } = useLocation();
  const navigation = getNavigation(hasPermission);

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(href);
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
        <div className="flex-1 flex flex-col pt-20 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavigation(e, item.href)}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-6 w-6
                      ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}
                    `}
                  />
                  {item.name}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}