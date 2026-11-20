// Sert le Labo aux personnes connectées, sinon l'écran du code à 6 chiffres.
import fs from "node:fs";
import path from "node:path";
import { whoIs } from "./_lib.js";

const LOGIN = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Labo Produits Nimbao</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f3f4f8;font:16px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#141a2e}
.c{background:#fff;padding:36px 32px;border-radius:18px;box-shadow:0 10px 40px rgba(20,26,46,.08);width:min(340px,90vw);text-align:center}
h1{font-size:20px;margin:0 0 6px}p{margin:0 0 22px;color:#6b7280;font-size:14px}
input{width:100%;box-sizing:border-box;font-size:28px;letter-spacing:10px;text-align:center;padding:12px;border:1.5px solid #d6d9e3;border-radius:12px;outline:none}
input:focus{border-color:#4f6bff}button{margin-top:14px;width:100%;padding:13px;border:0;border-radius:12px;background:#4f6bff;color:#fff;font-size:16px;font-weight:600;cursor:pointer}
.e{color:#d14343;font-size:14px;min-height:20px;margin-top:10px}</style></head><body>
<form class="c" id="f"><h1>Labo Produits</h1><p>Entre ton code à 6 chiffres</p>
<input id="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="\\d{6}" required autofocus>
<button>Entrer</button><div class="e" id="e"></div></form>
<script>document.getElementById("f").onsubmit=async function(ev){ev.preventDefault();var e=document.getElementById("e");e.textContent="";
var r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:document.getElementById("code").value})});
if(r.ok){location.reload()}else{var j={};try{j=await r.json()}catch(x){}e.textContent=j.error||"Code incorrect";document.getElementById("code").select()}}</script></body></html>`;

export function GET(request) {
  const who = whoIs(request);
  const html = who && who !== "routine"
    ? fs.readFileSync(path.join(process.cwd(), "private", "app.html"), "utf8")
    : LOGIN;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
