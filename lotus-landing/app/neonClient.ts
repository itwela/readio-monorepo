import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_DATABASE_URL: process.env.DATABASE_URL;

const sql = neon(databaseUrl || '');

export default sql;