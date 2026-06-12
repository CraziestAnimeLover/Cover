import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import LeftSidebar from './LeftSidebar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <LeftSidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;