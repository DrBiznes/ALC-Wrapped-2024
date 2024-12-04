import { createContext, useContext, useState, useCallback } from 'react';

interface FlipContextType {
  isGlobalFlipped: boolean;
  toggleGlobalFlip: () => void;
  individualFlips: { [key: string]: boolean };
  setIndividualFlip: (id: string, flipped: boolean) => void;
}

const FlipContext = createContext<FlipContextType | undefined>(undefined);

export function FlipProvider({ children }: { children: React.ReactNode }) {
  const [isGlobalFlipped, setIsGlobalFlipped] = useState(false);
  const [individualFlips, setIndividualFlips] = useState<Record<string, boolean>>({});

  const toggleGlobalFlip = useCallback(() => {
    setIsGlobalFlipped(prev => !prev);
    setIndividualFlips({});
  }, []);

  const setIndividualFlip = useCallback((id: string, flipped: boolean) => {
    setIndividualFlips(prev => ({
      ...prev,
      [id]: flipped
    }));
  }, []);

  return (
    <FlipContext.Provider value={{ 
      isGlobalFlipped, 
      toggleGlobalFlip, 
      individualFlips,
      setIndividualFlip
    }}>
      {children}
    </FlipContext.Provider>
  );
}

export function useFlip() {
  const context = useContext(FlipContext);
  if (context === undefined) {
    throw new Error('useFlip must be used within a FlipProvider');
  }
  return context;
} 