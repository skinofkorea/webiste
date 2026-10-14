import { useEffect, useState } from 'react';
import { loadMiikoreanStorefront, MiikoreanStorefrontData } from '../data/miikoreanStorefront';

export function useMiikoreanStorefront() {
  const [storefront, setStorefront] = useState<MiikoreanStorefrontData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadMiikoreanStorefront()
      .then((data) => {
        if (active) setStorefront(data);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'The Miikorean catalog could not be loaded.');
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
