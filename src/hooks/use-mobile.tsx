import { useState, useEffect } from 'react';

export const useMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Vérification initiale
    checkMobile();

    // Écouter les changements de taille d'écran
    window.addEventListener('resize', checkMobile);

    // Nettoyage
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
};