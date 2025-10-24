import React from 'react';
import { Link } from '../lib/memory-router';

interface ToastProps {
  message: string;
  action?: {
    text: string;
    to: string;
  };
}

const Toast: React.FC<ToastProps> = ({ message, action }) => {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-[calc(100%-2rem)] sm:max-w-sm animate-fade-in-up">
      <div className="bg-inverse-surface text-inverse-on-surface rounded-xl py-3 px-5 flex items-center justify-between shadow-lg min-h-[3.5rem]">
        <span className="font-medium mr-4">{message}</span>
        {action && (
          <Link to={action.to} className="font-bold text-inverse-primary uppercase text-sm flex-shrink-0">
            {action.text}
          </Link>
        )}
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};
export default Toast;
