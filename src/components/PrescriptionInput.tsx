import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { parseOptionalDiopter, formatDiopter } from '../utils/lensCalculator';

interface PrescriptionInputProps {
  label: string;
  sublabel: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  id: string;
}

export const PrescriptionInput: React.FC<PrescriptionInputProps> = ({
  label,
  sublabel,
  placeholder,
  value,
  onChange,
  id,
}) => {
  const currentNum = parseOptionalDiopter(value);

  // Stepper by 0.25 - starts at +/-0.25 if field was completely empty
  const handleStep = (step: number) => {
    const base = currentNum !== null ? currentNum : 0;
    const nextVal = Math.round((base + step) * 100) / 100;
    onChange(formatDiopter(nextVal));
  };

  // Toggle sign between + and -
  const handleToggleSign = () => {
    if (currentNum === null) {
      // If currently empty, start with negative sign indicator
      onChange('-');
      return;
    }
    if (currentNum === 0) {
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

  const isNegative = value.startsWith('-') || (currentNum !== null && currentNum < 0);

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-[#d6e0d8] rounded-2xl p-3.5 sm:p-4 shadow-[0_2px_12px_rgba(25,35,28,0.04)] hover:border-[#b8ccbc] transition-all">
      <div className="flex items-center justify-between mb-2.5">
        <label htmlFor={id} className="text-sm font-bold text-[#1a251c] flex items-center gap-1.5 cursor-pointer">
          <span className="tracking-tight">{label}</span>
          <span className="text-xs font-normal text-[#6c8571]">({sublabel})</span>
        </label>
        {currentNum !== null && Math.abs(currentNum) > 0 && (
          <span className="text-[11px] font-semibold text-[#3a503e] bg-[#eef4ee] border border-[#d3e2d6] px-2.5 py-0.5 rounded-lg tabular-nums">
            ABS: {Math.abs(currentNum).toFixed(2)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Toggle sign button (+ / -) */}
        <button
          type="button"
          onClick={handleToggleSign}
          className={`h-11 w-11 shrink-0 rounded-xl font-bold text-base flex items-center justify-center transition-all cursor-pointer border active:scale-95 ${
            isNegative
              ? 'bg-[#f2f6f2] text-[#2c3d2e] border-[#bccdbc] hover:bg-[#e4ebe4]'
              : 'bg-gradient-to-b from-[#3a503e] to-[#28382b] text-white border-[#4d6a52] hover:from-[#445d49] hover:to-[#304334] shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.15)]'
          }`}
          title="تبديل الإشارة (+ / -)"
          aria-label="تبديل الإشارة"
        >
          {isNegative ? '-' : '+'}
        </button>

        {/* Direct Text Input with subtle, light placeholder that disappears immediately upon typing */}
        <div className="relative flex-1">
          <input
            id={id}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || (label === 'SPH' ? 'مثال: -1.50' : 'مثال: -0.50')}
            className="w-full h-11 px-3 text-center text-lg font-bold text-[#141d16] bg-[#f7f9f7] border border-[#cad7cc] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3a503e]/25 focus:border-[#3a503e] focus:bg-white transition-all tabular-nums dir-ltr shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] placeholder:text-[#8ea592]/60 placeholder:font-normal placeholder:text-sm"
          />
        </div>

        {/* Stepper buttons -0.25 and +0.25 */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleStep(-0.25)}
            className="h-11 w-10 shrink-0 rounded-xl bg-[#eef4ee] hover:bg-[#e1eae2] text-[#293b2d] font-bold flex items-center justify-center transition-all cursor-pointer border border-[#c9d8cc] active:scale-95"
            title="تقليل 0.25"
            aria-label="تقليل 0.25"
          >
            <Minus className="w-4 h-4 stroke-[2.2]" />
          </button>
          <button
            type="button"
            onClick={() => handleStep(0.25)}
            className="h-11 w-10 shrink-0 rounded-xl bg-[#eef4ee] hover:bg-[#e1eae2] text-[#293b2d] font-bold flex items-center justify-center transition-all cursor-pointer border border-[#c9d8cc] active:scale-95"
            title="زيادة 0.25"
            aria-label="زيادة 0.25"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </div>
  );
};
