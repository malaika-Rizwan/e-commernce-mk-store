/**
 * Set a user's role to admin by email.
 * Usage: npx tsx scripts/makeAdmin.ts user@example.com
 * Requires: MONGODB_URI in .env.local (or .env)
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function loadEnvFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
          value = value.slice(1, -1).replace(/\\n/g, '\n');
        process.env[key] = value;
      }
    }
  } catch {
    // ignore
  }
}
loadEnvFile(path.join(root, '.env.local'));
loadEnvFile(path.join(root, '.env'));

async function main() {
  const email = process.argv[2]?.trim()?.toLowerCase();
  if (!email) {
    console.error('Usage: npx tsx scripts/makeAdmin.ts <email>');
    console.error('Example: npx tsx scripts/makeAdmin.ts admin@example.com');
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI. Set it in .env.local or environment.');
    process.exit(1);
  }

  const mongoose = await import('mongoose');
  const { default: connectDB } = await import('../lib/db');
  const { default: User } = await import('../models/User');

  try {
    await connectDB();
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );
    if (!user) {
      console.error(`No user found with email: ${email}`);
      console.error('Register first at /register, then run this script again.');
      process.exit(1);
    }
    console.log(`Done. "${user.name}" (${user.email}) is now an admin.`);
    console.log('Log in at /login to access the Admin Panel at /admin.');
  } finally {
    await mongoose.default.connection.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
