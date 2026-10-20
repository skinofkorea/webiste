import { useEffect, useState } from 'react';
import { loadStorefront, StorefrontData } from '../data/storefront';

export function useStorefront() {
  const [storefront, setStorefront] = useState<StorefrontData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadStorefront()
      .then((data) => {
        if (active) setStorefront(data);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'The Skin of Korea catalog could not be loaded.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    storefront,
    isLoading: !storefront && !error,
    error,
  };
}

export default useStorefront;
