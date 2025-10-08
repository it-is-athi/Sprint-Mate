import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Zap, LogOut, Calendar, MessageCircle, User, Home, ArrowLeft } from 'lucide-react';

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Sidebar Navigation Items
  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'schedules', label: 'Schedules', icon: Calendar, path: '/dashboard/schedules' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, path: '/dashboard/chat' },
    { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/profile' },
  ];

  const currentPath = location.pathname;
  const isTasksView = currentPath.includes('/tasks/');

  // Get page title based on current route
  const getPageTitle = () => {
    if (currentPath === '/dashboard') return 'Welcome back!';
    if (currentPath === '/dashboard/schedules') return 'My Schedules';
    if (currentPath.includes('/dashboard/schedules/tasks/')) return 'Schedule Tasks';
    if (currentPath === '/dashboard/chat') return 'AI Chat Assistant';
    if (currentPath === '/dashboard/profile') return 'Profile Settings';
    return 'Dashboard';
  };

  const getPageSubtitle = () => {
    if (currentPath === '/dashboard') return `Hello ${user?.name || 'User'}! Ready to tackle your goals today?`;
    if (currentPath === '/dashboard/schedules') return 'Organize your learning journey';
    if (currentPath.includes('/dashboard/schedules/tasks/')) return 'Manage your tasks';
    if (currentPath === '/dashboard/chat') return 'Get help with scheduling and planning';
    if (currentPath === '/dashboard/profile') return 'Manage your account settings';
    return 'Manage your learning journey';
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Fixed Sidebar - Never moves when scrolling */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-black border-r border-yellow-600/30 flex flex-col flex-shrink-0 z-50">
        {/* Logo */}
        <div className="p-6 border-b border-yellow-600/30">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center mr-3">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="text-white text-xl font-bold">SprintMate</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                (item.path === '/dashboard' && currentPath === '/dashboard') ||
                (item.path !== '/dashboard' && currentPath.startsWith(item.path));

              return (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-black font-semibold'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-yellow-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content - Add left margin for fixed sidebar */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Top Bar with updated greeting box */}
        <header
          className="relative bg-gray-900 border-b border-yellow-600/30 p-6 rounded-lg"
          style={{
            backgroundImage: `url('https://i.pinimg.com/736x/a2/c4/d6/a2c4d6902eb3111ddf5ef86bb18250e3.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '120px', // slightly bigger box
          }}
        >
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-black/50 rounded-lg pointer-events-none"></div>

          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-white drop-shadow-lg">
                {getPageTitle()}
              </h1>
              <p className="text-gray-200 drop-shadow-sm">
                {getPageSubtitle()}
              </p>
            </div>

            {/* User Info & Logout - Top Right */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-black" />
                </div>
                {/* Dynamic username */}
                <span className="text-sm text-gray-300">{user?.name || 'User'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-red-400 transition-all duration-200 border border-gray-700 hover:border-red-400/50"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Back Arrow - Separated from header */}
        {isTasksView && (
          <div className="px-6 pt-4 pb-2">
            <button
              onClick={() => navigate('/dashboard/schedules')}
              className="inline-flex items-center justify-center w-8 h-8 bg-gray-800 hover:bg-gray-700 text-yellow-400 hover:text-yellow-300 rounded-lg border border-yellow-600/30 hover:border-yellow-400/50 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className={`flex-1 p-6 overflow-x-hidden overflow-y-auto ${isTasksView ? 'pt-2' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
