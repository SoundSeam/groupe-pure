import { withSupabase } from "npm:@supabase/server@^1.4.1";

const ATTACHMENT_BUCKET = "contact-attachments";
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const RATE_LIMIT_PER_HOUR = 5;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/heic",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const ATTACHMENT_TYPES_BY_EXTENSION: Record<string, string> = {
  doc: "application/msword",
  docx:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  heic: "image/heic",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  pdf: "application/pdf",
  png: "image/png",
  webp: "image/webp",
};
const PROJECT_TYPES = new Set([
  "architecture",
  "construction",
  "excavation",
]);
const SUBCATEGORY_TRANSLATIONS: Record<string, string> = {
  "Residential and commercial plans": "Plans résidentiels et commerciaux",
  "Custom design": "Conception sur mesure",
  "Additions": "Agrandissements",
  "Space optimization": "Optimisation des espaces",
  "3D modelling and renderings": "Modélisation 3D et rendus",
  "Permit applications": "Demandes de permis",
  "Coordination with engineers": "Coordination avec les ingénieurs",
  "Interior design and material selection":
    "Design intérieur et choix des matériaux",
  "Project management support": "Accompagnement en gestion de projet",
  "New construction": "Construction neuve",
  "Residential renovation": "Rénovation résidentielle",
  "Commercial renovation": "Rénovation commerciale",
  "Turnkey projects": "Projets clé en main",
  "Interior finishing": "Finition intérieure",
  "Exterior cladding": "Revêtement extérieur",
  "Roofing": "Toiture",
  "Doors and windows": "Portes et fenêtres",
  "Kitchens and bathrooms": "Cuisine et salle de bain",
  "Framing": "Charpente",
  "Site management": "Gestion de chantier",
  "Residential excavation": "Excavation résidentielle",
  "Commercial excavation": "Excavation commerciale",
  "Site grading": "Nivellement de terrain",
  "Foundations": "Fondation",
  "French drains": "Drain français",
  "Utility service connections (water and sewer)":
    "Entrée de services (aqueduc et égout)",
  "Earthwork": "Terrassement",
  "Material transport": "Transport de matériaux",
  "Demolition": "Démolition",
  "Land clearing": "Déboisement",
  "Site preparation": "Préparation de terrain",
  "Backfilling and compaction": "Remblayage et compaction",
  "Equipment rental with operator": "Location d’équipement avec opérateur",
};
const BUDGET_TRANSLATIONS: Record<string, string> = {
  "Under $25,000": "Moins de 25 000 $",
  "$25,000–$50,000": "25 000 $ à 50 000 $",
  "$50,000–$100,000": "50 000 $ à 100 000 $",
  "$100,000–$250,000": "100 000 $ à 250 000 $",
  "$250,000–$500,000": "250 000 $ à 500 000 $",
  "$500,000–$1M": "500 000 $ à 1 M$",
  "$1M and above": "1 M$ et plus",
  "To be determined": "À déterminer",
};
const DEFAULT_ALLOWED_ORIGINS = [
  "https://groupepure.ca",
  "https://www.groupepure.ca",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

type Locale = "fr" | "en";
type ProjectType = "architecture" | "construction" | "excavation";
type SubmissionStatus =
  | "PENDING"
  | "PROCESSING"
  | "SENT"
  | "FAILED"
  | "REJECTED";

type PrepareRequest = {
  action: "prepare";
  idempotencyKey: string;
  locale: Locale;
  name: string;
  email: string;
  phone?: string;
  projectType: ProjectType;
  subcategory: string;
  budgetRange: string;
  message: string;
  website?: string;
  startedAt: number;
  attachment?: {
    name: string;
    type: string;
    size: number;
  } | null;
};

type SendRequest = {
  action: "send";
  idempotencyKey: string;
};

export type ContactSubmission = {
  idempotency_key: string;
  locale: Locale;
  name: string;
  visitor_email: string;
  phone: string | null;
  project_type: ProjectType;
  subcategory: string;
  budget_range: string;
  message: string;
  attachment_name: string | null;
  attachment_type: string | null;
  attachment_size: number | null;
  storage_path: string | null;
  status: SubmissionStatus;
};

type SupabaseAdmin = {
  from: (table: string) => any;
  storage: {
    from: (bucket: string) => any;
  };
};

export class ContactError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.trim().replace(/\0/g, "").slice(0, maxLength)
    : "";
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      .test(
        value,
      )
  );
}

