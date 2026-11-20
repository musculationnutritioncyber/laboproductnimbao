// Vérifie le code à 6 chiffres. 5 erreurs d'affilée depuis la même adresse = blocage 15 min.
import { users, makeSession, sessionCookie, readJSON, writeJSON, json } from "./_lib.js";

export async function POST(request) {
  const ip = (request.headers.get("x-forwarded-for") || "?").split(",")[0].trim();
  let body = {};
  try { body = await request.json(); } catch {}
  const fails = await readJSON("_fails", {});
  const f = fails[ip] || { n: 0, until: 0 };
  if (f.until > Date.now()) return json({ error: "Trop d'essais, réessaie dans 15 minutes" }, 429);
  const name = users()[String(body.code || "").trim()];
  if (!name) {
    f.n += 1;
    if (f.n >= 5) { f.until = Date.now() + 15 * 60e3; f.n = 0; }
    fails[ip] = f;
    await writeJSON("_fails", fails);
    await new Promise((r) => setTimeout(r, 800));
    return json({ error: "Code incorrect" }, 401);
  }
  if (fails[ip]) { delete fails[ip]; await writeJSON("_fails", fails); }
  return json({ user: name }, 200, { "Set-Cookie": sessionCookie(makeSession(name)) });
}
