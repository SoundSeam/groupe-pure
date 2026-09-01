export const FORM_LOCALES = ["fr", "en"] as const;
export type FormLocale = (typeof FORM_LOCALES)[number];

export const FORM_KINDS = ["contact", "application"] as const;
export type FormKind = (typeof FORM_KINDS)[number];

export const PROJECT_TYPES = [
  "architecture",
  "construction",
  "excavation",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const FORM_FIELD_IDS = [
  "name",
  "email",
  "phone",
  "projectType",
  "subcategory",
  "budgetRange",
  "message",
  "attachment",
] as const;
export type FormFieldId = (typeof FORM_FIELD_IDS)[number];

const OPTIONAL_FIELDS = new Set<FormFieldId>(["phone", "attachment"]);

export type ContactFormLabels = {
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
  verificationError: string;
  verificationUnavailable: string;
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

export type FormOption = {
  id: string;
  label: string;
  enabled: boolean;
};

export type FormFieldConfig = {
  label: string;
  placeholder: string;
  disabledPlaceholder?: string;
  enabled: boolean;
  required: boolean;
};

export type FormMessages = Pick<
  ContactFormLabels,
  | "submit"
  | "sending"
  | "required"
  | "invalidEmail"
  | "invalidAttachment"
  | "attachmentTooLarge"
  | "submissionError"
  | "rateLimited"
  | "verificationError"
  | "verificationUnavailable"
  | "success"
>;

export type CmsFormDefinition = {
  version: 1;
  fields: Record<FormFieldId, FormFieldConfig>;
  fieldOrder: FormFieldId[];
  projectTypes: Record<ProjectType, FormOption>;
  subcategoryOptions: Record<ProjectType, FormOption[]>;
  budgetOptions: FormOption[];
  messages: FormMessages;
};

export type LocalizedForms = Record<FormKind, CmsFormDefinition>;

export type CmsFormsDocument = {
  version: 1;
  locales: Record<FormLocale, LocalizedForms>;
};

export type CmsFormsPayload = {
  config: CmsFormsDocument;
  revision: number;
  publishedRevision: number;
  updatedAt: string | null;
};

function optionId(prefix: string, index: number) {
  return `${prefix}-${index + 1}`;
}

function optionsFromLabels(prefix: string, labels: readonly string[]) {
  return labels.map((label, index) => ({
    id: optionId(prefix, index),
    label,
    enabled: true,
  }));
}

export function createFormDefinition(
  labels: ContactFormLabels,
): CmsFormDefinition {
  return {
    version: 1,
    fields: {
      name: {
        label: labels.name,
        placeholder: labels.name,
        enabled: true,
        required: true,
      },
      email: {
        label: labels.email,
        placeholder: labels.email,
        enabled: true,
        required: true,
      },
      phone: {
        label: labels.phone,
        placeholder: labels.phone,
        enabled: true,
        required: false,
      },
      projectType: {
        label: labels.projectType,
        placeholder: labels.projectTypePlaceholder,
        enabled: true,
        required: true,
      },
      subcategory: {
        label: labels.subcategory,
        placeholder: labels.subcategoryPlaceholder,
        disabledPlaceholder: labels.subcategoryDisabledPlaceholder,
        enabled: true,
        required: true,
      },
      budgetRange: {
        label: labels.budgetRange,
        placeholder: labels.budgetRangePlaceholder,
        enabled: true,
        required: true,
      },
      message: {
        label: labels.message,
        placeholder: labels.message,
        enabled: true,
        required: true,
      },
      attachment: {
        label: labels.attachment,
        placeholder: labels.attachment,
        enabled: true,
        required: false,
      },
    },
    fieldOrder: [...FORM_FIELD_IDS],
    projectTypes: Object.fromEntries(
      PROJECT_TYPES.map((projectType) => [
        projectType,
        {
          id: projectType,
          label: labels.options[projectType],
          enabled: true,
        },
      ]),
    ) as Record<ProjectType, FormOption>,
    subcategoryOptions: Object.fromEntries(
      PROJECT_TYPES.map((projectType) => [
        projectType,
        optionsFromLabels(
          `${projectType}-subcategory`,
          labels.subcategoryOptions[projectType],
        ),
      ]),
    ) as Record<ProjectType, FormOption[]>,
    budgetOptions: optionsFromLabels("budget", labels.budgetOptions),
    messages: {
      submit: labels.submit,
      sending: labels.sending,
      required: labels.required,
      invalidEmail: labels.invalidEmail,
      invalidAttachment: labels.invalidAttachment,
      attachmentTooLarge: labels.attachmentTooLarge,
      submissionError: labels.submissionError,
      rateLimited: labels.rateLimited,
      verificationError: labels.verificationError,
      verificationUnavailable: labels.verificationUnavailable,
      success: labels.success,
    },
  };
}

function cleanString(value: unknown, fallback: string, maxLength = 500) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, maxLength)
    : fallback;
}

function cleanOption(
  value: unknown,
  fallback: FormOption,
  forcedId?: string,
): FormOption {
  const candidate =
    value && typeof value === "object"
      ? (value as Partial<FormOption>)
      : undefined;

  return {
    id: forcedId ?? cleanString(candidate?.id, fallback.id, 100),
    label: cleanString(candidate?.label, fallback.label, 160),
    enabled:
      typeof candidate?.enabled === "boolean"
        ? candidate.enabled
        : fallback.enabled,
  };
}

function cleanOptions(value: unknown, fallback: FormOption[], prefix: string) {
  if (!Array.isArray(value)) return fallback;

  const options = value
    .slice(0, 60)
    .map((entry, index) => {
      const fallbackOption = fallback[index] ?? {
        id: optionId(prefix, index),
        label: "",
        enabled: true,
      };
      return cleanOption(entry, fallbackOption);
    })
    .filter((option) => option.label);

  return options.length ? options : fallback;
}