function getAllowedOrigins() {
  const configured = Deno.env.get("CONTACT_ALLOWED_ORIGINS")
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set(configured?.length ? configured : DEFAULT_ALLOWED_ORIGINS);
}

function requireAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin || !getAllowedOrigins().has(origin)) {
    throw new ContactError("ORIGIN_NOT_ALLOWED", 403, "Origin not allowed.");
  }
}

export function validatePrepareRequest(value: unknown): PrepareRequest {
  if (!value || typeof value !== "object") {
    throw new ContactError("INVALID_FORM", 422, "Invalid form data.");
  }

  const input = value as Record<string, unknown>;
  const idempotencyKey = input.idempotencyKey;
  const locale = input.locale;
  const name = cleanString(input.name, 120);
  const email = cleanString(input.email, 254).toLowerCase();
  const phone = cleanString(input.phone, 50);
  const projectType = input.projectType;
  const subcategory = cleanString(input.subcategory, 160);
  const budgetRange = cleanString(input.budgetRange, 100);
  const message = cleanString(input.message, 5000);
  const website = cleanString(input.website, 200);
  const startedAt = typeof input.startedAt === "number"
    ? input.startedAt
    : Number.NaN;

  if (
    input.action !== "prepare" ||
    !isUuid(idempotencyKey) ||
    (locale !== "fr" && locale !== "en") ||
    !name ||
    !email ||
    !projectType ||
    !PROJECT_TYPES.has(String(projectType)) ||
    !subcategory ||
    !budgetRange ||
    !message ||
    !Number.isFinite(startedAt)
  ) {
    throw new ContactError("INVALID_FORM", 422, "Invalid form data.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ContactError("INVALID_EMAIL", 422, "Invalid email address.");
  }

  let attachment: PrepareRequest["attachment"] = null;

  if (input.attachment != null) {
    if (typeof input.attachment !== "object") {
      throw new ContactError(
        "INVALID_ATTACHMENT",
        422,
        "Invalid attachment.",
      );
    }

    const rawAttachment = input.attachment as Record<string, unknown>;
    const attachmentName = cleanString(rawAttachment.name, 180);
    const attachmentType = cleanString(rawAttachment.type, 150).toLowerCase();
    const attachmentExtension =
      attachmentName.split(".").pop()?.toLowerCase() ?? "";
    const attachmentSize = typeof rawAttachment.size === "number"
      ? rawAttachment.size
      : Number.NaN;

    if (
      !attachmentName ||
      !ALLOWED_ATTACHMENT_TYPES.has(attachmentType) ||
      ATTACHMENT_TYPES_BY_EXTENSION[attachmentExtension] !== attachmentType
    ) {
      throw new ContactError(
        "INVALID_ATTACHMENT",
        422,
        "Unsupported attachment.",
      );
    }

    if (
      !Number.isInteger(attachmentSize) ||
      attachmentSize <= 0 ||
      attachmentSize > MAX_ATTACHMENT_BYTES
    ) {
      throw new ContactError(
        "ATTACHMENT_TOO_LARGE",
        422,
        "Attachment is too large.",
      );
    }

    attachment = {
      name: attachmentName,
      type: attachmentType,
      size: attachmentSize,
    };
  }

  return {
    action: "prepare",
    idempotencyKey,
    locale,
    name,
    email,
    phone,
    projectType: projectType as ProjectType,
    subcategory,
    budgetRange,
    message,
    website,
    startedAt,
    attachment,
  };
}

function validateSendRequest(value: unknown): SendRequest {
  if (!value || typeof value !== "object") {
    throw new ContactError("INVALID_FORM", 422, "Invalid request.");
  }

  const input = value as Record<string, unknown>;

  if (input.action !== "send" || !isUuid(input.idempotencyKey)) {
    throw new ContactError("INVALID_FORM", 422, "Invalid request.");
  }

  return {
    action: "send",
    idempotencyKey: input.idempotencyKey,
  };
}

function getClientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");

  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    forwarded?.split(",")[0]?.trim() ||
    "unknown"
  );
}

