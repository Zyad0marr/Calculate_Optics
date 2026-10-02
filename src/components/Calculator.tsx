import React, { useState } from 'react';
import { Company, LensType, PricingRule, Customer, CalculationResult, PrescriptionInputState, OrderedEye } from '../types';
import { calculateLensPrice, parseOptionalDiopter } from '../utils/lensCalculator';
import { PrescriptionInput } from './PrescriptionInput';
import { dbService } from '../services/supabase';
import { RotateCcw, AlertCircle, Sparkles, Building2, Layers, User, Phone, CheckCircle2, BookmarkPlus, Eye } from 'lucide-react';

interface CalculatorProps {
  companies: Company[];
  lensTypes: LensType[];
  pricingRules: PricingRule[];
  customers: Customer[];
  onNavigateToManagement: () => void;
  onOrderSaved?: () => Promise<void>;
}

export const Calculator: React.FC<CalculatorProps> = ({
  companies,
  lensTypes,
  pricingRules,
  customers,
  onNavigateToManagement,
  onOrderSaved,
}) => {
  // Selections
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    companies.length > 0 ? companies[0].id : ''
  );
  const [selectedLensTypeId, setSelectedLensTypeId] = useState<string>(
    lensTypes.length > 0 ? lensTypes[0].id : ''
  );

  // 10. ORDERED EYES
  const [orderedEye, setOrderedEye] = useState<OrderedEye>('both');

  // Customer info for saving order - start truly empty
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Prescription inputs - start truly EMPTY (no 0 or 0.00 pre-filled)
  const [prescription, setPrescription] = useState<PrescriptionInputState>({
    rightSph: '',
    rightCyl: '',
    leftSph: '',
    leftCyl: '',
  });

  // Calculation result state
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Clear inputs to empty state
  const handleReset = () => {
    setPrescription({
      rightSph: '',
      rightCyl: '',
      leftSph: '',
      leftCyl: '',
    });
    setResult(null);
    setSaveSuccess(false);
    setSaveError(null);
  };

  // Perform calculation
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);

    const res = calculateLensPrice(
      selectedCompanyId,
      selectedLensTypeId,
      orderedEye,
      prescription.rightSph,
      prescription.rightCyl,
      prescription.leftSph,
      prescription.leftCyl,
      pricingRules,
      companies,
      lensTypes
    );
    setResult(res);
  };

  // Save order to Supabase (stores null for empty fields, never 0)
  const handleSaveOrder = async () => {
    if (!result || !result.found || result.price === null) return;
    if (!customerName.trim()) {
      setSaveError('يرجى إدخال اسم العميل لحفظ الطلب');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await dbService.createOrder({
        customerId: selectedCustomerId || undefined,
        customerName: customerName.trim(),
        phone: customerPhone.trim() || undefined,
        companyId: selectedCompanyId,
        companyName: result.companyName,
        lensTypeId: selectedLensTypeId,
        lensTypeName: result.lensTypeName,
        orderedEye: orderedEye,
        rightSph: orderedEye !== 'left' ? parseOptionalDiopter(prescription.rightSph) : null,
        rightCyl: orderedEye !== 'left' ? parseOptionalDiopter(prescription.rightCyl) : null,
        leftSph: orderedEye !== 'right' ? parseOptionalDiopter(prescription.leftSph) : null,
        leftCyl: orderedEye !== 'right' ? parseOptionalDiopter(prescription.leftCyl) : null,
        price: result.price,
      });

      setSaveSuccess(true);
      if (onOrderSaved) {
        await onOrderSaved();
      }
    } catch {
      setSaveError('حدث خطأ أثناء حفظ البيانات في قاعدة البيانات');
    } finally {
      setIsSaving(false);
    }
  };

  // Check if no companies or lens types
  if (companies.length === 0 || lensTypes.length === 0) {
    return (
      <div className="glass-surface rounded-3xl p-8 sm:p-10 text-center max-w-lg mx-auto shadow-[0_10px_35px_rgba(20,30,22,0.06)] border border-[#d2dfd5]">
        <div className="w-14 h-14 bg-[#f0f5f1] text-[#3a5240] rounded-2xl mx-auto flex items-center justify-center mb-4 border border-[#c9d9cc] shadow-xs">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-[#152017] mb-2">لا توجد بيانات كافية للحساب</h3>
        <p className="text-sm text-[#5f7564] mb-6 leading-relaxed">
          يرجى إضافة شركة واحدة ونوع عدسة واحد على الأقل في قسم الإدارة لبدء حساب الأسعار.
        </p>
        <button
          onClick={onNavigateToManagement}
          className="px-6 py-3 bg-gradient-to-b from-[#3a503e] to-[#293a2c] hover:from-[#435d48] hover:to-[#2e4232] text-white text-sm font-bold rounded-xl transition-all shadow-md subtle-rim-light cursor-pointer"
        >
          الانتقال إلى الإدارة
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-14">
      {/* Form Card */}
      <form onSubmit={handleCalculate} className="glass-surface rounded-3xl p-5 sm:p-8 shadow-[0_12px_40px_rgba(20,30,22,0.06)] border border-[#d7e3da] space-y-6">
        {/* Header / Intro */}
        <div className="flex items-center justify-between border-b border-[#e1eae3] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#141d16] tracking-tight">حاسبة أسعار العدسات</h2>
            <p className="text-xs sm:text-sm text-[#66806b] mt-0.5">
              تحديد السعر الدقيق بناءً على الشركة والنوع والمقاس المطلوب
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3a503e] hover:text-[#18231b] bg-[#eef4ee] hover:bg-[#e0ece2] border border-[#cad9cc] rounded-xl transition-all cursor-pointer"
            title="تفريغ الحقول"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>مسح الحقول</span>
          </button>
        </div>

        {/* Customer Input (Optional for calculation, used for Order saving) */}
        <div className="p-4 sm:p-5 bg-[#f6f9f6]/80 border border-[#d6e3d8] rounded-2xl space-y-3.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#27382a] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#547058]" />
              <span>بيانات العميل (اختياري)</span>
            </label>
            {customers.length > 0 && (
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  const cId = e.target.value;
                  setSelectedCustomerId(cId);
                  const found = customers.find((c) => c.id === cId);
                  if (found) {
                    setCustomerName(found.name);
                    setCustomerPhone(found.phone || '');
                  }
                }}
                className="text-xs font-semibold text-[#2a3c2e] bg-white border border-[#c6d7c8] rounded-xl px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#3a503e]"
              >
                <option value="">اختيار عميل مسجل مسبقاً...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setSelectedCustomerId('');
              }}
              placeholder="اسم العميل (مثال: محمد أحمد)"
              className="w-full h-11 px-3.5 rounded-xl border border-[#cbd7cc] bg-white text-[#152017] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3a503e]/20 focus:border-[#3a503e] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] placeholder:text-[#8ea592]/70 placeholder:font-normal"
            />
            <div className="relative">
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="رقم الهاتف (مثال: 01012345678)"
                className="w-full h-11 px-3.5 rounded-xl border border-[#cbd7cc] bg-white text-[#152017] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#3a503e]/20 focus:border-[#3a503e] tabular-nums dir-ltr text-right shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] placeholder:text-[#8ea592]/70 placeholder:font-normal"
              />
              <Phone className="w-4 h-4 text-[#8ea592] absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Company & Lens Type Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#1f2d22] mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#5e7c64]" />
              <span>الشركة</span>
            </label>
            <div className="relative">
              <select
                value={selectedCompanyId}
                onChange={(e) => {
                  setSelectedCompanyId(e.target.value);
                  setResult(null);
                }}
                className="w-full h-12 px-4 rounded-xl border border-[#cbd7cd] bg-white text-[#152017] text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#3a503e]/25 focus:border-[#3a503e] transition-all cursor-pointer shadow-xs"
              >
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1f2d22] mb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#5e7c64]" />
              <span>نوع العدسة</span>
            </label>
            <div className="relative">
              <select
                value={selectedLensTypeId}
                onChange={(e) => {
                  setSelectedLensTypeId(e.target.value);
                  setResult(null);
                }}
                className="w-full h-12 px-4 rounded-xl border border-[#cbd7cd] bg-white text-[#152017] text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#3a503e]/25 focus:border-[#3a503e] transition-all cursor-pointer shadow-xs"
              >
                {lensTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 10. ORDERED EYES (العيون المطلوبة) */}
        <div>
          <label className="block text-xs font-bold text-[#2a3c2e] mb-2 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#5e7c64]" />
            <span>العيون المطلوبة</span>
          </label>
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#f0f4f0]/90 border border-[#d2ded4] rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setOrderedEye('both');
                setResult(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                orderedEye === 'both'
                  ? 'bg-gradient-to-b from-[#384e3c] to-[#27382b] text-white shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] border border-[#4d6a52]'
                  : 'text-[#415545] hover:text-[#18231b] hover:bg-white/70 font-semibold'
              }`}
            >
              العينين
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderedEye('right');
                setResult(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                orderedEye === 'right'
                  ? 'bg-gradient-to-b from-[#384e3c] to-[#27382b] text-white shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] border border-[#4d6a52]'
                  : 'text-[#415545] hover:text-[#18231b] hover:bg-white/70 font-semibold'
              }`}
            >
              العين اليمنى فقط
            </button>
            <button
              type="button"
              onClick={() => {
                setOrderedEye('left');
                setResult(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                orderedEye === 'left'
                  ? 'bg-gradient-to-b from-[#384e3c] to-[#27382b] text-white shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] border border-[#4d6a52]'
                  : 'text-[#415545] hover:text-[#18231b] hover:bg-white/70 font-semibold'
              }`}
            >
              العين اليسرى فقط
            </button>
          </div>
        </div>

        {/* Prescription Fields: Right Eye & Left Eye */}
        <div className="space-y-4 pt-1">
          {/* Right Eye (العين اليمنى) */}
          <div
            className={`border rounded-2xl p-4 sm:p-5 transition-all ${
              orderedEye === 'left'
                ? 'bg-[#f0f3f0]/50 border-[#dce3dd] opacity-50'
                : 'bg-[#f8faf8] border-[#d4e1d7] shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
            }`}
          >
            <div className="flex items-center justify-between mb-3 border-b border-[#e2eae4] pb-2.5">
              <span className="text-sm font-bold text-[#19241b] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#415b45] shadow-[0_0_6px_rgba(65,91,69,0.4)]"></span>
                العين اليمنى (OD)
              </span>
              {orderedEye === 'left' && (
                <span className="text-xs font-semibold text-[#738a77] bg-[#e4ece5] px-2.5 py-0.5 rounded-lg">
                  لم يتم طلب العين اليمنى
                </span>
              )}
            </div>

            {orderedEye !== 'left' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <PrescriptionInput
                  id="rightSph"
                  label="SPH"
                  sublabel="كروي"
                  placeholder="مثال: -1.50"
                  value={prescription.rightSph}
                  onChange={(val) => {
                    setPrescription((prev) => ({ ...prev, rightSph: val }));
                    setResult(null);
                  }}
                />
                <PrescriptionInput
                  id="rightCyl"
                  label="CYL"
                  sublabel="أسطواني"
                  placeholder="مثال: -0.50"
                  value={prescription.rightCyl}
                  onChange={(val) => {
                    setPrescription((prev) => ({ ...prev, rightCyl: val }));
                    setResult(null);
                  }}
                />
              </div>
            ) : (
              <div className="text-xs text-[#7d9382] py-2 text-center font-medium">
                غير مطلوبة لهذا الطلب
              </div>
            )}
          </div>

          {/* Left Eye (العين اليسرى) */}
          <div
            className={`border rounded-2xl p-4 sm:p-5 transition-all ${
              orderedEye === 'right'
                ? 'bg-[#f0f3f0]/50 border-[#dce3dd] opacity-50'
                : 'bg-[#f8faf8] border-[#d4e1d7] shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
            }`}
          >
            <div className="flex items-center justify-between mb-3 border-b border-[#e2eae4] pb-2.5">
              <span className="text-sm font-bold text-[#19241b] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#527457] shadow-[0_0_6px_rgba(82,116,87,0.4)]"></span>
                العين اليسرى (OS)
              </span>
              {orderedEye === 'right' && (
                <span className="text-xs font-semibold text-[#738a77] bg-[#e4ece5] px-2.5 py-0.5 rounded-lg">
                  لم يتم طلب العين اليسرى
                </span>
              )}
            </div>

            {orderedEye !== 'right' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <PrescriptionInput
                  id="leftSph"
                  label="SPH"
                  sublabel="كروي"
                  placeholder="مثال: -1.50"
                  value={prescription.leftSph}
                  onChange={(val) => {
                    setPrescription((prev) => ({ ...prev, leftSph: val }));
                    setResult(null);
                  }}
                />
                <PrescriptionInput
                  id="leftCyl"
                  label="CYL"
                  sublabel="أسطواني"
                  placeholder="مثال: -0.50"
                  value={prescription.leftCyl}
                  onChange={(val) => {
                    setPrescription((prev) => ({ ...prev, leftCyl: val }));
                    setResult(null);
                  }}
                />
              </div>
            ) : (
              <div className="text-xs text-[#7d9382] py-2 text-center font-medium">
                غير مطلوبة لهذا الطلب
              </div>
            )}
          </div>
        </div>

        {/* Calculate Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full h-14 bg-gradient-to-b from-[#384e3c] via-[#2f4233] to-[#233327] hover:from-[#415a45] hover:to-[#2a3c2e] text-white font-bold text-lg rounded-2xl shadow-[0_8px_24px_rgba(20,30,22,0.28),inset_0_1px_0_rgba(255,255,255,0.22)] border-t border-[#5e8264]/40 focus:outline-none focus:ring-2 focus:ring-[#384e3c] focus:ring-offset-2 transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer lens-specular"
          >
            <Sparkles className="w-5 h-5 text-[#b9dfbe]" />
            <span>احسب السعر</span>
          </button>
        </div>
      </form>

      {/* 7. CALCULATION RESULT */}
      {result && (
        <div
          className={`rounded-3xl p-6 sm:p-8 transition-all animate-in fade-in slide-in-from-bottom-3 duration-250 ${
            result.found
              ? 'glass-surface-dark bg-gradient-to-b from-[#19241c] via-[#131c15] to-[#0c120e] text-white border border-[#3b5140] shadow-[0_16px_45px_rgba(10,15,11,0.45)] lens-specular'
              : 'glass-surface bg-white text-[#19241b] border border-amber-300/80 shadow-md'
          }`}
        >
          {result.found ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#273a2c]/80 border border-[#3d5943]/60 text-xs font-semibold text-[#a8c9ae] tracking-wider uppercase mb-1">
                <span>نتيجة التسعير المعتمدة</span>
              </div>

              {/* PRIMARY REQUIREMENT: "السعر: 200 جنيه" */}
              <div className="text-3xl sm:text-5xl font-black tracking-tight text-white py-1">
                السعر: {result.price} جنيه
              </div>

              {/* Save Order action */}
              <div className="pt-4 border-t border-[#2d3f31]/80 max-w-md mx-auto">
                {saveSuccess ? (
                  <div className="p-3.5 bg-[#1b3021]/80 border border-[#305439] text-[#a5e0b0] text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-inner">
                    <CheckCircle2 className="w-5 h-5 text-[#63c474]" />
                    <span>تم حفظ الطلب في سجل العملاء بنجاح!</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {saveError && (
                      <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold rounded-xl">
                        {saveError}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveOrder}
                      disabled={isSaving}
                      className="w-full sm:w-auto px-7 py-3 bg-gradient-to-b from-[#46654b] to-[#344d39] hover:from-[#507356] hover:to-[#3b5741] text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto disabled:opacity-50 shadow-[0_4px_14px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] border border-[#5d8363]/50"
                    >
                      <BookmarkPlus className="w-4 h-4 text-[#b9dfbe]" />
                      <span>{isSaving ? 'جاري الحفظ في Supabase...' : 'حفظ الطلب باسم العميل'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3 py-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 mx-auto flex items-center justify-center shadow-xs">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-base font-bold text-[#141d16]">
                {result.message || 'لا توجد قاعدة تسعير مطابقة لهذا المقاس'}
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onNavigateToManagement}
                  className="px-5 py-2.5 bg-gradient-to-b from-[#384e3c] to-[#27382b] hover:from-[#415a45] hover:to-[#2e4233] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  إضافة قاعدة تسعير الآن
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
