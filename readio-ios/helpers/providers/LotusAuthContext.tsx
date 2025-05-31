import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { tokenCache } from '@/lib/auth';
import { useLotusUtils } from './lotusUtilsContext';
import { api } from "@/convex/_generated/api";
import { useConvex, useMutation } from "convex/react"; // Import useConvex for manual queries
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
    user?: any;
    logout?: () => Promise<void>;
    setUser?: (value: any) => void;
    authenticateUser?: (jwt: string) => Promise<{ success: boolean; error?: string }>;
    fetchUser?: (jwt: string) => Promise<{ success: boolean; user?: any; error?: string }>;
}

const LotusAuthContext = createContext<LotusAuthContextType | null>(null);

export const LotusAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [initialAuthEmail, setInitialAuthEmail] = useState<string>('');
    const [lotusToken, setLotusToken] = useState<string>('');
    const { masterDebugMode } = useLotusUtils()
    const [token, setToken] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const convex = useConvex();

    // Keep user state here - no more automatic queries
    const [user, setUser] = useState<any>(null);
    
    const fetchUser = async (jwt: string) => {
        if (!jwt || typeof jwt !== 'string') {
            console.log('❌ Invalid JWT provided to fetchUser');
            setUser(null);
            setUserId('');
            setIsLoading(false);
            return { success: false, error: 'Invalid JWT' };
        }

        console.log('🔍 Manual fetch user with JWT:', jwt);
        setIsLoading(true);
        
        try {
            // Safety check for convex client
            if (!convex || typeof convex.query !== 'function') {
                console.error('❌ Convex client not available');
                setUser(null);
                setUserId('');
                setIsLoading(false);
                return { success: false, error: 'Convex client not available' };
            }

            // Use convex client directly to call the getUserByJWT query
            const result = await convex.query(api.users.getUserByJWT, { jwt });
            
            if (result && typeof result === 'object') {
                console.log('✅ Manual fetch successful, setting user:', result.user_db_id);
                setUser(result);
                setUserId(result.user_db_id || '');
                setIsLoading(false);
                return { success: true, user: result };
            } else {
                console.log('❌ Manual fetch failed: User not found');
                setUser(null);
                setUserId('');
                setIsLoading(false);
                return { success: false, error: 'User not found' };
            }
        } catch (error) {
            console.error('❌ Error in manual fetch:', error);
            setUser(null);
            setUserId('');
            setIsLoading(false);
            return { success: false, error: 'Fetch failed' };
        }
    };

    // Fetch token on mount and authenticate manually
    useEffect(() => {
        const fetchToken = async () => {
            try {
                const storedToken = await tokenCache.getToken(
                    masterDebugMode ? 'DebuglotusJWTAlwaysGrowingToken' : 'lotusJWTAlwaysGrowingToken'
                );
                
                if (storedToken) {
                    console.log('✅ Token found on mount:', storedToken);
                    await authenticateUser(storedToken);
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

    // Logout function - completely clear everything
    const logout = async () => {
        console.log('🚪 Logging out - clearing all data...');
        
        try {
            setIsLoading(true);

            // Clear local state first
            console.log('🔄 Clearing local state...');
            setToken('');
            setUserId('');
            setUser(null);
            setLotusToken('');
            setInitialAuthEmail('');
            
            // Clear tokens from SecureStore with additional safety
            try {
                if (tokenCache && typeof tokenCache.clearToken === 'function') {
                    const tokenKey = masterDebugMode ? 'DebuglotusJWTAlwaysGrowingToken' : 'lotusJWTAlwaysGrowingToken';
                    console.log('🔄 Clearing token from SecureStore:', tokenKey);
                    await tokenCache.clearToken(tokenKey);
                    console.log('✅ Token cleared from SecureStore');
                } else {
                    console.warn('⚠️ tokenCache.clearToken is not available');
                }
            } catch (secureStoreError) {
                console.error('❌ Error clearing token from SecureStore:', secureStoreError);
                // Don't throw - continue with logout even if SecureStore fails
            }
            
            setIsLoading(false);
            console.log('✅ Logout complete - all data cleared');
            
        } catch (error) {
            console.error('❌ Critical error during logout:', error);
            // Ensure we always clear loading state
            setIsLoading(false);
            // Even if logout fails, clear local state
            setToken('');
            setUserId('');
            setUser(null);
            setLotusToken('');
            setInitialAuthEmail('');
        }
    };

    const isAuthenticated = !!(token && userId);

    // Authentication function - pure manual approach
    const authenticateUser = async (jwt: string) => {
        console.log('🔐 Starting pure manual authentication');
        setIsLoading(true);
        setToken(jwt);

        // Directly fetch user data
        const result = await fetchUser(jwt);

        if (result.success) {
            console.log('✅ Authentication successful!');
            setIsLoading(false);
            return { success: true };
        } else {
            console.log('❌ Authentication failed:', result.error);
            setToken(''); // Clear invalid token
            setIsLoading(false);
            return { success: false, error: result.error };
        }
    };

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
            user,
            setUser,
            isAuthenticated,
            isLoading,
            logout,
            authenticateUser,
            fetchUser,
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