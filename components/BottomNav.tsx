
import React from 'react';
import { Link, useLocation } from '../lib/memory-router';
import Icon from './Icon';

const navItems = [
  { path: '/', icon: 'home', label: 'Home' },
  { path: '/schedule', icon: 'calendar_month', label: 'Schedule' },
  { path: '/my-list', icon: 'video_library', label: 'My List' },
];

const BottomNav: React.FC = () => {
  const [location] = useLocation();

  return (
    <nav className="bg-surface-container-low shadow-lg sticky bottom-0 z-10">
      <div className="flex justify-around items-center h-24">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-2 w-28 transition-colors duration-200 ${
                  isActive ? 'text-on-surface' : 'text-on-surface-variant'
                }`}
            >
              <>
                <div className={`flex items-center justify-center h-9 w-20 rounded-3xl ${isActive ? 'bg-secondary-container' : ''}`}>
                  <Icon name={item.icon} className="text-3xl" />
                </div>
                <span className={`text-sm font-medium ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>{item.label}</span>
              </>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
