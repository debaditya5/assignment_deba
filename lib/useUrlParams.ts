"use client";

import { useState, useEffect } from 'react';

export function useUrlParams() {
  const [params, setParams] = useState<URLSearchParams>(new URLSearchParams());

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setParams(urlParams);
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
  };

  return { get, set };
}
