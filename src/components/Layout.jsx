import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Workflow,
  Key,
  LogOut,
  Menu,
  X,
  Zap,
} from 'lucide-react';

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    activeClass: 'bg-primary-50 shadow-md text-primary-600 font-medium border-l-4 border-primary-500',
    iconColor: 'text-primary-600',
  },
  {
    path: '/workflows',
    label: 'Workflows',
    icon: Workflow,
    activeClass: 'bg-secondary-50 shadow-md text-secondary-600 font-medium border-l-4 border-secondary-500',
    iconColor: 'text-secondary-600',
  },
  {
    path: '/credentials',
    label: 'Credentials',
    icon: Key,
    activeClass: 'bg-accent-50 shadow-md text-accent-600 font-medium border-l-4 border-accent-500',
    iconColor: 'text-accent-600',
  },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const activeItem = navItems.find((item) => isActive(item.path));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 transform transition-transform duration-200 ease-in-out shadow-lg ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-secondary-500">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                <Workflow size={22} className="text-primary-600" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Flow</span>
                <div className="flex items-center gap-1">
                  <Zap size={12} className="text-accent-300" />
                  <span className="text-xs text-white/80">Automation</span>
                </div>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? item.activeClass
                      : 'text-gray-700 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <Icon
                    size={20}
                    className={active ? item.iconColor : 'text-gray-500'}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold">
                  {user?.name?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase() ||
                    'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || ''}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
            >
              <LogOut
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 lg:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex-1 lg:flex-none flex items-center gap-3">
              <div className="hidden lg:block">
                {activeItem && (
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500`}
                  >
                    {React.createElement(activeItem.icon, {
                      size: 18,
                      className: 'text-white',
                    })}
                  </div>
                )}
              </div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {activeItem?.label || 'Flow'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-success-50 to-success-100 rounded-full">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-success-700">
                  System Online
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
