#!/usr/bin/env node
/**
 * TradeBoard X — Login Debug Script
 * Run from the backend folder: node debug-login.js
 * Checks every known cause of "Login failed" without starting the server.
 */

const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function check(label, condition, fix) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.log(`  ❌  ${label}`);
    console.log(`       → FIX: ${fix}\n`);
    failed++;
  }
}

console.log('\n╔══════════════════════════════════════════════════════╗');
console.log('║      TradeBoard X — Login Debug Checker              ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

// ── 1. .env file ──────────────────────────────────────────────────────────────
console.log('1️⃣   .env file');
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);
check('.env file exists', envExists,
  `Create backend/.env — copy from .env.example and fill in values`);

if (envExists) {
  const raw = fs.readFileSync(envPath, 'utf8');
  const lines = raw.split('\n');
  const getValue = (key) => {
    const line = lines.find((l) => l.trim().startsWith(key + '='));
    if (!line) return null;
    return line.split('=').slice(1).join('=').trim();
  };

  const jwtSecret     = getValue('JWT_SECRET');
  const jwtRefresh    = getValue('JWT_REFRESH_SECRET');
  const mongoUri      = getValue('MONGODB_URI');
  const clientUrl     = getValue('CLIENT_URL');

  check('JWT_SECRET is defined',
    !!jwtSecret && jwtSecret !== '',
    'Add JWT_SECRET=your_random_32_char_string to backend/.env');

  check('JWT_SECRET has no surrounding quotes',
    !!jwtSecret && !jwtSecret.startsWith('"') && !jwtSecret.startsWith("'"),
    'Remove quotes: JWT_SECRET=mysecret  (not JWT_SECRET="mysecret")');

  check('JWT_SECRET is at least 32 characters',
    !!jwtSecret && jwtSecret.replace(/['"]/g, '').length >= 32,
    'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');

  check('JWT_REFRESH_SECRET is defined',
    !!jwtRefresh && jwtRefresh !== '',
    'Add JWT_REFRESH_SECRET=a_different_random_string to backend/.env');

  check('JWT_REFRESH_SECRET differs from JWT_SECRET',
    jwtSecret !== jwtRefresh,
    'Use TWO different secrets — one for access tokens, one for refresh tokens');

  check('MONGODB_URI is defined',
    !!mongoUri,
    'Add MONGODB_URI=mongodb://localhost:27017/tradeboard_x to backend/.env');

  check('CLIENT_URL is defined',
    !!clientUrl,
    'Add CLIENT_URL=http://localhost:3000 to backend/.env');

  // Check for spaces around = (common mistake)
  const badLines = lines.filter((l) => {
    if (!l.trim() || l.trim().startsWith('#')) return false;
    return /^[A-Z_]+ =/.test(l) || / = /.test(l);
  });
  check('No spaces around = in .env values',
    badLines.length === 0,
    `Remove spaces around = in these lines:\n         ${badLines.join('\n         ')}`);
}

// ── 2. server.js ──────────────────────────────────────────────────────────────
console.log('\n2️⃣   server.js');
const serverPath = path.join(process.cwd(), 'server.js');
if (fs.existsSync(serverPath)) {
  const content = fs.readFileSync(serverPath, 'utf8');
  const lines = content.split('\n');

  const dotenvIdx = lines.findIndex((l) =>
    /require\(['"]dotenv['"]\)\.config\(/.test(l) && !l.trim().startsWith('//')
  );
  check('dotenv is loaded in server.js',
    dotenvIdx !== -1,
    "Add require('dotenv').config() as the very first line of server.js");

  if (dotenvIdx !== -1) {
    const firstOtherRequire = lines.findIndex((l, i) =>
      i !== dotenvIdx &&
      /require\(/.test(l) &&
      !/dotenv/.test(l) &&
      !l.trim().startsWith('//')
    );
    check('dotenv is loaded BEFORE all other requires',
      dotenvIdx < firstOtherRequire || firstOtherRequire === -1,
      `Move require('dotenv').config() to line 1. Currently line ${dotenvIdx + 1}, but another require() is on line ${firstOtherRequire + 1}`);
  }

  check('CORS is configured with credentials:true',
    content.includes('credentials: true') || content.includes('credentials:true'),
    "CORS must include credentials: true for httpOnly cookies to work");
} else {
  check('server.js exists', false, `server.js not found in ${process.cwd()}`);
}

// ── 3. jwt.utils.js ───────────────────────────────────────────────────────────
console.log('\n3️⃣   utils/jwt.utils.js');
const jwtPath = path.join(process.cwd(), 'utils', 'jwt.utils.js');
if (fs.existsSync(jwtPath)) {
  const content = fs.readFileSync(jwtPath, 'utf8');
  const lines = content.split('\n');

  // Find top-level const reads of JWT_SECRET (the main bug)
  const topLevelBadLine = lines.findIndex((l, i) => {
    const trimmed = l.trim();
    return (
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*') &&
      /const\s+\w+\s*=\s*process\.env\.(JWT_SECRET|JWT_REFRESH_SECRET)/.test(trimmed) &&
      // Make sure it's at the top level (rough check: no leading spaces for indentation)
      !l.startsWith('  ') && !l.startsWith('\t\t')
    );
  });
  check('JWT secrets NOT captured at module load time (top level)',
    topLevelBadLine === -1,
    `Line ${topLevelBadLine + 1}: Move 'process.env.JWT_SECRET' inside the function body, not at the top of the file`);

  check('generateAccessToken exists',  content.includes('generateAccessToken'),
    'Add generateAccessToken function');
  check('generateRefreshToken exists', content.includes('generateRefreshToken'),
    'Add generateRefreshToken function');
  check('verifyAccessToken exists',    content.includes('verifyAccessToken'),
    'Add verifyAccessToken function');
} else {
  check('utils/jwt.utils.js exists', false, 'Create utils/jwt.utils.js');
}

// ── 4. node_modules ───────────────────────────────────────────────────────────
console.log('\n4️⃣   Dependencies');
const nmExists = fs.existsSync(path.join(process.cwd(), 'node_modules'));
check('node_modules exists (npm install was run)', nmExists, 'Run: npm install');

if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
  const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  ['dotenv', 'jsonwebtoken', 'bcryptjs', 'mongoose', 'express', 'cors', 'cookie-parser', 'uuid'].forEach((dep) => {
    check(`${dep} in package.json`, !!deps[dep], `Run: npm install ${dep}`);
  });
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n╔══════════════════════════════════════════════════════╗');
if (failed === 0) {
  console.log(`║  ✅  All ${passed} checks passed! Backend should work.      ║`);
} else {
  console.log(`║  Results: ${passed} passed  |  ${failed} failed                     ║`);
}
console.log('╚══════════════════════════════════════════════════════╝');

if (failed > 0) {
  console.log('\nFix the issues above, then restart the backend (Ctrl+C, npm run dev).');
}

console.log('\nNext: open http://localhost:5000/health to confirm the server is up.\n');
