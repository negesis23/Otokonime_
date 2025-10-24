
import React from 'react';
import { useHistory } from '../lib/memory-router';
import Icon from './Icon';

interface AppBarProps {
  title?: string;
  showBackButton?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

const AppBar: React.FC<AppBarProps> = ({ title, showBackButton = false, actions, className = '' }) => {
  const history = useHistory();
  const hasWhiteText = className.includes('text-white');
  const buttonHoverClass = hasWhiteText ? 'hover:bg-white/10 active:bg-white/20' : 'hover:bg-surface-container active:bg-surface-container-high';
  
  return (
    <header className={`sticky top-0 z-10 flex items-center h-20 px-6 transition-colors duration-300 bg-surface-container-low ${className}`}>
      {showBackButton && (
        <button onClick={history.back} className={`p-3 -ml-3 mr-4 rounded-full transition-colors ${buttonHoverClass}`}>
          <Icon name="arrow_back" />
        </button>
      )}
      <h1 className="text-2xl font-medium truncate flex-1">{title}</h1>
      <div className="flex items-center gap-2">
        {actions}
      </div>
    </header>
  );
};

export default AppBar;
