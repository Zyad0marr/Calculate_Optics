import React, { useState } from 'react';
import { Company, LensType, PricingRule, Customer, CalculationResult, PrescriptionInputState, OrderedEye } from '../types';
import { calculateLensPrice, parseDiopter } from '../utils/lensCalculator';
import { PrescriptionInput } from './PrescriptionInput';
import { dbService } from '../services/supabase';
import { RotateCcw, AlertCircle, Sparkles, Building2, Layers, User, Phone, CheckCircle2, BookmarkPlus } from 'lucide-react';

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

  // Customer info for saving order
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Prescription inputs
  const [prescription, setPrescription] = useState<PrescriptionInputState>({
    rightSph: '0.00',
    rightCyl: '0.00',
    leftSph: '0.00',
    leftCyl: '0.00',
  });

  // Calculation result state
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Clear inputs
  const handleReset = () => {
    setPrescription({
      rightSph: '0.00',
      rightCyl: '0.00',
      leftSph: '0.00',
      leftCyl: '0.00',
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

  // Save order to Supabase
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
        rightSph: orderedEye !== 'left' ? parseDiopter(prescription.rightSph) : null,
        rightCyl: orderedEye !== 'left' ? parseDiopter(prescription.rightCyl) : null,
        leftSph: orderedEye !== 'right' ? parseDiopter(prescription.leftSph) : null,
        leftCyl: orderedEye !== 'right' ? parseDiopter(prescription.leftCyl) : null,
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
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl mx-auto flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد بيانات كافية للحساب</h3>
        <p className="text-sm text-slate-500 mb-6">
          يرجى إضافة شركة واحدة ونوع عدسة واحد على الأقل في قسم الإدارة لبدء حساب الأسعار.
        </p>
        <button
          onClick={onNavigateToManagement}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
        >
          الانتقال إلى الإدارة
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Form Card */}
      <form onSubmit={handleCalculate} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
        {/* Header / Intro */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">حاسبة أسعار العدسات</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              تحديد السعر بناءً على الشركة ونوع العدسة والمقاس المطلوب
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="تفريغ الحقول"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>مسح</span>
          </button>
        </div>

        {/* Customer Input (Optional for calculation, used for Order saving) */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
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
                className="text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg px-2 py-1"
              >
                <option value="">اختيار عميل مسجل...</option>
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
              placeholder="اسم العميل (لحفظ الطلب)"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <div className="relative">
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="رقم الهاتف"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums dir-ltr text-right"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Company & Lens Type Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>الشركة</span>
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => {
                setSelectedCompanyId(e.target.value);
                setResult(null);
              }}
              className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer"
            >
              {companies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-400" />
              <span>نوع العدسة</span>
            </label>
            <select
              value={selectedLensTypeId}
              onChange={(e) => {
                setSelectedLensTypeId(e.target.value);
                setResult(null);
              }}
              className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer"
            >
              {lensTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 10. ORDERED EYES (العيون المطلوبة) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            العيون المطلوبة
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setOrderedEye('both');
                setResult(null);
              }}
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all cursor-pointer ${
                orderedEye === 'both'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all cursor-pointer ${
                orderedEye === 'right'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
              className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all cursor-pointer ${
                orderedEye === 'left'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
            className={`border rounded-2xl p-4 transition-all ${
              orderedEye === 'left'
                ? 'bg-slate-100/50 border-slate-200 opacity-60'
                : 'bg-slate-50/80 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                العين اليمنى (OD)
              </span>
              {orderedEye === 'left' && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                  لم يتم طلب العين اليمنى
                </span>
              )}
            </div>

            {orderedEye !== 'left' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PrescriptionInput
                  id="rightSph"
                  label="SPH"
                  sublabel="كروي"
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
                  value={prescription.rightCyl}
                  onChange={(val) => {
                    setPrescription((prev) => ({ ...prev, rightCyl: val }));
                    setResult(null);
                  }}
                />
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-1 text-center font-medium">
                غير مطلوبة لهذا الطلب
              </div>
            )}
          </div>

          {/* Left Eye (العين اليسرى) */}
          <div
            className={`border rounded-2xl p-4 transition-all ${
              orderedEye === 'right'
                ? 'bg-slate-100/50 border-slate-200 opacity-60'
                : 'bg-slate-50/80 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                العين اليسرى (OS)
              </span>
              {orderedEye === 'right' && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                  لم يتم طلب العين اليسرى
                </span>
              )}
            </div>

            {orderedEye !== 'right' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PrescriptionInput
                  id="leftSph"
                  label="SPH"
                  sublabel="كروي"
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
                  value={prescription.leftCyl}
                  onChange={(val) => {
                    setPrescription((prev) => ({ ...prev, leftCyl: val }));
                    setResult(null);
                  }}
                />
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-1 text-center font-medium">
                غير مطلوبة لهذا الطلب
              </div>
            )}
          </div>
        </div>

        {/* Calculate Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-sky-400" />
            <span>احسب السعر</span>
          </button>
        </div>
      </form>

      {/* 7. CALCULATION RESULT */}
      {result && (
        <div
          className={`rounded-2xl p-6 sm:p-7 border transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            result.found
              ? 'bg-slate-900 text-white border-slate-800 shadow-xl'
              : 'bg-white text-slate-800 border-amber-200 shadow-sm'
          }`}
        >
          {result.found ? (
            <div className="text-center space-y-4">
              {/* PRIMARY REQUIREMENT: "السعر: 200 جنيه" */}
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white py-1">
                السعر: {result.price} جنيه
              </div>

              {/* Save Order action */}
              <div className="pt-3 border-t border-slate-800">
                {saveSuccess ? (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>تم حفظ الطلب في سجل العملاء بنجاح!</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {saveError && (
                      <div className="p-2 bg-rose-900/80 border border-rose-700 text-rose-200 text-xs font-semibold rounded-lg">
                        {saveError}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveOrder}
                      disabled={isSaving}
                      className="w-full sm:w-auto px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      <span>{isSaving ? 'جاري الحفظ في Supabase...' : 'حفظ الطلب باسم العميل'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3 py-2">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="text-base font-bold text-slate-900">
                {result.message || 'لا توجد قاعدة تسعير مطابقة لهذا المقاس'}
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onNavigateToManagement}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
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
