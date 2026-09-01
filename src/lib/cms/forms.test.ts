import { describe, expect, it } from "vitest";

import {
  createFormDefinition,
  normalizeFormsDocument,
  type CmsFormsDocument,
  type ContactFormLabels,
} from "./forms";

const labels: ContactFormLabels = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  projectType: "Project type",
  projectTypePlaceholder: "Select a type",
  subcategory: "Sub-category",
  subcategoryPlaceholder: "Select a sub-category",
  subcategoryDisabledPlaceholder: "Select a type first",
  budgetRange: "Budget",
  budgetRangePlaceholder: "Select a budget",
  message: "Message",
  attachment: "Attachment",
  submit: "Send",
  sending: "Sending",
  required: "Required",
  invalidEmail: "Invalid email",
  invalidAttachment: "Invalid attachment",
  attachmentTooLarge: "Too large",
  submissionError: "Submission error",
  rateLimited: "Rate limited",
  verificationError: "Verification error",
  verificationUnavailable: "Verification unavailable",
  success: "Success",
  options: {
    architecture: "Architecture",
    construction: "Construction",
    excavation: "Excavation",
  },
  subcategoryOptions: {
    architecture: ["Plans"],
    construction: ["Renovation"],
    excavation: ["Foundations"],
  },
  budgetOptions: ["Under $25,000", "$25,000–$50,000"],
  emailSubject: "Subject",
  emailBodyLabels: {
    name: "Name",
    email: "Email",
    phone: "Phone",
    projectType: "Project type",
    subcategory: "Sub-category",
    budgetRange: "Budget",
    attachment: "Attachment",
    message: "Message",
  },
};

function fallbackDocument(): CmsFormsDocument {
  const contact = createFormDefinition(labels);
  const application = createFormDefinition({
    ...labels,
    submit: "Apply",
  });

  return {
    version: 1,
    locales: {
      fr: { contact, application },
      en: {
        contact: structuredClone(contact),
        application: structuredClone(application),
      },
    },
  };
}

describe("CMS form configuration", () => {
  it("creates a complete editable definition from existing labels", () => {
    const definition = createFormDefinition(labels);

    expect(definition.fields.projectType.placeholder).toBe("Select a type");
    expect(definition.projectTypes.architecture.id).toBe("architecture");
    expect(definition.subcategoryOptions.construction[0].label).toBe(
      "Renovation",
    );
    expect(definition.budgetOptions).toHaveLength(2);
  });

  it("preserves admin copy, ordering, choices, and optional-field settings", () => {
    const fallback = fallbackDocument();
    const edited = structuredClone(fallback);
    const contact = edited.locales.fr.contact;
    contact.fields.name.placeholder = "Votre nom complet";
    contact.fields.phone.enabled = false;
    contact.fieldOrder = [
      "email",
      "name",
      "phone",
      "projectType",
      "subcategory",
      "budgetRange",
      "message",
      "attachment",
    ];
    contact.budgetOptions = [
      { id: "custom-budget", label: "Sur mesure", enabled: true },
    ];

    const result = normalizeFormsDocument(edited, fallback);

    expect(result.locales.fr.contact.fields.name.placeholder).toBe(
      "Votre nom complet",
    );
    expect(result.locales.fr.contact.fields.phone.enabled).toBe(false);
    expect(result.locales.fr.contact.fieldOrder.slice(0, 2)).toEqual([
      "email",
      "name",
    ]);
    expect(result.locales.fr.contact.budgetOptions[0]).toMatchObject({
      id: "custom-budget",
      label: "Sur mesure",
    });
  });

  it("keeps core fields active and guarantees at least one project type", () => {
    const fallback = fallbackDocument();
    const edited = structuredClone(fallback);
    const contact = edited.locales.en.contact;
    contact.fields.email.enabled = false;
    contact.fields.email.required = false;
    contact.projectTypes.architecture.enabled = false;
    contact.projectTypes.construction.enabled = false;
    contact.projectTypes.excavation.enabled = false;

    const result = normalizeFormsDocument(edited, fallback);
    const normalized = result.locales.en.contact;

    expect(normalized.fields.email.enabled).toBe(true);
    expect(normalized.fields.email.required).toBe(true);
    expect(normalized.projectTypes.architecture.enabled).toBe(true);
  });

  it("repairs incomplete field ordering and rejects empty option lists", () => {
    const fallback = fallbackDocument();
    const edited = structuredClone(fallback);
    edited.locales.en.application.fieldOrder = ["message", "message"];
    edited.locales.en.application.budgetOptions = [];

    const result = normalizeFormsDocument(edited, fallback);
    const application = result.locales.en.application;

    expect(application.fieldOrder[0]).toBe("message");
    expect(new Set(application.fieldOrder).size).toBe(8);
    expect(application.budgetOptions).toEqual(
      fallback.locales.en.application.budgetOptions,
    );
  });
});
