import { neon } from '@neondatabase/serverless';
import Constants from 'expo-constants';

// Validate that all dummy parts exist
if ( !Constants.expoConfig?.extra?.DATABASE_URL_1 || !Constants.expoConfig?.extra?.DATABASE_URL_2 ) {
    throw new Error("Database credentials not found in expo config");
}

// Extract dummy parts and salt from Expo config
const extra = Constants.expoConfig.extra;

const dbUrlParts = [
    extra.DATABASE_URL_1,
    extra.DATABASE_URL_2,
];

const reconstructKey = (parts: string[]) => parts.join("");

const databaseUrl = reconstructKey(dbUrlParts);

const sql = neon(databaseUrl);

export default sql
