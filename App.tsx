
import React from 'react';
import { MemoryRouter as Router, Route, Switch, useLocation } from './lib/memory-router';
import { ThemeProvider } from './contexts/ThemeContext';
import { BookmarksProvider } from './contexts/BookmarksContext';

import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import WatchPage from './pages/WatchPage';
import SearchPage from './pages/SearchPage';
import BookmarksPage from './pages/BookmarksPage';
import SchedulePage from './pages/SchedulePage';
import ListPage from './pages/ListPage';
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BookmarksProvider>
        <Router>
          <Main />
        </Router>
      </BookmarksProvider>
    </ThemeProvider>
  );
};

const Main: React.FC = () => {
  const [location] = useLocation();
  const hideBottomNav = location.startsWith('/watch/');

  return (
    <div className="max-w-screen-sm mx-auto h-screen flex flex-col bg-background">
      <main className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/schedule" component={SchedulePage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/bookmarks" component={BookmarksPage} />
          <Route path="/anime/:slug" component={DetailPage} />
          <Route path="/watch/:slug" component={WatchPage} />
          <Route path="/list/:type" component={ListPage} />
        </Switch>
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
};

export default App;
