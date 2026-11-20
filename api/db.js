// Lecture : GET /api/db?c=products   Écriture : POST {op:set|update|add|delete|replace, c, id, data}
import crypto from "node:crypto";
import { whoIs, readJSON, writeJSON, json, COLLECTIONS } from "./_lib.js";

export async function GET(request) {
  if (!whoIs(request)) return json({ error: "non connecté" }, 401);
  const c = new URL(request.url).searchParams.get("c");
  if (!COLLECTIONS.includes(c)) return json({ error: "collection inconnue" }, 400);
  return json(await readJSON(c, {}));
}

export async function POST(request) {
  const who = whoIs(request);
  if (!who) return json({ error: "non connecté" }, 401);
  let b = {};
  try { b = await request.json(); } catch { return json({ error: "JSON invalide" }, 400); }
  if (!COLLECTIONS.includes(b.c)) return json({ error: "collection inconnue" }, 400);
  const all = await readJSON(b.c, {});
  let id = b.id;
  if (b.op === "replace") {
    if (who !== "routine") return json({ error: "réservé à la routine" }, 403);
    await writeJSON(b.c, b.data || {});
    return json({ ok: true, n: Object.keys(b.data || {}).length });
  }
  if (b.op === "add") { id = crypto.randomBytes(10).toString("base64url"); all[id] = b.data || {}; }
  else if (!id) return json({ error: "id manquant" }, 400);
  else if (b.op === "set") all[id] = b.data || {};
  else if (b.op === "update") all[id] = Object.assign({}, all[id] || {}, b.data || {});
  else if (b.op === "delete") delete all[id];
  else return json({ error: "op inconnue" }, 400);
  await writeJSON(b.c, all);
  return json({ ok: true, id });
}
