import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Navbar />
      <main className="w-full mx-auto py-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
