import Image from "next/image";
import { Blueprint, Bulldozer, CraneTower } from "@phosphor-icons/react/ssr";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

const pillars = [
  {
    title: "Architecture",
    icon: "architecture",
    lead: "Donner forme à l’intention.",
  },
  {
    title: "Construction",
    icon: "construction",
    lead: "Bâtir avec maîtrise.",
  },
  {
    title: "Excavation",
    icon: "excavation",
    lead: "Préparer le sol. Élever la suite.",
  },
];

const featuredProjects = [
  {
    title: "LE 2100",
    image:
      "https://www.matierepremierearchitecture.ca/assets/project/le-plateau/6.jpg?4b5713bb",
  },
  {
    title: "RÉSIDENCE MONTCALM",
    image:
      "https://www.matierepremierearchitecture.ca/assets/project/le-plateau/3.jpg?fc0d2768",
  },
  {
    title: "MAISON AUREL",
    image:
      "https://www.matierepremierearchitecture.ca/assets/project/le-plateau/4.jpg?bb264d85",
  },
  {
    title: "DOMAINE ÉLYSÉE",
    image:
      "https://www.matierepremierearchitecture.ca/assets/project/sur-le-ruisseau/1.jpg?c96649b5",
  },
  {
    title: "PAVILLON ORION",
    image:
      "https://www.matierepremierearchitecture.ca/assets/project/sur-le-ruisseau/2.jpg?ec02dae8",
  },
  {
    title: "ATELIER BELVÉDÈRE",
    image:
      "https://www.matierepremierearchitecture.ca/assets/project/sur-le-ruisseau/3.jpg?e7e1ab66",
  },
].map((project) => ({
  ...project,
  imageAlt: project.title,
}));

const contactPhoneLabel = "(514) 885-5877";
const contactPhoneHref = "tel:+15148855877";
const contactEmail = "info@groupepure.ca";
const contactAddress = "2100 Bd Marie-Victorin, Longueuil, QC J4G 1A8";

function StarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3 w-3 fill-current"
      viewBox="0 0 576 512"
    >
      <path d="M316.9 18.6 385 156.2l151.9 22.1c26.2 3.8 36.7 36.1 17.7 54.6L444.7 340l25.9 151.3c4.5 26.1-23 46-46.4 33.7L288 453.4 151.8 525c-23.4 12.3-50.9-7.6-46.4-33.7L131.3 340 21.4 232.9c-19-18.5-8.5-50.8 17.7-54.6L191 156.2 259.1 18.6c11.7-23.8 45-23.8 57.8 0z" />
    </svg>
  );
}

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <main className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-end overflow-hidden rounded-b-[3rem] pb-16 text-left sm:pb-20">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        >
          <source
            src="https://soundseam-origin.s3.us-east-2.amazonaws.com/misc/tic+.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-[#101211]/70" />
        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-end justify-between gap-8 px-6 sm:px-10">
          <div className="flex max-w-4xl flex-col items-start">
            <h1 className="text-4xl font-semibold text-white [text-shadow:0_3px_24px_rgba(0,0,0,0.55)] sm:text-6xl">
              Une vision pure, portée jusqu’à sa pleine réalisation.
            </h1>
            <p className="mt-6 max-w-xl text-lg font-light leading-8 text-white/70 [text-shadow:0_2px_18px_rgba(0,0,0,0.5)] sm:text-xl">
              Groupe Pure accompagne les projets ambitieux de leur première
              intention jusqu’à leur livraison finale, avec une même exigence :
              créer, bâtir et livrer avec précision.
            </p>
            <button
              type="button"
              className="mt-10 rounded-xl bg-white px-9 py-4 text-lg font-medium text-[#101211]"
            >
              Démarrer un projet
            </button>
          </div>
          <div className="hidden shrink-0 text-right sm:block">
            <div className="relative h-10 w-32">
              <Image
                src="https://inscriptions.galonsapchq.com/assets/logo-apchq-d0e669d9d2244f9ddf421839a73a8f0a6bed7db640029f5d5827cfb2f0a78adb.png"
                alt="APCHQ"
                fill
                sizes="128px"
                className="object-contain"
              />
            </div>
            <p className="mt-2 w-32 text-center text-[10px] font-semibold leading-none text-white/70">
              RBQ 5773-2182-01
            </p>
          </div>
        </div>
      </main>

      <section className="bg-[#101211] py-20 sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="max-w-3xl text-3xl font-semibold text-white sm:text-5xl">
              Du premier trait à la dernière finition.
            </h2>
            <div className="flex flex-col items-center text-center lg:items-end">
              <div className="inline-flex items-center justify-center gap-2.5 bg-[#171a18] px-5 py-3">
                <div className="flex items-baseline gap-1 text-sm leading-none text-white">
                  <span className="font-semibold">5.0</span>
                  <span className="font-normal text-white/65">(13)</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[#fcac0a]">
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                </div>
              </div>
              <div className="relative mt-3 h-5 w-46 flex items-end">
                <Image
                  src="https://framerusercontent.com/images/LjmZJ9uXcyr7VxCbjoNlhmWT9Cg.png"
                  alt="Google"
                  fill
                  sizes="64px"
                  className="object-contain ml-auto"
                />
              </div>
            </div>
          </div>
          <div className="mt-14 grid gap-5 sm:mt-20 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="flex flex-col">
                <div className="flex aspect-[4/3] rounded-xl w-full items-center justify-center overflow-hidden bg-[#171a18]">
                  {pillar.icon === "architecture" ? (
                    <Blueprint
                      aria-hidden="true"
                      className="h-28 w-28 text-white sm:h-32 sm:w-32"
                      weight="thin"
                    />
                  ) : pillar.icon === "construction" ? (
                    <CraneTower
                      aria-hidden="true"
                      className="h-28 w-28 text-white sm:h-32 sm:w-32"
                      weight="thin"
                    />
                  ) : (
                    <Bulldozer
                      aria-hidden="true"
                      className="h-28 w-28 text-white sm:h-32 sm:w-32"
                      weight="thin"
                    />
                  )}
                </div>
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-white sm:text-3xl">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-base font-light leading-7 text-white/70 sm:text-lg">
                    {pillar.lead}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="relative mt-16 sm:mt-20">
            <div className="absolute top-0 bottom-0 left-1/2 w-screen -translate-x-1/2 bg-[#171a18]" />
            <div className="relative py-12 sm:py-16">
              <div className="grid gap-5 lg:grid-cols-3">
                <div>
                  <div className="mb-5 inline-block bg-white/10 px-3 py-2 rounded-lg text-xs font-semibold uppercase text-white">
                    Projets clé en main
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <h2 className="text-3xl font-semibold text-white sm:text-5xl">
                    Une seule firme. Du début à la fin.
                  </h2>
                  <div className="mt-8 space-y-5 text-lg font-light leading-8 text-white/70 sm:text-xl">
                    <p>
                      Groupe Pure réunit les compétences essentielles sous une
                      même direction afin de préserver la cohérence du projet,
                      de la première intention à la livraison finale.
                    </p>
                    <p>
                      Notre approche clé en main est pensée pour les projets
                      corporatifs, commerciaux et résidentiels haut de gamme.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-2 xl:grid-cols-3">
                {featuredProjects.map((project) => (
                  <article key={project.title} className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.imageAlt}
                      fill
                      sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/30" />
                    <div className="absolute left-5 top-5">
                      <h3 className="text-sm font-semibold uppercase text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.6)] sm:text-base">
                        {project.title}
                      </h3>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-10 flex justify-center sm:mt-12">
                <button
                  type="button"
                  className="rounded-xl bg-white px-9 py-4 text-lg font-medium text-[#101211]"
                >
                  Voir nos réalisations
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#101211] py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-16 px-6 sm:px-10 lg:grid-cols-2 lg:items-end">
          <div className="inline-flex w-fit flex-col items-start self-end lg:justify-self-start lg:items-start">
            <Image
              src="https://soundseam-origin.s3.us-east-2.amazonaws.com/misc/LogoGrouepPureNoWordmark.png"
              width={128}
              height={128}
              alt="Groupe Pure Logo"
              className="h-16 w-16"
            />
            <ul className="mt-8 inline-flex w-fit items-center gap-4 text-white">
              <li className="w-fit">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="inline-flex w-fit items-center justify-center"
                >
                  <FaInstagram className="h-5 w-5" aria-hidden="true" />
                </a>
              </li>
              <li className="w-fit">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="inline-flex w-fit items-center justify-center"
                >
                  <FaFacebookF className="h-4 w-4" aria-hidden="true" />
                </a>
              </li>
            </ul>
            <p className="mt-6 w-fit text-xl font-semibold text-white">
              © {currentYear} Groupe Pure Construction Inc.
            </p>
          </div>

          <div className="inline-flex w-fit flex-col items-start self-end lg:justify-self-end lg:items-end">
            <h2 className="text-2xl font-semibold text-white">Contact</h2>
            <div className="mt-8 inline-flex w-fit flex-col items-start gap-3 text-base text-white/78 lg:items-end lg:text-right">
              <a href={contactPhoneHref} className="inline-block w-fit">
                {contactPhoneLabel}
              </a>
              <a href={`mailto:${contactEmail}`} className="inline-block w-fit">
                {contactEmail}
              </a>
              <p className="w-fit max-w-xs text-balance">{contactAddress}</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
