import "server-only";

import { projectImages } from "./site-data";
import type { Locale } from "./i18n";

type ServiceKey = "architecture" | "construction" | "excavation";

export type Service = {
  key: ServiceKey;
  title: string;
  lead: string;
  detail: string;
  examples: string[];
  image: string;
  imageAlt: string;
  video?: string;
};

export type Project = {
  title: string;
  image: string;
  imageAlt: string;
  type: string;
  location: string;
  summary: string;
};

const serviceImages = {
  architecture:
    "https://www.matierepremierearchitecture.ca/assets/project/le-plateau/4.jpg?bb264d85",
  construction:
    "https://www.matierepremierearchitecture.ca/assets/project/sur-le-ruisseau/1.jpg?c96649b5",
  excavation:
    "https://soundseam-origin.s3.us-east-2.amazonaws.com/misc/ChatGPT+Image+Jun+1%2C+2026%2C+03_54_15+PM.png",
};

const architectureVideo =
  "https://soundseam-origin.s3.us-east-2.amazonaws.com/misc/super_cinematic%2C_slow_pan_202607221517.mp4";
const constructionVideo =
  "https://soundseam-origin.s3.us-east-2.amazonaws.com/misc/IMG_3004.mov";
const excavationVideo =
  "https://soundseam-origin.s3.us-east-2.amazonaws.com/misc/IMG_2222.mov";

