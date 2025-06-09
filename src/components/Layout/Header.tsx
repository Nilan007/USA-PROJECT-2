import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, User, LogOut, Settings } from 'lucide-react';

export default function Header() {
  const { user, signOut, isAdmin } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-900">FederalTalks IQ</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm">
                <div className="font-medium text-gray-900">{user?.full_name}</div>
                <div className="text-gray-500 capitalize">
                  {user?.role} {isAdmin && '• Admin Portal'}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={signOut}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}