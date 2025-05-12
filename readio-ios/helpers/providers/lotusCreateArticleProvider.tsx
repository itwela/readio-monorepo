
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LotusCreateArticleContextType {
    
}

const LotusCreateArticleContext = createContext<LotusCreateArticleContextType | null>(null);

export const LotusCreateArticleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    return (
        <LotusCreateArticleContext.Provider value={{     
            
           }}>
          {children}
        </LotusCreateArticleContext.Provider>
      );
}

export const useLotusCreateArticle = (match?: string) => {
    const context = useContext(LotusCreateArticleContext);
    if (!context) throw new Error('useLotusCreateArticle must be used within a LotusCreateArticleProvider');
    return context;
};