async function hashClientAddress(request: Request) {
  const salt = Deno.env.get("CONTACT_RATE_LIMIT_SALT") ||
    Deno.env.get("RESEND_API_KEY") ||
    Deno.env.get("SUPABASE_URL") ||
    "groupe-pure-contact";
  const input = new TextEncoder().encode(
    `${salt}:${getClientAddress(request)}`,
  );
  const digest = await crypto.subtle.digest("SHA-256", input);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function safeFileName(fileName: string) {
  const normalized = fileName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 120);

  return normalized || "attachment";
}

function storagePathFor(idempotencyKey: string, fileName: string) {
  const date = new Date().toISOString().slice(0, 7);
  return `${date}/${idempotencyKey}/${safeFileName(fileName)}`;
}

async function enforceRateLimit(
  supabaseAdmin: SupabaseAdmin,
  ipHash: string,
) {
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabaseAdmin
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", cutoff);

  if (error) {
    console.error("contact_rate_limit_query_failed", error.code);
    throw new ContactError(
      "SERVICE_UNAVAILABLE",
      503,
      "Contact service unavailable.",
    );
  }

  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    throw new ContactError(
      "RATE_LIMITED",
      429,
      "Too many submissions.",
    );
  }
}

async function prepareSubmission(
  request: Request,
  supabaseAdmin: SupabaseAdmin,
  rawInput: unknown,
) {
  const input = validatePrepareRequest(rawInput);

  // Honeypots receive a normal success response so automated submitters do not
  // learn which field caused the rejection.
  if (input.website) {
    return jsonResponse({ ok: true, sent: true });
  }

  if (Date.now() - input.startedAt < 1200) {
    return jsonResponse({ ok: true, sent: true });
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("contact_submissions")
    .select("status, storage_path")
    .eq("idempotency_key", input.idempotencyKey)
    .maybeSingle();

  if (existingError) {
    console.error("contact_existing_query_failed", existingError.code);
    throw new ContactError(
      "SERVICE_UNAVAILABLE",
      503,
      "Contact service unavailable.",
    );
  }

  if (existing?.status === "SENT") {
    return jsonResponse({ ok: true, sent: true });
  }

  if (existing?.status === "PROCESSING") {
    throw new ContactError(
      "SUBMISSION_IN_PROGRESS",
      409,
      "Submission already in progress.",
    );
  }

  const ipHash = await hashClientAddress(request);

  if (!existing) {
    await enforceRateLimit(supabaseAdmin, ipHash);
  }

  const storagePath = input.attachment
    ? storagePathFor(input.idempotencyKey, input.attachment.name)
    : null;
  const submission = {
    idempotency_key: input.idempotencyKey,
    locale: input.locale,
    name: input.name,
    visitor_email: input.email,
    phone: input.phone || null,
    project_type: input.projectType,
    subcategory: input.subcategory,
    budget_range: input.budgetRange,
    message: input.message,
    attachment_name: input.attachment?.name ?? null,
    attachment_type: input.attachment?.type ?? null,
    attachment_size: input.attachment?.size ?? null,
    storage_path: storagePath,
    ip_hash: ipHash,
    user_agent: cleanString(request.headers.get("user-agent"), 500) || null,
    status: "PENDING",
    resend_email_id: null,
    error_code: null,
    sent_at: null,
  };

  const databaseOperation = existing
    ? supabaseAdmin
      .from("contact_submissions")
      .update(submission)
      .eq("idempotency_key", input.idempotencyKey)
    : supabaseAdmin.from("contact_submissions").insert(submission);
  const { error: saveError } = await databaseOperation;

  if (saveError) {
    console.error("contact_submission_save_failed", saveError.code);
    throw new ContactError(
      "SERVICE_UNAVAILABLE",
      503,
      "Contact service unavailable.",
    );
  }

  if (!input.attachment || !storagePath) {
    return jsonResponse({
      ok: true,
      submissionId: input.idempotencyKey,
      upload: null,
    });
  }

  const { data: signedUpload, error: uploadError } = await supabaseAdmin.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUploadUrl(storagePath, { upsert: Boolean(existing) });

  if (uploadError || !signedUpload) {
    console.error(
      "contact_signed_upload_failed",
      uploadError?.message ?? "missing_data",
    );
    await supabaseAdmin
      .from("contact_submissions")
      .update({ status: "FAILED", error_code: "UPLOAD_PREPARATION_FAILED" })
      .eq("idempotency_key", input.idempotencyKey);
    throw new ContactError(
      "UPLOAD_FAILED",
      503,
      "Could not prepare attachment upload.",
    );
  }

  return jsonResponse({
    ok: true,
    submissionId: input.idempotencyKey,
    upload: {
      path: storagePath,
      token: signedUpload.token,
    },
  });
}

function startsWithBytes(bytes: Uint8Array, signature: number[]) {
  return signature.every((byte, index) => bytes[index] === byte);
}

export function attachmentMatchesType(
  bytes: Uint8Array,
  mimeType: string,
) {
  switch (mimeType) {
    case "application/pdf": {
      const prefix = new TextDecoder("latin1").decode(bytes.slice(0, 1024));
      return prefix.includes("%PDF-");
    }
    case "application/msword":
      return startsWithBytes(bytes, [
        0xd0,
        0xcf,
        0x11,
        0xe0,
        0xa1,
        0xb1,
        0x1a,
        0xe1,
      ]);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      if (!startsWithBytes(bytes, [0x50, 0x4b, 0x03, 0x04])) {
        return false;
      }
      const zipDirectory = new TextDecoder("latin1").decode(bytes);
      return (
        zipDirectory.includes("[Content_Types].xml") &&
        zipDirectory.includes("word/")
      );
    }
    case "image/jpeg":
      return startsWithBytes(bytes, [0xff, 0xd8, 0xff]);
    case "image/png":
      return startsWithBytes(bytes, [
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a,
      ]);
    case "image/webp":
      return (
        startsWithBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
        String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
      );
    case "image/heic": {
      const boxType = new TextDecoder("latin1").decode(bytes.slice(4, 40));
      return (
        boxType.startsWith("ftyp") &&
        ["heic", "heix", "hevc", "hevx", "mif1", "msf1"].some((brand) =>
          boxType.includes(brand)
        )
      );
    }
    default:
      return false;
  }
}

