#!/usr/bin/env node
// export-users.mjs — WO: Database Export for Email Campaign
// READ-ONLY. Never writes to Firestore. Verified.
//
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=~/.secrets/sa-key.json node export-users.mjs

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs   from 'node:fs';
import path from 'node:path';
import os   from 'node:os';

const DELIVERABLE       = path.join(os.homedir(), 'reh', 'reh', 'users.json');
const LOG_DIR           = path.join(os.homedir(), 'reh', 'logs');
const EXPECTED_COUNT    = 79;
const DEFAULT_FIRSTNAME = 'Dear One';   // per WO §4

const now   = new Date();
const stamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);

// ── Init ────────────────────────────────────────────────
let app;
try {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyPath) throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set');
  if (!fs.existsSync(keyPath)) throw new Error(`Key not found: ${keyPath}`);

  const sa = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  if (!sa.project_id)  throw new Error('SA key missing project_id');
  if (!sa.private_key) throw new Error('SA key missing private_key');

  app = initializeApp({ credential: cert(sa), projectId: sa.project_id });
  console.log(`[init] Admin SDK ready — project ${sa.project_id}`);
} catch (err) {
  console.error('[FATAL]', err.message);
  process.exit(1);
}
const db = getFirestore(app);

fs.mkdirSync(path.dirname(DELIVERABLE), { recursive: true });
fs.mkdirSync(LOG_DIR, { recursive: true });

// ── Preserve previous deliverable before overwriting ────
if (fs.existsSync(DELIVERABLE)) {
  const bak = `${DELIVERABLE}.bak.${stamp}`;
  fs.copyFileSync(DELIVERABLE, bak);
  console.log(`[backup] ${bak}`);
}

// ── Main ────────────────────────────────────────────────
try {
  console.log('[query] reading users collection…');
  const snap = await db.collection('users').get();
  const totalDocs = snap.size;
  console.log(`[query] ${totalDocs} docs returned`);

  const users = [];
  const issues = [];
  let defaulted = 0, skipped = 0;

  snap.forEach(doc => {
    const data  = doc.data() || {};
    const email = (doc.id || '').trim().toLowerCase();
    const first = (data.firstName || '').trim();

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      issues.push(`Invalid doc-ID email: ${JSON.stringify(doc.id)}`);
      skipped++; return;
    }

    let firstName = first;
    if (!firstName) {
      firstName = DEFAULT_FIRSTNAME;
      defaulted++;
      issues.push(`firstName missing for ${email} — defaulted to "${DEFAULT_FIRSTNAME}"`);
    }
    users.push({ email, firstName });
  });

  users.sort((a, b) => a.email.localeCompare(b.email));

  fs.writeFileSync(DELIVERABLE, JSON.stringify(users, null, 2) + '\n', 'utf8');
  console.log(`[write] ${DELIVERABLE} (${users.length} entries)`);

  const logPath = path.join(LOG_DIR, `export-users-${stamp}.log`);
  fs.writeFileSync(logPath, [
    `run: ${now.toISOString()}`,
    `docs returned: ${totalDocs}`,
    `users written: ${users.length}`,
    `defaulted firstNames: ${defaulted}`,
    `skipped (bad email): ${skipped}`,
    '', 'issues:',
    ...issues.map(i => '  - ' + i),
  ].join('\n'), 'utf8');
  console.log(`[log] ${logPath}`);

  // ── Count safety check ─────────────────────────────
  console.log('');
  const diff = Math.abs(users.length - EXPECTED_COUNT);
  if (diff === 0) {
    console.log(`[ok] ${users.length} users exported (matches expected).`);
  } else if (diff <= 2) {
    console.log(`[warn] ${users.length} exported (expected 79 — within ±2 tolerance).`);
  } else {
    console.error(`[ALERT] ${users.length} exported, expected 79. DO NOT SEND.`);
    process.exit(2);
  }

  console.log('');
  console.log('Summary:');
  console.log(`  total docs in users:      ${totalDocs}`);
  console.log(`  users written:            ${users.length}`);
  console.log(`  firstName defaulted:      ${defaulted}`);
  console.log(`  skipped (invalid email):  ${skipped}`);
} catch (err) {
  console.error('[FATAL]', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
}