'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

// Create refresh context
interface RefreshContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const RefreshContext = createContext<RefreshContextType>({
  refreshTrigger: 0,
  triggerRefresh: () => {},
});

export const useRefresh = () => useContext(RefreshContext);

interface RefreshProviderProps {
  children: ReactNode;
}

export const RefreshProvider = ({ children }: RefreshProviderProps) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <RefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
}; 