export function bytesToBase64(bytes: Uint8Array) {
  const chunkSize = 0x8000;
  let binary = "";

  for (let offset = 0; offset < bytes.byteLength; offset += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, Math.min(offset + chunkSize, bytes.byteLength)),
    );
  }

  return btoa(binary);
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

export function emailContent(
  submission: ContactSubmission,
  attachmentUrl: string | null,
) {
  const projectLabels: Record<ProjectType, string> = {
    architecture: "Architecture",
    construction: "Construction",
    excavation: "Excavation",
  };
  const labels = {
    subject: "Nouvelle demande de projet",
    name: "Nom",
    email: "Courriel",
    phone: "Téléphone",
    projectType: "Type de chantier",
    subcategory: "Sous-catégorie",
    budget: "Budget prévu",
    attachment: "Pièce jointe",
    message: "Message",
    download: "Télécharger la pièce jointe",
  };
  const projectLabel = projectLabels[submission.project_type];
  const subcategory = submission.locale === "en"
    ? SUBCATEGORY_TRANSLATIONS[submission.subcategory] ||
      submission.subcategory
    : submission.subcategory;
  const budget = submission.locale === "en"
    ? BUDGET_TRANSLATIONS[submission.budget_range] || submission.budget_range
    : submission.budget_range;
  const subject = `${labels.subject} — ${projectLabel} — ${submission.name}`;
  const rows = [
    [labels.name, submission.name],
    [labels.email, submission.visitor_email],
    [labels.phone, submission.phone || "—"],
    [labels.projectType, projectLabel],
    [labels.subcategory, subcategory],
    [labels.budget, budget],
    [labels.attachment, submission.attachment_name || "—"],
  ];
  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `${labels.message}:`,
    submission.message,
    ...(attachmentUrl ? ["", `${labels.download}: ${attachmentUrl}`] : []),
  ].join("\n");
  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><th style="padding:8px 16px 8px 0;text-align:left;vertical-align:top;color:#66706b;font-weight:600">${
          escapeHtml(label)
        }</th><td style="padding:8px 0;color:#161a18">${
          escapeHtml(value)
        }</td></tr>`,
    )
    .join("");
  const attachmentLink = attachmentUrl
    ? `<p style="margin:24px 0 0"><a href="${
      escapeHtml(attachmentUrl)
    }" style="color:#8a672f;font-weight:600">${
      escapeHtml(labels.download)
    }</a></p>`
    : "";
  const html = `
    <!doctype html>
    <html lang="fr">
      <body style="margin:0;background:#f4f3ef;font-family:Arial,sans-serif;color:#161a18">
        <div style="max-width:680px;margin:0 auto;padding:32px 20px">
          <div style="background:#ffffff;border-radius:16px;padding:32px">
            <p style="margin:0 0 8px;color:#8a672f;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Groupe Pure</p>
            <h1 style="margin:0 0 24px;font-size:25px;line-height:1.25">${
    escapeHtml(labels.subject)
  }</h1>
            <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.5">${tableRows}</table>
            <div style="margin-top:24px;padding-top:24px;border-top:1px solid #e7e5df">
              <p style="margin:0 0 8px;color:#66706b;font-weight:600">${
    escapeHtml(labels.message)
  }</p>
              <p style="margin:0;white-space:pre-wrap;line-height:1.65">${
    escapeHtml(submission.message)
  }</p>
              ${attachmentLink}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, text, html };
}

