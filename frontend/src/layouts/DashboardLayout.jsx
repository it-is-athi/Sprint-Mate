import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Zap, LogOut, Calendar, MessageCircle, User, Home, ArrowLeft, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import BlurText from '../components/BlurText';

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'schedules', label: 'Schedules', icon: Calendar, path: '/dashboard/schedules' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, path: '/dashboard/chat' },
    { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/profile' },
  ];

  const currentPath = location.pathname;
  const isTasksView = currentPath.includes('/tasks/');

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

  // Theme class helpers
  const lightTheme = theme === 'light';
  const rootBg = lightTheme
    ? 'bg-gradient-to-b from-yellow-50 via-amber-100 to-yellow-200 text-gray-900'
    : 'bg-black text-white';
  const sidebarBg = lightTheme
    ? 'bg-gradient-to-b from-yellow-200 via-yellow-100 to-amber-50 border-yellow-400/30'
    : 'bg-gradient-to-b from-gray-900 to-black border-yellow-600/30';

  return (
    <div className={`min-h-screen ${rootBg} transition-colors duration-300`}>
      {/* Sidebar - nav only */}
      <div className={`fixed left-0 top-0 h-screen w-64 ${sidebarBg} flex flex-col flex-shrink-0 z-50`}>
        {/* Logo */}
        <div className="p-6 border-b border-yellow-600/30">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center mr-3">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold">SprintMate</span>
          </div>
        </div>
        {/* Navigation only */}
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
                        ? (lightTheme
                            ? 'bg-gradient-to-r from-yellow-300 to-yellow-100 text-yellow-900 font-semibold'
                            : 'bg-gradient-to-r from-yellow-600 to-amber-600 text-black font-semibold')
                        : (lightTheme
                            ? 'text-gray-700 hover:bg-yellow-100 hover:text-amber-700'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-yellow-400')
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
      {/* Main Content */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Top Bar / Greeting */}
        <header
          className={`relative border-b p-6 rounded-lg flex items-center ${lightTheme ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-900 border-yellow-600/30'}`}
          style={{ minHeight: '120px' }}
        >
          <div className="flex items-center justify-between w-full">
            <div>
              {currentPath === '/dashboard'
                ? <BlurText text="Welcome back!" className={`text-3xl font-serif font-bold ${lightTheme ? 'text-yellow-900' : 'text-white'} drop-shadow-lg`} animateBy="words" direction="top" />
                : <h1 className={`text-3xl font-serif font-bold drop-shadow-lg ${lightTheme ? 'text-yellow-900' : 'text-white'}`}>{getPageTitle()}</h1>
              }
              <p className={`text-md ${lightTheme ? 'text-yellow-900' : 'text-gray-200'} drop-shadow-sm`}>
                {getPageSubtitle()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme toggle icon button */}
              <button
                onClick={toggleTheme}
                className={`rounded-full p-2 transition-colors duration-200 ${lightTheme ? 'hover:bg-yellow-200' : 'hover:bg-gray-800'}`}
                aria-label="Toggle theme"
              >
                {lightTheme ? <Moon className="w-6 h-6 text-yellow-900"/> : <Sun className="w-6 h-6 text-yellow-200"/>}
              </button>
              {/* Logout button icon only */}
              <button
                onClick={handleLogout}
                className={`rounded-full p-2 transition-colors duration-200 ${lightTheme ? 'hover:bg-yellow-200' : 'hover:bg-gray-800'}`}
                aria-label="Logout"
              >
                <LogOut className={`w-6 h-6 ${lightTheme ? 'text-red-600' : 'text-gray-300'}`} />
              </button>
            </div>
          </div>
        </header>
        {/* Back Arrow - Separated from header */}
        {isTasksView && (
          <div className="px-6 pt-4 pb-2">
            <button
              onClick={() => navigate('/dashboard/schedules')}
              className={`inline-flex items-center justify-center w-8 h-8 ${lightTheme ? 'bg-yellow-200 hover:bg-yellow-300 text-amber-700 hover:text-yellow-900 border-yellow-300 hover:border-yellow-400/50' : 'bg-gray-800 hover:bg-gray-700 text-yellow-400 hover:text-yellow-300 border-yellow-600/30 hover:border-yellow-400/50'} rounded-lg border transition-all duration-200`}
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
