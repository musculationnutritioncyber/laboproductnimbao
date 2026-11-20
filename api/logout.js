import { sessionCookie } from "./_lib.js";
export function GET() {
  return new Response(null, { status: 302, headers: { Location: "/", "Set-Cookie": sessionCookie("") } });
}
