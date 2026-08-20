import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLinkClasses = (path) => {
    const isActive = location.pathname === path;
    const base = "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors";
    const active = "border-blue-600 text-blue-600 dark:text-blue-400";
    const inactive = "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200";
    return `${base} ${isActive ? active : inactive}`;
  };

  const getMobileLinkClasses = (path) => {
    const isActive = location.pathname === path;
    const base = "block px-3 py-2 rounded-md text-base font-medium transition-colors";
    const active = "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200";
    const inactive = "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white";
    return `${base} ${isActive ? active : inactive}`;
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm transition-colors relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center text-xl font-bold text-blue-600 dark:text-blue-400">
              IELTS Prep
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/dashboard" className={getLinkClasses('/dashboard')} aria-current={location.pathname === '/dashboard' ? 'page' : undefined}>Dashboard</Link>
              <Link to="/listening" className={getLinkClasses('/listening')} aria-current={location.pathname === '/listening' ? 'page' : undefined}>Listening</Link>
              <Link to="/reading" className={getLinkClasses('/reading')} aria-current={location.pathname === '/reading' ? 'page' : undefined}>Reading</Link>
              <Link to="/writing" className={getLinkClasses('/writing')} aria-current={location.pathname === '/writing' ? 'page' : undefined}>Writing</Link>
              <Link to="/speaking" className={getLinkClasses('/speaking')} aria-current={location.pathname === '/speaking' ? 'page' : undefined}>Speaking</Link>
              <Link to="/history" className={getLinkClasses('/history')} aria-current={location.pathname === '/history' ? 'page' : undefined}>History</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-800">
                  <Shield size={16} className="mr-1" /> Admin Panel
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {user && (
              <Link to="/settings" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2 flex items-center border-r dark:border-gray-700 pr-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs mr-2 border dark:border-gray-700 uppercase tracking-wider">{user.role}</span>
                {user.username}
              </Link>
            )}
            <ThemeToggle />
            <Link to="/mock-test" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
              Full Mock Test
            </Link>
            {user && (
              <button 
                onClick={handleLogout}
                className="inline-flex items-center p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                title="Logout"
                aria-label="Log out"
              >
                <LogOut size={20} />
              </button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="sm:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className={getMobileLinkClasses('/dashboard')}>Dashboard</Link>
            <Link to="/listening" onClick={() => setMenuOpen(false)} className={getMobileLinkClasses('/listening')}>Listening</Link>
            <Link to="/reading" onClick={() => setMenuOpen(false)} className={getMobileLinkClasses('/reading')}>Reading</Link>
            <Link to="/writing" onClick={() => setMenuOpen(false)} className={getMobileLinkClasses('/writing')}>Writing</Link>
            <Link to="/speaking" onClick={() => setMenuOpen(false)} className={getMobileLinkClasses('/speaking')}>Speaking</Link>
            <Link to="/history" onClick={() => setMenuOpen(false)} className={getMobileLinkClasses('/history')}>History</Link>
            {user && (
              <Link to="/settings" onClick={() => setMenuOpen(false)} className={getMobileLinkClasses('/settings')}>
                Settings ({user.username})
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center px-3 py-2 rounded-md text-base font-medium text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/30">
                <Shield size={18} className="mr-2" /> Admin Panel
              </Link>
            )}
            <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-700 flex flex-col space-y-2">
              <Link to="/mock-test" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-bold text-white bg-blue-600 hover:bg-blue-700 text-center">
                Full Mock Test
              </Link>
              {user && (
                <button 
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 text-left"
                >
                  <LogOut size={18} className="mr-2" /> Log out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
