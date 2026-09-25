// Sends an email to the Groundbreakable team whenever a row lands in
// `development_profiles` (get-started.html "Show me where to look") or
// `access_requests` (the "Request Access" form). Invoked by a Postgres
// AFTER INSERT trigger via pg_net -- see
// supabase/migrations/20260925130000_submission_notify_webhook.sql.
//
// Auth: pg_net can't attach a Supabase JWT, so the trigger instead sends a
// shared secret (stored in Postgres Vault, never in git) in the
// `x-webhook-secret` header, checked against the WEBHOOK_SECRET function
// secret below. Deploy with --no-verify-jwt.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const NOTIFY_EMAIL = Deno.env.get("NOTIFY_EMAIL")!;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET")!;
const FROM_EMAIL = Deno.env.get("NOTIFY_FROM_EMAIL") || "Groundbreakable <onboarding@resend.dev>";

const esc = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const row = (label: string, value: unknown) =>
  value ? `<tr><td style="padding:4px 12px 4px 0;color:#666;white-space:nowrap;vertical-align:top">${esc(label)}</td><td style="padding:4px 0">${esc(value)}</td></tr>` : "";

function formatEmail(table: string, record: Record<string, unknown>): { subject: string; html: string } | null {
  if (table === "development_profiles") {
    const rows = [
      row("Develops", Array.isArray(record.develop_types) ? record.develop_types.join(", ") : record.develop_types),
      row("Current markets", record.current_markets),
      row("Open to new markets", record.open_to_new_markets ? "Yes" : "No"),
      row("What makes an area attractive", record.area_attractive),
      row("What makes a site work", record.site_criteria),
      row("Wants us to uncover", Array.isArray(record.uncover_priorities) ? record.uncover_priorities.join(", ") : record.uncover_priorities),
      row("Company", record.company),
      row("Email", record.work_email),
      row("Phone", record.phone),
    ].join("");
    return {
      subject: `New Development Profile: ${String(record.full_name ?? "Unknown")} (${String(record.company ?? "")})`,
      html: `<table style="font-family:sans-serif;font-size:14px">${rows}</table>`,
    };
  }

  if (table === "access_requests") {
    const rows = [
      row("Email", record.work_email),
      row("Primary market", record.primary_market),
    ].join("");
    return {
      subject: `New Access Request: ${String(record.full_name ?? "Unknown")}`,
      html: `<table style="font-family:sans-serif;font-size:14px">${rows}</table>`,
    };
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response("unauthorized", { status: 401 });
  }

  const { table, record } = await req.json();
  const email = formatEmail(table, record ?? {});
  if (!email) return new Response("ignored: unknown table", { status: 200 });

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      subject: email.subject,
      html: email.html,
    }),
  });

  if (!resendResponse.ok) {
    const detail = await resendResponse.text();
    console.error("Resend send failed", resendResponse.status, detail);
    return new Response(`resend error: ${detail}`, { status: 502 });
  }

  return new Response("ok", { status: 200 });
});
