
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Readio } from '@/types/type';

interface LotusAuthContextType {
    lotusToken?: string;
    setLotusToken?: (value: string) => void;
    initialAuthEmail?: string;
    setInitialAuthEmail?: (value: string) => void;
}

const LotusAuthContext = createContext<LotusAuthContextType | null>(null);

export const LotusAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [initialAuthEmail, setInitialAuthEmail] = useState<string>('');
    const [lotusToken, setLotusToken] = useState<string>('');

    return (
        <LotusAuthContext.Provider value={{
            initialAuthEmail,
            setInitialAuthEmail,
            lotusToken,
            setLotusToken,
        }}>
          {children}
        </LotusAuthContext.Provider>
      );
}

export const useLotusAuth = (match?: string) => {
    const context = useContext(LotusAuthContext);
    if (!context) throw new Error('useLotusAuth must be used within a LotusAuthProvider');
    return context;
};