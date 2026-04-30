import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './hooks/useStore';
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

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
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
            <Route path="/mehr" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
