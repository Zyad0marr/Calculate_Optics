import React, { useState } from 'react';
import { Customer, Order } from '../types';
import { dbService } from '../services/supabase';
import { ConfirmModal } from './ConfirmModal';
import { UserCheck, Phone, Calendar, Trash2, Plus, Search, Glasses, Eye, Loader2 } from 'lucide-react';

interface CustomersProps {
  customers: Customer[];
  orders: Order[];
  onDataRefresh: () => Promise<void>;
}

export const Customers: React.FC<CustomersProps> = ({ customers, orders, onDataRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confirm delete modal state
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

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await dbService.addCustomer(newName.trim(), newPhone.trim());
      await onDataRefresh();
      setNewName('');
      setNewPhone('');
      setIsAddingCustomer(false);
    } catch {
      setError('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const promptDeleteCustomer = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف العميل',
      message: `هل أنت متأكد من حذف العميل "${name}" وجميع طلباته؟`,
      onConfirm: async () => {
        try {
          await dbService.deleteCustomer(id);
          await onDataRefresh();
        } catch {
          alert('حدث خطأ أثناء حذف العميل');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const promptDeleteOrder = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف الطلب',
      message: 'هل أنت متأكد من الحذف؟',
      onConfirm: async () => {
        try {
          await dbService.deleteOrder(id);
          await onDataRefresh();
        } catch {
          alert('حدث خطأ أثناء حذف الطلب');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (o.customerName || o.customer_name || '').toLowerCase().includes(term);
    const phoneMatch = (o.phone || '').includes(term);
    return nameMatch || phoneMatch;
  });

  const getOrderedEyeLabel = (eye?: string) => {
    if (eye === 'right') return 'العين اليمنى فقط';
    if (eye === 'left') return 'العين اليسرى فقط';
    return 'العينين';
  };

  const formatPrescriptionDisplay = (val: number | null | undefined, label: string) => {
    if (val === null || val === undefined) return null;
    const sign = val > 0 ? '+' : '';
    return `${label}: ${sign}${val.toFixed(2)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header & Add Button */}
      <div className="glass-surface rounded-3xl p-5 sm:p-7 shadow-[0_10px_35px_rgba(20,30,22,0.05)] border border-[#d6e2d8]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e1ece3] pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#141d16] flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#eef4ee] text-[#384e3c] border border-[#cad9cc]">
                <UserCheck className="w-5 h-5" />
              </span>
              <span>العملاء والطلبات</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#617b66] mt-1">
              سجل بأسماء العملاء والمقاسات والعدسات المطلوبة والأسعار
            </p>
          </div>

          {!isAddingCustomer && (
            <button
              onClick={() => setIsAddingCustomer(true)}
              className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-b from-[#384e3c] to-[#27382b] hover:from-[#415a45] hover:to-[#2e4233] text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm subtle-rim-light"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عميل جديد</span>
            </button>
          )}
        </div>

        {/* Add Customer Form */}
        {isAddingCustomer && (
          <form onSubmit={handleAddCustomer} className="mt-4 p-4.5 bg-[#f6f9f6] border border-[#d2ded4] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#152017]">إضافة بيانات عميل جديد</span>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCustomer(false);
                  setError(null);
                }}
                className="text-xs text-[#5e7763] hover:text-[#18231b] cursor-pointer"
              >
                إلغاء
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#293c2d] mb-1.5">اسم العميل *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="الاسم بالكامل (مثال: محمد أحمد)"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#cbd8cd] bg-white text-[#152017] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#384e3c]/20 focus:border-[#384e3c] placeholder:text-[#8ea592]/60 placeholder:font-normal"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#293c2d] mb-1.5">رقم الهاتف (اختياري)</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="رقم الهاتف (مثال: 01012345678)"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#cbd8cd] bg-white text-[#152017] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#384e3c]/20 focus:border-[#384e3c] tabular-nums dir-ltr text-right placeholder:text-[#8ea592]/60 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingCustomer(false)}
                className="px-4 py-2 text-xs font-medium text-[#465c49] hover:text-[#18231b] bg-white border border-[#cbd7cd] rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-b from-[#384e3c] to-[#27382b] hover:from-[#415a45] hover:to-[#2e4233] disabled:opacity-50 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ العميل'}
              </button>
            </div>
          </form>
        )}

        {/* Search Bar */}
        <div className="mt-4 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم العميل أو رقم الهاتف..."
            className="w-full h-12 pr-11 pl-4 rounded-xl border border-[#cbd8cd] bg-white/90 text-[#141d16] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#384e3c]/25 focus:border-[#384e3c] transition-all placeholder:text-[#8ea592]/60 placeholder:font-normal"
          />
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#748f78]">
            <Search className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Orders & Customers Records */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="glass-surface rounded-3xl p-10 text-center text-[#7e9683] border border-[#d6e2d8]">
            <Glasses className="w-12 h-12 mx-auto stroke-[1.5] text-[#99b39e] mb-3" />
            <p className="text-base font-bold text-[#1e2d21]">لا توجد طلبات أو عملاء مسجلين</p>
            <p className="text-xs text-[#627a67] mt-1 max-w-sm mx-auto">
              عند حساب سعر عدسة وحفظها من الحاسبة، ستظهر تفاصيل العميل والطلب هنا تلقائياً.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const eyeMode = order.orderedEye || order.ordered_eye || 'both';
            const rSphText = formatPrescriptionDisplay(order.rightSph, 'SPH');
            const rCylText = formatPrescriptionDisplay(order.rightCyl, 'CYL');
            const lSphText = formatPrescriptionDisplay(order.leftSph, 'SPH');
            const lCylText = formatPrescriptionDisplay(order.leftCyl, 'CYL');

            return (
              <div
                key={order.id}
                className="glass-surface rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(20,30,22,0.03)] border border-[#d7e3da] space-y-3.5 hover:border-[#adc3b0] transition-all"
              >
                {/* Top Row: Customer Name & Price */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#141d16] flex items-center gap-2">
                      <span>{order.customerName || order.customer_name}</span>
                      {(order.phone) && (
                        <span className="text-xs font-normal text-[#5c7762] flex items-center gap-1 tabular-nums dir-ltr">
                          <Phone className="w-3.5 h-3.5 text-[#7f9984]" />
                          <span>{order.phone}</span>
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-[#5d7763] flex items-center gap-2.5 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#7e9983]" />
                        <span>
                          {new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-[#27382a] bg-[#eef4ee] px-2 py-0.5 rounded-md border border-[#d4e1d7]">
                        {order.companyName || order.company_name} - {order.lensTypeName || order.lens_type_name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black text-[#17231a] tabular-nums">
                        {order.price} جنيه
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => promptDeleteOrder(order.id)}
                      className="p-2 text-[#7f9984] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="حذف هذا الطلب"
                      aria-label="حذف الطلب"
                    >
                      <Trash2 className="w-4 h-4 stroke-[1.8]" />
                    </button>
                  </div>
                </div>

                {/* Ordered Eyes & Prescription Details */}
                <div className="pt-3 border-t border-[#e2ece4] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Right Eye */}
                  <div className="p-3.5 bg-[#f6f9f6] rounded-2xl border border-[#d8e3da]">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1c291f] mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#415a45]"></span>
                        العين اليمنى (OD)
                      </span>
                      {eyeMode === 'left' && (
                        <span className="text-[#7c9581] font-normal">لم يتم طلب العين اليمنى</span>
                      )}
                    </div>
                    {eyeMode !== 'left' ? (
                      <div className="text-sm font-semibold text-[#18241b] tabular-nums flex items-center gap-4">
                        {rSphText && <span>{rSphText}</span>}
                        {rCylText && <span>{rCylText}</span>}
                        {!rSphText && !rCylText && (
                          <span className="text-xs text-[#7e9683] italic">لم يُدخل مقاس</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-[#7e9683] italic">غير مطلوبة</div>
                    )}
                  </div>

                  {/* Left Eye */}
                  <div className="p-3.5 bg-[#f6f9f6] rounded-2xl border border-[#d8e3da]">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1c291f] mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#527457]"></span>
                        العين اليسرى (OS)
                      </span>
                      {eyeMode === 'right' && (
                        <span className="text-[#7c9581] font-normal">لم يتم طلب العين اليسرى</span>
                      )}
                    </div>
                    {eyeMode !== 'right' ? (
                      <div className="text-sm font-semibold text-[#18241b] tabular-nums flex items-center gap-4">
                        {lSphText && <span>{lSphText}</span>}
                        {lCylText && <span>{lCylText}</span>}
                        {!lSphText && !lCylText && (
                          <span className="text-xs text-[#7e9683] italic">لم يُدخل مقاس</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-[#7e9683] italic">غير مطلوبة</div>
                    )}
                  </div>
                </div>

                {/* Eye Badge */}
                <div className="text-xs text-[#5d7763] font-medium flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#7b9880]" />
                  <span>العيون المطلوبة: <strong className="text-[#1a261d]">{getOrderedEyeLabel(eyeMode)}</strong></span>
                </div>
              </div>
            );
          })
        )}
      </div>

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