function cleanField(
  value: unknown,
  fallback: FormFieldConfig,
  fieldId: FormFieldId,
) {
  const candidate =
    value && typeof value === "object"
      ? (value as Partial<FormFieldConfig>)
      : undefined;
  const optional = OPTIONAL_FIELDS.has(fieldId);

  return {
    label: cleanString(candidate?.label, fallback.label, 160),
    placeholder: cleanString(
      candidate?.placeholder,
      fallback.placeholder,
      fieldId === "message" ? 500 : 200,
    ),
    ...(fieldId === "subcategory"
      ? {
          disabledPlaceholder: cleanString(
            candidate?.disabledPlaceholder,
            fallback.disabledPlaceholder ?? fallback.placeholder,
            200,
          ),
        }
      : {}),
    enabled: optional
      ? candidate?.enabled !== false
      : true,
    required: optional
      ? candidate?.required === true
      : true,
  } satisfies FormFieldConfig;
}

function normalizeDefinition(value: unknown, fallback: CmsFormDefinition) {
  const candidate =
    value && typeof value === "object"
      ? (value as Partial<CmsFormDefinition>)
      : undefined;
  const fields = Object.fromEntries(
    FORM_FIELD_IDS.map((fieldId) => [
      fieldId,
      cleanField(candidate?.fields?.[fieldId], fallback.fields[fieldId], fieldId),
    ]),
  ) as Record<FormFieldId, FormFieldConfig>;
  const requestedOrder = Array.isArray(candidate?.fieldOrder)
    ? candidate.fieldOrder.filter(
        (fieldId): fieldId is FormFieldId =>
          typeof fieldId === "string" &&
          FORM_FIELD_IDS.includes(fieldId as FormFieldId),
      )
    : [];
  const fieldOrder = [
    ...new Set([...requestedOrder, ...FORM_FIELD_IDS]),
  ] as FormFieldId[];
  const projectTypes = Object.fromEntries(
    PROJECT_TYPES.map((projectType) => [
      projectType,
      cleanOption(
        candidate?.projectTypes?.[projectType],
        fallback.projectTypes[projectType],
        projectType,
      ),
    ]),
  ) as Record<ProjectType, FormOption>;

  if (!PROJECT_TYPES.some((projectType) => projectTypes[projectType].enabled)) {
    projectTypes[PROJECT_TYPES[0]].enabled = true;
  }

  const subcategoryOptions = Object.fromEntries(
    PROJECT_TYPES.map((projectType) => [
      projectType,
      cleanOptions(
        candidate?.subcategoryOptions?.[projectType],
        fallback.subcategoryOptions[projectType],
        `${projectType}-subcategory`,
      ),
    ]),
  ) as Record<ProjectType, FormOption[]>;
  const messages = Object.fromEntries(
    Object.entries(fallback.messages).map(([key, fallbackValue]) => [
      key,
      cleanString(
        candidate?.messages?.[key as keyof FormMessages],
        fallbackValue,
        600,
      ),
    ]),
  ) as FormMessages;

  return {
    version: 1,
    fields,
    fieldOrder,
    projectTypes,
    subcategoryOptions,
    budgetOptions: cleanOptions(
      candidate?.budgetOptions,
      fallback.budgetOptions,
      "budget",
    ),
    messages,
  } satisfies CmsFormDefinition;
}

export function normalizeFormsDocument(
  value: unknown,
  fallback: CmsFormsDocument,
): CmsFormsDocument {
  const candidate =
    value && typeof value === "object"
      ? (value as Partial<CmsFormsDocument>)
      : undefined;

  return {
    version: 1,
    locales: Object.fromEntries(
      FORM_LOCALES.map((locale) => [
        locale,
        Object.fromEntries(
          FORM_KINDS.map((kind) => [
            kind,
            normalizeDefinition(
              candidate?.locales?.[locale]?.[kind],
              fallback.locales[locale][kind],
            ),
          ]),
        ),
      ]),
    ) as Record<FormLocale, LocalizedForms>,
  };
}

export function labelsForForm(
  definition: CmsFormDefinition,
  fallback: ContactFormLabels,
): ContactFormLabels {
  return {
    ...fallback,
    name: definition.fields.name.label,
    email: definition.fields.email.label,
    phone: definition.fields.phone.label,
    projectType: definition.fields.projectType.label,
    projectTypePlaceholder: definition.fields.projectType.placeholder,
    subcategory: definition.fields.subcategory.label,
    subcategoryPlaceholder: definition.fields.subcategory.placeholder,
    subcategoryDisabledPlaceholder:
      definition.fields.subcategory.disabledPlaceholder ??
      definition.fields.subcategory.placeholder,
    budgetRange: definition.fields.budgetRange.label,
    budgetRangePlaceholder: definition.fields.budgetRange.placeholder,
    message: definition.fields.message.label,
    attachment: definition.fields.attachment.label,
    ...definition.messages,
    options: Object.fromEntries(
      PROJECT_TYPES.map((projectType) => [
        projectType,
        definition.projectTypes[projectType].label,
      ]),
    ) as Record<ProjectType, string>,
    subcategoryOptions: Object.fromEntries(
      PROJECT_TYPES.map((projectType) => [
        projectType,
        definition.subcategoryOptions[projectType]
          .filter((option) => option.enabled)
          .map((option) => option.label),
      ]),
    ) as Record<ProjectType, string[]>,
    budgetOptions: definition.budgetOptions
      .filter((option) => option.enabled)
      .map((option) => option.label),
  };
}

export function definitionFieldOrder(
  definition: CmsFormDefinition,
  fieldId: FormFieldId,
) {
  return definition.fieldOrder.indexOf(fieldId);
}
