import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Glasses } from 'lucide-react';
import { authService } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.login(username, password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c130e] via-[#131c15] to-[#090e0a] flex flex-col justify-center items-center px-4 py-8 select-none relative overflow-hidden">
      {/* Subtle ambient lens reflection light */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#2d4232]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#1f3023]/25 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#162119]/90 backdrop-blur-xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.55)] p-7 sm:p-9 border border-[#344b39] relative z-10 lens-specular">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#384e3c] to-[#223025] text-emerald-200 mb-3.5 border border-[#527056]/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_rgba(0,0,0,0.4)]">
            <Glasses className="w-9 h-9 stroke-[1.8] text-[#b3d7b8]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">نور للبصريات</h1>
          <p className="text-xs text-[#8da592] mt-1 font-medium tracking-wide">NOUR OPTICS · ATELIER MANAGEMENT</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-950/70 border border-rose-800/80 rounded-xl text-rose-200 text-sm font-medium text-center shadow-inner">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-xs font-semibold text-[#a6bea9] mb-1.5 text-right">
              اسم المستخدم
            </label>
            <div className="relative">
              <input
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full h-12 pr-11 pl-4 rounded-xl border border-[#2e4032] bg-[#0f1711] text-white text-base focus:outline-none focus:ring-2 focus:ring-[#527357]/30 focus:border-[#527357] transition-all placeholder:text-[#5f7564] text-right shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#6e8a73]">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a6bea9] mb-1.5 text-right">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full h-12 pr-11 pl-11 rounded-xl border border-[#2e4032] bg-[#0f1711] text-white text-base focus:outline-none focus:ring-2 focus:ring-[#527357]/30 focus:border-[#527357] transition-all placeholder:text-[#5f7564] text-right shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#6e8a73]">
                <Lock className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6e8a73] hover:text-[#9fc1a4] focus:outline-none min-w-[44px] justify-center cursor-pointer transition-colors"
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-2 bg-gradient-to-b from-[#3a523e] via-[#2f4233] to-[#233327] hover:from-[#435e47] hover:to-[#2a3c2e] text-white font-bold rounded-xl text-base shadow-[0_4px_16px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.22)] border-t border-[#608565]/40 focus:outline-none focus:ring-2 focus:ring-[#3a523e] transition-all disabled:opacity-50 active:scale-[0.99] flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>جاري الدخول...</span>
              </span>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#708b75] border-t border-[#253629] pt-4 tracking-wide">
          نظام محمي خاص · نور للبصريات
        </div>
      </div>
    </div>
  );
};
