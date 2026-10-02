import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { authService } from './services/api';
import { dbService, isSupabaseConfigured } from './services/supabase';
import { AppData } from './types';
import { initialData } from './data/defaultData';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { Calculator } from './components/Calculator';
import { Management } from './components/Management';
import { Customers } from './components/Customers';
import { Loader2, Database } from 'lucide-react';

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

  const [appData, setAppData] = useState<AppData>({
    ...initialData,
    customers: [],
    orders: [],
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Load persistent data from Supabase
  const loadData = async () => {
    try {
      const data = await dbService.fetchAllData();
      setAppData(data);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
        <Header onLogout={handleLogout} />

        {/* Database connection badge banner (subtle, clean) */}
        {!isSupabaseConfigured && (
          <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 text-center text-xs font-semibold text-amber-800 flex items-center justify-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span>يعمل التطبيق حالياً في وضع التخزين المحلي. لربط Supabase أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY.</span>
          </div>
        )}

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400 gap-2">
              <Loader2 className="w-7 h-7 text-slate-900 animate-spin" />
              <span className="text-xs font-semibold text-slate-600">جاري تحميل البيانات من قاعدة البيانات...</span>
            </div>
          ) : (
            children
          )}
        </main>

        <footer className="py-4 border-t border-slate-200/80 bg-white/60 text-center text-xs text-slate-400">
          نور للبصريات · نظام تسعير العدسات والعملاء
        </footer>
      </div>
    );
  };

  return (
    <Routes>
      {/* 4. Login Route */}
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

      {/* 5. Main Dashboard / Calculator */}
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

      {/* 11. Customers */}
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

      {/* 6. Companies */}
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

      {/* 7. Lens Types */}
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

      {/* 8. Pricing Rules */}
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
