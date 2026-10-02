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
      <header className="sticky top-0 z-30 bg-[#121914]/95 backdrop-blur-md border-b border-[#253528] shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Zone 1: Wordmark */}
            <div 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#384c3c] to-[#212e24] border border-[#506b54]/50 text-emerald-300 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_12px_rgba(0,0,0,0.35)] group-hover:border-[#678b6c]/70 transition-all">
                <Glasses className="w-5 h-5 stroke-[2] text-[#b4d2b9]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight leading-snug">نور للبصريات</span>
                <span className="text-[10px] text-[#8ea893] font-medium tracking-wide">NOUR OPTICS · ATELIER</span>
              </div>
            </div>

            {/* Zone 2: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center bg-[#1a251c]/90 p-1.5 rounded-2xl border border-[#2d3f30]/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-b from-[#3a503e] to-[#293a2c] text-white border border-[#526f56]/60 shadow-[0_2px_8px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]'
                        : 'text-[#96ab9a] hover:text-white hover:bg-[#233326]/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#b7d9bd]' : 'text-[#7e9482]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Actions */}
            <div className="flex items-center">
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#a3b8a6] hover:text-rose-300 hover:bg-rose-950/40 rounded-xl border border-transparent hover:border-rose-900/40 transition-all cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4 text-[#8ea592]" />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Navigation Bar */}
        <div className="lg:hidden border-t border-[#233326] bg-[#141c16]/95 backdrop-blur-md px-2.5 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex-1 min-w-[76px] py-2 px-1.5 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-b from-[#384e3c] to-[#27372a] text-white font-bold border border-[#4e6a52]/70 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]'
                    : 'text-[#8ba290] hover:text-white bg-[#19231b]/70 border border-[#27372b]/60 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#b3d6b9]' : 'text-[#778d7c]'}`} />
                <span className="text-[10px] sm:text-[11px] whitespace-nowrap leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>
    </>
  );
};
