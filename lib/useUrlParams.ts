"use client";

import { useState, useEffect } from 'react';

// Custom event for URL parameter changes
const URL_CHANGE_EVENT = 'urlParamsChange';

export function useUrlParams() {
  const [params, setParams] = useState<URLSearchParams>(new URLSearchParams());

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setParams(urlParams);
    }
  }, []);

  // Listen for URL changes (both programmatic and browser navigation)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleUrlChange = () => {
        const urlParams = new URLSearchParams(window.location.search);
        setParams(urlParams);
      };

      // Listen for custom URL change events
      window.addEventListener(URL_CHANGE_EVENT, handleUrlChange);
      // Listen for browser back/forward navigation
      window.addEventListener('popstate', handleUrlChange);
      
      return () => {
        window.removeEventListener(URL_CHANGE_EVENT, handleUrlChange);
        window.removeEventListener('popstate', handleUrlChange);
      };
    }
  }, []);

  const get = (key: string, defaultValue?: string) => {
    return params.get(key) || defaultValue || '';
  };

  const set = (key: string, value: string) => {
    const newParams = new URLSearchParams(params);
    newParams.set(key, value);
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    window.history.pushState({}, '', newUrl);
    setParams(newParams);
    
    // Dispatch custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(URL_CHANGE_EVENT));
    }
  };

  return { get, set };
}