const dictionaries = {
  fr: {
    metadata: {
      siteName: "Groupe Pure",
      home: {
        title: "Groupe Pure | Architecture, construction et excavation",
        description:
          "Groupe Pure accompagne les projets ambitieux en architecture, construction et excavation, de la première intention à la livraison finale.",
      },
      services: {
        title: "Services | Groupe Pure",
        description:
          "Architecture, construction et excavation coordonnées sous une même direction pour des projets résidentiels, commerciaux et corporatifs.",
      },
      projects: {
        title: "Projets | Groupe Pure",
        description:
          "Découvrez une sélection de réalisations Groupe Pure et l'approche de direction intégrée derrière chaque chantier.",
      },
      about: {
        title: "À propos | Groupe Pure",
        description:
          "Une firme clé en main qui réunit architecture, construction et excavation avec rigueur, cohérence et crédibilité APCHQ/RBQ.",
      },
      contact: {
        title: "Contact | Groupe Pure",
        description:
          "Contactez Groupe Pure pour discuter d'un projet d'architecture, de construction ou d'excavation.",
      },
    },
    header: {
      homeLabel: "Groupe Pure accueil",
      navLabel: "Navigation principale",
      mobileNavLabel: "Navigation mobile",
      openMenu: "Ouvrir le menu",
      closeMenu: "Fermer le menu",
      startProject: "Démarrer un projet",
      languageLabel: "Changer de langue",
      links: [
        { href: "/", label: "Accueil" },
        { href: "/services", label: "Services" },
        { href: "/projects", label: "Projets" },
        { href: "/about", label: "À propos" },
        { href: "/contact", label: "Contact" },
      ],
    },
    common: {
      contact: "Contact",
      startProject: "Démarrer un projet",
      viewWork: "Voir nos réalisations",
      learnMore: "En savoir plus",
      rbqCaption: "RBQ 5773-2182-01",
      apchqAlt: "APCHQ",
      googleAlt: "Google",
      logoAlt: "Groupe Pure Logo",
      copyright: "Groupe Pure Construction Inc.",
      social: {
        instagram: "Instagram",
        facebook: "Facebook",
      },
    },
    home: {
      heroTitle: "Une vision pure, portée jusqu'à sa pleine réalisation.",
      heroLead:
        "Groupe Pure accompagne les projets ambitieux de leur première intention jusqu'à leur livraison finale, avec une même exigence : créer, bâtir et livrer avec précision.",
      servicesTitle: "Du premier trait à la dernière finition.",
      ratingCount: "(13)",
      technicalTitle:
        "Des travaux techniques, intégrés à une vision complète.",
      technicalBody:
        "Certains projets commencent par une intention architecturale. D'autres par un problème plus concret : infiltration, fondation, drainage, excavation ou accès au bâtiment. Groupe Pure aborde ces réalités avec la même discipline, pour que les travaux invisibles soutiennent réellement la qualité du résultat final.",
      technicalCategories: [
        {
          title: "Fondations",
          body: "Fissures, imperméabilisation, infiltration, sous-sol.",
        },
        {
          title: "Terrain",
          body: "Excavation, drainage, entrée d'eau, margelles.",
        },
        {
          title: "Extérieur",
          body: "Béton, murets, pavé-uni, balcons, patios.",
        },
        {
          title: "Projet complet",
          body: "Conception, coordination, construction, livraison.",
        },
      ],
      processTitle: "Une méthode claire avant le chantier.",
      processSteps: [
        {
          title: "Comprendre le lieu",
          body: "On cerne les contraintes, les priorités et l'état réel du bâtiment ou du terrain.",
        },
        {
          title: "Cadrer les travaux",
          body: "On définit les interventions nécessaires, l'ordre logique et les responsabilités.",
        },
        {
          title: "Coordonner l'exécution",
          body: "Les décisions terrain sont suivies avec une vue d'ensemble du projet.",
        },
        {
          title: "Livrer proprement",
          body: "Le résultat doit être solide, cohérent et fidèle à l'intention initiale.",
        },
      ],
      territoryTitle:
        "Basés à Longueuil, présents sur la Rive-Sud et à Montréal.",
      territoryBody:
        "Groupe Pure intervient principalement à Longueuil, en Montérégie et dans plusieurs secteurs de Montréal, selon la nature du mandat et l'ampleur des travaux.",
      territoryRegions:
        "Longueuil · Montréal · Rive-Sud · Montérégie · Vallée-du-Richelieu · Haut-Richelieu",
      credibilityTitle: "Une réputation bâtie sur l'exécution.",
      credibilityBody:
        "Les clients recherchent une équipe capable de comprendre le projet, de cadrer les travaux et de livrer avec rigueur. Groupe Pure est présent sur des plateformes vérifiées et détient une licence RBQ active.",
      credibilityItems: [
        "RBQ 5773-2182-01",
        "Membre APCHQ",
        "Basés à Longueuil",
        "Avis vérifiés disponibles",
      ],
      aboutEyebrow: "Projets clé en main",
      aboutTitle: "Une seule firme. Du début à la fin.",
      aboutBody: [
        "Groupe Pure réunit les compétences essentielles sous une même direction afin de préserver la cohérence du projet, de la première intention à la livraison finale.",
        "Notre approche clé en main est pensée pour les projets corporatifs, commerciaux et résidentiels haut de gamme.",
      ],
      contactTitle:
        "Un projet à construire, corriger ou reprendre avec méthode?",
      contactLead:
        "Décrivez-nous le lieu, les travaux envisagés et l'état actuel du projet. Nous vous répondrons avec une première direction claire.",
      contactButton: "Cadrer mon projet",
    },
    services: [
      {
        key: "architecture",
        title: "Architecture",
        lead: "Nous transformons vos intentions en plans clairs, réfléchis et adaptés à la façon dont chaque lieu sera réellement habité.",
        detail:
          "L'équipe traduit les besoins, les contraintes et l'ambition du projet en une direction architecturale cohérente, prête à guider les étapes techniques et le chantier.",
        examples: [
          "Plans",
          "Conception",
          "Coordination technique",
          "Accompagnement des décisions",
        ],
        image: serviceImages.architecture,
        imageAlt: "Intérieur architectural contemporain",
        video: architectureVideo,
      },
      {
        key: "construction",
        title: "Construction",
        lead: "Nos équipes coordonnent chaque étape du chantier avec rigueur, pour que l'exécution reste fidèle à la vision initiale.",
        detail:
          "Planification, coordination des corps de métier, suivi de qualité et décisions terrain sont gérés avec une lecture globale du résultat attendu.",
        examples: [
          "Rénovation d'espaces de vie",
          "Agrandissements",
          "Balcons et patios",
          "Béton et finitions",
        ],
        image: serviceImages.construction,
        imageAlt: "Résidence contemporaine en construction",
        video: constructionVideo,
      },
      {
        key: "excavation",
        title: "Excavation",
        lead: "Nous préparons le terrain avec précision afin que les fondations du projet soient solides, propres et prêtes pour la suite.",
        detail:
          "Préparation de site, excavation, drainage et travaux préliminaires sont intégrés au calendrier du projet pour éviter les ruptures entre conception et exécution.",
        examples: [
          "Drain français",
          "Imperméabilisation",
          "Fissures et infiltration",
          "Entrée d'eau et margelles",
          "Ponceaux",
        ],
        image: serviceImages.excavation,
        imageAlt: "Terrain préparé pour un chantier haut de gamme",
        video: excavationVideo,
      },
    ] satisfies Service[],
    servicesPage: {
      eyebrow: "Services",
      title: "Architecture, construction et excavation sous une même direction.",
      lead: "Chaque discipline avance avec la même exigence : comprendre l'intention, protéger la qualité et livrer un résultat cohérent.",
      ctaTitle: "Un projet à structurer avec clarté?",
      ctaLead:
        "Présentez-nous vos objectifs. Nous vous aiderons à cadrer les prochaines étapes avec une direction réaliste.",
    },
    projects: [
      {
        title: "LE 2100",
        image: projectImages[0],
        imageAlt: "Projet LE 2100",
        type: "Commercial",
        location: "Longueuil",
        summary:
          "Direction intégrée pour un lieu sobre, précis et adapté aux exigences d'un usage professionnel.",
      },
      {
        title: "RÉSIDENCE MONTCALM",
        image: projectImages[1],
        imageAlt: "Résidence Montcalm",
        type: "Résidentiel",
        location: "Rive-Sud",
        summary:
          "Une résidence pensée autour de volumes calmes, de matériaux durables et d'une exécution contrôlée.",
      },
      {
        title: "MAISON AUREL",
        image: projectImages[2],
        imageAlt: "Maison Aurel",
        type: "Résidentiel",
        location: "Montréal",
        summary:
          "Architecture et construction coordonnées pour préserver la finesse des détails jusqu'à la livraison.",
      },
      {
        title: "DOMAINE ÉLYSÉE",
        image: projectImages[3],
        imageAlt: "Domaine Élysée",
        type: "Résidentiel haut de gamme",
        location: "Estrie",
        summary:
          "Un chantier complet mené avec une attention particulière aux seuils, aux vues et aux fondations.",
      },
      {
        title: "PAVILLON ORION",
        image: projectImages[4],
        imageAlt: "Pavillon Orion",
        type: "Corporatif",
        location: "Montérégie",
        summary:
          "Un espace de travail au langage architectural net, construit pour durer et évoluer.",
      },
      {
        title: "ATELIER BELVÉDÈRE",
        image: projectImages[5],
        imageAlt: "Atelier Belvédère",
        type: "Atelier",
        location: "Laurentides",
        summary:
          "Un volume fonctionnel et lumineux où les contraintes techniques deviennent une partie du caractère du lieu.",
      },
    ] satisfies Project[],
    projectsPage: {
      eyebrow: "Projets",
      title: "Des réalisations sobres, solides et précisément coordonnées.",
      lead: "Chaque projet présenté ici reflète la même méthode : une intention claire, une direction constante et une exécution attentive aux détails.",
      note:
        "Les fiches détaillées arrivent bientôt. Cette sélection présente déjà l'étendue des mandats et la qualité de l'approche Groupe Pure.",
    },
    aboutPage: {
      eyebrow: "À propos",
      title: "Une firme clé en main pour garder le projet entier.",
      lead: "Groupe Pure réunit architecture, construction et excavation afin que les décisions importantes restent alignées du début à la fin.",
      sections: [
        {
          title: "Direction intégrée",
          body: "Une seule équipe coordonne la vision, les priorités, les contraintes et le chantier. Les décisions sont plus claires parce qu'elles sont prises avec une compréhension complète du projet.",
        },
        {
          title: "Qualité mesurable",
          body: "Les matériaux, les détails et les méthodes d'exécution sont suivis avec rigueur. L'objectif est simple : livrer un résultat durable, propre et fidèle à l'intention initiale.",
        },
        {
          title: "Crédibilité terrain",
          body: "Membre APCHQ et titulaire RBQ, Groupe Pure travaille avec les standards attendus pour des projets corporatifs, commerciaux et résidentiels haut de gamme.",
        },
      ],
      sectorsTitle: "Secteurs servis",
      sectors: ["Corporatif", "Commercial", "Résidentiel haut de gamme"],
    },
    contactPage: {
      eyebrow: "Contact",
      title: "Commençons par cadrer votre projet.",
      lead: "Envoyez-nous les grandes lignes. Le formulaire prépare un courriel avec vos informations afin que vous puissiez l'envoyer depuis votre boîte mail.",
      directTitle: "Coordonnées directes",
      formTitle: "Votre demande",
    },
    form: {
      name: "Nom",
      email: "Courriel",
      phone: "Téléphone",
      projectType: "Type de chantier",
      projectTypePlaceholder: "Sélectionner un type",
      message: "Message",
      submit: "Préparer le courriel",
      required: "Ce champ est requis.",
      invalidEmail: "Entrez une adresse courriel valide.",
      success:
        "Votre application courriel va s'ouvrir avec un message préparé. Vous pourrez le relire avant l'envoi.",
      options: {
        architecture: "Architecture",
        construction: "Construction",
        excavation: "Excavation",
      },
      emailSubject: "Nouvelle demande de projet",
      emailBodyLabels: {
        name: "Nom",
        email: "Courriel",
        phone: "Téléphone",
        projectType: "Type de chantier",
        message: "Message",
      },
    },
  },
  en: {
    metadata: {
      siteName: "Groupe Pure",
      home: {
        title: "Groupe Pure | Architecture, construction and excavation",
        description:
          "Groupe Pure supports ambitious architecture, construction and excavation projects from first intent to final delivery.",
      },
      services: {
        title: "Services | Groupe Pure",
        description:
          "Architecture, construction and excavation coordinated under one direction for residential, commercial and corporate projects.",
      },
      projects: {
        title: "Projects | Groupe Pure",
        description:
          "Explore selected Groupe Pure projects and the integrated direction behind each build.",
      },
      about: {
        title: "About | Groupe Pure",
        description:
          "A turnkey firm bringing together architecture, construction and excavation with discipline, cohesion and APCHQ/RBQ credibility.",
      },
      contact: {
        title: "Contact | Groupe Pure",
        description:
          "Contact Groupe Pure to discuss an architecture, construction or excavation project.",
      },
    },
    header: {
      homeLabel: "Groupe Pure home",
      navLabel: "Primary navigation",
      mobileNavLabel: "Mobile navigation",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      startProject: "Start a project",
      languageLabel: "Change language",
      links: [
        { href: "/", label: "Home" },
        { href: "/services", label: "Services" },
        { href: "/projects", label: "Projects" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
      ],
    },
    common: {
      contact: "Contact",
      startProject: "Start a project",
      viewWork: "View our work",
      learnMore: "Learn more",
      rbqCaption: "RBQ 5773-2182-01",
      apchqAlt: "APCHQ",
      googleAlt: "Google",
      logoAlt: "Groupe Pure Logo",
      copyright: "Groupe Pure Construction Inc.",
      social: {
        instagram: "Instagram",
        facebook: "Facebook",
      },
    },
    home: {
      heroTitle: "A pure vision carried through to full realization.",
      heroLead:
        "Groupe Pure guides ambitious projects from their first intent through final delivery, with one standard: create, build and deliver with precision.",
      servicesTitle: "From the first line to the final finish.",
      ratingCount: "(13)",
      technicalTitle: "Technical work, integrated into a complete vision.",
      technicalBody:
        "Some projects begin with an architectural intent. Others begin with a more concrete problem: infiltration, foundation, drainage, excavation or building access. Groupe Pure approaches these realities with the same discipline, so the invisible work truly supports the quality of the final result.",
      technicalCategories: [
        {
          title: "Foundations",
          body: "Cracks, waterproofing, infiltration, basement.",
        },
        {
          title: "Site",
          body: "Excavation, drainage, water entry, window wells.",
        },
        {
          title: "Exterior",
          body: "Concrete, retaining walls, pavers, balconies, patios.",
        },
        {
          title: "Complete project",
          body: "Design, coordination, construction, delivery.",
        },
      ],
      processTitle: "A clear method before the build.",
      processSteps: [
        {
          title: "Understand the place",
          body: "We identify constraints, priorities and the real condition of the building or site.",
        },
        {
          title: "Frame the work",
          body: "We define the required interventions, the logical sequence and the responsibilities.",
        },
        {
          title: "Coordinate execution",
          body: "Field decisions are followed with a complete view of the project.",
        },
        {
          title: "Deliver cleanly",
          body: "The result must be solid, coherent and faithful to the initial intent.",
        },
      ],
      territoryTitle:
        "Based in Longueuil, present on the South Shore and in Montreal.",
      territoryBody:
        "Groupe Pure works primarily in Longueuil, Monteregie and several areas of Montreal, depending on the nature of the mandate and the scale of the work.",
      territoryRegions:
        "Longueuil · Montreal · South Shore · Monteregie · Richelieu Valley · Haut-Richelieu",
      credibilityTitle: "A reputation built on execution.",
      credibilityBody:
        "Clients look for a team capable of understanding the project, framing the work and delivering with discipline. Groupe Pure is present on verified platforms and holds an active RBQ licence.",
      credibilityItems: [
        "RBQ 5773-2182-01",
        "APCHQ member",
        "Based in Longueuil",
        "Verified reviews available",
      ],
      aboutEyebrow: "Turnkey projects",
      aboutTitle: "One firm. From beginning to end.",
      aboutBody: [
        "Groupe Pure brings the essential disciplines under one direction to preserve project cohesion, from the first intent to final delivery.",
        "Our turnkey approach is designed for corporate, commercial and high-end residential projects.",
      ],
      contactTitle: "A project to build, correct or resume with method?",
      contactLead:
        "Tell us about the place, the work being considered and the current state of the project. We will respond with clear first direction.",
      contactButton: "Frame my project",
    },
    services: [
      {
        key: "architecture",
        title: "Architecture",
        lead: "We turn your intent into clear, thoughtful plans shaped around how each place will actually be used.",
        detail:
          "The team translates needs, constraints and ambition into a coherent architectural direction ready to guide technical steps and site execution.",
        examples: [
          "Plans",
          "Design",
          "Technical coordination",
          "Decision guidance",
        ],
        image: serviceImages.architecture,
        imageAlt: "Contemporary architectural interior",
        video: architectureVideo,
      },
      {
        key: "construction",
        title: "Construction",
        lead: "Our teams coordinate each stage of the build with discipline, keeping execution faithful to the initial vision.",
        detail:
          "Planning, trade coordination, quality control and field decisions are managed with a complete view of the expected result.",
        examples: [
          "Living spaces",
          "Extensions",
          "Balconies and patios",
          "Concrete and finishes",
        ],
        image: serviceImages.construction,
        imageAlt: "Contemporary residence under construction",
        video: constructionVideo,
      },
      {
        key: "excavation",
        title: "Excavation",
        lead: "We prepare the ground with precision so the project's foundations are solid, clean and ready for what follows.",
        detail:
          "Site preparation, excavation, drainage and preliminary work are integrated into the project schedule to avoid gaps between design and execution.",
        examples: [
          "French drains",
          "Foundation",
          "Cracks",
          "Water entry and window wells",
        ],
        image: serviceImages.excavation,
        imageAlt: "Prepared site for a high-end build",
        video: excavationVideo,
      },
    ] satisfies Service[],
    servicesPage: {
      eyebrow: "Services",
      title: "Architecture, construction and excavation under one direction.",
      lead: "Each discipline moves with the same standard: understand the intent, protect quality and deliver a coherent result.",
      ctaTitle: "Need to structure a project clearly?",
      ctaLead:
        "Tell us your objectives. We will help frame the next steps with realistic direction.",
    },
    projects: [
      {
        title: "LE 2100",
        image: projectImages[0],
        imageAlt: "LE 2100 project",
        type: "Commercial",
        location: "Longueuil",
        summary:
          "Integrated direction for a restrained, precise space suited to professional use.",
      },
      {
        title: "RÉSIDENCE MONTCALM",
        image: projectImages[1],
        imageAlt: "Residence Montcalm",
        type: "Residential",
        location: "South Shore",
        summary:
          "A residence shaped around calm volumes, durable materials and controlled execution.",
      },
      {
        title: "MAISON AUREL",
        image: projectImages[2],
        imageAlt: "Maison Aurel",
        type: "Residential",
        location: "Montreal",
        summary:
          "Architecture and construction coordinated to preserve refined details through delivery.",
      },
      {
        title: "DOMAINE ÉLYSÉE",
        image: projectImages[3],
        imageAlt: "Domaine Élysée",
        type: "High-end residential",
        location: "Eastern Townships",
        summary:
          "A complete build led with close attention to thresholds, views and foundations.",
      },
      {
        title: "PAVILLON ORION",
        image: projectImages[4],
        imageAlt: "Pavillon Orion",
        type: "Corporate",
        location: "Monteregie",
        summary:
          "A workspace with a clean architectural language, built to last and adapt.",
      },
      {
        title: "ATELIER BELVÉDÈRE",
        image: projectImages[5],
        imageAlt: "Atelier Belvedere",
        type: "Studio",
        location: "Laurentians",
        summary:
          "A functional, bright volume where technical constraints become part of the place's character.",
      },
    ] satisfies Project[],
    projectsPage: {
      eyebrow: "Projects",
      title: "Restrained, solid and precisely coordinated work.",
      lead: "Each project shown here reflects the same method: clear intent, steady direction and execution attentive to detail.",
      note:
        "Detailed case studies are coming soon. This selection already shows the range of mandates and the quality of Groupe Pure's approach.",
    },
    aboutPage: {
      eyebrow: "About",
      title: "A turnkey firm that keeps the project whole.",
      lead: "Groupe Pure brings architecture, construction and excavation together so important decisions stay aligned from beginning to end.",
      sections: [
        {
          title: "Integrated direction",
          body: "One team coordinates the vision, priorities, constraints and build. Decisions become clearer because they are made with a complete understanding of the project.",
        },
        {
          title: "Measurable quality",
          body: "Materials, details and execution methods are tracked with discipline. The goal is simple: deliver a durable, clean result faithful to the initial intent.",
        },
        {
          title: "Field credibility",
          body: "As an APCHQ member and RBQ licence holder, Groupe Pure works to the standards expected for corporate, commercial and high-end residential projects.",
        },
      ],
      sectorsTitle: "Sectors served",
      sectors: ["Corporate", "Commercial", "High-end residential"],
    },
    contactPage: {
      eyebrow: "Contact",
      title: "Let's start by framing your project.",
      lead: "Send us the broad strokes. The form prepares an email with your information so you can send it from your own mailbox.",
      directTitle: "Direct contact",
      formTitle: "Your request",
    },
    form: {
      name: "Name",
      email: "Email",
      phone: "Phone",
      projectType: "Project type",
      projectTypePlaceholder: "Select a type",
      message: "Message",
      submit: "Prepare email",
      required: "This field is required.",
      invalidEmail: "Enter a valid email address.",
      success:
        "Your email app will open with a prepared message. You can review it before sending.",
      options: {
        architecture: "Architecture",
        construction: "Construction",
        excavation: "Excavation",
      },
      emailSubject: "New project inquiry",
      emailBodyLabels: {
        name: "Name",
        email: "Email",
        phone: "Phone",
        projectType: "Project type",
        message: "Message",
      },
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[keyof typeof dictionaries];

export async function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
