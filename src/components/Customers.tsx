import React, { useState } from 'react';
import { Customer, Order } from '../types';
import { dbService } from '../services/supabase';
import { ConfirmModal } from './ConfirmModal';
import { UserCheck, Phone, Calendar, Trash2, Plus, Search, Glasses, Eye } from 'lucide-react';

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

  // Filter orders or customers
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header & Add Button */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-slate-800" />
              <span>العملاء والطلبات</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              سجل بأسماء العملاء والمقاسات والعدسات المطلوبة والأسعار
            </p>
          </div>

          {!isAddingCustomer && (
            <button
              onClick={() => setIsAddingCustomer(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عميل جديد</span>
            </button>
          )}
        </div>

        {/* Add Customer Form */}
        {isAddingCustomer && (
          <form onSubmit={handleAddCustomer} className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">إضافة بيانات عميل جديد</span>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCustomer(false);
                  setError(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                إلغاء
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">اسم العميل *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="الاسم بالكامل"
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الهاتف (اختياري)</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums dir-ltr text-right"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingCustomer(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
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
            className="w-full h-12 pr-11 pl-4 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
          />
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Orders & Customers Records */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400">
            <Glasses className="w-12 h-12 mx-auto stroke-[1.5] text-slate-300 mb-2" />
            <p className="text-base font-bold text-slate-600">لا توجد طلبات أو عملاء مسجلين</p>
            <p className="text-xs text-slate-400 mt-1">
              عند حساب سعر عدسة وحفظها من الحاسبة، ستظهر تفاصيل العميل والطلب هنا تلقائياً.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const eyeMode = order.orderedEye || order.ordered_eye || 'both';
            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
              >
                {/* Top Row: Customer Name & Price */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>{order.customerName || order.customer_name}</span>
                      {(order.phone) && (
                        <span className="text-xs font-normal text-slate-500 flex items-center gap-1 tabular-nums dir-ltr">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{order.phone}</span>
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-slate-700">
                        {order.companyName || order.company_name} - {order.lensTypeName || order.lens_type_name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                        {order.price} جنيه
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => promptDeleteOrder(order.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="حذف هذا الطلب"
                      aria-label="حذف الطلب"
                    >
                      <Trash2 className="w-4 h-4 stroke-[1.8]" />
                    </button>
                  </div>
                </div>

                {/* Ordered Eyes & Prescription Details */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Right Eye */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                        العين اليمنى (OD)
                      </span>
                      {eyeMode === 'left' && (
                        <span className="text-slate-400 font-normal">لم يتم طلب العين اليمنى</span>
                      )}
                    </div>
                    {eyeMode !== 'left' ? (
                      <div className="text-sm font-semibold text-slate-800 tabular-nums flex items-center gap-4">
                        <span>SPH: {order.rightSph !== null && order.rightSph !== undefined ? order.rightSph : '0.00'}</span>
                        <span>CYL: {order.rightCyl !== null && order.rightCyl !== undefined ? order.rightCyl : '0.00'}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">غير مطلوبة</div>
                    )}
                  </div>

                  {/* Left Eye */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        العين اليسرى (OS)
                      </span>
                      {eyeMode === 'right' && (
                        <span className="text-slate-400 font-normal">لم يتم طلب العين اليسرى</span>
                      )}
                    </div>
                    {eyeMode !== 'right' ? (
                      <div className="text-sm font-semibold text-slate-800 tabular-nums flex items-center gap-4">
                        <span>SPH: {order.leftSph !== null && order.leftSph !== undefined ? order.leftSph : '0.00'}</span>
                        <span>CYL: {order.leftCyl !== null && order.leftCyl !== undefined ? order.leftCyl : '0.00'}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">غير مطلوبة</div>
                    )}
                  </div>
                </div>

                {/* Eye Badge */}
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>العيون المطلوبة: <strong>{getOrderedEyeLabel(eyeMode)}</strong></span>
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
