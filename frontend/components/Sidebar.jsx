import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Calendar, CheckSquare, MessageSquare, User, LogOut, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const lightTheme = theme === 'light';

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? (lightTheme ? 'bg-yellow-400/90 text-black shadow-md' : 'bg-yellow-500/90 text-black shadow-lg shadow-yellow-500/20')
        : (lightTheme ? 'text-gray-700 hover:bg-yellow-100/80' : 'text-gray-300 hover:bg-white/10')
    }`;

  return (
    <div 
      className={`h-full w-64 flex flex-col p-4 border-r transition-colors duration-300 ${
        lightTheme 
          ? 'bg-white/70 backdrop-blur-lg border-gray-200' 
          : 'bg-black/50 backdrop-blur-lg border-yellow-500/10'
      }`}
      style={{ fontFamily: "'Bodoni Moda', serif" }}
    >
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className={`p-2 rounded-full ${lightTheme ? 'bg-yellow-400' : 'bg-yellow-500'}`}>
          <svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className={`text-2xl font-bold ${lightTheme ? 'text-gray-900' : 'text-white'}`}>SprintMate</h1>
      </div>

      <nav className="flex-grow space-y-3">
        <NavLink to="/dashboard/home" className={navLinkClasses}>
          <Home className="w-5 h-5" />
          <span className="font-semibold">Home</span>
        </NavLink>
        <NavLink to="/dashboard/schedules" className={navLinkClasses}>
          <Calendar className="w-5 h-5" />
          <span className="font-semibold">Schedules</span>
        </NavLink>
        <NavLink to="/dashboard/tasks" className={navLinkClasses}>
          <CheckSquare className="w-5 h-5" />
          <span className="font-semibold">Tasks</span>
        </NavLink>
        <NavLink to="/dashboard/chat" className={navLinkClasses}>
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">AI Chat</span>
        </NavLink>
        <NavLink to="/dashboard/profile" className={navLinkClasses}>
          <User className="w-5 h-5" />
          <span className="font-semibold">Profile</span>
        </NavLink>
      </nav>

      <div className="mt-auto space-y-3">
        <div className="flex items-center justify-center p-2 rounded-lg bg-gray-500/10">
          <span className={`text-sm font-semibold ${lightTheme ? 'text-gray-600' : 'text-gray-400'}`}>Theme</span>
          <button
            onClick={toggleTheme}
            className="ml-auto p-2 rounded-md hover:bg-gray-500/20 transition-colors"
          >
            {lightTheme ? <Moon className="w-5 h-5 text-gray-700" /> : <Sun className="w-5 h-5 text-yellow-400" />}
          </button>
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
            lightTheme ? 'text-red-600 hover:bg-red-100' : 'text-red-400 hover:bg-red-500/10'
          }`}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
