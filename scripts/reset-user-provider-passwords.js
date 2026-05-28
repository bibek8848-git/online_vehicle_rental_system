const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  return fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return acc;
      const [key, ...rest] = trimmed.split('=');
      acc[key] = rest.join('=').trim();
      return acc;
    }, {});
}

(async () => {
  try {
    const env = loadEnv(path.resolve(__dirname, '..', '.env'));
    const connectionString = env.DATABASE_URL || process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in .env or environment');
    }

    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

    const password = '12345678';
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE role IN ('USER', 'PROVIDER')"
      , [hashedPassword]
    );

    console.log(`Updated ${result.rowCount} user/provider account(s) with password '${password}'.`);
    await pool.end();
  } catch (error) {
    console.error('Failed to reset passwords:', error);
    process.exit(1);
  }
})();
