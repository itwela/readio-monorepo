import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { tokenCache } from '@/lib/auth';
import { useLotusUtils } from './lotusUtilsContext';
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react"; // Import Convex's useQuery hook
import { Redirect } from "expo-router";

interface LotusAuthContextType {
    lotusToken?: string;
    setLotusToken?: (value: string) => void;
    initialAuthEmail?: string;
    setInitialAuthEmail?: (value: string) => void;
    token?: string;
    setToken?: (value: string) => void;
    userId?: string;
    setUserId?: (value: string) => void;
    isAuthenticated?: boolean;
    isLoading?: boolean;
}

const LotusAuthContext = createContext<LotusAuthContextType | null>(null);

export const LotusAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [initialAuthEmail, setInitialAuthEmail] = useState<string>('');
    const [lotusToken, setLotusToken] = useState<string>('');
    const { masterDebugMode } = useLotusUtils()
    const [token, setToken] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    // Use useQuery at the top level - it will only run when token exists
    const user = useQuery(
        api.users.getUserByJWT, 
        token ? { jwt: token } : "skip"
    );

    // Fetch token on mount
    useEffect(() => {
        const fetchToken = async () => {
            try {
                const storedToken = await tokenCache.getToken(
                    masterDebugMode ? 'DebuglotusJWTAlwaysGrowingToken' : 'lotusJWTAlwaysGrowingToken'
                );
                
                if (storedToken) {
                    console.log('✅ Token found:', storedToken);
                    setToken(storedToken);
                } else {
                    console.log('❌ No token found');
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('❌ Error fetching token:', error);
                setIsLoading(false);
            }
        };

        fetchToken();
    }, [masterDebugMode]);

    // Update userId when user data is fetched
    useEffect(() => {
        if (user?.user_db_id) {
            console.log('✅ User ID found:', user.user_db_id);
            setUserId(user.user_db_id);
            setIsLoading(false);
        } else if (token && user === null) {
            // Token exists but no user found - invalid token
            console.log('❌ Invalid token - no user found');
            setToken('');
            setIsLoading(false);
        }
    }, [user, token]);

    const isAuthenticated = !!(token && userId);

    return (
        <LotusAuthContext.Provider value={{
            initialAuthEmail,
            setInitialAuthEmail,
            lotusToken,
            setLotusToken,
            token,
            setToken,
            userId,
            setUserId,
            isAuthenticated,
            isLoading,
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