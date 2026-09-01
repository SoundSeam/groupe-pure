import "server-only";

import { getDictionary } from "@/lib/dictionaries";
import {
  createFormDefinition,
  type CmsFormsDocument,
  type ContactFormLabels,
} from "@/lib/cms/forms";

export async function defaultFormsDocument(): Promise<CmsFormsDocument> {
  const [fr, en] = await Promise.all([
    getDictionary("fr"),
    getDictionary("en"),
  ]);

  return {
    version: 1,
    locales: {
      fr: {
        contact: createFormDefinition(fr.form as ContactFormLabels),
        application: createFormDefinition(
          fr.teamPage.applicationForm as ContactFormLabels,
        ),
      },
      en: {
        contact: createFormDefinition(en.form as ContactFormLabels),
        application: createFormDefinition(
          en.teamPage.applicationForm as ContactFormLabels,
        ),
      },
    },
  };
}
