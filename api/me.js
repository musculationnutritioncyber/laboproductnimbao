import { whoIs, json } from "./_lib.js";
export function GET(request) {
  const who = whoIs(request);
  return who ? json({ user: who }) : json({ error: "non connecté" }, 401);
}
