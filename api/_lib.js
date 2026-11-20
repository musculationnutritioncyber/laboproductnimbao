// Outils partagés : session signée (cookie) + stockage Vercel Blob privé.
import crypto from "node:crypto";
import { put, get } from "@vercel/blob";

const SECRET = process.env.LABO_SECRET || "";
const COOKIE = "labo_s";
const DAYS = 30;

// LABO_CODES = "Nico:123456,Bastien:654321"
export function users() {
  const out = {};
  String(process.env.LABO_CODES || "").split(",").forEach((p) => {
    const [name, code] = p.split(":").map((s) => (s || "").trim());
    if (name && /^\d{6}$/.test(code)) out[code] = name;
  });
  return out;
}

function sign(v) { return crypto.createHmac("sha256", SECRET).update(v).digest("base64url"); }

export function makeSession(name) {
  const body = Buffer.from(JSON.stringify({ u: name, e: Date.now() + DAYS * 864e5 })).toString("base64url");
  return body + "." + sign(body);
}

export function sessionCookie(token) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${token ? DAYS * 86400 : 0}`;
}

// Renvoie le prénom connecté, "routine" pour la clé API, ou null.
export function whoIs(request) {
  const key = request.headers.get("x-labo-key");
  if (key && process.env.LABO_API_KEY && safeEq(key, process.env.LABO_API_KEY)) return "routine";
  const m = (request.headers.get("cookie") || "").match(/(?:^|;\s*)labo_s=([^;]+)/);
  if (!m || !SECRET) return null;
  const [body, sig] = m[1].split(".");
  if (!body || !sig || !safeEq(sig, sign(body))) return null;
  try {
    const d = JSON.parse(Buffer.from(body, "base64url").toString());
    if (d.e < Date.now()) return null;
    return Object.values(users()).includes(d.u) ? d.u : null;
  } catch { return null; }
}

function safeEq(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export const COLLECTIONS = ["products", "changes", "jours", "lectures"];

export async function readJSON(name, fallback) {
  const r = await get(`labo/${name}.json`, { access: "private", useCache: false });
  if (!r || r.statusCode !== 200) return fallback;
  return JSON.parse(await new Response(r.stream).text());
}

export async function writeJSON(name, data) {
  await put(`labo/${name}.json`, JSON.stringify(data), {
    access: "private", allowOverwrite: true, addRandomSuffix: false, contentType: "application/json",
  });
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers } });
}
