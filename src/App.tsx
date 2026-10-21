import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Overview } from './components/Dashboard/Overview';
import { ProductCatalog } from './components/Products/ProductCatalog';
import { KardexViewer } from './components/Inventory/KardexViewer';
import { MixStudio } from './components/Mixes/MixStudio';
import { SalesManager } from './components/Sales/SalesManager';
import { PurchaseRegister } from './components/Purchases/PurchaseRegister';
import { BagInventory } from './components/Bags/BagInventory';
import { PhysicalCountModal } from './components/Audit/PhysicalCountModal';
import { FinancialReports } from './components/Reports/FinancialReports';
import { CustomerCRM } from './components/Customers/CustomerCRM';
import { SupplierManager } from './components/Suppliers/SupplierManager';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

const NotificationBanner: React.FC = () => {
  const { errorMessage, setErrorMessage, successMessage, setSuccessMessage } = useApp();

  if (!errorMessage && !successMessage) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full space-y-2">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 shadow-lg flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span className="text-xs font-medium leading-relaxed">{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 shadow-lg flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-xs font-medium leading-relaxed">{successMessage}</span>
          </div>
          <button 
            onClick={() => setSuccessMessage(null)} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

const LoadingOverlay: React.FC = () => {
  const { isLoading } = useApp();
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-lg">
        <Loader2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-spin" />
      </div>
      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-wide bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
        Actualizando inventario...
      </p>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full relative min-w-0">
      {activeTab === 'dashboard' && <Overview />}
      {activeTab === 'sales' && <SalesManager />}
      {activeTab === 'purchases' && <PurchaseRegister />}
      {activeTab === 'mixes' && <MixStudio />}
      {activeTab === 'kardex' && <KardexViewer />}
      {activeTab === 'customers' && <CustomerCRM />}
      {activeTab === 'suppliers' && <SupplierManager />}
      {activeTab === 'products' && <ProductCatalog />}
      {activeTab === 'bags' && <BagInventory />}
      {activeTab === 'audit' && <PhysicalCountModal />}
      {activeTab === 'financials' && <FinancialReports />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans relative transition-colors duration-200">
        <Navbar />
        <div className="flex-1 flex flex-col lg:flex-row">
          <Sidebar />
          <MainContent />
        </div>
        <NotificationBanner />
        <LoadingOverlay />
      </div>
    </AppProvider>
  );
};

export default App;
