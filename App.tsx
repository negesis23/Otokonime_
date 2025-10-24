
import React from 'react';
import { MemoryRouter as Router, Route, Switch, useLocation } from './lib/memory-router';
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
  const [location] = useLocation();
  const hideBottomNav = location.startsWith('/watch/') || location.startsWith('/anime/') || location.startsWith('/batch/');

  return (
    <div className="max-w-screen-sm mx-auto h-screen flex flex-col bg-background">
      <main className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/schedule" component={SchedulePage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/my-list" component={MyListPage} />
          <Route path="/anime/:slug" component={DetailPage} />
          <Route path="/watch/:slug" component={WatchPage} />
          <Route path="/list/:type" component={ListPage} />
          <Route path="/batch/:slug" component={BatchPage} />
          <Route path="/genre/:slug" component={GenrePage} />
        </Switch>
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
};

export default App;