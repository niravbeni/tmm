'use client';

import { useState, useLayoutEffect } from 'react';

export function MobileDetector({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // useLayoutEffect runs synchronously after all DOM mutations
  // This ensures we detect mobile before the first paint
  useLayoutEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (!isClient) {
    // Return null or a loading state during SSR
    return null;
  }
  
  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full p-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
          <rect x="4" y="3" width="16" height="16" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="19" x2="12" y2="21" />
        </svg>
        <h1 className="text-2xl font-bold mb-4 text-center">Desktop Only</h1>
        <p className="text-center mb-6">
          The results page is designed for desktop viewing only. Please use a larger screen to view game results.
        </p>
      </div>
    );
  }
  
  return <>{children}</>;
} 