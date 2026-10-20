// Edge middleware: guard /admin. If the request has no valid admin session cookie, redirect to /login
// before admin.html is ever served (no flash of the admin page).
export const config = { matcher: '/admin' };

function secret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

async function valid(token) {
  const s = secret();
  if (!s || !token) return false;
  const dot = token.indexOf('.');
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(s), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const mac = await crypto.subtle.sign('HMAC', key, enc.encode(exp));
    const hex = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, '0')).join('');
    return hex === sig;
  } catch {
    return false;
  }
}

export default async function middleware(request) {
  const cookie = request.headers.get('cookie') || '';
  const part = cookie.split(';').map((s) => s.trim()).find((s) => s.startsWith('fc_admin='));
  const token = part ? part.slice('fc_admin='.length) : '';
  if (await valid(token)) return; // logged in -> let /admin through
  return Response.redirect(new URL('/login', request.url), 302);
}
