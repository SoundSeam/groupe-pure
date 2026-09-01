"use client";

import { UploadSimple } from "@phosphor-icons/react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  createFormDefinition,
  definitionFieldOrder,
  labelsForForm,
  PROJECT_TYPES,
  type CmsFormDefinition,
  type CmsFormsPayload,
  type ContactFormLabels,
  type ProjectType,
} from "@/lib/cms/forms";
import { fieldClass } from "./styles";

type Locale = "fr" | "en";
const projectTypes: ProjectType[] = [...PROJECT_TYPES];

function isProjectType(value: string): value is ProjectType {
  return projectTypes.some((projectType) => projectType === value);
}

type ContactFormProps = {
  alignSubmitRight?: boolean;
  definition?: CmsFormDefinition;
  labels: ContactFormLabels;
  locale: Locale;
  preview?: boolean;
  submissionType?: "contact" | "application";
};

type Errors = Partial<
  Record<
    | "name"
    | "email"
    | "phone"
    | "projectType"
    | "subcategory"
    | "budgetRange"
    | "message"
    | "attachment",
    string
  >
>;

type PrepareResponse = {
  ok: boolean;
  sent?: boolean;
  submissionId?: string;
  upload?: {
    path: string;
    token: string;
  } | null;
};

type TurnstileRenderOptions = {
  sitekey: string;
  action: string;
  appearance: "interaction-only";
  theme: "dark";
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: TurnstileRenderOptions,
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

const maxAttachmentBytes = 20 * 1024 * 1024;
const turnstileSiteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
const errorFields = new Set<keyof Errors>([
  "name",
  "email",
  "phone",
  "projectType",
  "subcategory",
  "budgetRange",
  "message",
]);
const allowedAttachmentTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/heic",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const attachmentTypesByExtension: Record<string, string> = {
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  heic: "image/heic",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  pdf: "application/pdf",
  png: "image/png",
  webp: "image/webp",
};

function getAttachmentType(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const expectedType = attachmentTypesByExtension[extension] ?? "";
  const browserType = file.type.toLowerCase();

  if (!expectedType) {
    return "";
  }

  if (!browserType) {
    return expectedType;
  }

  return allowedAttachmentTypes.has(browserType) &&
      browserType === expectedType
    ? browserType
    : "";
}

async function getFunctionErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("context" in error)) {
    return "";
  }

  const context = (error as { context?: unknown }).context;

  if (!(context instanceof Response)) {
    return "";
  }

  try {
    const payload = (await context.clone().json()) as { code?: unknown };
    return typeof payload.code === "string" ? payload.code : "";
  } catch {
    return "";
  }
}

