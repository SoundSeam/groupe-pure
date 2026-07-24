"use client";

import { UploadSimple } from "@phosphor-icons/react";
import { useRef, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fieldClass } from "./styles";

type ProjectType = "architecture" | "construction" | "excavation";
type Locale = "fr" | "en";

type ContactFormLabels = {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  projectTypePlaceholder: string;
  subcategory: string;
  subcategoryPlaceholder: string;
  subcategoryDisabledPlaceholder: string;
  budgetRange: string;
  budgetRangePlaceholder: string;
  message: string;
  attachment: string;
  submit: string;
  sending: string;
  required: string;
  invalidEmail: string;
  invalidAttachment: string;
  attachmentTooLarge: string;
  submissionError: string;
  rateLimited: string;
  success: string;
  options: Record<ProjectType, string>;
  subcategoryOptions: Record<ProjectType, readonly string[]>;
  budgetOptions: readonly string[];
  emailSubject: string;
  emailBodyLabels: {
    name: string;
    email: string;
    phone: string;
    projectType: string;
    subcategory: string;
    budgetRange: string;
    attachment: string;
    message: string;
  };
};

const projectTypes: ProjectType[] = [
  "architecture",
  "construction",
  "excavation",
];

function isProjectType(value: string): value is ProjectType {
  return projectTypes.some((projectType) => projectType === value);
}

type ContactFormProps = {
  alignSubmitRight?: boolean;
  labels: ContactFormLabels;
  locale: Locale;
};

type Errors = Partial<
  Record<
    | "name"
    | "email"
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

const maxAttachmentBytes = 20 * 1024 * 1024;
const errorFields = new Set<keyof Errors>([
  "name",
  "email",
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
  labels,
  locale,
}: ContactFormProps) {
  const [projectType, setProjectType] = useState<ProjectType | "">("");
  const [subcategory, setSubcategory] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isDraggingAttachment, setIsDraggingAttachment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState("");
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
  const submissionId = useRef<string | null>(null);

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
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    if (!projectTypeValue) nextErrors.projectType = labels.required;
    if (!subcategoryValue) nextErrors.subcategory = labels.required;
    if (!budgetRange) nextErrors.budgetRange = labels.required;
    if (!message) nextErrors.message = labels.required;
    if (attachmentFile && !getAttachmentType(attachmentFile)) {
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
            subcategory: subcategoryValue,
            budgetRange,
            message,
            website,
            startedAt: formStartedAt,
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
        setStatus(code === "RATE_LIMITED" ? labels.rateLimited : labels.submissionError);
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
    <form
      className="grid gap-4 sm:grid-cols-2"
      data-cms-ignore
      noValidate
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

          submissionId.current = null;
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
      <div>
        <label className="sr-only" htmlFor="name">
          {labels.name}
        </label>
        <input
          className={fieldClass}
          id="name"
          maxLength={120}
          name="name"
          placeholder={labels.name}
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
      <div>
        <label className="sr-only" htmlFor="email">
          {labels.email}
        </label>
        <input
          className={fieldClass}
          id="email"
          maxLength={254}
          name="email"
          placeholder={labels.email}
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
      <div>
        <label className="sr-only" htmlFor="phone">
          {labels.phone}
        </label>
        <input
          className={fieldClass}
          id="phone"
          maxLength={50}
          name="phone"
          placeholder={labels.phone}
          type="tel"
        />
      </div>
      <div>
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
            {projectTypes.map((option) => (
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
      <div>
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
      <div>
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
      <div className="sm:col-span-2">
        <label className="sr-only" htmlFor="message">
          {labels.message}
        </label>
        <textarea
          className={`${fieldClass} min-h-40 resize-none`}
          id="message"
          maxLength={5000}
          name="message"
          placeholder={labels.message}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message ? (
          <p id="message-error" className="mt-2 text-sm text-white/65">
            {errors.message}
          </p>
        ) : null}
      </div>
      <div className="sm:col-span-2">
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
            {attachmentFile?.name || labels.attachment}
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
      <div className="sm:col-span-2">
        <button
          type="submit"
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
  );
}
