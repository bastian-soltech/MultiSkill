'use client';

import { useEffect } from 'react';

export default function AOSInit() {
  useEffect(() => {
    // We check if AOS is defined (loaded from CDN)
    const initAOS = () => {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.AOS) {
        // @ts-ignore
        window.AOS.init({
          duration: 1000,
          once: true,
          easing: 'ease-out-quad',
        });
      } else {
        // If not loaded yet, wait a bit and try again
        setTimeout(initAOS, 100);
      }
    };

    initAOS();
  }, []);

  return null;
}
