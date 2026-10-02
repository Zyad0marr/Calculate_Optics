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
      <div className="min-h-screen bg-[#f7f9f7] flex flex-col text-[#152017] selection:bg-[#d6e7d9] selection:text-[#19271b] relative">
        <Header onLogout={handleLogout} />

        {/* Database connection badge banner (subtle, clean) */}
        {!isSupabaseConfigured && (
          <div className="bg-[#edf4ee] border-b border-[#d3dfd5] px-4 py-2 text-center text-xs font-semibold text-[#304835] flex items-center justify-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#517357]" />
            <span>يعمل التطبيق حالياً في وضع التخزين المحلي. لربط Supabase أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY.</span>
          </div>
        )}

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-9">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-[#6d8a73] gap-2.5">
              <Loader2 className="w-7 h-7 text-[#384e3c] animate-spin" />
              <span className="text-xs font-semibold text-[#4c6851]">جاري تحميل البيانات من قاعدة البيانات...</span>
            </div>
          ) : (
            children
          )}
        </main>

        <footer className="py-5 border-t border-[#dfe8e1] bg-white/80 backdrop-blur-xs text-center text-xs text-[#6e8773] tracking-wide">
          نور للبصريات · نظام تسعير العدسات وسجل العملاء · NOUR OPTICS ATELIER
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
