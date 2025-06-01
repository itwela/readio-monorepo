import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// Remove useQuery import and add ConvexHttpClient
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import * as SecureStore from 'expo-secure-store';
// Import API clients
import { GoogleGenerativeAI } from "@google/generative-ai";
import { S3 } from '@aws-sdk/client-s3';
import OpenAI from 'openai';
import { createClient } from 'pexels';
import Replicate from "replicate";
import {
  systemPromptPexalQuery, systemPromptForArticleGeneration, systemPromptForArticleTitle,
  systemPromptAdmin, systemPromptChooseCategory, systemPromptReplicateImageQuery,
  systemPromptImageFormatter, systemPromptNSFW
} from "../../constants/tokens";

// Define the type for our environment variables
interface EnvVariables {
  EXPO_PUBLIC_CLERK_KEY_DEV: string | null;
  EXPO_PUBLIC_CLERK_KEY_PROD: string | null;
  EXPO_PUBLIC_AWS_SDK_LOAD_CONFIG: string | null;
  EXPO_PUBLIC_AWS_ACCESS_KEY_ID: string | null;
  EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY: string | null;
  EXPO_PUBLIC_SALT: string | null;
  EXPO_PUBLIC_DATABASE_URL: string | null;
  EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY: string | null;
  EXPO_PUBLIC_OPENAI_API_KEY: string | null;
  EXPO_PUBLIC_PEXALS_API_KEY: string | null;
  EXPO_PUBLIC_REPLICATE_API_TOKEN: string | null;
  EXPO_PUBLIC_UNSPLASH_ACESSS_KEY: string | null;
  EXPO_PUBLIC_UNSPLASH_SECRET_KEY: string | null;
  EXPO_PUBLIC_ELEVENLABS_API_KEY: string | null;
  EXPO_PUBLIC_REVENUECAT_API_KEY_APPLE: string | null;
  EXPO_PUBLIC_APPSFLYER_API_KEY: string | null;
  EXPO_PUBLIC_debugModeAdminTriggerEmail: string | null;
  EXPO_PUBLIC_debugTriggerAdminModePass: string | null;
  EXPO_PUBLIC_debugModeNormieTriggerEmail: string | null;
  EXPO_PUBLIC_debugModeNormieTriggerPass: string | null;
}

// Client interfaces
export interface ApiClients {
  // Gemini/Google AI
  genAI: GoogleGenerativeAI | null;
  geminiTest: any;
  geminiTitle: any;
  geminiCategory: any;
  geminiArticle: any;
  geminiPexals: any;
  geminiNSFW: any;
  geminiReplicate: any;
  geminiImageFormatter: any;
  geminiAdmin: any;

  // OpenAI
  openAIClient: OpenAI | null;

  // AWS S3
  s3Client: S3 | null;

  // Pexels
  pexelsClient: any;

  // Replicate
  replicateClient: any;

  // Add other clients here
}

// Define the context type
interface LotusEnvContextType {
  envVariables: EnvVariables;
  isLoading: boolean;
  clients: ApiClients;
  refresh: () => Promise<void>;
  getEnv: (key: keyof EnvVariables) => string | null;
}

// Create empty initial state
const initialEnvState: EnvVariables = {
  EXPO_PUBLIC_CLERK_KEY_DEV: null,
  EXPO_PUBLIC_CLERK_KEY_PROD: null,
  EXPO_PUBLIC_AWS_SDK_LOAD_CONFIG: null,
  EXPO_PUBLIC_AWS_ACCESS_KEY_ID: null,
  EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY: null,
  EXPO_PUBLIC_SALT: null,
  EXPO_PUBLIC_DATABASE_URL: null,
  EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY: null,
  EXPO_PUBLIC_OPENAI_API_KEY: null,
  EXPO_PUBLIC_PEXALS_API_KEY: null,
  EXPO_PUBLIC_REPLICATE_API_TOKEN: null,
  EXPO_PUBLIC_UNSPLASH_ACESSS_KEY: null,
  EXPO_PUBLIC_UNSPLASH_SECRET_KEY: null,
  EXPO_PUBLIC_ELEVENLABS_API_KEY: null,
  EXPO_PUBLIC_REVENUECAT_API_KEY_APPLE: null,
  EXPO_PUBLIC_APPSFLYER_API_KEY: null,
  EXPO_PUBLIC_debugModeAdminTriggerEmail: null,
  EXPO_PUBLIC_debugTriggerAdminModePass: null,
  EXPO_PUBLIC_debugModeNormieTriggerEmail: null,
  EXPO_PUBLIC_debugModeNormieTriggerPass: null,
};

