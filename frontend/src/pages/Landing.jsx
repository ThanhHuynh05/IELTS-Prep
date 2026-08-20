import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Target, BarChart2, ShieldCheck } from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();

  // If user is already logged in, redirect them to their dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Navbar */}
      <nav className="border-b dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-xl tracking-tight">IELTS Master</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Log in
              </Link>
              <Link 
                to="/register" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-extrabold tracking-tight sm:text-7xl">
          Elevate Your IELTS Score with <span className="text-indigo-600 dark:text-indigo-400">Confidence</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          The ultimate platform for preparing all four IELTS modules: Listening, Reading, Writing, and Speaking. Track your progress and achieve your target band.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link 
            to="/register" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-transform hover:scale-105 shadow-lg"
          >
            Start Learning for Free
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Targeted Practice</h3>
              <p className="text-gray-600 dark:text-gray-400">Hone your skills with extensive practice tests designed to mirror the real IELTS exam.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <BarChart2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-400">Detailed analytics and band score estimation help you understand your strengths and weaknesses.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Feedback</h3>
              <p className="text-gray-600 dark:text-gray-400">Strict backend validation and AI-assisted marking for accurate and actionable insights.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
