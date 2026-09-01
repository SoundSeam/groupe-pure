"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Eye,
  FloppyDisk,
  PaperPlaneTilt,
  SignOut,
  SpinnerGap,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import ContactForm from "@/components/contact-form";
import {
  PROJECT_TYPES,
  type CmsFormDefinition,
  type CmsFormsDocument,
  type CmsFormsPayload,
  type ContactFormLabels,
  type FormFieldId,
  type FormKind,
  type FormLocale,
  type FormOption,
  type ProjectType,
} from "@/lib/cms/forms";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Activity = "idle" | "loading" | "saving" | "publishing" | "error";

const fieldNames: Record<FormLocale, Record<FormFieldId, string>> = {
  fr: {
    name: "Nom",
    email: "Courriel",
    phone: "Téléphone",
    projectType: "Type de projet / domaine",
    subcategory: "Sous-catégorie / rôle",
    budgetRange: "Budget / disponibilité",
    message: "Message",
    attachment: "Pièce jointe",
  },
  en: {
    name: "Name",
    email: "Email",
    phone: "Phone",
    projectType: "Project type / discipline",
    subcategory: "Sub-category / role",
    budgetRange: "Budget / availability",
    message: "Message",
    attachment: "Attachment",
  },
};

const formNames: Record<FormLocale, Record<FormKind, string>> = {
  fr: { contact: "Demande de projet", application: "Candidature" },
  en: { contact: "Project inquiry", application: "Application" },
};

const messageNames: Record<
  FormLocale,
  Record<keyof CmsFormDefinition["messages"], string>
> = {
  fr: {
    submit: "Bouton d’envoi",
    sending: "Pendant l’envoi",
    success: "Confirmation",
    required: "Champ requis",
    invalidEmail: "Courriel invalide",
    invalidAttachment: "Fichier invalide",
    attachmentTooLarge: "Fichier trop volumineux",
    submissionError: "Erreur d’envoi",
    rateLimited: "Trop de demandes",
    verificationError: "Échec de vérification",
    verificationUnavailable: "Vérification indisponible",
  },
  en: {
    submit: "Submit button",
    sending: "While sending",
    success: "Confirmation",
    required: "Required field",
    invalidEmail: "Invalid email",
    invalidAttachment: "Invalid file",
    attachmentTooLarge: "File too large",
    submissionError: "Submission error",
    rateLimited: "Too many requests",
    verificationError: "Verification failed",
    verificationUnavailable: "Verification unavailable",
  },
};

function previewLabels(definition: CmsFormDefinition): ContactFormLabels {
  const field = definition.fields;

  return {
    name: field.name.label,
    email: field.email.label,
    phone: field.phone.label,
    projectType: field.projectType.label,
    projectTypePlaceholder: field.projectType.placeholder,
    subcategory: field.subcategory.label,
    subcategoryPlaceholder: field.subcategory.placeholder,
    subcategoryDisabledPlaceholder:
      field.subcategory.disabledPlaceholder ?? field.subcategory.placeholder,
    budgetRange: field.budgetRange.label,
    budgetRangePlaceholder: field.budgetRange.placeholder,
    message: field.message.label,
    attachment: field.attachment.label,
    ...definition.messages,
    options: Object.fromEntries(
      PROJECT_TYPES.map((type) => [type, definition.projectTypes[type].label]),
    ) as Record<ProjectType, string>,
    subcategoryOptions: Object.fromEntries(
      PROJECT_TYPES.map((type) => [
        type,
        definition.subcategoryOptions[type].map((option) => option.label),
      ]),
    ) as Record<ProjectType, string[]>,
    budgetOptions: definition.budgetOptions.map((option) => option.label),
    emailSubject: "",
    emailBodyLabels: {
      name: field.name.label,
      email: field.email.label,
      phone: field.phone.label,
      projectType: field.projectType.label,
      subcategory: field.subcategory.label,
      budgetRange: field.budgetRange.label,
      attachment: field.attachment.label,
      message: field.message.label,
    },
  };
}

function optionsText(options: FormOption[]) {
  return options
    .filter((option) => option.enabled)
    .map((option) => option.label)
    .join("\n");
}

