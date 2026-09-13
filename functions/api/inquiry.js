const RESEND_API_URL = "https://api.resend.com/emails";
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TURNSTILE_ACTION = "project_inquiry";
const TURNSTILE_HOSTNAMES = new Set([
  "astraproductions.co",
  "www.astraproductions.co",
  "astraproductions.pages.dev",
]);
const TURNSTILE_TOKEN_MAX_LENGTH = 4096;
const INTERNAL_FROM = "Astra Website <website@send.astraproductions.co>";
const CONFIRMATION_FROM = "Astra Productions <website@send.astraproductions.co>";
const INTERNAL_RECIPIENT = "jc@astraproductions.co";
const MAX_BODY_BYTES = 24_000;

const LIMITS = {
  user_name: 100,
  user_email: 254,
  author_website: 500,
  book_link: 1000,
  service: 160,
  message: 5000,
  deadline: 200,
  company: 200,
  genre: 200,
  extra_notes: 5000,
  bot_field: 200,
  request_id: 100,
};

const json = (body, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const emailLooksValid = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const websiteLooksValid = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const safeSubjectName = (value) => value.replace(/[\r\n]+/g, " ").trim();

function normalizePayload(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Invalid request" };
  }

  const data = {};
  for (const [key, maxLength] of Object.entries(LIMITS)) {
    const value = body[key];
    if (value == null) {
      data[key] = "";
      continue;
    }
    if (typeof value !== "string") {
      return { error: "Invalid request" };
    }
    const cleaned = value.replace(/\u0000/g, "").trim();
    if (cleaned.length > maxLength) {
      return { error: "One or more fields are too long." };
    }
    data[key] = cleaned;
  }

  return { data };
}

async function verifyTurnstile(secret, token, remoteIp) {
  const form = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteIp) form.set("remoteip", remoteIp);

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "AstraProductionsWebsite/1.0",
    },
    body: form.toString(),
  });

  if (!response.ok) {
    throw new Error(`Turnstile verification unavailable (${response.status})`);
  }

  const result = await response.json();
  const hostnameOk = TURNSTILE_HOSTNAMES.has(result.hostname);
  const actionOk = result.action === TURNSTILE_ACTION;

  if (!result.success || !hostnameOk || !actionOk) {
    console.warn("Turnstile verification rejected", {
      hostname: result.hostname || "",
      action: result.action || "",
      errorCodes: result["error-codes"] || [],
    });
    return false;
  }

  return true;
}

async function sendEmail(apiKey, payload, idempotencyKey) {
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "AstraProductionsWebsite/1.0",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error("Resend email failed", {
      status: response.status,
      kind: idempotencyKey.split("/")[0],
    });
    throw new Error("Email delivery failed");
  }

  return response.json();
}

function inquiryRows(data, meta) {
  return [
    ["Name", data.user_name],
    ["Email", data.user_email],
    ["Author website", data.author_website || "Not provided"],
    ["Book title / official link", data.book_link],
    ["Assessment focus", data.service],
    ["Context / message", data.message || "Not provided"],
    ["Timeline", data.deadline || "Not provided"],
    ["Company", data.company || "Not provided"],
    ["Genre", data.genre || "Not provided"],
    ["Additional notes", data.extra_notes || "Not provided"],
    ["Request ID", meta.requestId],
    ["Submitted", meta.submittedAt],
  ];
}

function buildInternalText(data, meta) {
  return inquiryRows(data, meta)
    .map(([label, value]) => `${label}:\n${value}`)
    .join("\n\n");
}

function buildInternalHtml(data, meta) {
  const rows = inquiryRows(data, meta)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px 8px 0;font-weight:700;vertical-align:top;width:180px">${escapeHtml(label)}</td><td style="padding:8px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111827;line-height:1.5"><h2>New Astra project review</h2><table style="border-collapse:collapse;width:100%;max-width:760px">${rows}</table></body></html>`;
}

function buildConfirmationText(data) {
  return `Hi ${data.user_name},\n\nThanks for sending your project to Astra Productions.\n\nWe received your request and will review the book, your current online presence, and the information you provided to identify the three priorities we would address first.\n\nBook / project: ${data.book_link}\n\nYou do not need to send anything else right now. If additional information would help with the review, we will reply to this email.\n\nAstra Productions\nStrategic creative direction for authors\nhttps://astraproductions.co/`;
}

