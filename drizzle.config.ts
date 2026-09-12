import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const host = process.env.DB_HOST || '127.0.0.1';
const port = process.env.DB_PORT || '3306';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'backend_ats';

// Membuat URL koneksi MySQL
const dbUrl = `mysql://${user}:${password}@${host}:${port}/${database}`;

export default defineConfig({
  schema: './src/config/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
    url: dbUrl,
  },
});