import React from 'react';

interface GlobalLoadingOverlayProps {
  forcedLoading?: boolean;
}

export const useGlobalIsLoading = () => false;

const GlobalLoadingOverlay: React.FC<GlobalLoadingOverlayProps> = () => {
  return null;
};

export default GlobalLoadingOverlay;