async function sendSubmission(
  supabaseAdmin: SupabaseAdmin,
  rawInput: unknown,
) {
  const input = validateSendRequest(rawInput);
  const { data: submission, error: queryError } = await supabaseAdmin
    .from("contact_submissions")
    .select(
      "idempotency_key, locale, name, visitor_email, phone, project_type, subcategory, budget_range, message, attachment_name, attachment_type, attachment_size, storage_path, status",
    )
    .eq("idempotency_key", input.idempotencyKey)
    .maybeSingle();

  if (queryError) {
    console.error("contact_send_query_failed", queryError.code);
    throw new ContactError(
      "SERVICE_UNAVAILABLE",
      503,
      "Contact service unavailable.",
    );
  }

  if (!submission) {
    throw new ContactError(
      "SUBMISSION_NOT_FOUND",
      404,
      "Submission not found.",
    );
  }

  if (submission.status === "SENT") {
    return jsonResponse({ ok: true, sent: true });
  }

  if (
    submission.status === "PROCESSING" ||
    submission.status === "REJECTED"
  ) {
    throw new ContactError(
      "SUBMISSION_IN_PROGRESS",
      409,
      "Submission cannot be processed.",
    );
  }

  const { data: claimed, error: claimError } = await supabaseAdmin
    .from("contact_submissions")
    .update({ status: "PROCESSING", error_code: null })
    .eq("idempotency_key", input.idempotencyKey)
    .in("status", ["PENDING", "FAILED"])
    .select("idempotency_key")
    .maybeSingle();

  if (claimError || !claimed) {
    throw new ContactError(
      "SUBMISSION_IN_PROGRESS",
      409,
      "Submission already in progress.",
    );
  }

  try {
    let attachmentContent: string | null = null;

    if (submission.storage_path) {
      const { data: attachmentBlob, error: downloadError } = await supabaseAdmin
        .storage
        .from(ATTACHMENT_BUCKET)
        .download(submission.storage_path);

      if (downloadError || !attachmentBlob) {
        throw new ContactError(
          "UPLOAD_MISSING",
          422,
          "Attachment upload is missing.",
        );
      }

      const bytes = new Uint8Array(await attachmentBlob.arrayBuffer());

      if (
        !submission.attachment_type ||
        !submission.attachment_size ||
        bytes.byteLength !== submission.attachment_size ||
        bytes.byteLength > MAX_ATTACHMENT_BYTES ||
        !attachmentMatchesType(bytes, submission.attachment_type)
      ) {
        await supabaseAdmin.storage
          .from(ATTACHMENT_BUCKET)
          .remove([submission.storage_path]);
        await supabaseAdmin
          .from("contact_submissions")
          .update({ status: "REJECTED", error_code: "INVALID_ATTACHMENT" })
          .eq("idempotency_key", input.idempotencyKey);
        throw new ContactError(
          "INVALID_ATTACHMENT",
          422,
          "Attachment failed validation.",
        );
      }

      attachmentContent = bytesToBase64(bytes);
    }

    const apiKey = Deno.env.get("RESEND_API_KEY")?.trim();

    if (!apiKey) {
      throw new ContactError(
        "EMAIL_NOT_CONFIGURED",
        503,
        "Email delivery is not configured.",
      );
    }

    const content = emailContent(
      submission as ContactSubmission,
      null,
    );
    const from = Deno.env.get("CONTACT_FROM_EMAIL")?.trim() ||
      "Groupe Pure <website@groupepure.ca>";
    const to = Deno.env.get("CONTACT_TO_EMAIL")?.trim() || "info@groupepure.ca";
    const payload: Record<string, unknown> = {
      from,
      to: [to],
      reply_to: submission.visitor_email,
      subject: content.subject,
      text: content.text,
      html: content.html,
      tags: [
        { name: "source", value: "contact_form" },
        { name: "locale", value: submission.locale },
        { name: "project_type", value: submission.project_type },
      ],
    };

    if (attachmentContent && submission.attachment_name) {
      payload.attachments = [
        {
          filename: submission.attachment_name,
          content: attachmentContent,
        },
      ];
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `contact/${input.idempotencyKey}`,
      },
      body: JSON.stringify(payload),
    });
    const resendResult = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      const errorName = typeof resendResult?.name === "string"
        ? resendResult.name
        : `HTTP_${resendResponse.status}`;
      console.error("contact_resend_failed", errorName);
      throw new ContactError(
        "DELIVERY_FAILED",
        502,
        "Email delivery failed.",
      );
    }

    const resendEmailId = typeof resendResult?.id === "string"
      ? resendResult.id
      : null;
    const { error: sentUpdateError } = await supabaseAdmin
      .from("contact_submissions")
      .update({
        status: "SENT",
        resend_email_id: resendEmailId,
        error_code: null,
        sent_at: new Date().toISOString(),
      })
      .eq("idempotency_key", input.idempotencyKey);

    if (sentUpdateError) {
      // Resend's idempotency key still protects retries for 24 hours.
      console.error("contact_sent_update_failed", sentUpdateError.code);
    }

    return jsonResponse({
      ok: true,
      sent: true,
      submissionId: input.idempotencyKey,
    });
  } catch (error) {
    const contactError = error instanceof ContactError
      ? error
      : new ContactError("DELIVERY_FAILED", 502, "Email delivery failed.");

    if (contactError.code !== "INVALID_ATTACHMENT") {
      await supabaseAdmin
        .from("contact_submissions")
        .update({ status: "FAILED", error_code: contactError.code })
        .eq("idempotency_key", input.idempotencyKey);
    }

    throw contactError;
  }
}

