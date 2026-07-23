import { PageHero, SectionShell } from "./site-ui";

type LegalSection = {
  body: React.ReactNode;
  title: string;
};

export default function LegalPage({
  eyebrow,
  lead,
  sections,
  title,
  updated,
}: {
  eyebrow: string;
  lead: string;
  sections: LegalSection[];
  title: string;
  updated: string;
}) {
  return (
    <main>
      <PageHero eyebrow={eyebrow} title={title} lead={lead} />
      <SectionShell className="pt-0">
        <div className="max-w-3xl">
          <p className="text-sm text-white/50">{updated}</p>
          <div className="mt-12 space-y-12">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-base font-light leading-8 text-white/70">
                  {section.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </SectionShell>
    </main>
  );
}