function buildConfirmationHtml(data) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111827;line-height:1.6"><p>Hi ${escapeHtml(data.user_name)},</p><p>Thanks for sending your project to Astra Productions.</p><p>We received your request and will review the book, your current online presence, and the information you provided to identify the three priorities we would address first.</p><p><strong>Book / project:</strong> ${escapeHtml(data.book_link)}</p><p>You do not need to send anything else right now. If additional information would help with the review, we will reply to this email.</p><p><strong>Astra Productions</strong><br>Strategic creative direction for authors<br><a href="https://astraproductions.co/">astraproductions.co</a></p></body></html>`;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405, { Allow: "POST" });
  }

  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) {
    return json({ ok: false, error: "Invalid request" }, 403);
  }

  if (!env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return json({ ok: false, error: "Submission service unavailable" }, 503);
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    console.error("TURNSTILE_SECRET_KEY is not configured");
    return json({ ok: false, error: "Security check unavailable" }, 503);
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ ok: false, error: "Invalid request" }, 415);
  }

  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "Request is too large" }, 413);
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  const normalized = normalizePayload(body);
  if (normalized.error) {
    return json({ ok: false, error: normalized.error }, 400);
  }
  const data = normalized.data;

  if (data.bot_field) {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  if (!data.user_name || !data.user_email || !data.book_link || !data.service) {
    return json({ ok: false, error: "Please complete the required fields." }, 400);
  }

  if (!emailLooksValid(data.user_email)) {
    return json({ ok: false, error: "Please enter a valid email address." }, 400);
  }

  if (!websiteLooksValid(data.author_website)) {
    return json({ ok: false, error: "Please enter a valid website URL." }, 400);
  }

  const turnstileTokenRaw = body["cf-turnstile-response"];
  if (typeof turnstileTokenRaw !== "string") {
    return json(
      { ok: false, code: "turnstile_failed", error: "Please complete the security check." },
      403
    );
  }

  const turnstileToken = turnstileTokenRaw.trim();
  if (!turnstileToken || turnstileToken.length > TURNSTILE_TOKEN_MAX_LENGTH) {
    return json(
      { ok: false, code: "turnstile_failed", error: "Security check expired. Please try again." },
      403
    );
  }

  let turnstileVerified;
  try {
    turnstileVerified = await verifyTurnstile(
      env.TURNSTILE_SECRET_KEY,
      turnstileToken,
      request.headers.get("CF-Connecting-IP") || ""
    );
  } catch (error) {
    console.error("Turnstile verification unavailable", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return json({ ok: false, error: "Security check unavailable. Please try again." }, 503);
  }

  if (!turnstileVerified) {
    return json(
      { ok: false, code: "turnstile_failed", error: "Security check expired. Please try again." },
      403
    );
  }

  const requestId = /^[A-Za-z0-9_-]{8,100}$/.test(data.request_id)
    ? data.request_id
    : crypto.randomUUID();
  const meta = {
    requestId,
    submittedAt: new Date().toISOString(),
  };

  try {
    await sendEmail(
      env.RESEND_API_KEY,
      {
        from: INTERNAL_FROM,
        to: [INTERNAL_RECIPIENT],
        reply_to: data.user_email,
        subject: `New Astra project review — ${safeSubjectName(data.user_name)}`,
        text: buildInternalText(data, meta),
        html: buildInternalHtml(data, meta),
      },
      `inquiry/${requestId}`
    );
  } catch {
    return json({ ok: false, error: "We could not send your request. Please try again." }, 502);
  }

  let confirmationSent = true;
  try {
    await sendEmail(
      env.RESEND_API_KEY,
      {
        from: CONFIRMATION_FROM,
        to: [data.user_email],
        reply_to: INTERNAL_RECIPIENT,
        subject: "We received your Astra project review request",
        text: buildConfirmationText(data),
        html: buildConfirmationHtml(data),
      },
      `confirmation/${requestId}`
    );
  } catch {
    confirmationSent = false;
    console.error("Author confirmation email was not sent", { requestId });
  }

  return json({ ok: true, confirmationSent });
}
