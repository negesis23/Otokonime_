import React from 'react';
import { MemoryRouter, BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { MyListProvider } from './contexts/BookmarksContext';

import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import WatchPage from './pages/WatchPage';
import SearchPage from './pages/SearchPage';
import MyListPage from './pages/BookmarksPage';
import SchedulePage from './pages/SchedulePage';
import ListPage from './pages/ListPage';
import BottomNav from './components/BottomNav';
import BatchPage from './pages/BatchPage';
import GenrePage from './pages/GenrePage';

const App: React.FC = () => {
  // Determine router based on environment.
  // We explicitly check for production flags. If not found, we assume development/preview mode (MemoryRouter).
  // This prevents issues where BrowserRouter is used in environments without history API support or with weird base paths.
  const isProduction = 
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') ||
    // @ts-ignore
    (typeof import.meta !== 'undefined' && (import.meta.env?.PROD === true || import.meta.env?.MODE === 'production'));

  const Router = isProduction ? BrowserRouter : MemoryRouter;

  return (
    <ThemeProvider>
      <MyListProvider>
        <Router>
          <Main />
        </Router>
      </MyListProvider>
    </ThemeProvider>
  );
};

const Main: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const hideBottomNav = path.startsWith('/watch/') || path.startsWith('/anime/') || path.startsWith('/batch/');

  return (
    <div className="max-w-screen-sm mx-auto h-screen flex flex-col bg-background">
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/my-list" element={<MyListPage />} />
          <Route path="/anime/:slug" element={<DetailPage />} />
          <Route path="/watch/:slug" element={<WatchPage />} />
          <Route path="/list/:type" element={<ListPage />} />
          <Route path="/batch/:slug" element={<BatchPage />} />
          <Route path="/genre/:slug" element={<GenrePage />} />
          {/* Catch-all route to handle 404s or redirects, useful for BrowserRouter edge cases */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
};

export default App;