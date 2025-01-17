
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Readio } from '@/types/type';

interface LotusGiantStepsContextType {
    walkingSelection?: string;
    setWalkingSelection?: (value: string) => void;
}

const LotusGiantStepsContext = createContext<LotusGiantStepsContextType | null>(null);

export const LotusGiantStepsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [walkingSelection, setWalkingSelection] = useState<string>('');
    
    return (
        <LotusGiantStepsContext.Provider value={{
            walkingSelection,
            setWalkingSelection
        }}>
          {children}
        </LotusGiantStepsContext.Provider>
      );
}

export const useLotusGiantSteps = (match?: string) => {
    const context = useContext(LotusGiantStepsContext);
    if (!context) throw new Error('useLotusGiantSteps must be used within a LotusGiantStepsProvider');
    return context;
};