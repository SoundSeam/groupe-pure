"use client";

import { UploadSimple } from "@phosphor-icons/react";
import { useState } from "react";

import { fieldClass } from "./styles";

type ProjectType = "architecture" | "construction" | "excavation";

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
  required: string;
  invalidEmail: string;
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
  recipient: string;
};

type Errors = Partial<
  Record<
    "name" | "email" | "projectType" | "subcategory" | "budgetRange" | "message",
    string
  >
>;

export default function ContactForm({
  alignSubmitRight = false,
  labels,
  recipient,
}: ContactFormProps) {
  const [projectType, setProjectType] = useState<ProjectType | "">("");
  const [subcategory, setSubcategory] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [isDraggingAttachment, setIsDraggingAttachment] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState("");

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const projectTypeValue = String(formData.get("projectType") ?? "").trim();
    const subcategoryValue = String(formData.get("subcategory") ?? "").trim();
    const budgetRange = String(formData.get("budgetRange") ?? "").trim();
    const attachmentName = attachmentFile?.name.trim() ?? "";
    const message = String(formData.get("message") ?? "").trim();
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

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("");
      return;
    }

    const projectTypeLabel = isProjectType(projectTypeValue)
      ? labels.options[projectTypeValue]
      : projectTypeValue;
    const body = [
      `${labels.emailBodyLabels.name}: ${name}`,
      `${labels.emailBodyLabels.email}: ${email}`,
      `${labels.emailBodyLabels.phone}: ${phone || "-"}`,
      `${labels.emailBodyLabels.projectType}: ${projectTypeLabel}`,
      `${labels.emailBodyLabels.subcategory}: ${subcategoryValue}`,
      `${labels.emailBodyLabels.budgetRange}: ${budgetRange}`,
      `${labels.emailBodyLabels.attachment}: ${attachmentName || "-"}`,
      "",
      `${labels.emailBodyLabels.message}:`,
      message,
    ].join("\n");

    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(
      labels.emailSubject,
    )}&body=${encodeURIComponent(body)}`;

    setStatus(labels.success);
    window.location.href = mailto;
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" noValidate onSubmit={handleSubmit}>
      <div>
        <label className="sr-only" htmlFor="name">
          {labels.name}
        </label>
        <input
          className={fieldClass}
          id="name"
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
          className="peer sr-only"
          id="attachment"
          name="attachment"
          onChange={(event) =>
            setAttachmentFile(event.target.files?.[0] ?? null)
          }
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
            setAttachmentFile(event.dataTransfer.files[0] ?? null);
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
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className={`rounded-xl bg-[#e4c58f] px-9 py-4 text-lg font-medium text-[#101211] transition hover:bg-[#e4c58f]/90 ${
            alignSubmitRight ? "ml-auto block" : ""
          }`}
        >
          {labels.submit}
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