export default function ContactForm({
  alignSubmitRight = false,
  definition: suppliedDefinition,
  labels: fallbackLabels,
  locale,
  preview = false,
  submissionType = "contact",
}: ContactFormProps) {
  const pathname = usePathname();
  const fallbackDefinition = useMemo(
    () => createFormDefinition(fallbackLabels),
    [fallbackLabels],
  );
  const [publishedDefinition, setPublishedDefinition] =
    useState<CmsFormDefinition | null>(null);
  const definition =
    suppliedDefinition ?? publishedDefinition ?? fallbackDefinition;
  const labels = useMemo(
    () => labelsForForm(definition, fallbackLabels),
    [definition, fallbackLabels],
  );
  const enabledProjectTypes = projectTypes.filter(
    (projectType) => definition.projectTypes[projectType].enabled,
  );
  const [projectType, setProjectType] = useState<ProjectType | "">("");
  const [subcategory, setSubcategory] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isDraggingAttachment, setIsDraggingAttachment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState("");
  const [turnstileScriptReady, setTurnstileScriptReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
  const submissionId = useRef<string | null>(null);
  const turnstileContainer = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  useEffect(() => {
    if (suppliedDefinition || preview) return;

    let active = true;
    const controller = new AbortController();

    void fetch("/api/cms/forms", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) =>
        response.ok ? ((await response.json()) as CmsFormsPayload) : null,
      )
      .then((payload) => {
        if (!active || !payload) return;
        setPublishedDefinition(
          payload.config.locales[locale][
            submissionType === "application" ? "application" : "contact"
          ],
        );
      })
      .catch(() => undefined);

    return () => {
      active = false;
      controller.abort();
    };
  }, [locale, pathname, preview, submissionType, suppliedDefinition]);

  useEffect(() => {
    if (
      preview ||
      !turnstileSiteKey ||
      !turnstileScriptReady ||
      !turnstileContainer.current ||
      !window.turnstile ||
      turnstileWidgetId.current
    ) {
      return;
    }

    turnstileWidgetId.current = window.turnstile.render(
      turnstileContainer.current,
      {
        sitekey: turnstileSiteKey,
        action: "contact_form",
        appearance: "interaction-only",
        theme: "dark",
        callback: (token) => {
          setTurnstileToken(token);
          setStatus((current) =>
            current === labels.verificationError ? "" : current
          );
        },
        "expired-callback": () => {
          setTurnstileToken("");
        },
        "error-callback": () => {
          setTurnstileToken("");
          setStatus(labels.verificationUnavailable);
        },
      },
    );

    return () => {
      if (turnstileWidgetId.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetId.current);
      }

      turnstileWidgetId.current = null;
    };
  }, [
    labels.verificationError,
    labels.verificationUnavailable,
    preview,
    turnstileScriptReady,
  ]);

  function resetTurnstile() {
    setTurnstileToken("");

    if (turnstileWidgetId.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetId.current);
    }
  }

  function handleProjectTypeChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const value = event.target.value;

    setProjectType(isProjectType(value) ? value : "");
    setSubcategory("");
    setErrors((current) => ({
      ...current,
      projectType: undefined,
      subcategory: undefined,
    }));
  }

  function selectAttachment(file: File | null) {
    if (!file) {
      setAttachmentFile(null);
      setErrors((current) => ({ ...current, attachment: undefined }));
      submissionId.current = null;
      return true;
    }

    const attachmentType = getAttachmentType(file);

    if (!attachmentType) {
      setAttachmentFile(null);
      setErrors((current) => ({
        ...current,
        attachment: labels.invalidAttachment,
      }));
      return false;
    }

    if (file.size > maxAttachmentBytes) {
      setAttachmentFile(null);
      setErrors((current) => ({
        ...current,
        attachment: labels.attachmentTooLarge,
      }));
      return false;
    }

    setAttachmentFile(file);
    setErrors((current) => ({ ...current, attachment: undefined }));
    submissionId.current = null;
    return true;
  }

  function finishSuccessfully(form: HTMLFormElement) {
    form.reset();
    setProjectType("");
    setSubcategory("");
    setAttachmentFile(null);
    setErrors({});
    setStatus(labels.success);
    submissionId.current = null;
    setFormStartedAt(Date.now());
    resetTurnstile();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const projectTypeValue = String(formData.get("projectType") ?? "").trim();
    const subcategoryValue = String(formData.get("subcategory") ?? "").trim();
    const budgetRange = String(formData.get("budgetRange") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim();
    const nextErrors: Errors = {};

    if (!name) nextErrors.name = labels.required;
    if (!email) {
      nextErrors.email = labels.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = labels.invalidEmail;
    }
    if (
      definition.fields.phone.enabled &&
      definition.fields.phone.required &&
      !phone
    ) {
      nextErrors.phone = labels.required;
    }
    if (!projectTypeValue) nextErrors.projectType = labels.required;
    if (!subcategoryValue) nextErrors.subcategory = labels.required;
    if (!budgetRange) nextErrors.budgetRange = labels.required;
    if (!message) nextErrors.message = labels.required;
    if (
      definition.fields.attachment.enabled &&
      definition.fields.attachment.required &&
      !attachmentFile
    ) {
      nextErrors.attachment = labels.required;
    } else if (attachmentFile && !getAttachmentType(attachmentFile)) {
      nextErrors.attachment = labels.invalidAttachment;
    } else if (attachmentFile && attachmentFile.size > maxAttachmentBytes) {
      nextErrors.attachment = labels.attachmentTooLarge;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("");
      return;
    }

    if (!isProjectType(projectTypeValue)) {
      setErrors((current) => ({
        ...current,
        projectType: labels.required,
      }));
      return;
    }

    if (!preview && turnstileSiteKey && !turnstileToken) {
      setStatus(labels.verificationError);
      resetTurnstile();
      return;
    }

    const currentSubmissionId =
      submissionId.current ?? crypto.randomUUID();
    submissionId.current = currentSubmissionId;
    setIsSubmitting(true);
    setStatus(labels.sending);

    try {
      const supabase = createSupabaseBrowserClient();
      const attachmentType = attachmentFile
        ? getAttachmentType(attachmentFile)
        : "";
      const { data: preparedData, error: prepareError } =
        await supabase.functions.invoke("contact", {
          body: {
            action: "prepare",
            idempotencyKey: currentSubmissionId,
            locale,
            name,
            email,
            phone,
            projectType: projectTypeValue,
            subcategory:
              submissionType === "application"
                ? `application::${subcategoryValue}`
                : subcategoryValue,
            budgetRange,
            message,
            website,
            startedAt: formStartedAt,
            turnstileToken: turnstileToken || undefined,
            attachment: attachmentFile
              ? {
                  name: attachmentFile.name,
                  type: attachmentType,
                  size: attachmentFile.size,
                }
              : null,
          },
        });

      if (prepareError) {
        const code = await getFunctionErrorCode(prepareError);
        if (code === "RATE_LIMITED") {
          setStatus(labels.rateLimited);
        } else if (code === "VERIFICATION_FAILED") {
          submissionId.current = null;
          setStatus(labels.verificationError);
          resetTurnstile();
        } else {
          setStatus(labels.submissionError);
        }
        return;
      }

      const prepared = preparedData as PrepareResponse | null;

      if (!prepared?.ok) {
        setStatus(labels.submissionError);
        return;
      }

      if (prepared.sent) {
        finishSuccessfully(form);
        return;
      }

      if (prepared.upload) {
        if (!attachmentFile) {
          setStatus(labels.submissionError);
          return;
        }

        const { error: uploadError } = await supabase.storage
          .from("contact-attachments")
          .uploadToSignedUrl(
            prepared.upload.path,
            prepared.upload.token,
            attachmentFile,
            {
              contentType: attachmentType,
            },
          );

        if (uploadError) {
          setStatus(labels.submissionError);
          return;
        }
      }

      const { data: sentData, error: sendError } =
        await supabase.functions.invoke("contact", {
          body: {
            action: "send",
            idempotencyKey: currentSubmissionId,
          },
        });

      if (sendError) {
        const code = await getFunctionErrorCode(sendError);
        setStatus(code === "RATE_LIMITED" ? labels.rateLimited : labels.submissionError);
        return;
      }

      if (!(sentData as { sent?: boolean } | null)?.sent) {
        setStatus(labels.submissionError);
        return;
      }

      finishSuccessfully(form);
    } catch {
      setStatus(labels.submissionError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {!preview && turnstileSiteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={() => setTurnstileScriptReady(true)}
          onError={() => {
            setTurnstileScriptReady(false);
            setStatus(labels.verificationUnavailable);
          }}
        />
      ) : null}
      <form
      className="grid gap-4 sm:grid-cols-2"
      data-cms-ignore
      noValidate
      data-form-preview={preview ? "true" : undefined}
      aria-busy={isSubmitting}
      onChange={(event) => {
        if (!isSubmitting) {
          const fieldName = (event.target as unknown as { name?: string })
            .name as keyof Errors;

          if (errorFields.has(fieldName)) {
            setErrors((current) => ({
              ...current,
              [fieldName]: undefined,
            }));
          }

          if (submissionId.current) {
            submissionId.current = null;
            resetTurnstile();
          }
          setStatus("");
        }
      }}
      onSubmit={handleSubmit}
    >
      <div
        className="pointer-events-none absolute -left-[10000px] h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <input
          aria-hidden="true"
          autoComplete="off"
          id="website"
          name="website"
          tabIndex={-1}
          type="text"
        />
      </div>
      <div style={{ order: definitionFieldOrder(definition, "name") }}>
        <label className="sr-only" htmlFor="name">
          {labels.name}
        </label>
        <input
          className={fieldClass}
          id="name"
          maxLength={120}
          name="name"
          placeholder={definition.fields.name.placeholder}
          type="text"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name ? (
          <p id="name-error" className="mt-2 text-sm text-white/65">
            {errors.name}
          </p>
        ) : null}
      </div>
      <div style={{ order: definitionFieldOrder(definition, "email") }}>
        <label className="sr-only" htmlFor="email">
          {labels.email}
        </label>
        <input
          className={fieldClass}
          id="email"
          maxLength={254}
          name="email"
          placeholder={definition.fields.email.placeholder}
          type="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email ? (
          <p id="email-error" className="mt-2 text-sm text-white/65">
            {errors.email}
          </p>
        ) : null}
      </div>
      {definition.fields.phone.enabled ? (
      <div style={{ order: definitionFieldOrder(definition, "phone") }}>
        <label className="sr-only" htmlFor="phone">
          {labels.phone}
        </label>
        <input
          className={fieldClass}
          id="phone"
          maxLength={50}
          name="phone"
          placeholder={definition.fields.phone.placeholder}
          type="tel"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : undefined}
        />
        {errors.phone ? (
          <p id="phone-error" className="mt-2 text-sm text-white/65">
            {errors.phone}
          </p>
        ) : null}
      </div>
      ) : null}
      <div style={{ order: definitionFieldOrder(definition, "projectType") }}>
        <label className="sr-only" htmlFor="projectType">
          {labels.projectType}
        </label>
        <div className="relative">
          <select
            className={`${fieldClass} appearance-none pr-14 text-white [&:invalid]:text-white/40`}
            id="projectType"
            name="projectType"
            required
            value={projectType}
            onChange={handleProjectTypeChange}
            aria-invalid={Boolean(errors.projectType)}
            aria-describedby={
              errors.projectType ? "project-type-error" : undefined
            }
          >
            <option value="" disabled>
              {labels.projectTypePlaceholder}
            </option>
            {enabledProjectTypes.map((option) => (
              <option key={option} value={option}>
                {labels.options[option]}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              d="m4 6 4 4 4-4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        {errors.projectType ? (
          <p id="project-type-error" className="mt-2 text-sm text-white/65">
            {errors.projectType}
          </p>
        ) : null}
      </div>
      <div style={{ order: definitionFieldOrder(definition, "subcategory") }}>
        <label className="sr-only" htmlFor="subcategory">
          {labels.subcategory}
        </label>
        <div className="relative">
          <select
            className={`${fieldClass} appearance-none pr-14 text-white disabled:cursor-not-allowed disabled:text-white/25 disabled:opacity-60 [&:invalid]:text-white/40`}
            disabled={!projectType}
            id="subcategory"
            name="subcategory"
            required
            value={subcategory}
            onChange={(event) => setSubcategory(event.target.value)}
            aria-invalid={Boolean(errors.subcategory)}
            aria-describedby={
              errors.subcategory ? "subcategory-error" : undefined
            }
          >
            <option value="" disabled>
              {projectType
                ? labels.subcategoryPlaceholder
                : labels.subcategoryDisabledPlaceholder}
            </option>
            {projectType
              ? labels.subcategoryOptions[projectType].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))
              : null}
          </select>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              d="m4 6 4 4 4-4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        {errors.subcategory ? (
          <p id="subcategory-error" className="mt-2 text-sm text-white/65">
            {errors.subcategory}
          </p>
        ) : null}
      </div>
      <div style={{ order: definitionFieldOrder(definition, "budgetRange") }}>
        <label className="sr-only" htmlFor="budgetRange">
          {labels.budgetRange}
        </label>
        <div className="relative">
          <select
            className={`${fieldClass} appearance-none pr-14 text-white [&:invalid]:text-white/40`}
            defaultValue=""
            id="budgetRange"
            name="budgetRange"
            required
            aria-invalid={Boolean(errors.budgetRange)}
            aria-describedby={
              errors.budgetRange ? "budget-range-error" : undefined
            }
          >
            <option value="" disabled>
              {labels.budgetRangePlaceholder}
            </option>
            {labels.budgetOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              d="m4 6 4 4 4-4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        {errors.budgetRange ? (
          <p id="budget-range-error" className="mt-2 text-sm text-white/65">
            {errors.budgetRange}
          </p>
        ) : null}
      </div>
      <div
        className="sm:col-span-2"
        style={{ order: definitionFieldOrder(definition, "message") }}
      >
        <label className="sr-only" htmlFor="message">
          {labels.message}
        </label>
        <textarea
          className={`${fieldClass} min-h-40 resize-none`}
          id="message"
          maxLength={5000}
          name="message"
          placeholder={definition.fields.message.placeholder}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message ? (
          <p id="message-error" className="mt-2 text-sm text-white/65">
            {errors.message}
          </p>
        ) : null}
      </div>
      {definition.fields.attachment.enabled ? (
      <div
        className="sm:col-span-2"
        style={{ order: definitionFieldOrder(definition, "attachment") }}
      >
        <input
          accept=".doc,.docx,.heic,.jpeg,.jpg,.pdf,.png,.webp"
          aria-describedby={
            errors.attachment ? "attachment-error" : undefined
          }
          aria-invalid={Boolean(errors.attachment)}
          className="peer sr-only"
          id="attachment"
          name="attachment"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;

            if (!selectAttachment(file)) {
              event.target.value = "";
            }
          }}
          type="file"
        />
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-[#171a18] px-5 py-8 text-center transition ${
            isDraggingAttachment
              ? "border-[#e4c58f] bg-[#e4c58f]/5"
              : "border-white/20 hover:border-white/35"
          } peer-focus-visible:border-white/50`}
          htmlFor="attachment"
          onDragLeave={() => setIsDraggingAttachment(false)}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDraggingAttachment(true);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDraggingAttachment(false);
            selectAttachment(event.dataTransfer.files[0] ?? null);
          }}
        >
          <UploadSimple
            aria-hidden="true"
            className="h-5 w-5 text-white/55"
          />
          <span
            className={`max-w-full truncate ${
              attachmentFile ? "text-white" : "text-white/40"
            }`}
          >
            {attachmentFile?.name || definition.fields.attachment.placeholder}
          </span>
        </label>
        {errors.attachment ? (
          <p
            id="attachment-error"
            className="mt-2 text-sm text-white/65"
          >
            {errors.attachment}
          </p>
        ) : null}
      </div>
      ) : null}
      {!preview && turnstileSiteKey ? (
        <div className="sm:col-span-2" style={{ order: 90 }}>
          <div
            ref={turnstileContainer}
            aria-label={labels.verificationError}
            className="min-h-0"
          />
        </div>
      ) : null}
      <div className="sm:col-span-2" style={{ order: 100 }}>
        <button
          type={preview ? "button" : "submit"}
          disabled={isSubmitting}
          className={`rounded-xl bg-[#e4c58f] px-9 py-4 text-lg font-medium text-[#101211] transition hover:bg-[#e4c58f]/90 disabled:cursor-wait disabled:opacity-65 ${
            alignSubmitRight ? "ml-auto block" : ""
          }`}
        >
          {isSubmitting ? labels.sending : labels.submit}
        </button>
        {status ? (
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/65" role="status">
            {status}
          </p>
        ) : null}
      </div>
      </form>
    </>
  );
}
