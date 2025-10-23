
import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';

// Simplified path matching, inspired by wouter
const matchPath = (pattern: string, path: string): { params: Record<string, string> } | null => {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].substring(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }

  return { params };
};


interface RouterContextType {
  path: string;
  search: string;
  navigate: (path: string) => void;
  goBack: () => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const MemoryRouter: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<string[]>(['/']);

  const currentLocation = history[history.length - 1] || '/';
  
  const [path, search] = useMemo(() => {
    const parts = currentLocation.split('?');
    const pathPart = parts[0];
    const searchPart = parts[1] ? `?${parts[1]}` : '';
    return [pathPart, searchPart];
  }, [currentLocation]);

  const navigate = useCallback((to: string) => {
    setHistory(prev => [...prev, to]);
  }, []);

  const goBack = useCallback(() => {
    setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const value = useMemo(() => ({
    path,
    search,
    navigate,
    goBack,
  }), [path, search, navigate, goBack]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

// Hooks
export const useLocation = (): [string, (to: string) => void] => {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useLocation must be used within a MemoryRouter');
  return [context.path, context.navigate];
};

export const useRoute = (pattern: string): [boolean, Record<string, string> | null] => {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useRoute must be used within a MemoryRouter');
  const match = matchPath(pattern, context.path);
  if (match) {
    return [true, match.params];
  }
  return [false, null];
};

export const useSearch = (): string => {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useSearch must be used within a MemoryRouter');
  return context.search;
};

export const useHistory = () => {
    const context = useContext(RouterContext);
    if (!context) throw new Error('useHistory must be used within a MemoryRouter');
    return {
        back: context.goBack,
    };
};

// Components
export const Switch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = useContext(RouterContext);
  if (!context) throw new Error('Switch must be used within a MemoryRouter');

  const childrenArray = React.Children.toArray(children) as React.ReactElement[];

  for (const child of childrenArray) {
    if (React.isValidElement(child) && child.props.path) {
        const match = matchPath(child.props.path, context.path);
        if (match) {
            const Component = child.props.component;
            return <Component params={match.params} />;
        }
    }
  }
  return null;
};

// Route component is just a configuration holder for Switch
export const Route: React.FC<{ path: string; component: React.ComponentType<{ params?: Record<string, string> }> }> = () => null;


export const Link: React.FC<{ to?: string; href?: string; children: React.ReactNode; className?: string }> = ({ to, href, children, className }) => {
  const context = useContext(RouterContext);
  if (!context) throw new Error('Link must be used within a MemoryRouter');
  
  const target = to || href;
  if (!target) {
    return <span className={className} role="button" tabIndex={0}>{children}</span>;
  }
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    context.navigate(target);
  };
  
  return <a href={target} onClick={handleClick} className={className}>{children}</a>;
};
