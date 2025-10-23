
import React from 'react';
import AppBar from '../components/AppBar';
import Icon from '../components/Icon';

const SchedulePage: React.FC = () => {
  return (
    <div>
      <AppBar title="Schedule" />
      <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-15rem)] px-4">
        <Icon name="calendar_month" className="text-8xl text-on-surface-variant" />
        <h2 className="mt-4 text-2xl font-medium text-on-surface">Coming Soon!</h2>
        <p className="mt-2 text-on-surface-variant">The anime schedule feature is currently under development.</p>
      </div>
    </div>
  );
};

export default SchedulePage;
