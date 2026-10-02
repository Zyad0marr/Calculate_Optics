import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'تأكيد الحذف',
  message,
  confirmLabel = 'نعم، حذف',
  cancelLabel = 'إلغاء',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0d150f]/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="glass-surface bg-white/95 rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-[0_20px_50px_rgba(15,22,17,0.35)] border border-[#d2ded4] space-y-4 text-center select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 bg-rose-50 text-rose-700 rounded-2xl mx-auto flex items-center justify-center border border-rose-200/80 shadow-xs">
          <AlertTriangle className="w-6 h-6 stroke-[2]" />
        </div>

        <div>
          <h4 className="text-lg font-bold text-[#141d16] mb-1">{title}</h4>
          <p className="text-sm font-medium text-[#57705c] leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 text-sm font-semibold text-[#304434] bg-[#eef4ee] hover:bg-[#e0ece2] border border-[#c9d8cc] rounded-xl transition-all cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-11 text-sm font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-sm transition-all cursor-pointer active:scale-98"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
