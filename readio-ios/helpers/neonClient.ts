import { neon } from '@neondatabase/serverless';
import Constants from 'expo-constants';

// Validate that all dummy parts exist
// if ( !Constants.expoConfig?.extra?.DATABASE_URL_1 || !Constants.expoConfig?.extra?.DATABASE_URL_2 ) {
//     throw new Error("Database credentials not found in expo config");
// }

// Extract dummy parts and salt from Expo config
// const extra = Constants.expoConfig.extra;

// const dbUrlParts = [
//     extra.DATABASE_URL_1,
//     extra.DATABASE_URL_2,
// ];

// const reconstructKey = (parts: string[]) => parts.join("");

const CONNECTION_STRING = "postgresql://readiodb_owner:seG3E2cFOSxL@ep-hidden-sunset-a5pin5y4.us-east-2.aws.neon.tech/readiodb?sslmode=require";

// const sql = neon(`${}`);
const sql = neon(CONNECTION_STRING);

export default sql
