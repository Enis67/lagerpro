import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { StoreProvider } from './hooks/useStore';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';

// Lazy-loaded Pages – reduziert Haupt-Chunk um ~60%
const QuickBooking = lazy(() => import('./pages/QuickBooking'));
const DeliveryBooking = lazy(() => import('./pages/DeliveryBooking'));
const MaterialList = lazy(() => import('./pages/MaterialList'));
const MaterialDetail = lazy(() => import('./pages/MaterialDetail'));
const MaterialForm = lazy(() => import('./pages/MaterialForm'));
const ProjectList = lazy(() => import('./pages/ProjectList'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const ProjectForm = lazy(() => import('./pages/ProjectForm'));
const ReorderList = lazy(() => import('./pages/ReorderList'));
const OrderList = lazy(() => import('./pages/OrderList'));
const MovementLog = lazy(() => import('./pages/MovementLog'));
const Settings = lazy(() => import('./pages/Settings'));
const Statistics = lazy(() => import('./pages/Statistics'));
const DailyReport = lazy(() => import('./pages/DailyReport'));
const CategoryManager = lazy(() => import('./pages/CategoryManager'));
const SupplierManager = lazy(() => import('./pages/SupplierManager'));
const BatchBooking = lazy(() => import('./pages/BatchBooking'));
const InventoryScan = lazy(() => import('./pages/InventoryScan'));
const AiAssistant = lazy(() => import('./pages/AiAssistant'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const CsvImport = lazy(() => import('./components/CsvImport'));

const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100vh',
    color: 'var(--color-primary)'
  }}>
    <div className="spinner" />
  </div>
);

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  // TEMP: Auth deaktiviert für lokale Entwicklung
  if (loading) return <PageLoader />;
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }>
          <Route path="/" element={<Dashboard />} />
          <Route path="/buchen" element={<QuickBooking />} />
          <Route path="/material" element={<MaterialList />} />
          <Route path="/material/neu" element={<MaterialForm />} />
          <Route path="/material/:id" element={<MaterialDetail />} />
          <Route path="/material/:id/edit" element={<MaterialForm />} />
          <Route path="/baustellen" element={<ProjectList />} />
          <Route path="/baustellen/neu" element={<ProjectForm />} />
          <Route path="/baustellen/:id" element={<ProjectDetail />} />
          <Route path="/baustellen/:id/edit" element={<ProjectForm />} />
          <Route path="/nachbestellung" element={<ReorderList />} />
          <Route path="/bestellliste" element={<OrderList />} />
          <Route path="/lieferung" element={<DeliveryBooking />} />
          <Route path="/mehrfach" element={<BatchBooking />} />
          <Route path="/bewegungen" element={<MovementLog />} />
          <Route path="/statistiken" element={<Statistics />} />
          <Route path="/tagesbericht" element={<DailyReport />} />
          <Route path="/kategorien" element={<CategoryManager />} />
          <Route path="/lieferanten" element={<SupplierManager />} />
          <Route path="/inventur" element={<InventoryScan />} />
          <Route path="/assistent" element={<AiAssistant />} />
          <Route path="/werkzeuge" element={<ToolsPage />} />
          <Route path="/csv-import" element={<CsvImport />} />
          <Route path="/mehr" element={<Settings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </StoreProvider>
    </AuthProvider>
  );
}

