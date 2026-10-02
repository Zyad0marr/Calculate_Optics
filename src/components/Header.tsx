import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Glasses, Calculator, Building2, Layers, DollarSign, LogOut, UserCheck } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'حاسبة الأسعار', icon: Calculator },
    { path: '/customers', label: 'العملاء والطلبات', icon: UserCheck },
    { path: '/companies', label: 'الشركات', icon: Building2 },
    { path: '/lens-types', label: 'أنواع العدسات', icon: Layers },
    { path: '/pricing', label: 'قواعد التسعير', icon: DollarSign },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Zone 1: Wordmark */}
            <div 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Glasses className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">نور للبصريات</span>
            </div>

            {/* Zone 2: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Actions */}
            <div className="flex items-center">
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Navigation Bar */}
        <div className="lg:hidden border-t border-slate-100 bg-slate-50/90 px-2 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex-1 min-w-[72px] py-2 px-1.5 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 font-medium'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] sm:text-[11px] whitespace-nowrap leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>
    </>
  );
};
