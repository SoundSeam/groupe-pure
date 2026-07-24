import {
  attachmentMatchesType,
  bytesToBase64,
  ContactError,
  type ContactSubmission,
  emailContent,
  safeFileName,
  validatePrepareRequest,
} from "./index.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function validPrepareRequest() {
  return {
    action: "prepare",
    idempotencyKey: "51060f96-f97a-4b82-9b75-1d9b1bc88b58",
    locale: "fr",
    name: "Client Test",
    email: "CLIENT@example.com",
    phone: "514-555-0100",
    projectType: "construction",
    subcategory: "Construction neuve",
    budgetRange: "250 000 $ à 500 000 $",
    message: "Projet résidentiel.",
    website: "",
    startedAt: Date.now() - 5000,
    attachment: {
      name: "plans.pdf",
      type: "application/pdf",
      size: 1024,
    },
  };
}

Deno.test("validates and normalizes a complete submission", () => {
  const result = validatePrepareRequest(validPrepareRequest());

  assert(result.email === "client@example.com", "Email was not normalized.");
  assert(result.attachment?.name === "plans.pdf", "Attachment was lost.");
});

Deno.test("rejects unsupported and oversized attachments", () => {
  for (
    const attachment of [
      { name: "payload.exe", type: "application/octet-stream", size: 100 },
      { name: "payload.exe", type: "application/pdf", size: 100 },
      {
        name: "plans.pdf",
        type: "application/pdf",
        size: 20 * 1024 * 1024 + 1,
      },
    ]
  ) {
    let caught: unknown;

    try {
      validatePrepareRequest({
        ...validPrepareRequest(),
        attachment,
      });
    } catch (error) {
      caught = error;
    }

    assert(caught instanceof ContactError, "Invalid attachment was accepted.");
  }
});

Deno.test("checks file signatures instead of trusting MIME metadata", () => {
  assert(
    attachmentMatchesType(
      new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
      "application/pdf",
    ),
    "A valid PDF signature was rejected.",
  );
  assert(
    !attachmentMatchesType(
      new Uint8Array([0x4d, 0x5a, 0x90, 0x00]),
      "application/pdf",
    ),
    "An executable disguised as a PDF was accepted.",
  );
  assert(
    attachmentMatchesType(
      new Uint8Array([
        0x52,
        0x49,
        0x46,
        0x46,
        0,
        0,
        0,
        0,
        0x57,
        0x45,
        0x42,
        0x50,
      ]),
      "image/webp",
    ),
    "A valid WebP signature was rejected.",
  );
});

Deno.test("sanitizes storage filenames", () => {
  assert(
    safeFileName("../../Plans été 2026.pdf") ===
      "Plans-ete-2026.pdf",
    "Filename sanitization changed unexpectedly.",
  );
});

Deno.test("encodes attachment bytes deterministically for Resend retries", () => {
  const bytes = new Uint8Array([0, 1, 2, 253, 254, 255]);

  assert(
    bytesToBase64(bytes) === "AAEC/f7/",
    "Attachment encoding changed unexpectedly.",
  );
});

Deno.test("escapes visitor content in the internal email", () => {
  const submission: ContactSubmission = {
    idempotency_key: "51060f96-f97a-4b82-9b75-1d9b1bc88b58",
    locale: "en",
    name: "<script>alert(1)</script>",
    visitor_email: "client@example.com",
    phone: null,
    project_type: "architecture",
    subcategory: "Custom design",
    budget_range: "$100,000–$250,000",
    message: "<img src=x onerror=alert(1)>",
    attachment_name: null,
    attachment_type: null,
    attachment_size: null,
    storage_path: null,
    status: "PENDING",
  };
  const content = emailContent(submission, null);

  assert(!content.html.includes("<script>"), "Name HTML was not escaped.");
  assert(!content.html.includes("<img src=x"), "Message HTML was not escaped.");
  assert(
    content.html.includes("&lt;script&gt;"),
    "Escaped visitor content is missing.",
  );
  assert(
    content.subject.startsWith("Nouvelle demande de projet"),
    "The owner email subject is not in French.",
  );
  assert(
    content.text.includes("Sous-catégorie: Conception sur mesure"),
    "The English sub-category was not translated for the owner.",
  );
  assert(
    content.text.includes("Budget prévu: 100 000 $ à 250 000 $"),
    "The English budget was not translated for the owner.",
  );
});
