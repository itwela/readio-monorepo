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

    // Logout function - completely clear everything with robust error handling
    const logout = async () => {
        console.log('🚪 Logging out - clearing all data...');
        
        // Always clear local state immediately, regardless of other operations
        const clearLocalState = () => {
            try {
                setToken('');
                setUserId('');
                setUser(null);
                setLotusToken('');
                setInitialAuthEmail('');
                console.log('✅ Local state cleared');
            } catch (error) {
                console.error('❌ Error clearing local state (non-critical):', error);
                // Don't throw - this is just state clearing
            }
        };

        try {
            // Set loading but don't crash if it fails
            try {
                setIsLoading(true);
            } catch (loadingError) {
                console.warn('⚠️ Could not set loading state:', loadingError);
            }

            // Clear local state first - this should never fail
            clearLocalState();
            
            // Attempt to clear tokens from SecureStore with maximum safety
            try {
                if (tokenCache && typeof tokenCache.clearToken === 'function') {
                    const tokenKey = masterDebugMode ? 'DebuglotusJWTAlwaysGrowingToken' : 'lotusJWTAlwaysGrowingToken';
                    console.log('🔄 Attempting to clear token from SecureStore:', tokenKey);
                    
                    // Wrap in timeout to prevent hanging
                    const clearTokenPromise = tokenCache.clearToken(tokenKey);
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Token clear timeout')), 5000)
                    );
                    
                    await Promise.race([clearTokenPromise, timeoutPromise]);
                    console.log('✅ Token cleared from SecureStore');
                } else {
                    console.warn('⚠️ tokenCache.clearToken is not available - skipping');
                }
            } catch (secureStoreError) {
                console.error('❌ Error clearing token from SecureStore (non-critical):', secureStoreError);
                // This is non-critical - continue with logout
            }
            
        } catch (error) {
            console.error('❌ Error during logout process (handled):', error);
            // Ensure local state is cleared even if other operations fail
            clearLocalState();
        } finally {
            // Always clear loading state and ensure logout completes
            try {
                setIsLoading(false);
                console.log('✅ Logout process completed');
            } catch (finalError) {
                console.error('❌ Error in logout finally block (ignored):', finalError);
                // Don't throw even here - just log
            }
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