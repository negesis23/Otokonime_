import React from 'react';
import { useHistory } from '../lib/memory-router';
import Icon from './Icon';

interface AppBarProps {
  title?: string;
  showBackButton?: boolean;
  actions?: React.ReactNode;
}

const AppBar: React.FC<AppBarProps> = ({ title, showBackButton = false, actions }) => {
  const history = useHistory();
  
  return (
    <header className="sticky top-0 z-10 flex items-center h-20 px-6 bg-surface-container-low">
      {showBackButton && (
        <button onClick={history.back} className="p-3 -ml-3 rounded-full hover:bg-surface-container active:bg-surface-container-high">
          <Icon name="arrow_back" />
        </button>
      )}
      <h1 className="text-2xl font-medium ml-4 truncate flex-1">{title}</h1>
      <div className="flex items-center gap-2">
        {actions}
      </div>
    </header>
  );
};

export default AppBar;