// send-emails.cjs — owner: Mile (Reh Communications)
// Modes:  MODE=dry | MODE=test | MODE=live
const fs = require('fs');

const KEY        = (process.env.RESEND_API_KEY || '').trim();
const FROM       = process.env.REH_FROM || 'Reh <concierge@rehcrown.com>';
const REPLY_TO   = 'concierge@rehcrown.com';
const MODE       = process.env.MODE || 'dry';
const TEST_TO    = 'rehcrown@gmail.com';
const CTA        = 'https://rehcrown.com/login';
const UNSUB_BASE = 'https://rehcrown.com/u/';          // WO-001 endpoint
const ADDRESS    = 'Lagos, Nigeria';                   // ← must be registered business address
const CAMPAIGN   = 'reh-winback-001';
const DELAY_MS   = 550;

if (!KEY.startsWith('re_')) {
  console.error('FATAL: RESEND_API_KEY missing or malformed (expected re_...).');
  process.exit(1);
}
if (FROM.includes('resend.dev')) {
  console.error('FATAL: sender is resend.dev. Verify rehcrown.com in Resend and use concierge@rehcrown.com.');
  process.exit(1);
}

// ── recipients ──────────────────────────────────────────────
const raw = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
const seen = new Set();
const list = raw
  .map(u => (typeof u === 'string' ? { email: u, firstName: '' } : u))
  .filter(u => u.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(u.email))
  .filter(u => !/^(info|admin|noreply|no-reply|postmaster|abuse)@/i.test(u.email))
  .filter(u => {
    const k = u.email.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });

// ── templates (see §4) ──────────────────────────────────────
function html(firstName, unsub) { /* paste §4 HTML, replace {{firstName}}, {{unsubscribe}}, {{BUSINESS_ADDRESS}} */ }
function text(firstName, unsub) { /* paste §4 text, same replacements */ }

function payload(to, firstName) {
  const unsub = UNSUB_BASE + encodeURIComponent(Buffer.from(to.toLowerCase()).toString('base64url'));
  return {
    from: FROM,
    to: [to],
    reply_to: REPLY_TO,
    subject: 'Your seat in the Circle is waiting',
    html: html(firstName, unsub),
    text: text(firstName, unsub),
    headers: {
      'List-Unsubscribe': `<${unsub}>, <mailto:unsubscribe@rehcrown.com?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}

async function sendOne(to, firstName, i) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `${CAMPAIGN}-${to.toLowerCase()}`,
    },
    body: JSON.stringify(payload(to, firstName)),
  });
  const body = await res.json().catch(() => ({}));
  fs.appendFileSync('send-log.jsonl', JSON.stringify({
    ts: new Date().toISOString(), campaign: CAMPAIGN, to,
    status: res.status, id: body.id || null, err: body.message || null,
  }) + '\n');
  console.log(`[${i}] ${res.status} ${to} ${body.id || body.message || ''}`);
  return res.status;
}

(async () => {
  console.log(`campaign=${CAMPAIGN} MODE=${MODE} recipients=${list.length}`);

  if (MODE === 'dry') {
    const sample = list[0] || { email: TEST_TO, firstName: 'Reh' };
    console.log('DRY RUN — nothing sent. Payload for first recipient:');
    console.log(JSON.stringify(payload(sample.email, sample.firstName), null, 2));
    return;
  }

  if (MODE === 'test') {
    console.log(`TEST → ${TEST_TO}`);
    const s = await sendOne(TEST_TO, 'Reh', 0);
    process.exit(s === 200 ? 0 : 1);
  }

  if (MODE === 'live') {
    if (list.length > 200) {
      console.error('REFUSING: live list larger than expected. This campaign is 79 users.');
      process.exit(1);
    }
    let ok = 0, fail = 0;
    for (let i = 0; i < list.length; i++) {
      try {
        const s = await sendOne(list[i].email, list[i].firstName || '', i);
        if (s === 200) ok++;
        else if (s === 429) { console.log('429 — backing off 2s'); await new Promise(r => setTimeout(r, 2000)); i--; continue; }
        else fail++;
      } catch (e) {
        fail++; console.error('NETWORK', list[i].email, e.message);
      }
      if (i < list.length - 1) await new Promise(r => setTimeout(r, DELAY_MS));
    }
    console.log(`DONE ok=${ok} fail=${fail} log=send-log.jsonl`);
  }
})();