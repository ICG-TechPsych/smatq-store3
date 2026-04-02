// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// .env is in backend/ folder (one level up from src/)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export default {};
