import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './hooks/useStore';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import QuickBooking from './pages/QuickBooking';
import MaterialList from './pages/MaterialList';
import MaterialDetail from './pages/MaterialDetail';
import MaterialForm from './pages/MaterialForm';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import ProjectForm from './pages/ProjectForm';
import ReorderList from './pages/ReorderList';
import MovementLog from './pages/MovementLog';
import Settings from './pages/Settings';
import Statistics from './pages/Statistics';
import CategoryManager from './pages/CategoryManager';
import SupplierManager from './pages/SupplierManager';
import Auth from './pages/Auth';
import InventoryScan from './pages/InventoryScan';
import AiAssistant from './pages/AiAssistant';

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
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
        <Route path="/material/:id" element={<MaterialDetail />} />
        <Route path="/material/:id/edit" element={<MaterialForm />} />
        <Route path="/baustellen" element={<ProjectList />} />
        <Route path="/baustellen/:id" element={<ProjectDetail />} />
        <Route path="/baustellen/:id/edit" element={<ProjectForm />} />
        <Route path="/nachbestellen" element={<ReorderList />} />
        <Route path="/bewegungen" element={<MovementLog />} />
        <Route path="/statistiken" element={<Statistics />} />
        <Route path="/kategorien" element={<CategoryManager />} />
        <Route path="/lieferanten" element={<SupplierManager />} />
        <Route path="/inventur" element={<InventoryScan />} />
        <Route path="/assistent" element={<AiAssistant />} />
        <Route path="/mehr" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  );
}
