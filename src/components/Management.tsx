import React, { useState } from 'react';
import { Company, LensType, PricingRule, AppData, AppSection } from '../types';
import { dbService } from '../services/supabase';
import { formatRange } from '../utils/lensCalculator';
import { ConfirmModal } from './ConfirmModal';
import { Building2, Layers, DollarSign, Plus, Trash2, Loader2 } from 'lucide-react';

interface ManagementProps {
  data: AppData;
  onDataChange: (updatedData: AppData) => void;
  onDataRefresh: () => Promise<void>;
  activeSection: AppSection;
  setActiveSection: (sec: AppSection) => void;
}

export const Management: React.FC<ManagementProps> = ({
  data,
  onDataChange,
  onDataRefresh,
  activeSection,
}) => {
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
  });

  const [loadingAction, setLoadingAction] = useState<boolean>(false);

  // Company form
  const [newCompanyName, setNewCompanyName] = useState('');
  const [companyError, setCompanyError] = useState<string | null>(null);

  // Lens type form
  const [newLensTypeName, setNewLensTypeName] = useState('');
  const [lensTypeError, setLensTypeError] = useState<string | null>(null);

  // Pricing rules filters
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    data.companies.length > 0 ? data.companies[0].id : ''
  );
  const [selectedLensTypeId, setSelectedLensTypeId] = useState<string>(
    data.lensTypes.length > 0 ? data.lensTypes[0].id : ''
  );

  // Pricing rule form (ONLY Range & Price)
  const [minRange, setMinRange] = useState('');
  const [maxRange, setMaxRange] = useState('');
  const [price, setPrice] = useState('');
  const [ruleError, setRuleError] = useState<string | null>(null);
  const [isAddingRule, setIsAddingRule] = useState(false);

  // -------------------------------------------------------------
  // 6. COMPANIES HANDLERS
  // -------------------------------------------------------------
  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyError(null);
    const trimmed = newCompanyName.trim();
    if (!trimmed) return;

    setLoadingAction(true);
    try {
      const added = await dbService.addCompany(trimmed);
      const updated = {
        ...data,
        companies: [...data.companies, added],
      };
      onDataChange(updated);
      setNewCompanyName('');
      if (!selectedCompanyId) {
        setSelectedCompanyId(added.id);
      }
      await onDataRefresh();
    } catch {
      setCompanyError('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoadingAction(false);
    }
  };

  const promptDeleteCompany = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف شركة',
      message: 'هل أنت متأكد من حذف هذه الشركة؟',
      onConfirm: async () => {
        setLoadingAction(true);
        try {
          await dbService.deleteCompany(id);
          const updated = {
            ...data,
            companies: data.companies.filter((c) => c.id !== id),
            pricingRules: data.pricingRules.filter((r) => (r.company_id || r.companyId) !== id),
          };
          onDataChange(updated);
          if (selectedCompanyId === id && updated.companies.length > 0) {
            setSelectedCompanyId(updated.companies[0].id);
          }
          await onDataRefresh();
        } catch {
          alert('حدث خطأ أثناء حذف الشركة');
        } finally {
          setLoadingAction(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // -------------------------------------------------------------
  // 7. LENS TYPES HANDLERS
  // -------------------------------------------------------------
  const handleAddLensType = async (e: React.FormEvent) => {
    e.preventDefault();
    setLensTypeError(null);
    const trimmed = newLensTypeName.trim();
    if (!trimmed) return;

    setLoadingAction(true);
    try {
      const added = await dbService.addLensType(trimmed);
      const updated = {
        ...data,
        lensTypes: [...data.lensTypes, added],
      };
      onDataChange(updated);
      setNewLensTypeName('');
      if (!selectedLensTypeId) {
        setSelectedLensTypeId(added.id);
      }
      await onDataRefresh();
    } catch {
      setLensTypeError('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoadingAction(false);
    }
  };

  const promptDeleteLensType = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف نوع العدسة',
      message: 'هل أنت متأكد من حذف نوع العدسة؟',
      onConfirm: async () => {
        setLoadingAction(true);
        try {
          await dbService.deleteLensType(id);
          const updated = {
            ...data,
            lensTypes: data.lensTypes.filter((lt) => lt.id !== id),
            pricingRules: data.pricingRules.filter((r) => (r.lens_type_id || r.lensTypeId) !== id),
          };
          onDataChange(updated);
          if (selectedLensTypeId === id && updated.lensTypes.length > 0) {
            setSelectedLensTypeId(updated.lensTypes[0].id);
          }
          await onDataRefresh();
        } catch {
          alert('حدث خطأ أثناء حذف نوع العدسة');
        } finally {
          setLoadingAction(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // -------------------------------------------------------------
  // 8. PRICING RULES HANDLERS (ONLY Range & Price)
  // -------------------------------------------------------------
  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setRuleError(null);

    if (!selectedCompanyId || !selectedLensTypeId) {
      setRuleError('يرجى اختيار الشركة ونوع العدسة أولاً');
      return;
    }

    const min = parseFloat(minRange);
    const max = parseFloat(maxRange);
    const p = parseFloat(price);

    if (isNaN(min) || isNaN(max)) {
      setRuleError('يرجى إدخال قيم صحيحة للنطاق (من - إلى)');
      return;
    }

    if (min < 0 || max < 0) {
      setRuleError('قيم النطاق يجب أن تكون أرقام موجبة أو صفر');
      return;
    }

    if (min > max) {
      setRuleError('بداية النطاق يجب أن تكون أصغر من أو تساوي نهايته');
      return;
    }

    if (isNaN(p) || p < 0) {
      setRuleError('يرجى إدخال سعر صحيح');
      return;
    }

    setLoadingAction(true);
    try {
      const added = await dbService.addPricingRule(
        selectedCompanyId,
        selectedLensTypeId,
        min,
        max,
        p
      );
      const updated = {
        ...data,
        pricingRules: [...data.pricingRules, added],
      };
      onDataChange(updated);
      setMinRange('');
      setMaxRange('');
      setPrice('');
      setIsAddingRule(false);
      await onDataRefresh();
    } catch {
      setRuleError('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoadingAction(false);
    }
  };

  const promptDeleteRule = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف قاعدة التسعير',
      message: 'هل أنت متأكد من الحذف؟',
      onConfirm: async () => {
        setLoadingAction(true);
        try {
          await dbService.deletePricingRule(id);
          const updated = {
            ...data,
            pricingRules: data.pricingRules.filter((r) => r.id !== id),
          };
          onDataChange(updated);
          await onDataRefresh();
        } catch {
          alert('حدث خطأ أثناء حذف قاعدة التسعير');
        } finally {
          setLoadingAction(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const currentRules = data.pricingRules
    .filter((r) => {
      const cId = r.company_id || r.companyId;
      const ltId = r.lens_type_id || r.lensTypeId;
      return cId === selectedCompanyId && ltId === selectedLensTypeId;
    })
    .sort((a, b) => {
      const aMin = a.min_range !== undefined ? a.min_range : a.minRange;
      const bMin = b.min_range !== undefined ? b.min_range : b.minRange;
      return aMin - bMin;
    });

  const selectedCompany = data.companies.find((c) => c.id === selectedCompanyId);
  const selectedLensType = data.lensTypes.find((lt) => lt.id === selectedLensTypeId);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* ------------------------------------------------------------- */}
      {/* SECTION: COMPANIES (الشركات) */}
      {/* ------------------------------------------------------------- */}
      {activeSection === 'companies' && (
        <div className="glass-surface rounded-3xl p-5 sm:p-8 shadow-[0_10px_35px_rgba(20,30,22,0.05)] border border-[#d6e2d8] space-y-6">
          <div className="border-b border-[#e1ece3] pb-4">
            <h3 className="text-xl font-bold text-[#141d16] flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#eef4ee] text-[#384e3c] border border-[#cad9cc]">
                <Building2 className="w-5 h-5" />
              </span>
              <span>الشركات</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#617b66] mt-1">
              إضافة وإدارة وحذف شركات العدسات المعتمدة (مثل ZEISS, Essilor, HOYA)
            </p>
          </div>

          {/* Add Company Form */}
          <form onSubmit={handleAddCompany} className="space-y-3">
            {companyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
                {companyError}
              </div>
            )}
            <div className="flex gap-2.5">
              <input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="اسم الشركة (مثال: ZEISS أو Essilor)"
                className="flex-1 h-12 px-4 rounded-xl border border-[#cbd8cd] bg-white text-[#141d16] text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#384e3c]/20 focus:border-[#384e3c] placeholder:text-[#8ea592]/60 placeholder:font-normal"
                required
              />
              <button
                type="submit"
                disabled={loadingAction}
                className="px-5 h-12 bg-gradient-to-b from-[#384e3c] to-[#27382b] hover:from-[#415a45] hover:to-[#2e4233] disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-[0.98] transition-transform shadow-sm subtle-rim-light"
              >
                {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>إضافة شركة</span>
              </button>
            </div>
          </form>

          {/* Companies List */}
          <div className="border border-[#d6e2d8] rounded-2xl divide-y divide-[#e3ece5] overflow-hidden bg-white/70">
            {data.companies.length === 0 ? (
              <div className="p-8 text-center text-[#7e9683] text-sm">
                لا توجد شركات مضافة حالياً. اكتب اسم الشركة واضغط على &quot;إضافة شركة&quot;.
              </div>
            ) : (
              data.companies.map((comp) => {
                const rulesCount = data.pricingRules.filter((r) => (r.company_id || r.companyId) === comp.id).length;
                return (
                  <div
                    key={comp.id}
                    className="p-4 flex items-center justify-between hover:bg-[#f6f9f6] transition-colors"
                  >
                    <div>
                      <span className="font-bold text-[#152017] text-base">{comp.name}</span>
                      <span className="text-xs text-[#5e7964] mr-3 bg-[#edf4ee] px-2.5 py-0.5 rounded-lg border border-[#d2ded4]">
                        {rulesCount} قاعدة تسعير
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => promptDeleteCompany(comp.id)}
                      className="p-2 text-[#7f9984] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                      title="حذف الشركة"
                      aria-label={`حذف ${comp.name}`}
                    >
                      <Trash2 className="w-5 h-5 stroke-[1.8]" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION: LENS TYPES (أنواع العدسات) */}
      {/* ------------------------------------------------------------- */}
      {activeSection === 'lensTypes' && (
        <div className="glass-surface rounded-3xl p-5 sm:p-8 shadow-[0_10px_35px_rgba(20,30,22,0.05)] border border-[#d6e2d8] space-y-6">
          <div className="border-b border-[#e1ece3] pb-4">
            <h3 className="text-xl font-bold text-[#141d16] flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#eef4ee] text-[#384e3c] border border-[#cad9cc]">
                <Layers className="w-5 h-5" />
              </span>
              <span>أنواع العدسات</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#617b66] mt-1">
              إضافة وإدارة وحذف أنواع العدسات (مثل Single Vision, Blue Cut, Photochromic)
            </p>
          </div>

          {/* Add Lens Type Form */}
          <form onSubmit={handleAddLensType} className="space-y-3">
            {lensTypeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
                {lensTypeError}
              </div>
            )}
            <div className="flex gap-2.5">
              <input
                type="text"
                value={newLensTypeName}
                onChange={(e) => setNewLensTypeName(e.target.value)}
                placeholder="نوع العدسة (مثال: Blue Cut أو Photochromic)"
                className="flex-1 h-12 px-4 rounded-xl border border-[#cbd8cd] bg-white text-[#141d16] text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#384e3c]/20 focus:border-[#384e3c] placeholder:text-[#8ea592]/60 placeholder:font-normal"
                required
              />
              <button
                type="submit"
                disabled={loadingAction}
                className="px-5 h-12 bg-gradient-to-b from-[#384e3c] to-[#27382b] hover:from-[#415a45] hover:to-[#2e4233] disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-[0.98] transition-transform shadow-sm subtle-rim-light"
              >
                {loadingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>إضافة نوع</span>
              </button>
            </div>
          </form>

          {/* Lens Types List */}
          <div className="border border-[#d6e2d8] rounded-2xl divide-y divide-[#e3ece5] overflow-hidden bg-white/70">
            {data.lensTypes.length === 0 ? (
              <div className="p-8 text-center text-[#7e9683] text-sm">
                لا توجد أنواع عدسات مضافة حالياً. اكتب اسم النوع واضغط على &quot;إضافة نوع&quot;.
              </div>
            ) : (
              data.lensTypes.map((lt) => {
                const rulesCount = data.pricingRules.filter((r) => (r.lens_type_id || r.lensTypeId) === lt.id).length;
                return (
                  <div
                    key={lt.id}
                    className="p-4 flex items-center justify-between hover:bg-[#f6f9f6] transition-colors"
                  >
                    <div>
                      <span className="font-bold text-[#152017] text-base">{lt.name}</span>
                      <span className="text-xs text-[#5e7964] mr-3 bg-[#edf4ee] px-2.5 py-0.5 rounded-lg border border-[#d2ded4]">
                        {rulesCount} قاعدة تسعير
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => promptDeleteLensType(lt.id)}
                      className="p-2 text-[#7f9984] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                      title="حذف نوع العدسة"
                      aria-label={`حذف ${lt.name}`}
                    >
                      <Trash2 className="w-5 h-5 stroke-[1.8]" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION: PRICING RULES (قواعد التسعير) */}
      {/* ------------------------------------------------------------- */}
      {activeSection === 'pricingRules' && (
        <div className="space-y-6">
          {/* Filter Bar: Select Company & Lens Type */}
          <div className="glass-surface rounded-3xl p-5 sm:p-6 shadow-[0_10px_35px_rgba(20,30,22,0.05)] border border-[#d6e2d8]">
            <h3 className="text-base font-bold text-[#152017] mb-3 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#eef4ee] text-[#384e3c] border border-[#cad9cc]">
                <DollarSign className="w-4 h-4" />
              </span>
              <span>تحديد الشركة ونوع العدسة لإدارة الأسعار</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#304434] mb-1.5">
                  الشركة
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#cbd8cd] bg-white text-[#152017] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#384e3c]/20 focus:border-[#384e3c]"
                >
                  {data.companies.length === 0 ? (
                    <option value="">لا توجد شركات مسجلة</option>
                  ) : (
                    data.companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#304434] mb-1.5">
                  نوع العدسة
                </label>
                <select
                  value={selectedLensTypeId}
                  onChange={(e) => setSelectedLensTypeId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#cbd8cd] bg-white text-[#152017] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#384e3c]/20 focus:border-[#384e3c]"
                >
                  {data.lensTypes.length === 0 ? (
                    <option value="">لا توجد أنواع عدسات مسجلة</option>
                  ) : (
                    data.lensTypes.map((lt) => (
                      <option key={lt.id} value={lt.id}>
                        {lt.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Rules for Selected Combination */}
          <div className="glass-surface rounded-3xl p-5 sm:p-7 shadow-[0_10px_35px_rgba(20,30,22,0.05)] border border-[#d6e2d8] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e1ece3] pb-4">
              <div>
                <h4 className="text-base font-bold text-[#152017]">
                  قواعد التسعير لـ {selectedCompany?.name || '...'} · {selectedLensType?.name || '...'}
                </h4>
                <p className="text-xs text-[#617b66] mt-0.5">
                  النطاق يطابق القيمة المطلقة للمقاس ABS(Prescription)
                </p>
              </div>

              {!isAddingRule && (
                <button
                  onClick={() => setIsAddingRule(true)}
                  disabled={!selectedCompanyId || !selectedLensTypeId}
                  className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-b from-[#384e3c] to-[#27382b] hover:from-[#415a45] hover:to-[#2e4233] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm subtle-rim-light"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة نطاق تسعير</span>
                </button>
              )}
            </div>

            {/* 8. PRICING RULES FORM: ONLY Range & Price */}
            {isAddingRule && (
              <form onSubmit={handleAddRule} className="p-4.5 bg-[#f6f9f6] border border-[#d2ded4] rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#152017]">
                    إضافة نطاق تسعير جديد
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingRule(false);
                      setRuleError(null);
                    }}
                    className="text-xs text-[#5e7763] hover:text-[#18231b] cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>

                {ruleError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
                    {ruleError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field 1: Range */}
                  <div>
                    <label className="block text-xs font-bold text-[#2a3d2e] mb-1.5">
                      النطاق (Range)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        placeholder="من (مثال: 0.00)"
                        value={minRange}
                        onChange={(e) => setMinRange(e.target.value)}
                        className="w-1/2 h-11 px-3 text-center rounded-xl border border-[#cbd8cd] bg-white text-[#152017] text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#384e3c]/20 focus:border-[#384e3c] tabular-nums placeholder:text-[#8ea592]/60 placeholder:font-normal placeholder:text-xs"
                        required
                      />
                      <span className="text-[#89a28e] text-sm font-bold">-</span>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        placeholder="إلى (مثال: 2.00)"
                        value={maxRange}
                        onChange={(e) => setMaxRange(e.target.value)}
                        className="w-1/2 h-11 px-3 text-center rounded-xl border border-[#cbd8cd] bg-white text-[#152017] text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#384e3c]/20 focus:border-[#384e3c] tabular-nums placeholder:text-[#8ea592]/60 placeholder:font-normal placeholder:text-xs"
                        required
                      />
                    </div>
                  </div>

                  {/* Field 2: Price */}
                  <div>
                    <label className="block text-xs font-bold text-[#2a3d2e] mb-1.5">
                      السعر (Price)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="مثال: 200"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full h-11 pr-3 pl-12 rounded-xl border border-[#cbd8cd] bg-white text-[#152017] text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#384e3c]/20 focus:border-[#384e3c] tabular-nums placeholder:text-[#8ea592]/60 placeholder:font-normal placeholder:text-sm"
                        required
                      />
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#6d8872] pointer-events-none">
                        جنيه
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingRule(false);
                      setRuleError(null);
                    }}
                    className="px-4 py-2 text-xs font-medium text-[#465c49] hover:text-[#18231b] bg-white border border-[#cbd7cd] rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-b from-[#384e3c] to-[#27382b] hover:from-[#415a45] hover:to-[#2e4233] disabled:opacity-50 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>حفظ القاعدة</span>
                  </button>
                </div>
              </form>
            )}

            {/* Rules List */}
            {currentRules.length === 0 ? (
              <div className="text-center py-8 text-[#7e9683] text-sm">
                لا توجد قواعد تسعير مسجلة لهذا النوع والشركة. انقر على &quot;إضافة نطاق تسعير&quot; للبدء.
              </div>
            ) : (
              <div className="divide-y divide-[#e3ece5]">
                {currentRules.map((rule) => {
                  const min = rule.min_range !== undefined ? rule.min_range : rule.minRange;
                  const max = rule.max_range !== undefined ? rule.max_range : rule.maxRange;
                  return (
                    <div
                      key={rule.id}
                      className="py-3.5 flex items-center justify-between hover:bg-[#f6f9f6] px-3 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="px-3.5 py-1.5 bg-[#edf4ee] border border-[#d2dfd4] rounded-xl text-[#263728] font-bold text-sm tabular-nums">
                          النطاق: {formatRange(min, max)}
                        </div>
                        <div className="text-base sm:text-lg font-extrabold text-[#141e15]">
                          {rule.price} جنيه
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => promptDeleteRule(rule.id)}
                        className="p-2 text-[#7f9984] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                        title="حذف قاعدة التسعير"
                        aria-label="حذف قاعدة التسعير"
                      >
                        <Trash2 className="w-5 h-5 stroke-[1.8]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
