import { useState, useEffect } from 'react';

interface Location {
  pathname: string;
  navigate: (path: string, replace?: boolean) => void;
}

export function useLocation(): Location {
  const [pathname, setPathname] = useState(window.location.pathname);

  const navigate = (path: string, replace = false) => {
    if (path === pathname) return;
    
    if (replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
    
    setPathname(path);
    // Dispatch a custom event to notify about the navigation
    window.dispatchEvent(new CustomEvent('locationchange', { detail: path }));
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('locationchange', handleLocationChange);
    
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return { pathname, navigate };
}