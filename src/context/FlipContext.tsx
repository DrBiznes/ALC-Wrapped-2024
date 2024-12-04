import { createContext, useContext, useState } from 'react';

interface FlipContextType {
  isFlipped: boolean;
  isGlobalFlip: boolean;
  toggleFlip: (isGlobal?: boolean) => void;
  individualFlips: { [key: string]: boolean };
  toggleIndividualFlip: (id: string) => void;
}

const FlipContext = createContext<FlipContextType | undefined>(undefined);

export function FlipProvider({ children }: { children: React.ReactNode }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGlobalFlip, setIsGlobalFlip] = useState(false);
  const [individualFlips, setIndividualFlips] = useState<{ [key: string]: boolean }>({});

  const toggleFlip = (isGlobal: boolean = false) => {
    if (isGlobal) {
      setIsGlobalFlip(true);
      setIsFlipped(prev => !prev);
      setIndividualFlips({});
    } else {
      setIsGlobalFlip(false);
    }
  };

  const toggleIndividualFlip = (id: string) => {
    setIndividualFlips(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <FlipContext.Provider value={{ 
      isFlipped, 
      isGlobalFlip, 
      toggleFlip, 
      individualFlips,
      toggleIndividualFlip 
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