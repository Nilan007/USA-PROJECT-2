import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Map,
  Search,
  Settings,
  Shield,
  UserCheck,
  BarChart3,
  Heart,
  GitBranch,
  Upload,
  FolderOpen,
  Bell,
  Brain
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Contracts', href: '/contracts', icon: FolderOpen },
    { name: 'FED IQ - AI Search', href: '/search', icon: Brain },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Favorites', href: '/favorites', icon: Heart },
    { name: 'Pipeline', href: '/pipeline', icon: GitBranch },
    { name: 'Subscription', href: '/subscription', icon: CreditCard },
    { name: 'Statewise - IQ', href: '/map', icon: Map },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Data Management', href: '/admin/manage', icon: Upload },
    { name: 'User Management', href: '/admin/users', icon: UserCheck },
    { name: 'Contracts', href: '/admin/contracts', icon: FolderOpen },
    { name: 'Contacts', href: '/admin/contacts', icon: Users },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Trial Requests', href: '/admin/trials', icon: Shield },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const navigation = isAdmin ? adminNavigation : userNavigation;

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      <div className="flex items-center justify-center h-16 px-4">
        <h2 className="text-white text-lg font-semibold">
          {isAdmin ? 'Admin Portal' : 'User Portal'}
        </h2>
      </div>
      
      <nav className="flex-1 px-4 pb-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}