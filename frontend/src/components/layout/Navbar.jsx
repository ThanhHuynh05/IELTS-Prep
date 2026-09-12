import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield, Menu, X, Settings, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <div className="hidden lg:ml-4 xl:ml-6 lg:flex lg:space-x-4 xl:space-x-8 overflow-hidden">
              <Link to="/dashboard" className={getLinkClasses('/dashboard')} aria-current={location.pathname === '/dashboard' ? 'page' : undefined}>Dashboard</Link>
              <Link to="/listening" className={getLinkClasses('/listening')} aria-current={location.pathname === '/listening' ? 'page' : undefined}>Listening</Link>
              <Link to="/reading" className={getLinkClasses('/reading')} aria-current={location.pathname === '/reading' ? 'page' : undefined}>Reading</Link>
              <Link to="/writing" className={getLinkClasses('/writing')} aria-current={location.pathname === '/writing' ? 'page' : undefined}>Writing</Link>
              <Link to="/speaking" className={getLinkClasses('/speaking')} aria-current={location.pathname === '/speaking' ? 'page' : undefined}>Speaking</Link>
              <Link to="/history" className={getLinkClasses('/history')} aria-current={location.pathname === '/history' ? 'page' : undefined}>History</Link>
            </div>
          </div>
          <div className="hidden lg:ml-2 xl:ml-6 lg:flex lg:items-center space-x-4 shrink-0">
            <Link to="/mock-test" className="inline-flex items-center px-3 xl:px-4 py-2 border border-transparent text-sm font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors whitespace-nowrap">
              Full Mock Test
            </Link>
            
            {user && (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none"
                >
                  <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs border dark:border-gray-700 uppercase tracking-wider">{user.role}</span>
                  <span>{user.username}</span>
                  <ChevronDown size={16} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 z-50">
                    {user?.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="flex items-center px-4 py-2 text-sm text-fuchsia-600 dark:text-fuchsia-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Shield size={16} className="mr-2" /> Admin Panel
                      </Link>
                    )}
                    <Link 
                      to="/settings" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings size={16} className="mr-2" /> Settings
                    </Link>
                    <button 
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut size={16} className="mr-2" /> Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden space-x-2">
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
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-lg">
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
