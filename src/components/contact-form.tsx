"use client";

import { useState } from "react";

import { fieldClass } from "./styles";

type ContactFormLabels = {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  projectTypePlaceholder: string;
  message: string;
  submit: string;
  required: string;
  invalidEmail: string;
  success: string;
  options: {
    architecture: string;
    construction: string;
    excavation: string;
  };
  emailSubject: string;
  emailBodyLabels: {
    name: string;
    email: string;
    phone: string;
    projectType: string;
    message: string;
  };
};

type ContactFormProps = {
  labels: ContactFormLabels;
  recipient: string;
};

type Errors = Partial<Record<"name" | "email" | "projectType" | "message", string>>;

export default function ContactForm({ labels, recipient }: ContactFormProps) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const projectType = String(formData.get("projectType") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const nextErrors: Errors = {};

    if (!name) nextErrors.name = labels.required;
    if (!email) {
      nextErrors.email = labels.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = labels.invalidEmail;
    }
    if (!projectType) nextErrors.projectType = labels.required;
    if (!message) nextErrors.message = labels.required;

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("");
      return;
    }

    const body = [
      `${labels.emailBodyLabels.name}: ${name}`,
      `${labels.emailBodyLabels.email}: ${email}`,
      `${labels.emailBodyLabels.phone}: ${phone || "-"}`,
      `${labels.emailBodyLabels.projectType}: ${projectType}`,
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
            defaultValue=""
            id="projectType"
            name="projectType"
            aria-invalid={Boolean(errors.projectType)}
            aria-describedby={
              errors.projectType ? "project-type-error" : undefined
            }
          >
            <option value="" disabled>
              {labels.projectTypePlaceholder}
            </option>
            <option value={labels.options.architecture}>
              {labels.options.architecture}
            </option>
            <option value={labels.options.construction}>
              {labels.options.construction}
            </option>
            <option value={labels.options.excavation}>
              {labels.options.excavation}
            </option>
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
        <button
          type="submit"
          className="rounded-xl bg-white px-9 py-4 text-lg font-medium text-[#101211] transition hover:bg-white/90"
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
