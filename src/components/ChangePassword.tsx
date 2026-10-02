import React, { useState } from 'react';
import { KeyRound, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '../services/auth';

export const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword.trim()) {
      setError('يرجى إدخال كلمة المرور الحالية');
      return;
    }

    if (!newPassword.trim()) {
      setError('كلمة المرور الجديدة لا يمكن أن تكون فارغة');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.changePassword(currentPassword, newPassword, confirmPassword);
      if (res.success) {
        setSuccess(res.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء الاتصال بقاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-16">
      <div className="glass-surface rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(20,30,22,0.06)] border border-[#d6e2d8]">
        {/* Header */}
        <div className="border-b border-[#e1ece3] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-[#384e3c] to-[#243327] text-emerald-200 border border-[#4d6a52] shadow-xs">
              <KeyRound className="w-5 h-5 text-[#b9dfbe]" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-[#141d16] tracking-tight">تغيير كلمة المرور</h2>
              <p className="text-xs text-[#617b66] mt-0.5">
                تحديث كلمة مرور الحساب والتحقق منها وحفظها بشكل آمن ومشفّر في قاعدة البيانات
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 bg-[#1b3021]/80 border border-[#305439] text-[#a5e0b0] text-xs font-semibold rounded-2xl flex items-center gap-2 shadow-inner">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#63c474]" />
            <span>{success}</span>
          </div>
        )}

        {/* Change Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4.5" noValidate>
          {/* Field 1: Current Password */}
          <div>
            <label className="block text-xs font-bold text-[#2a3d2e] mb-1.5 text-right">
              كلمة المرور الحالية
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الحالية"
                className="w-full h-12 pr-11 pl-11 rounded-xl border border-[#cbd8cd] bg-white text-[#152017] text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#384e3c]/20 focus:border-[#384e3c] transition-all placeholder:text-[#8ea592]/60 placeholder:font-normal text-right"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#748f78]">
                <Lock className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#748f78] hover:text-[#2c3d2e] focus:outline-none min-w-[40px] justify-center cursor-pointer"
                aria-label={showCurrent ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Field 2: New Password */}
          <div>
            <label className="block text-xs font-bold text-[#2a3d2e] mb-1.5 text-right">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة"
                className="w-full h-12 pr-11 pl-11 rounded-xl border border-[#cbd8cd] bg-white text-[#152017] text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#384e3c]/20 focus:border-[#384e3c] transition-all placeholder:text-[#8ea592]/60 placeholder:font-normal text-right"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#748f78]">
                <KeyRound className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#748f78] hover:text-[#2c3d2e] focus:outline-none min-w-[40px] justify-center cursor-pointer"
                aria-label={showNew ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Field 3: Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-[#2a3d2e] mb-1.5 text-right">
              تأكيد كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد إدخال كلمة المرور الجديدة"
                className="w-full h-12 pr-11 pl-11 rounded-xl border border-[#cbd8cd] bg-white text-[#152017] text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#384e3c]/20 focus:border-[#384e3c] transition-all placeholder:text-[#8ea592]/60 placeholder:font-normal text-right"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#748f78]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#748f78] hover:text-[#2c3d2e] focus:outline-none min-w-[40px] justify-center cursor-pointer"
                aria-label={showConfirm ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 bg-gradient-to-b from-[#384e3c] via-[#2f4233] to-[#233327] hover:from-[#415a45] hover:to-[#2a3c2e] disabled:opacity-50 text-white font-bold text-base rounded-2xl shadow-[0_4px_16px_rgba(20,30,22,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] border-t border-[#5e8264]/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] lens-specular"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري التحقق والتحديث...</span>
                </span>
              ) : (
                'تغيير كلمة المرور'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
