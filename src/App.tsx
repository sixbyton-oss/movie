import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import Layout from '@/components/layout/Layout';
import LoadingScreen from '@/components/LoadingScreen';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { DashboardStatsProvider } from '@/contexts/DashboardStatsContext';

import { routes } from './routes';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <Router>
      <DashboardStatsProvider>
        <FavoritesProvider>
          <IntersectObserver />
          {loading && <LoadingScreen onComplete={handleLoadingComplete} />}
          <Layout>
            <Routes>
              {routes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={route.element}
                />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
          <Toaster />
        </FavoritesProvider>
      </DashboardStatsProvider>
    </Router>
  );
};

export default App;