function optionsFromText(
  value: string,
  current: FormOption[],
  prefix: string,
) {
  const labels = value
    .split("\n")
    .slice(0, 60);

  return labels.map((label, index) => ({
    id:
      current[index]?.id ??
      `${prefix}-${Date.now().toString(36)}-${index + 1}`,
    label,
    enabled: true,
  }));
}

function cloneDocument(document: CmsFormsDocument) {
  return structuredClone(document);
}

export default function AdminForms({
  email,
  initialConfig,
}: {
  email: string;
  initialConfig: CmsFormsDocument;
}) {
  const [config, setConfig] = useState(initialConfig);
  const [serverSnapshot, setServerSnapshot] = useState(initialConfig);
  const [locale, setLocale] = useState<FormLocale>("fr");
  const [formKind, setFormKind] = useState<FormKind>("contact");
  const [revision, setRevision] = useState(0);
  const [publishedRevision, setPublishedRevision] = useState(0);
  const [activity, setActivity] = useState<Activity>("loading");
  const [message, setMessage] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const dirty = JSON.stringify(config) !== JSON.stringify(serverSnapshot);
  const busy =
    activity === "loading" ||
    activity === "saving" ||
    activity === "publishing";
  const definition = config.locales[locale][formKind];

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/api/cms/forms?mode=draft", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as
          | CmsFormsPayload
          | { error?: string }
          | null;
        if (!response.ok || !payload || !("config" in payload)) {
          throw new Error(
            payload && "error" in payload && payload.error
              ? payload.error
              : "Les formulaires n’ont pas pu être chargés.",
          );
        }
        return payload;
      })
      .then((payload) => {
        setConfig(payload.config);
        setServerSnapshot(payload.config);
        setRevision(payload.revision);
        setPublishedRevision(payload.publishedRevision);
        setActivity("idle");
      })
      .catch((error: Error) => {
        if (error.name === "AbortError") return;
        setMessage(error.message);
        setActivity("error");
      });

    return () => controller.abort();
  }, []);

  function editDefinition(change: (draft: CmsFormDefinition) => void) {
    setConfig((current) => {
      const next = cloneDocument(current);
      change(next.locales[locale][formKind]);
      return next;
    });
    setActivity("idle");
    setMessage("");
  }

  function moveField(fieldId: FormFieldId, direction: -1 | 1) {
    editDefinition((draft) => {
      const index = draft.fieldOrder.indexOf(fieldId);
      const destination = index + direction;
      if (index < 0 || destination < 0 || destination >= draft.fieldOrder.length) {
        return;
      }
      [draft.fieldOrder[index], draft.fieldOrder[destination]] = [
        draft.fieldOrder[destination],
        draft.fieldOrder[index],
      ];
    });
  }

  async function saveDraft() {
    setActivity("saving");
    setMessage("");
    const response = await fetch("/api/cms/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config, baseRevision: revision }),
    });
    const payload = (await response.json().catch(() => null)) as {
      config?: CmsFormsDocument;
      revision?: number;
      publishedRevision?: number;
      error?: string;
    } | null;

    if (!response.ok || typeof payload?.revision !== "number") {
      setMessage(payload?.error ?? "Le brouillon n’a pas pu être enregistré.");
      setActivity("error");
      return null;
    }

    const savedConfig = payload.config ?? config;
    setConfig(savedConfig);
    setRevision(payload.revision);
    setPublishedRevision(payload.publishedRevision ?? publishedRevision);
    setServerSnapshot(savedConfig);
    setActivity("idle");
    setMessage("Brouillon enregistré.");
    return { revision: payload.revision, config: savedConfig };
  }

  async function publish() {
    let baseRevision = revision;
    let publishedConfig = config;
    if (dirty) {
      const saved = await saveDraft();
      if (saved === null) return;
      baseRevision = saved.revision;
      publishedConfig = saved.config;
    }

    setActivity("publishing");
    setMessage("");
    const response = await fetch("/api/cms/forms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseRevision }),
    });
    const payload = (await response.json().catch(() => null)) as {
      revision?: number;
      publishedRevision?: number;
      error?: string;
    } | null;

    if (
      !response.ok ||
      typeof payload?.revision !== "number" ||
      typeof payload.publishedRevision !== "number"
    ) {
      setMessage(payload?.error ?? "La publication n’a pas fonctionné.");
      setActivity("error");
      return;
    }

    setRevision(payload.revision);
    setPublishedRevision(payload.publishedRevision);
    setConfig(publishedConfig);
    setServerSnapshot(publishedConfig);
    setActivity("idle");
    setMessage("Formulaires publiés.");
  }

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await createSupabaseBrowserClient().auth.signOut({ scope: "global" });
    } finally {
      window.location.replace("/admin");
    }
  }

  if (signingOut) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#101211] text-white">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <SpinnerGap className="h-4 w-4 animate-spin" /> Déconnexion…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0d0c] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#111412]/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-[1500px] items-center gap-2 px-4 sm:px-6">
          <Link
            href="/admin/fr"
            className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-white/65 transition hover:bg-white/8 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Éditeur</span>
          </Link>
          <Link
            href="/admin/pages"
            className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-white/65 transition hover:bg-white/8 hover:text-white"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Pages</span>
          </Link>
          <div className="mx-2 h-6 w-px bg-white/10" />
          <h1 className="text-sm font-semibold sm:text-base">Formulaires</h1>

          <div className="ml-auto flex items-center gap-2">
            {message ? (
              <p
                className={`hidden text-xs sm:block ${activity === "error" ? "text-red-300" : "text-white/50"}`}
                role="status"
              >
                {message}
              </p>
            ) : null}
            <button
              type="button"
              disabled={busy || !dirty}
              onClick={() => void saveDraft()}
              className="flex h-9 items-center gap-2 rounded-lg border border-white/12 px-3 text-sm font-medium text-white/75 transition hover:bg-white/8 disabled:opacity-35"
            >
              {activity === "saving" ? (
                <SpinnerGap className="h-4 w-4 animate-spin" />
              ) : (
                <FloppyDisk className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Enregistrer</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void publish()}
              className="flex h-9 items-center gap-2 rounded-lg bg-[#e4c58f] px-4 text-sm font-semibold text-[#101211] transition hover:bg-[#efd4a5] disabled:opacity-45"
            >
              {activity === "publishing" ? (
                <SpinnerGap className="h-4 w-4 animate-spin" />
              ) : publishedRevision === revision && revision > 0 && !dirty ? (
                <Check className="h-4 w-4" weight="bold" />
              ) : (
                <PaperPlaneTilt className="h-4 w-4" />
              )}
              Publier
            </button>
            <button
              type="button"
              title={email}
              aria-label="Déconnexion"
              onClick={() => void signOut()}
              className="grid h-9 w-9 place-items-center rounded-lg text-white/55 transition hover:bg-white/8 hover:text-white"
            >
              <SignOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-white/10 bg-[#111412] p-1">
            {FORM_KINDS_UI.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setFormKind(kind)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  formKind === kind
                    ? "bg-white text-[#101211]"
                    : "text-white/58 hover:text-white"
                }`}
              >
                {formNames[locale][kind]}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border border-white/10 bg-[#111412] p-1">
            {(["fr", "en"] as const).map((nextLocale) => (
              <button
                key={nextLocale}
                type="button"
                onClick={() => setLocale(nextLocale)}
                className={`rounded-md px-3 py-2 text-xs font-semibold uppercase transition ${
                  locale === nextLocale
                    ? "bg-[#e4c58f] text-[#101211]"
                    : "text-white/55 hover:text-white"
                }`}
              >
                {nextLocale}
              </button>
            ))}
          </div>
        </div>

        {message ? (
          <p
            className={`mt-4 text-sm sm:hidden ${activity === "error" ? "text-red-300" : "text-white/55"}`}
            role="status"
          >
            {message}
          </p>
        ) : null}

        <div
          className={`mt-6 grid items-start gap-8 transition xl:grid-cols-[minmax(0,760px)_minmax(430px,1fr)] ${
            busy ? "pointer-events-none opacity-65" : ""
          }`}
        >
          <div className="space-y-6">
            <EditorSection
              title={locale === "fr" ? "Champs" : "Fields"}
              description={
                locale === "fr"
                  ? "Modifiez le texte et l’ordre. Le téléphone et la pièce jointe peuvent être masqués."
                  : "Edit wording and order. Phone and attachment can be hidden."
              }
            >
              <div className="divide-y divide-white/8">
                {definition.fieldOrder.map((fieldId, index) => {
                  const field = definition.fields[fieldId];
                  const optional = fieldId === "phone" || fieldId === "attachment";

                  return (
                    <div key={fieldId} className="grid gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[2.25rem_minmax(0,1fr)]">
                      <div className="flex gap-1 sm:flex-col">
                        <OrderButton
                          label="Monter"
                          disabled={index === 0 || busy}
                          onClick={() => moveField(fieldId, -1)}
                        >
                          <ArrowUp />
                        </OrderButton>
                        <OrderButton
                          label="Descendre"
                          disabled={index === definition.fieldOrder.length - 1 || busy}
                          onClick={() => moveField(fieldId, 1)}
                        >
                          <ArrowDown />
                        </OrderButton>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-white">
                            {fieldNames[locale][fieldId]}
                          </h3>
                          {optional ? (
                            <div className="flex items-center gap-4 text-xs text-white/60">
                              <SimpleCheckbox
                                checked={field.enabled}
                                label={locale === "fr" ? "Afficher" : "Show"}
                                onChange={(checked) =>
                                  editDefinition((draft) => {
                                    draft.fields[fieldId].enabled = checked;
                                    if (!checked) draft.fields[fieldId].required = false;
                                  })
                                }
                              />
                              <SimpleCheckbox
                                checked={field.required}
                                disabled={!field.enabled}
                                label={locale === "fr" ? "Obligatoire" : "Required"}
                                onChange={(checked) =>
                                  editDefinition((draft) => {
                                    draft.fields[fieldId].required = checked;
                                  })
                                }
                              />
                            </div>
                          ) : (
                            <span className="text-[11px] text-white/35">
                              {locale === "fr" ? "Champ essentiel" : "Core field"}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <TextControl
                            label={locale === "fr" ? "Libellé" : "Label"}
                            value={field.label}
                            onChange={(value) =>
                              editDefinition((draft) => {
                                draft.fields[fieldId].label = value;
                              })
                            }
                          />
                          <TextControl
                            label={
                              fieldId === "attachment"
                                ? locale === "fr"
                                  ? "Texte affiché"
                                  : "Displayed text"
                                : locale === "fr"
                                  ? "Texte dans le champ"
                                  : "Placeholder"
                            }
                            value={field.placeholder}
                            onChange={(value) =>
                              editDefinition((draft) => {
                                draft.fields[fieldId].placeholder = value;
                              })
                            }
                          />
                          {fieldId === "subcategory" ? (
                            <div className="sm:col-span-2">
                              <TextControl
                                label={
                                  locale === "fr"
                                    ? "Avant la sélection du type"
                                    : "Before a type is selected"
                                }
                                value={field.disabledPlaceholder ?? ""}
                                onChange={(value) =>
                                  editDefinition((draft) => {
                                    draft.fields.subcategory.disabledPlaceholder = value;
                                  })
                                }
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </EditorSection>

            <EditorSection
              title={locale === "fr" ? "Choix" : "Choices"}
              description={
                locale === "fr"
                  ? "Un choix par ligne. Réorganisez simplement les lignes."
                  : "One choice per line. Reorder the lines to reorder choices."
              }
            >
              <div className="space-y-5">
                {PROJECT_TYPES.map((projectType) => {
                  const option = definition.projectTypes[projectType];
                  const enabledCount = PROJECT_TYPES.filter(
                    (type) => definition.projectTypes[type].enabled,
                  ).length;

                  return (
                    <div key={projectType} className="rounded-lg border border-white/8 bg-white/[0.018] p-4">
                      <div className="flex items-end gap-3">
                        <div className="min-w-0 flex-1">
                          <TextControl
                            label={
                              locale === "fr" ? "Type principal" : "Main type"
                            }
                            value={option.label}
                            onChange={(value) =>
                              editDefinition((draft) => {
                                draft.projectTypes[projectType].label = value;
                              })
                            }
                          />
                        </div>
                        <SimpleCheckbox
                          checked={option.enabled}
                          disabled={option.enabled && enabledCount === 1}
                          label={locale === "fr" ? "Actif" : "Active"}
                          onChange={(checked) =>
                            editDefinition((draft) => {
                              draft.projectTypes[projectType].enabled = checked;
                            })
                          }
                        />
                      </div>
                      <label className="mt-4 block text-xs font-medium text-white/48">
                        {locale === "fr" ? "Sous-catégories" : "Sub-categories"}
                        <textarea
                          rows={Math.min(
                            10,
                            Math.max(4, definition.subcategoryOptions[projectType].length),
                          )}
                          value={optionsText(definition.subcategoryOptions[projectType])}
                          onChange={(event) => {
                            const value = event.target.value;
                            editDefinition((draft) => {
                              draft.subcategoryOptions[projectType] = optionsFromText(
                                value,
                                draft.subcategoryOptions[projectType],
                                `${projectType}-subcategory`,
                              );
                            });
                          }}
                          className="mt-2 w-full resize-y rounded-md border border-white/10 bg-[#0d100e] px-3 py-2.5 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-[#e4c58f]/70"
                        />
                      </label>
                    </div>
                  );
                })}

                <label className="block text-xs font-medium text-white/48">
                  {formKind === "application"
                    ? locale === "fr"
                      ? "Disponibilités"
                      : "Availability"
                    : locale === "fr"
                      ? "Tranches de budget"
                      : "Budget ranges"}
                  <textarea
                    rows={Math.min(10, Math.max(4, definition.budgetOptions.length))}
                    value={optionsText(definition.budgetOptions)}
                    onChange={(event) => {
                      const value = event.target.value;
                      editDefinition((draft) => {
                        draft.budgetOptions = optionsFromText(
                          value,
                          draft.budgetOptions,
                          "budget",
                        );
                      });
                    }}
                    className="mt-2 w-full resize-y rounded-md border border-white/10 bg-[#0d100e] px-3 py-2.5 text-sm leading-6 text-white outline-none transition focus:border-[#e4c58f]/70"
                  />
                </label>
              </div>
            </EditorSection>

            <EditorSection
              title={locale === "fr" ? "Messages" : "Messages"}
              description={
                locale === "fr"
                  ? "Texte du bouton, confirmation et erreurs montrées aux visiteurs."
                  : "Button, confirmation, and error text shown to visitors."
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {(Object.keys(definition.messages) as Array<
                  keyof CmsFormDefinition["messages"]
                >).map((key) => (
                  <div
                    key={key}
                    className={
                      key === "success" ||
                      key === "submissionError" ||
                      key === "verificationUnavailable"
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <TextControl
                      multiline={
                        key === "success" ||
                        key === "submissionError" ||
                        key === "verificationUnavailable"
                      }
                      label={messageNames[locale][key]}
                      value={definition.messages[key]}
                      onChange={(value) =>
                        editDefinition((draft) => {
                          draft.messages[key] = value;
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </EditorSection>
          </div>

          <aside className="xl:sticky xl:top-24">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111412] shadow-2xl shadow-black/20">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/38">
                  {locale === "fr" ? "Aperçu" : "Preview"}
                </p>
                <h2 className="mt-1 font-semibold text-white">
                  {formNames[locale][formKind]}
                </h2>
              </div>
              <div className="bg-[#101211] p-5 sm:p-7">
                <ContactForm
                  definition={definition}
                  labels={previewLabels(definition)}
                  locale={locale}
                  preview
                  submissionType={formKind === "application" ? "application" : "contact"}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

const FORM_KINDS_UI: FormKind[] = ["contact", "application"];

function EditorSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#111412] p-5 sm:p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-white/45">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function TextControl({
  label,
  value,
  multiline = false,
  onChange,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const classes =
    "mt-2 w-full rounded-md border border-white/10 bg-[#0d100e] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#e4c58f]/70";

  return (
    <label className="block text-xs font-medium text-white/48">
      {label}
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${classes} resize-y leading-6`}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={classes}
        />
      )}
    </label>
  );
}

function SimpleCheckbox({
  checked,
  disabled = false,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 whitespace-nowrap">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[#e4c58f] disabled:opacity-40"
      />
      <span>{label}</span>
    </label>
  );
}

function OrderButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-md border border-white/10 text-white/48 transition hover:bg-white/8 hover:text-white disabled:opacity-20 [&>svg]:h-3.5 [&>svg]:w-3.5"
    >
      {children}
    </button>
  );
}
