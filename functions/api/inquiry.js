const RESEND_API_URL = "https://api.resend.com/emails";
const INTERNAL_FROM = "Astra Website <website@send.astraproductions.co>";
const CONFIRMATION_FROM = "Astra Productions <website@send.astraproductions.co>";
const INTERNAL_RECIPIENT = "jc@astraproductions.co";
const MAX_BODY_BYTES = 24_000;
const MIN_FORM_AGE_MS = 1_500;
const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1000;
const RATE_WINDOW_MS = 5 * 60 * 1000;

const LIMITS = {
  user_name: 100,
  user_email: 254,
  author_website: 500,
  book_link: 1000,
  service: 160,
  inquiry_type: 16,
  message: 5000,
  deadline: 200,
  company: 200,
  genre: 200,
  extra_notes: 5000,
  bot_field: 200,
  request_id: 100,
  form_elapsed_ms: 16,
  submitted_at: 64,
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

  let result = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok) {
    console.error("Resend email failed", {
      status: response.status,
      kind: idempotencyKey.split("/")[0],
      code: result?.name || result?.code || "",
    });
    const error = new Error("Email delivery failed");
    error.status = response.status;
    error.code = result?.name || result?.code || "";
    throw error;
  }

  return result;
}

async function buildRateLimitKey(request, email) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const bucket = Math.floor(Date.now() / RATE_WINDOW_MS);
  // Keyed by network AND sender, so two authors on the same Wi-Fi are not blocked by each other.
  const material = new TextEncoder().encode(`${ip}|${String(email || "").trim().toLowerCase()}|${bucket}`);
  const digest = await crypto.subtle.digest("SHA-256", material);
  const hash = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `inquiry-window/${hash.slice(0, 40)}`;
}

function inquiryRows(data, meta) {
  return [
    ["Name", data.user_name],
    ["Email", data.user_email],
    ["Author website", data.author_website || "Not provided"],
    ["Book title / official link", data.book_link],
    ["Request type", data.inquiry_type === "quote" ? "Project quote request" : "Free 3-point review"],
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

  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111827;line-height:1.5"><h2>New Astra project inquiry</h2><table style="border-collapse:collapse;width:100%;max-width:760px">${rows}</table></body></html>`;
}

function buildConfirmationText(data) {
  const description = data.inquiry_type === "quote"
    ? "Thanks for requesting a project quote. We received your information and will review the scope to discuss what would be involved before giving you a price and schedule."
    : "Thanks for requesting a free three-point review. We received your information and will review the book, its online presence and the next steps interested readers can take.";
  return "Hi " + data.user_name + "\n\n" + description + "\n\nBook / project: " + data.book_link
    + "\n\nIf we need more details, we'll reply to this email. Nothing is charged through the form."
    + "\n\nAstra Productions\nCinematic book trailers and author websites\nhttps://astraproductions.co/";
}

function buildConfirmationHtml(data) {
  const description = data.inquiry_type === "quote"
    ? "Thanks for requesting a project quote. We received your information and will review the scope to discuss what would be involved before giving you a price and schedule."
    : "Thanks for requesting a free three-point review. We received your information and will review the book, its online presence and the next steps interested readers can take.";
  return '<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111827;line-height:1.6"><p>Hi ' + escapeHtml(data.user_name)
    + '</p><p>' + description + '</p><p><strong>Book / project:</strong> ' + escapeHtml(data.book_link)
    + '</p><p>If we need more details, we will reply to this email. Nothing is charged through the form.</p>'
    + '<p><strong>Astra Productions</strong><br>Cinematic book trailers and author websites<br>'
    + '<a href="https://astraproductions.co/">astraproductions.co</a></p></body></html>';
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405, { Allow: "POST" });
  }

  const origin = request.headers.get("Origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return json({ ok: false, error: "Invalid request" }, 403);
  }

  const fetchSite = request.headers.get("Sec-Fetch-Site");
  if (fetchSite && fetchSite !== "same-origin") {
    return json({ ok: false, error: "Invalid request" }, 403);
  }

  if (!env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return json({ ok: false, error: "Submission service unavailable" }, 503);
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

  if (data.inquiry_type && !["review", "quote"].includes(data.inquiry_type)) {
    return json({ ok: false, error: "Invalid request type." }, 400);
  }
  // Older forms without this field remain compatible with the free review route.
  data.inquiry_type ||= "review";

  if (!data.user_name || !data.user_email || !data.book_link || !data.service) {
    return json({ ok: false, error: "Please complete the required fields." }, 400);
  }

  if (!emailLooksValid(data.user_email)) {
    return json({ ok: false, error: "Please enter a valid email address." }, 400);
  }

  if (!websiteLooksValid(data.author_website)) {
    return json({ ok: false, error: "Please enter a valid website URL." }, 400);
  }

  const formElapsedMs = Number(data.form_elapsed_ms);
  if (!Number.isFinite(formElapsedMs) || formElapsedMs < MIN_FORM_AGE_MS || formElapsedMs > MAX_FORM_AGE_MS) {
    return json({ ok: false, error: "Please reload the page and try again." }, 400);
  }

  const submittedAtMs = Date.parse(data.submitted_at);
  if (!Number.isFinite(submittedAtMs)) {
    return json({ ok: false, error: "Please reload the page and try again." }, 400);
  }

  const requestId = /^[A-Za-z0-9_-]{8,100}$/.test(data.request_id)
    ? data.request_id
    : crypto.randomUUID();
  const meta = {
    requestId,
    submittedAt: new Date(submittedAtMs).toISOString(),
  };
  const rateLimitKey = await buildRateLimitKey(request, data.user_email);

  try {
    await sendEmail(
      env.RESEND_API_KEY,
      {
        from: INTERNAL_FROM,
        to: [INTERNAL_RECIPIENT],
        reply_to: data.user_email,
        subject: (data.inquiry_type === "quote" ? "New Astra quote request" : "New Astra free review") + " — " + safeSubjectName(data.user_name),
        text: buildInternalText(data, meta),
        html: buildInternalHtml(data, meta),
      },
      rateLimitKey
    );
  } catch (error) {
    if (
      error?.status === 409 &&
      ["invalid_idempotent_request", "concurrent_idempotent_requests"].includes(error?.code)
    ) {
      return json(
        {
          ok: false,
          code: "rate_limited",
          error: "Please wait a few minutes before sending another request.",
        },
        429,
        { "Retry-After": "300" }
      );
    }
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
