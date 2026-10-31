// Invia per email la lista della spesa dell'app "Vivo" usando Resend.
// Solo il proprietario dei dati (peso_is_owner) può usarla: non è un servizio aperto.
// Segreto richiesto: RESEND_API_KEY (si imposta in Supabase → Edge Functions → Secrets).
// Il mittente è la costante FROM: finché un dominio non è verificato in Resend si può usare
// onboarding@resend.dev, che però invia solo all'indirizzo del proprietario dell'account Resend.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = ["https://24021959.github.io", "http://localhost:3000"];
const FROM = "Vivo <onboarding@resend.dev>";
const MAX_TEXT = 8000;

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

/** Testo semplice della lista → HTML minimo (titoli dei reparti, elenchi). */
function toHtml(text: string): string {
  let html = '<div style="font-family:system-ui,Arial,sans-serif;font-size:16px;line-height:1.5;color:#1f2421">';
  let inList = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trimEnd();
    if (line.startsWith("- ")) {
      if (!inList) {
        html += '<ul style="padding-left:20px;margin:4px 0 12px">';
        inList = true;
      }
      html += `<li>${esc(line.slice(2))}</li>`;
      continue;
    }
    if (inList) {
      html += "</ul>";
      inList = false;
    }
    if (!line) continue;
    const isHeading = line === line.toUpperCase() && /[A-ZÀ-Ü]/.test(line) && line.length < 40;
    html += isHeading
      ? `<h3 style="margin:16px 0 4px;color:#2a7562;font-size:14px;letter-spacing:.04em">${esc(line)}</h3>`
      : `<p style="margin:4px 0">${esc(line)}</p>`;
  }
  if (inList) html += "</ul>";
  return html + "</div>";
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ ok: false, code: "method", error: "Metodo non consentito." }, 405, origin);

  // 1) solo il proprietario
  const auth = req.headers.get("Authorization");
  if (!auth) return json({ ok: false, code: "signed_out", error: "Accesso mancante." }, 401, origin);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: isOwner, error: ownerErr } = await sb.rpc("peso_is_owner");
  if (ownerErr || isOwner !== true) {
    return json({ ok: false, code: "forbidden", error: "Questo account non può inviare la lista." }, 403, origin);
  }

  // 2) dati
  let body: { to?: unknown; subject?: unknown; text?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, code: "bad_request", error: "Richiesta non valida." }, 400, origin);
  }
  const to = typeof body.to === "string" ? body.to.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.replace(/[\r\n]+/g, " ").trim().slice(0, 150) : "";
  const text = typeof body.text === "string" ? body.text.slice(0, MAX_TEXT) : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to) || to.length > 254) {
    return json({ ok: false, code: "bad_email", error: "L'indirizzo email non è valido." }, 400, origin);
  }
  if (!subject || !text.trim()) {
    return json({ ok: false, code: "bad_request", error: "Oggetto o testo mancanti." }, 400, origin);
  }

  // 3) invio
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    return json(
      { ok: false, code: "not_configured", error: "L'invio automatico non è ancora attivo: manca la chiave di Resend." },
      503,
      origin,
    );
  }
  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [to], subject, text, html: toHtml(text) }),
    });
  } catch {
    return json({ ok: false, code: "network", error: "Non riesco a raggiungere il servizio di invio. Riprova." }, 502, origin);
  }
  const out = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = String(out?.message ?? "");
    if (/own email|testing emails|verify a domain/i.test(msg)) {
      return json(
        {
          ok: false,
          code: "testing_only",
          error:
            "Resend, finché il dominio non è verificato, invia solo all'indirizzo con cui è stato creato l'account Resend. Usa quell'indirizzo oppure verifica il dominio.",
        },
        422,
        origin,
      );
    }
    console.error("Resend error", res.status, msg);
    return json({ ok: false, code: "resend", error: "Resend non ha accettato l'invio. Riprova più tardi." }, 502, origin);
  }
  return json({ ok: true, id: out?.id ?? null }, 200, origin);
});
