import { createContext, useContext, useState } from 'react';

interface ColorContextType {
  colors: { [key: string]: string };
  setColor: (id: string, color: string) => void;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<{ [key: string]: string }>({});

  const setColor = (id: string, color: string) => {
    setColors(prev => ({
      ...prev,
      [id]: color
    }));
  };

  return (
    <ColorContext.Provider value={{ colors, setColor }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColors() {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('useColors must be used within a ColorProvider');
  }
  return context;
} 