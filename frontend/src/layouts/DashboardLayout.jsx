// layouts/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { IoAnalyticsOutline, IoSettingsOutline } from 'react-icons/io5';
import { MdOutlineCalendarToday, MdOutlineHome } from "react-icons/md";
import { HiOutlineLightningBolt, HiOutlineLogout } from 'react-icons/hi';
import { PiToolbox } from 'react-icons/pi';

export const DashboardLayout = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmSignOut = window.confirm("Are you sure you want to sign out?");
    if (!confirmSignOut) return;

    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121212] text-white transition-all ease-in-out duration-150">
      {/* Sidebar */}
      <aside 
        className={`h-full bg-[#1e1e1e] border-r border-white/10 transition-all duration-300 flex flex-col ${
          isExpanded ? 'w-64' : 'w-16'
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          {isExpanded && (
            <span className="font-cal text-2xl tracking-tight leading-none whitespace-nowrap">
              <span className="text-blue-300 font-bold">Train</span>
              <span className="text-white font-bold">Loop</span>
            </span>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/10 rounded-lg text-xs shrink-0 ml-auto cursor-pointer"
          >
            {isExpanded ? <FaArrowLeft size={15} /> : <FaArrowRight size={15}/>}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-2 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl">
            <span className={`shrink-0 w-6 h-6 flex items-center justify-center ${isExpanded ? "text-blue-300" : ""} transition-all ease-in-out duration-150`}><MdOutlineHome /></span>
            {isExpanded && <span className="text-sm">Overview</span>}
          </Link>

          <Link to="/analytics" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl">
            <span className={`shrink-0 w-6 h-6 flex items-center justify-center ${isExpanded ? "text-blue-300" : ""} transition-all ease-in-out duration-150`}><IoAnalyticsOutline /></span>
            {isExpanded && <span className="text-sm">Analytics</span>}
          </Link>

          <Link to="/calendar" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl">
            <span className={`shrink-0 w-6 h-6 flex items-center justify-center ${isExpanded ? "text-blue-300" : ""} transition-all ease-in-out duration-150`}><MdOutlineCalendarToday /></span>
            {isExpanded && <span className="text-sm">Calendar</span>}
          </Link>

          <Link to="/activities" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl">
            <span className={`shrink-0 w-6 h-6 flex items-center justify-center ${isExpanded ? "text-blue-300" : ""} transition-all ease-in-out duration-150`}><HiOutlineLightningBolt /></span>
            {isExpanded && <span className="text-sm">Activities</span>}
          </Link>

          <Link to="/gear" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl">
            <span className={`shrink-0 w-6 h-6 flex items-center justify-center ${isExpanded ? "text-blue-300" : ""} transition-all ease-in-out duration-150`}><PiToolbox /></span>
            {isExpanded && <span className="text-sm">Gear</span>}
          </Link>

          <Link to="/settings" className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl">
            <span className={`shrink-0 w-6 h-6 flex items-center justify-center ${isExpanded ? "text-blue-300" : ""} transition-all ease-in-out duration-150`}><IoSettingsOutline /></span>
            {isExpanded && <span className="text-sm">Settings</span>}
          </Link>
        </nav>

        {/* Footer / Logout Action */}
        <div className="p-2 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors cursor-pointer"
          >
            <span className="shrink-0 w-6 h-6 flex items-center justify-center">
              <HiOutlineLogout size={18} />
            </span>
            {isExpanded && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};