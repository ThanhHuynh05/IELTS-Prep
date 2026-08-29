import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

  useEffect(() => {
    const checkSession = () => {
      const storedUser = localStorage.getItem('ielts_user');
      const sessionExpiry = localStorage.getItem('ielts_session_expiry');

      if (storedUser && sessionExpiry) {
        if (Date.now() > parseInt(sessionExpiry, 10)) {
          // Session expired
          setUser(null);
          localStorage.removeItem('ielts_user');
          localStorage.removeItem('ielts_session_expiry');
        } else {
          setUser(JSON.parse(storedUser));
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  // Update session expiry on user activity
  useEffect(() => {
    if (!user) return;

    let activityTimeout;
    
    const updateActivity = () => {
      localStorage.setItem('ielts_session_expiry', Date.now() + SESSION_TIMEOUT_MS);
    };

    const handleActivity = () => {
      // Debounce updates to avoid excessive writes
      if (activityTimeout) return;
      activityTimeout = setTimeout(() => {
        updateActivity();
        activityTimeout = null;
      }, 1000); // 1-second debounce
    };

    // Initialize the first expiry timestamp
    updateActivity();

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));

    // Periodically check for expiration
    const intervalId = setInterval(() => {
      const sessionExpiry = localStorage.getItem('ielts_session_expiry');
      if (sessionExpiry && Date.now() > parseInt(sessionExpiry, 10)) {
        logout();
        alert('Your session has expired due to inactivity. Please log in again.');
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (activityTimeout) clearTimeout(activityTimeout);
      clearInterval(intervalId);
    };
  }, [user]);

  // Simulate strict backend validation
  const login = async (identifier, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('ielts_user', JSON.stringify(data.user));
      localStorage.setItem('ielts_session_expiry', Date.now() + SESSION_TIMEOUT_MS);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ielts_user');
    localStorage.removeItem('ielts_session_expiry');
  };

  const register = async (username, email, password, adminCode = '') => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, adminCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('ielts_user', JSON.stringify(data.user));
      localStorage.setItem('ielts_session_expiry', Date.now() + SESSION_TIMEOUT_MS);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Reset failed');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