// Initialize empty clients
const initialApiClients: ApiClients = {
  genAI: null,
  geminiTest: null,
  geminiTitle: null,
  geminiCategory: null,
  geminiArticle: null,
  geminiPexals: null,
  geminiNSFW: null,
  geminiReplicate: null,
  geminiImageFormatter: null,
  geminiAdmin: null,
  openAIClient: null,
  s3Client: null,
  pexelsClient: null,
  replicateClient: null,
};

// Create the context
const LotusEnvContext = createContext<LotusEnvContextType>({
  envVariables: initialEnvState,
  isLoading: true,
  clients: initialApiClients,
  refresh: async () => { },
  getEnv: () => null,
});

// Create the provider component
export const LotusEnvProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [envVariables, setEnvVariables] = useState<EnvVariables>(initialEnvState);
  const [clients, setClients] = useState<ApiClients>(initialApiClients);
  const [isLoading, setIsLoading] = useState(true);

  const convexClient = new ConvexHttpClient('https://brainy-kingfisher-980.convex.cloud');
  const loadFromSecureStore = async () => {
    const results: Partial<EnvVariables> = {};
    let foundAny = false;

    // Try to load each key from SecureStore
    for (const key of Object.keys(initialEnvState) as Array<keyof EnvVariables>) {
      try {
        const value = await SecureStore.getItemAsync(`ENV_${key}`);
        if (value) {
          results[key] = value;
          foundAny = true;
        }
      } catch (error) {
        // console.warn(`Error loading ${key} from SecureStore:`, error);
      }
    }

    if (foundAny) {
      return results;
    }
    return null;
  };

  // Function to save environment variables to SecureStore
  const saveToSecureStore = async (variables: EnvVariables) => {
    for (const [key, value] of Object.entries(variables)) {
      if (value) {
        try {
          await SecureStore.setItemAsync(`ENV_${key}`, value);
        } catch (error) {
          // console.warn(`Error saving ${key} to SecureStore:`, error);
        }
      }
    }
  };

  // Initialize all clients with the loaded environment variables
  const initializeClients = (env: EnvVariables) => {
    // try {
    //   const newClients: ApiClients = { ...initialApiClients };

    //   // Initialize Google AI/Gemini
    //   if (env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY) {
    //     const genAI = new GoogleGenerativeAI(env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY);

    //     newClients.genAI = genAI;
    //     newClients.geminiTest = genAI.getGenerativeModel({
    //       model: "gemini-1.5-flash-8b",
    //       systemInstruction: `Im just testing if you are overloaded. Respond with the word "Hello" and Hello only, if you are there.`
    //     });

    //     newClients.geminiTitle = genAI.getGenerativeModel({
    //       model: "gemini-1.5-flash-8b",
    //       systemInstruction: systemPromptForArticleTitle
    //     });

    //     newClients.geminiCategory = genAI.getGenerativeModel({
    //       model: "gemini-1.5-flash-8b",
    //       systemInstruction: systemPromptChooseCategory
    //     });

    //     newClients.geminiArticle = genAI.getGenerativeModel({
    //       model: "gemini-1.5-flash-8b",
    //       systemInstruction: systemPromptForArticleGeneration
    //     });

    //     newClients.geminiPexals = genAI.getGenerativeModel({
    //       model: "gemini-1.5-flash-8b",
    //       systemInstruction: systemPromptPexalQuery
    //     });

    //     newClients.geminiNSFW = genAI.getGenerativeModel({
    //       model: "gemini-1.5-flash-8b",
    //       systemInstruction: systemPromptNSFW
    //     });

    //     newClients.geminiReplicate = genAI.getGenerativeModel({
    //       model: "gemini-1.5-flash-8b",
    //       systemInstruction: systemPromptReplicateImageQuery
    //     });

    //     newClients.geminiImageFormatter = genAI.getGenerativeModel({
    //       model: "gemini-1.5-flash-8b",
    //       systemInstruction: systemPromptImageFormatter
    //     });

    //     newClients.geminiAdmin = genAI.getGenerativeModel({
    //       model: "gemini-1.5-flash-8b",
    //       systemInstruction: systemPromptAdmin
    //     });

    //     console.log("Initialized Google AI/Gemini client");
    //   }

    //   // Initialize OpenAI
    //   if (env.EXPO_PUBLIC_OPENAI_API_KEY) {
    //     newClients.openAIClient = new OpenAI({
    //       apiKey: env.EXPO_PUBLIC_OPENAI_API_KEY,
    //     });
    //     console.log("Initialized OpenAI client");
    //   }

    //   // Initialize S3
    //   if (env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID && env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY) {
    //     newClients.s3Client = new S3({
    //       region: 'us-east-2',
    //       credentials: {
    //         accessKeyId: env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID,
    //         secretAccessKey: env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY,
    //       },
    //     });
    //   }

    //   // Initialize Pexels
    //   if (env.EXPO_PUBLIC_PEXALS_API_KEY) {
    //     newClients.pexelsClient = createClient(env.EXPO_PUBLIC_PEXALS_API_KEY);
    //   }

    //   if (env.EXPO_PUBLIC_REPLICATE_API_TOKEN) {
    //     newClients.replicateClient = new Replicate({ auth: env.EXPO_PUBLIC_REPLICATE_API_TOKEN });
    //   }

    //   setClients(newClients);
    // } catch (error) {
    //   console.error("Error initializing API clients:", error);
    // }
  };

  // Function to refresh environment variables
  const refresh = async () => {
    setIsLoading(true);

    try {
      // Load from both sources in parallel
      const [databaseVariables, secureStoreVariables] = await Promise.all([
        loadFromDatabase(),
        loadFromSecureStore()
      ]);

      let finalVariables = secureStoreVariables || {};
      let needsUpdate = false;

      // If we have database variables, compare with SecureStore
      if (databaseVariables) {
        // Compare each key to see if they differ
        for (const [key, dbValue] of Object.entries(databaseVariables)) {
          const storeValue = secureStoreVariables?.[key as keyof EnvVariables];
          
          if (dbValue !== storeValue) {
            console.log(`Environment variable differs between DB and SecureStore, updating...`);
            finalVariables[key as keyof EnvVariables] = dbValue;
            needsUpdate = true;
          }
        }

        // If there are differences, update SecureStore
        if (needsUpdate) {
          console.log('Updating SecureStore with latest database values...');
          await saveToSecureStore(finalVariables as EnvVariables);
        } else {
          console.log('SecureStore is up to date with database values');
        }
      } else if (!secureStoreVariables) {
        // Neither source has data, use empty state
        console.log('No environment variables found in database or SecureStore');
        finalVariables = {};
      }

      // Always use the final variables (from SecureStore after potential update)
      setEnvVariables(prev => {
        const updatedVars = { ...prev, ...finalVariables };
        initializeClients(updatedVars);
        return updatedVars;
      });

    } catch (error) {
      console.error('Error refreshing environment variables:', error);
      
      // Fallback to SecureStore only if database fails
      try {
        const cachedVariables = await loadFromSecureStore();
        if (cachedVariables) {
          setEnvVariables(prev => {
            const updatedVars = { ...prev, ...cachedVariables };
            initializeClients(updatedVars);
            return updatedVars;
          });
        }
      } catch (fallbackError) {
        console.error('Fallback to SecureStore also failed:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 MANUAL LOADING: Load from database using ConvexHttpClient - now returns the variables instead of setting state
  const loadFromDatabase = async (): Promise<Partial<EnvVariables> | null> => {
    try {
      const envVariablesFromDB = await convexClient.query(api.envVariables.getEnvVariables);

      if (envVariablesFromDB && envVariablesFromDB.length > 0) {
        const newEnv: Partial<EnvVariables> = {};
        envVariablesFromDB.forEach((row: { key: string, value: string }) => {
          const key = row.key as keyof EnvVariables;
          if (key in initialEnvState) {
            newEnv[key] = row.value;
          }
        });

        return newEnv;
      }

      return null;
    } catch (error) {
      console.warn('Error loading from database:', error);
      return null;
    }
  };

  // Get a specific environment variable
  const getEnv = (key: keyof EnvVariables): string | null => {
    return envVariables[key];
  };

  // Load variables when the component mounts
  useEffect(() => {
    refresh();
  }, []);

  return (
    <LotusEnvContext.Provider
      value={{
        envVariables,
        isLoading,
        clients,
        refresh,
        getEnv,
      }}
    >
      {children}
    </LotusEnvContext.Provider>
  );
};

// Create the hook for using the context
export const useLotusEnv = () => {
  const context = useContext(LotusEnvContext);
  if (!context) {
    throw new Error('useLotusEnv must be used within a LotusEnvProvider');
  }
  return context;
};
