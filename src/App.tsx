import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { authService } from './services/auth';
import { dbService, isSupabaseConfigured } from './services/supabase';
import { AppData } from './types';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { Calculator } from './components/Calculator';
import { Management } from './components/Management';
import { Customers } from './components/Customers';
import { ChangePassword } from './components/ChangePassword';
import { Loader2, Database, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}

function MainApp() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return authService.isAuthenticated();
  });

  // Empty initial data - Supabase is the strict single source of truth
  const [appData, setAppData] = useState<AppData>({
    companies: [],
    lensTypes: [],
    pricingRules: [],
    customers: [],
    orders: [],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Load persistent data from Supabase
  const loadData = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const data = await dbService.fetchAllData();
      setAppData(data);
    } catch (err: any) {
      console.error('Failed to load data from Supabase:', err);
      setDbError(err.message || 'تعذر الاتصال بقاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleDataChange = (updated: AppData) => {
    setAppData(updated);
  };

  // Protected route wrapper
  const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return (
      <div className="min-h-screen bg-[#f7f9f7] flex flex-col text-[#152017] selection:bg-[#d6e7d9] selection:text-[#19271b] relative">
        <Header onLogout={handleLogout} />

        {/* Database connection badge / error banner */}
        {!isSupabaseConfigured && (
          <div className="bg-[#edf4ee] border-b border-[#d3dfd5] px-4 py-2 text-center text-xs font-semibold text-[#304835] flex items-center justify-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#517357]" />
            <span>يرجى إضافة متغيرات VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في بيئة التشغيل لربط قاعدة البيانات السحابية.</span>
          </div>
        )}

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-9">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[350px] text-[#6d8a73] gap-3">
              <Loader2 className="w-8 h-8 text-[#384e3c] animate-spin" />
              <span className="text-sm font-semibold text-[#4c6851]">جاري مزامنة البيانات من قاعدة البيانات المركزية (Supabase)...</span>
            </div>
          ) : dbError ? (
            <div className="glass-surface max-w-lg mx-auto rounded-3xl p-8 sm:p-10 text-center shadow-lg border border-rose-200">
              <div className="w-14 h-14 bg-rose-50 text-rose-700 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-rose-200 shadow-xs">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#152017] mb-2">تعذر الاتصال بقاعدة البيانات</h3>
              <p className="text-sm text-[#5f7564] mb-6 leading-relaxed">
                {dbError}. تأكد من الاتصال بالإنترنت وصحة بيانات الاتصال بقاعدة بيانات Supabase.
              </p>
              <button
                type="button"
                onClick={loadData}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-[#384e3c] to-[#27382b] hover:from-[#415a45] hover:to-[#2e4233] text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة المحاولة الآن</span>
              </button>
            </div>
          ) : (
            children
          )}
        </main>

        <footer className="py-5 border-t border-[#dfe8e1] bg-white/80 backdrop-blur-xs text-center text-xs text-[#6e8773] tracking-wide">
          نور للبصريات · نظام تسعير العدسات وسجل العملاء الموحد · NOUR OPTICS ATELIER
        </footer>
      </div>
    );
  };

  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      {/* Main Dashboard / Calculator */}
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <Calculator
              companies={appData.companies}
              lensTypes={appData.lensTypes}
              pricingRules={appData.pricingRules}
              customers={appData.customers}
              onNavigateToManagement={() => navigate('/pricing')}
              onOrderSaved={loadData}
            />
          </ProtectedLayout>
        }
      />

      {/* Customers and Orders */}
      <Route
        path="/customers"
        element={
          <ProtectedLayout>
            <Customers
              customers={appData.customers}
              orders={appData.orders}
              onDataRefresh={loadData}
            />
          </ProtectedLayout>
        }
      />

      {/* Companies */}
      <Route
        path="/companies"
        element={
          <ProtectedLayout>
            <Management
              data={appData}
              onDataChange={handleDataChange}
              onDataRefresh={loadData}
              activeSection="companies"
              setActiveSection={() => {}}
            />
          </ProtectedLayout>
        }
      />

      {/* Lens Types */}
      <Route
        path="/lens-types"
        element={
          <ProtectedLayout>
            <Management
              data={appData}
              onDataChange={handleDataChange}
              onDataRefresh={loadData}
              activeSection="lensTypes"
              setActiveSection={() => {}}
            />
          </ProtectedLayout>
        }
      />

      {/* Pricing Rules */}
      <Route
        path="/pricing"
        element={
          <ProtectedLayout>
            <Management
              data={appData}
              onDataChange={handleDataChange}
              onDataRefresh={loadData}
              activeSection="pricingRules"
              setActiveSection={() => {}}
            />
          </ProtectedLayout>
        }
      />

      {/* Change Password */}
      <Route
        path="/change-password"
        element={
          <ProtectedLayout>
            <ChangePassword />
          </ProtectedLayout>
        }
      />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
