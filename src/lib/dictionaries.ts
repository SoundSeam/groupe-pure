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
    "https://soundseam-origin.s3.us-east-2.amazonaws.com/misc/708488574_18007329599876233_7701415963308166788_n.jpeg",
  construction:
    "https://soundseam-origin.s3.us-east-2.amazonaws.com/misc/ChatGPT+Image+Jul+23%2C+2026%2C+03_00_23+PM.png",
  excavation:
    "https://soundseam-origin.s3.us-east-2.amazonaws.com/misc/excavationsevice.jpg",
};

const teamPortraits = [
  "/team/project-director-v2.png",
  "/team/architectural-technologist-v2.png",
  "/team/project-coordinator-v2.png",
] as const;
const maudePortrait = "/team/maude-desormeaux-professional.png";
const mathieuPortrait = "/team/mathieu-lariviere-black-shirt.png";
const elisePortrait = "/team/elise-bibeau-professional.png";
const yanickPortrait = "/team/yanick-grenier-antonacci-professional-v2.png";

const architectureVideo =
  "https://soundseam-origin.s3.us-east-2.amazonaws.com/misc/Papers_in_slow_pan_202607230939.mp4";
const constructionVideo =
  "https://soundseam-origin.s3.us-east-2.amazonaws.com/misc/Construction_worker_framing_atti%E2%80%A6_202607230944.mp4";
const excavationVideo =
  "https://soundseam-origin.s3.us-east-2.amazonaws.com/misc/Excavation.mp4.mov";

const frServiceSubcategories = {
  architecture: [
    "Plans résidentiels et commerciaux",
    "Conception sur mesure",
    "Agrandissements",
    "Optimisation des espaces",
    "Modélisation 3D et rendus",
    "Demandes de permis",
    "Coordination avec les ingénieurs",
    "Design intérieur et choix des matériaux",
    "Accompagnement en gestion de projet",
  ],
  construction: [
    "Construction neuve",
    "Rénovation résidentielle",
    "Rénovation commerciale",
    "Projets clé en main",
    "Agrandissements",
    "Finition intérieure",
    "Revêtement extérieur",
    "Toiture",
    "Portes et fenêtres",
    "Cuisine et salle de bain",
    "Charpente",
    "Gestion de chantier",
  ],
  excavation: [
    "Excavation résidentielle",
    "Excavation commerciale",
    "Nivellement de terrain",
    "Fondation",
    "Drain français",
    "Entrée de services (aqueduc et égout)",
    "Terrassement",
    "Transport de matériaux",
    "Démolition",
    "Déboisement",
    "Préparation de terrain",
    "Remblayage et compaction",
    "Location d’équipement avec opérateur",
  ],
} satisfies Record<ServiceKey, string[]>;

