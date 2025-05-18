import React, { createContext, useState, useContext, ReactNode } from 'react';

interface UpdateErrorContextType {
  updateError: string | null;
  setUpdateError: (error: string | null) => void;
}

const UpdateErrorContext = createContext<UpdateErrorContextType | undefined>(undefined);

export const UpdateErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [updateError, setUpdateError] = useState<string | null>(null);

  return (
    <UpdateErrorContext.Provider value={{ updateError, setUpdateError }}>
      {children}
    </UpdateErrorContext.Provider>
  );
};

export const useUpdateError = (): UpdateErrorContextType => {
  const context = useContext(UpdateErrorContext);
  if (context === undefined) {
    throw new Error('useUpdateError must be used within an UpdateErrorProvider');
  }
  return context;
}; 