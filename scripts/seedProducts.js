/**
 * Runs the TypeScript seed script. Use: node scripts/seedProducts.js
 * Requires: npm install (tsx and dotenv). Or run: npm run seed
 */
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { execSync } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'seedProducts.ts');
try {
  execSync(`npx tsx "${scriptPath}"`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
} catch {
  process.exit(1);
}