const enServiceSubcategories = {
  architecture: [
    "Residential and commercial plans",
    "Custom design",
    "Additions",
    "Space optimization",
    "3D modelling and renderings",
    "Permit applications",
    "Coordination with engineers",
    "Interior design and material selection",
    "Project management support",
  ],
  construction: [
    "New construction",
    "Residential renovation",
    "Commercial renovation",
    "Turnkey projects",
    "Additions",
    "Interior finishing",
    "Exterior cladding",
    "Roofing",
    "Doors and windows",
    "Kitchens and bathrooms",
    "Framing",
    "Site management",
  ],
  excavation: [
    "Residential excavation",
    "Commercial excavation",
    "Site grading",
    "Foundations",
    "French drains",
    "Utility service connections (water and sewer)",
    "Earthwork",
    "Material transport",
    "Demolition",
    "Land clearing",
    "Site preparation",
    "Backfilling and compaction",
    "Equipment rental with operator",
  ],
} satisfies Record<ServiceKey, string[]>;

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
      team: {
        title: "Notre équipe | Groupe Pure",
        description:
          "Découvrez l’équipe qui coordonne les projets d’architecture, de construction et d’excavation de Groupe Pure.",
      },
      contact: {
        title: "Contact | Groupe Pure",
        description:
          "Contactez Groupe Pure pour discuter d'un projet d'architecture, de construction ou d'excavation.",
      },
      privacy: {
        title: "Politique de confidentialité",
        description:
          "Consultez la politique de confidentialité du site de Groupe Pure.",
      },
      terms: {
        title: "Conditions d’utilisation",
        description:
          "Consultez les conditions d’utilisation du site de Groupe Pure.",
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
        { href: "/team", label: "Notre équipe" },
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
      mapTitle: "Carte de l’adresse de Groupe Pure à Longueuil",
      logoAlt: "Groupe Pure Logo",
      copyright: "Groupe Pure Construction Inc.",
      privacy: "Confidentialité",
      terms: "Conditions d’utilisation",
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
      googleReviewsLabel: "Avis sur Google Maps",
      territoryTitle: "Entrepreneur général et spécialisé.",
      territoryRegionsLabel: "Zone de service",
      territoryRegions: "Boucherville, Rive-Sud, Montréal",
      openingHoursLabel: "Heures d’ouverture",
      openingHours: [
        { day: "Lundi", hours: "08:00–16:00" },
        { day: "Mardi", hours: "08:00–16:00" },
        { day: "Mercredi", hours: "08:00–16:00" },
        { day: "Jeudi", hours: "08:00–16:00" },
        { day: "Vendredi", hours: "08:00–16:00" },
      ],
      appointmentNote:
        "Veuillez prendre rendez-vous avant de vous présenter sur place.",
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
        examples: frServiceSubcategories.architecture,
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
        examples: frServiceSubcategories.construction,
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
        examples: frServiceSubcategories.excavation,
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
    },
    teamPage: {
      eyebrow: "Notre équipe",
      title: "Des expertises complémentaires, une même direction.",
      lead: "Derrière chaque projet, une équipe engagée rassemble la vision, la technique et le chantier pour faire avancer chaque décision avec clarté.",
      aboutTitle: "À propos",
      aboutBody:
        "Groupe Pure réunit architecture, construction et excavation sous une même direction afin de préserver la cohérence de chaque projet, de la première intention à la livraison finale. Notre approche clé en main conjugue une vision claire, une exécution rigoureuse et une expertise terrain reconnue pour réaliser des projets corporatifs, commerciaux et résidentiels haut de gamme.",
      members: [
        {
          name: "Yanick Grenier-Antonacci",
          title: "Direction de projets",
          image: yanickPortrait,
          imageAlt: "Portrait de Yanick Grenier-Antonacci",
        },
        {
          name: "Maude Desormeaux",
          title: "Coordination de projets",
          image: maudePortrait,
          imageAlt: "Portrait de Maude Desormeaux",
        },
        {
          name: "Félix Deland",
          title: "Technologie de l’architecture",
          image: teamPortraits[1],
          imageAlt: "Portrait temporaire d’un membre de l’équipe",
        },
        {
          name: "Shannon Matte",
          title: "Membre de l’équipe",
          image: teamPortraits[0],
          imageAlt: "Portrait temporaire d’un membre de l’équipe",
        },
        {
          name: "Thomas Sawadogo",
          title: "Membre de l’équipe",
          image: teamPortraits[2],
          imageAlt: "Portrait temporaire d’un membre de l’équipe",
        },
        {
          name: "Mathis Houde",
          title: "Membre de l’équipe",
          image: teamPortraits[1],
          imageAlt: "Portrait temporaire d’un membre de l’équipe",
        },
        {
          name: "Chloé Lavallée",
          title: "Membre de l’équipe",
          image: teamPortraits[0],
          imageAlt: "Portrait temporaire d’un membre de l’équipe",
        },
        {
          name: "André Santos",
          title: "Membre de l’équipe",
          image: teamPortraits[2],
          imageAlt: "Portrait temporaire d’un membre de l’équipe",
        },
        {
          name: "William Tremblay",
          title: "Membre de l’équipe",
          image: teamPortraits[1],
          imageAlt: "Portrait temporaire d’un membre de l’équipe",
        },
        {
          name: "Yvon Racine",
          title: "Membre de l’équipe",
          image: teamPortraits[0],
          imageAlt: "Portrait temporaire d’un membre de l’équipe",
        },
        {
          name: "Mathieu Larivière",
          title: "Membre de l’équipe",
          image: mathieuPortrait,
          imageAlt: "Portrait de Mathieu Larivière",
        },
        {
          name: "Élise Bibeau",
          title: "Membre de l’équipe",
          image: elisePortrait,
          imageAlt: "Portrait d’Élise Bibeau",
        },
        {
          name: "Daniel Nduwimana",
          title: "Conception Web",
          image: teamPortraits[1],
          imageAlt: "Portrait temporaire d’un membre de l’équipe",
        },
      ],
    },
    contactPage: {
      eyebrow: "Contact",
      title: "Commençons par cadrer votre projet.",
      lead: "Envoyez-nous les grandes lignes. Le formulaire prépare un courriel avec vos informations afin que vous puissiez l'envoyer depuis votre boîte mail.",
      directTitle: "Coordonnées directes",
      buildingAlt: "Bureaux de Groupe Pure à Longueuil",
    },
    form: {
      name: "Nom",
      email: "Courriel",
      phone: "Téléphone",
      projectType: "Type de chantier",
      projectTypePlaceholder: "Sélectionner un type",
      subcategory: "Sous-catégorie",
      subcategoryPlaceholder: "Sélectionner une sous-catégorie",
      subcategoryDisabledPlaceholder: "Choisir d'abord un type de chantier",
      budgetRange: "Budget prévu",
      budgetRangePlaceholder: "Sélectionner une tranche de budget",
      message: "Message",
      attachment: "Pièce jointe",
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
      subcategoryOptions: frServiceSubcategories,
      budgetOptions: [
        "Moins de 25 000 $",
        "25 000 $ à 50 000 $",
        "50 000 $ à 100 000 $",
        "100 000 $ à 250 000 $",
        "250 000 $ à 500 000 $",
        "500 000 $ à 1 M$",
        "1 M$ et plus",
        "À déterminer",
      ],
      emailSubject: "Nouvelle demande de projet",
      emailBodyLabels: {
        name: "Nom",
        email: "Courriel",
        phone: "Téléphone",
        projectType: "Type de chantier",
        subcategory: "Sous-catégorie",
        budgetRange: "Budget prévu",
        attachment: "Pièce jointe à ajouter",
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
      team: {
        title: "Our team | Groupe Pure",
        description:
          "Meet the team coordinating Groupe Pure architecture, construction and excavation projects.",
      },
      contact: {
        title: "Contact | Groupe Pure",
        description:
          "Contact Groupe Pure to discuss an architecture, construction or excavation project.",
      },
      privacy: {
        title: "Privacy policy",
        description: "Read the privacy policy for the Groupe Pure website.",
      },
      terms: {
        title: "Terms of use",
        description: "Read the terms of use for the Groupe Pure website.",
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
        { href: "/team", label: "Our team" },
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
      mapTitle: "Map of Groupe Pure’s Longueuil address",
      logoAlt: "Groupe Pure Logo",
      copyright: "Groupe Pure Construction Inc.",
      privacy: "Privacy",
      terms: "Terms of use",
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
      googleReviewsLabel: "Reviews on Google Maps",
      territoryTitle: "General and specialized contractor.",
      territoryRegionsLabel: "Service area",
      territoryRegions: "Boucherville, South Shore, Montreal",
      openingHoursLabel: "Opening hours",
      openingHours: [
        { day: "Monday", hours: "08:00–16:00" },
        { day: "Tuesday", hours: "08:00–16:00" },
        { day: "Wednesday", hours: "08:00–16:00" },
        { day: "Thursday", hours: "08:00–16:00" },
        { day: "Friday", hours: "08:00–16:00" },
      ],
      appointmentNote:
        "Please make an appointment before visiting us in person.",
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
        examples: enServiceSubcategories.architecture,
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
        examples: enServiceSubcategories.construction,
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
        examples: enServiceSubcategories.excavation,
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
    },
    teamPage: {
      eyebrow: "Our team",
      title: "Complementary expertise, one shared direction.",
      lead: "Behind every project, a committed team brings vision, technical thinking and field execution together so each decision moves forward clearly.",
      aboutTitle: "About",
      aboutBody:
        "Groupe Pure brings architecture, construction and excavation together under one direction to preserve the cohesion of every project, from first intent to final delivery. Our turnkey approach combines clear vision, disciplined execution and recognized field expertise to deliver corporate, commercial and high-end residential projects.",
      members: [
        {
          name: "Yanick Grenier-Antonacci",
          title: "Project direction",
          image: yanickPortrait,
          imageAlt: "Portrait of Yanick Grenier-Antonacci",
        },
        {
          name: "Maude Desormeaux",
          title: "Project coordination",
          image: maudePortrait,
          imageAlt: "Portrait of Maude Desormeaux",
        },
        {
          name: "Félix Deland",
          title: "Architectural technology",
          image: teamPortraits[1],
          imageAlt: "Temporary portrait of a team member",
        },
        {
          name: "Shannon Matte",
          title: "Team member",
          image: teamPortraits[0],
          imageAlt: "Temporary portrait of a team member",
        },
        {
          name: "Thomas Sawadogo",
          title: "Team member",
          image: teamPortraits[2],
          imageAlt: "Temporary portrait of a team member",
        },
        {
          name: "Mathis Houde",
          title: "Team member",
          image: teamPortraits[1],
          imageAlt: "Temporary portrait of a team member",
        },
        {
          name: "Chloé Lavallée",
          title: "Team member",
          image: teamPortraits[0],
          imageAlt: "Temporary portrait of a team member",
        },
        {
          name: "André Santos",
          title: "Team member",
          image: teamPortraits[2],
          imageAlt: "Temporary portrait of a team member",
        },
        {
          name: "William Tremblay",
          title: "Team member",
          image: teamPortraits[1],
          imageAlt: "Temporary portrait of a team member",
        },
        {
          name: "Yvon Racine",
          title: "Team member",
          image: teamPortraits[0],
          imageAlt: "Temporary portrait of a team member",
        },
        {
          name: "Mathieu Larivière",
          title: "Team member",
          image: mathieuPortrait,
          imageAlt: "Portrait of Mathieu Larivière",
        },
        {
          name: "Élise Bibeau",
          title: "Team member",
          image: elisePortrait,
          imageAlt: "Portrait of Élise Bibeau",
        },
        {
          name: "Daniel Nduwimana",
          title: "Web Design",
          image: teamPortraits[1],
          imageAlt: "Temporary portrait of a team member",
        },
      ],
    },
    contactPage: {
      eyebrow: "Contact",
      title: "Let's start by framing your project.",
      lead: "Send us the broad strokes. The form prepares an email with your information so you can send it from your own mailbox.",
      directTitle: "Direct contact",
      buildingAlt: "Groupe Pure offices in Longueuil",
    },
    form: {
      name: "Name",
      email: "Email",
      phone: "Phone",
      projectType: "Project type",
      projectTypePlaceholder: "Select a type",
      subcategory: "Sub-category",
      subcategoryPlaceholder: "Select a sub-category",
      subcategoryDisabledPlaceholder: "Select a project type first",
      budgetRange: "Estimated budget",
      budgetRangePlaceholder: "Select a budget range",
      message: "Message",
      attachment: "Attachment",
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
      subcategoryOptions: enServiceSubcategories,
      budgetOptions: [
        "Under $25,000",
        "$25,000–$50,000",
        "$50,000–$100,000",
        "$100,000–$250,000",
        "$250,000–$500,000",
        "$500,000–$1M",
        "$1M and above",
        "To be determined",
      ],
      emailSubject: "New project inquiry",
      emailBodyLabels: {
        name: "Name",
        email: "Email",
        phone: "Phone",
        projectType: "Project type",
        subcategory: "Sub-category",
        budgetRange: "Estimated budget",
        attachment: "Attachment to add",
        message: "Message",
      },
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[keyof typeof dictionaries];

export async function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
