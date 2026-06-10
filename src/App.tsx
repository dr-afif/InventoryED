import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { DailyCheck } from './pages/DailyCheck';
import { Inventory } from './pages/Inventory';
import { Logs } from './pages/Logs';
import { Admin } from './pages/Admin';
import { InstallPWA } from './components/InstallPWA';

function App() {
  const fetchInitialData = useStore(state => state.fetchInitialData);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <BrowserRouter basename="/InventoryED">
      <InstallPWA />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="check" element={<DailyCheck />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="logs" element={<Logs />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