const handler = async (
  request: Request,
  context: { supabaseAdmin: SupabaseAdmin },
) => {
  try {
    requireAllowedOrigin(request);

    if (request.method !== "POST") {
      throw new ContactError(
        "METHOD_NOT_ALLOWED",
        405,
        "Method not allowed.",
      );
    }

    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      throw new ContactError(
        "INVALID_CONTENT_TYPE",
        415,
        "JSON body required.",
      );
    }

    const rawInput = await request.json();
    const action = rawInput && typeof rawInput === "object"
      ? (rawInput as Record<string, unknown>).action
      : null;

    if (action === "prepare") {
      return await prepareSubmission(
        request,
        context.supabaseAdmin,
        rawInput,
      );
    }

    if (action === "send") {
      return await sendSubmission(context.supabaseAdmin, rawInput);
    }

    throw new ContactError("INVALID_ACTION", 422, "Invalid action.");
  } catch (error) {
    if (error instanceof ContactError) {
      return jsonResponse(
        { ok: false, code: error.code, message: error.message },
        error.status,
      );
    }

    console.error(
      "contact_unexpected_error",
      error instanceof Error ? error.name : "unknown",
    );
    return jsonResponse(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message: "Unexpected contact service error.",
      },
      500,
    );
  }
};

export default {
  fetch: withSupabase(
    {
      auth: "publishable",
      cors: "default",
    },
    handler,
  ),
};
