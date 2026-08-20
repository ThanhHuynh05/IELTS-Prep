import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Listening from './pages/Listening';
import Reading from './pages/Reading';
import Writing from './pages/Writing';
import Speaking from './pages/Speaking';
import MockTest from './pages/MockTest';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import { getSettings } from './utils/storage';

import Landing from './pages/Landing';
import Register from './pages/Register';

function AppContent() {
  const [hasSettings, setHasSettings] = useState(true);

  useEffect(() => {
    if (!getSettings()) {
      setHasSettings(false);
    }
  }, []);

  if (!hasSettings) {
    return <Onboarding onComplete={() => setHasSettings(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/listening" element={<Listening />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/speaking" element={<Speaking />} />
        <Route path="/mock-test" element={<MockTest />} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminPanel /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
