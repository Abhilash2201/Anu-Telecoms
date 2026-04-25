import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Check both the project root and src/ so the server works whether started from
// the repo root or from within the server/ directory.
const envFiles = [path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), 'src', '.env')];

for (const envFile of envFiles) {
  if (fs.existsSync(envFile)) {
    // override: false means variables already set in the process environment
    // (e.g. injected by Render/Vercel) are never overwritten by the .env file.
    dotenv.config({ path: envFile, override: false });
  }
}
