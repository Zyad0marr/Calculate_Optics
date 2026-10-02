import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { parseDiopter, formatDiopter } from '../utils/lensCalculator';

interface PrescriptionInputProps {
  label: string;
  sublabel: string;
  value: string;
  onChange: (val: string) => void;
  id: string;
}

export const PrescriptionInput: React.FC<PrescriptionInputProps> = ({
  label,
  sublabel,
  value,
  onChange,
  id,
}) => {
  const currentNum = parseDiopter(value);

  // Stepper by 0.25
  const handleStep = (step: number) => {
    const nextVal = Math.round((currentNum + step) * 100) / 100;
    onChange(formatDiopter(nextVal));
  };

  // Toggle sign between + and -
  const handleToggleSign = () => {
    if (currentNum === 0) {
      // Toggle string representation if 0
      if (value.startsWith('-')) {
        onChange('+0.00');
      } else {
        onChange('-0.00');
      }
      return;
    }
    const inverted = -currentNum;
    onChange(formatDiopter(inverted));
  };

  // Preset quick selections for standard optical values
  const isNegative = value.startsWith('-') || currentNum < 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <span>{label}</span>
          <span className="text-xs font-normal text-slate-500">({sublabel})</span>
        </label>
        {Math.abs(currentNum) > 0 && (
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md tabular-nums">
            القيمة المطلقة: {Math.abs(currentNum).toFixed(2)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Toggle sign button (+ / -) */}
        <button
          type="button"
          onClick={handleToggleSign}
          className={`h-11 w-11 shrink-0 rounded-lg font-bold text-base flex items-center justify-center transition-colors cursor-pointer border ${
            isNegative
              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
          }`}
          title="تبديل الإشارة (+ / -)"
          aria-label="تبديل الإشارة"
        >
          {isNegative ? '-' : '+'}
        </button>

        {/* Direct Text Input */}
        <div className="relative flex-1">
          <input
            id={id}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0.00"
            className="w-full h-11 px-3 text-center text-lg font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all tabular-nums dir-ltr"
          />
        </div>

        {/* Stepper buttons -0.25 and +0.25 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleStep(-0.25)}
            className="h-11 w-10 shrink-0 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer border border-slate-200 active:scale-95"
            title="تقليل 0.25"
            aria-label="تقليل 0.25"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleStep(0.25)}
            className="h-11 w-10 shrink-0 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors cursor-pointer border border-slate-200 active:scale-95"
            title="زيادة 0.25"
            aria-label="زيادة 0.25"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
