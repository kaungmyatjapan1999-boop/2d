import React from 'react';
import { ActiveTab } from '../types';
import {
  Home,
  BarChart3,
  Target,
  Dices,
  TrendingUp,
  CloudDownload,
  BookOpen,
  PlusCircle,
  Grid,
  Settings,
  Github,
} from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  recordCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  recordCount,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4 md:w-5 md:h-5" /> },
    { id: 'analysis', label: 'Analysis', icon: <BarChart3 className="w-4 h-4 md:w-5 md:h-5" /> },
    { id: 'probabilities', label: 'Probabilities', icon: <Target className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" /> },
    { id: 'lucky', label: 'Lucky Gen', icon: <Dices className="w-4 h-4 md:w-5 md:h-5 text-amber-500" /> },
    { id: 'trends', label: '4W Trends', icon: <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-rose-500" /> },
    { id: 'matrix', label: '100 Matrix', icon: <Grid className="w-4 h-4 md:w-5 md:h-5" /> },
    { id: 'autofetch', label: 'Auto Fetch', icon: <CloudDownload className="w-4 h-4 md:w-5 md:h-5" /> },
    {
      id: 'history',
      label: 'History',
      icon: <BookOpen className="w-4 h-4 md:w-5 md:h-5" />,
      badge: recordCount > 0 ? String(recordCount) : undefined,
    },
    { id: 'entry', label: 'Data Entry', icon: <PlusCircle className="w-4 h-4 md:w-5 md:h-5" /> },
    { id: 'github', label: 'GitHub CI', icon: <Github className="w-4 h-4 md:w-5 md:h-5 text-slate-700" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4 md:w-5 md:h-5" /> },
  ];

  return (
    <>
      {/* Desktop / Tablet Navigation */}
      <nav className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-11 gap-2 my-4">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1.5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs ${
                isActive
                  ? 'bg-gradient-to-tr from-[#1685ff] to-[#7438ef] text-white border-transparent shadow-md scale-[1.02]'
                  : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="mb-1">{item.icon}</span>
              <span className="text-[11px] font-bold tracking-tight truncate w-full text-center">
                {item.label}
              </span>
              {item.badge && !isActive && (
                <span className="absolute top-1 right-1 text-[8px] bg-indigo-100 text-indigo-700 font-bold px-1 py-0.2 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Floating Bottom Nav for Mobile */}
      <div className="fixed md:hidden bottom-0 left-0 right-0 z-50 bg-[#161743]/90 backdrop-blur-lg border-t border-white/10 px-1 py-1.5 flex justify-around items-center shadow-[0_-8px_25px_rgba(0,0,0,0.3)]">
        {navItems.slice(0, 5).map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition cursor-pointer ${
                isActive
                  ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-[9px] mt-0.5 truncate max-w-[50px]">{item.label}</span>
            </button>
          );
        })}
        {/* Overflow for Entry & Settings on mobile */}
        <button
          onClick={() => onTabChange(activeTab === 'entry' ? 'settings' : 'entry')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition cursor-pointer ${
            activeTab === 'entry' || activeTab === 'settings'
              ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          {activeTab === 'settings' ? (
            <Settings className="w-4 h-4" />
          ) : (
            <PlusCircle className="w-4 h-4" />
          )}
          <span className="text-[9px] mt-0.5">
            {activeTab === 'settings' ? 'Settings' : 'More'}
          </span>
        </button>
      </div>
    </>
  );
};
