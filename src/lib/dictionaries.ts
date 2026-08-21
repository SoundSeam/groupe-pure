import "server-only";

import { projectImages, siteMedia } from "./site-data";
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
  id?: string;
  title: string;
  image: string;
  imageAlt: string;
  mediaType?: "image" | "video";
  type: string;
  location: string;
  summary: string;
};

const serviceImages = {
  architecture: siteMedia("services/architecture.webp"),
  construction: siteMedia("services/construction.webp"),
  excavation: siteMedia("services/excavation.webp"),
};

const teamPortraits = [
  siteMedia("team/project-director.webp"),
  siteMedia("team/architectural-technologist.webp"),
  siteMedia("team/project-coordinator.webp"),
] as const;
const maudePortrait = siteMedia("team/maude-desormeaux.webp");
const mathieuPortrait = "/team/mathieu-lariviere-happy.png";
const elisePortrait = siteMedia("team/elise-bibeau.webp");
const yanickPortrait = "/team/yanick-grenier-antonacci-athletic.png";
const felixPortrait = "/team/felix-deland-professional.png";
const andrePortrait = "/team/andre-santos-professional.png";
const shannonPortrait = "/team/shannon-matte-professional.png";
const thomasPortrait = "/team/thomas-sawadogo-professional.png";
const chloePortrait = "/team/chloe-lavallee-professional.png";
const mathisPortrait = "/team/mathis-houde-professional.png";
const williamPortrait = "/team/william-tremblay-professional.png";
const yvonPortrait = "/team/yvon-racine-professional-v3.png";
const danielPortrait = "/team/daniel-nduwimana-headshot.png";

const architectureVideo = siteMedia("services/architecture.mp4");
const constructionVideo = siteMedia(
  "services/construction-worker-framing-202608041208.mp4",
);
const excavationVideo = siteMedia("services/excavation.mp4");

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
      careers: {
        eyebrow: "Carrières",
        buttonLabel: "Joindre notre équipe",
        stripTitle: "Envie de bâtir la suite avec nous?",
        stripLead: "Présentez-vous à notre équipe en quelques minutes.",
        title: "Votre prochain projet pourrait commencer ici.",
        lead:
          "Présentez votre parcours en quelques mots et joignez votre CV ou portfolio. Nous vous contacterons si votre profil correspond à une occasion.",
      },
      applicationForm: {
        name: "Nom complet",
        email: "Courriel",
        phone: "Téléphone",
        projectType: "Domaine",
        projectTypePlaceholder: "Choisir un domaine",
        subcategory: "Rôle recherché",
        subcategoryPlaceholder: "Choisir un rôle",
        subcategoryDisabledPlaceholder: "Choisir d’abord un domaine",
        budgetRange: "Disponibilité",
        budgetRangePlaceholder: "Indiquer votre disponibilité",
        message: "Parlez-nous brièvement de votre parcours et de ce que vous aimeriez accomplir avec nous",
        attachment: "CV ou portfolio — PDF, Word ou image (20 Mo max.)",
        submit: "Envoyer ma candidature",
        sending: "Envoi en cours…",
        required: "Ce champ est requis.",
        invalidEmail: "Entrez une adresse courriel valide.",
        invalidAttachment:
          "Ajoutez un fichier PDF, Word, HEIC, JPG, PNG ou WebP valide.",
        attachmentTooLarge: "Le fichier doit peser 20 Mo ou moins.",
        submissionError:
          "L’envoi n’a pas fonctionné. Vérifiez votre connexion et réessayez.",
        rateLimited:
          "Trop de demandes ont été envoyées récemment. Réessayez dans une heure.",
        verificationError:
          "La vérification de sécurité a expiré ou échoué. Réessayez.",
        verificationUnavailable:
          "La vérification de sécurité ne peut pas charger. Désactivez temporairement votre bloqueur de contenu ou écrivez-nous directement.",
        success:
          "Merci — votre candidature a bien été transmise à notre équipe.",
        options: {
          architecture: "Architecture et design",
          construction: "Construction",
          excavation: "Excavation",
        },
        subcategoryOptions: {
          architecture: [
            "Technologue en architecture",
            "Designer intérieur",
            "Chargé·e de projet",
            "Stagiaire",
            "Candidature spontanée",
          ],
          construction: [
            "Chargé·e de projet",
            "Surintendant·e de chantier",
            "Charpentier·ère-menuisier·ère",
            "Métier spécialisé",
            "Manœuvre",
            "Candidature spontanée",
          ],
          excavation: [
            "Opérateur·trice de machinerie",
            "Chauffeur·euse classe 1 ou 3",
            "Chargé·e de projet",
            "Manœuvre",
            "Candidature spontanée",
          ],
        },
        budgetOptions: [
          "Dès maintenant",
          "Dans moins de 30 jours",
          "Dans 1 à 3 mois",
          "Ouvert·e aux occasions futures",
        ],
        emailSubject: "Nouvelle candidature",
        emailBodyLabels: {
          name: "Nom",
          email: "Courriel",
          phone: "Téléphone",
          projectType: "Domaine",
          subcategory: "Rôle recherché",
          budgetRange: "Disponibilité",
          attachment: "CV ou portfolio",
          message: "Présentation",
        },
      },
      aboutTitle: "À propos",
      aboutBody:
        "Groupe Pure réunit architecture, construction et excavation sous une même direction afin de préserver la cohérence de chaque projet, de la première intention à la livraison finale. Notre approche clé en main conjugue une vision claire, une exécution rigoureuse et une expertise terrain reconnue pour réaliser des projets corporatifs, commerciaux et résidentiels haut de gamme.",
      members: [
        {
          name: "Yanick Grenier-Antonacci",
          title: "Fondateur PDG/Gestion des opérations",
          image: yanickPortrait,
          imageAlt: "Portrait de Yanick Grenier-Antonacci",
        },
        {
          name: "Maude Desormeaux",
          title: "Adjointe administrative",
          image: maudePortrait,
          imageAlt: "Portrait de Maude Desormeaux",
        },
        {
          name: "Félix Deland",
          title: "Technologue en architecture",
          image: felixPortrait,
          imageAlt: "Portrait de Félix Deland",
        },
        {
          name: "Shannon Matte",
          title: "Chargée de projet",
          image: shannonPortrait,
          imageAlt: "Portrait de Shannon Matte",
        },
        {
          name: "Thomas Sawadogo",
          title: "Technologue en architecture",
          image: thomasPortrait,
          imageAlt: "Portrait de Thomas Sawadogo",
        },
        {
          name: "Mathis Houde",
          title: "Technologue en architecture",
          image: mathisPortrait,
          imageAlt: "Portrait de Mathis Houde",
        },
        {
          name: "Chloé Lavallée",
          title: "Technologue en architecture",
          image: chloePortrait,
          imageAlt: "Portrait de Chloé Lavallée",
        },
        {
          name: "André Santos",
          title: "Cimentier-applicateur",
          image: andrePortrait,
          imageAlt: "Portrait d’André Santos",
        },
        {
          name: "William Tremblay",
          title: "Opérateur de pelle",
          image: williamPortrait,
          imageAlt: "Portrait de William Tremblay",
        },
        {
          name: "Yvon Racine",
          title: "Peintre en bâtiment",
          image: yvonPortrait,
          imageAlt: "Portrait de Yvon Racine",
        },
        {
          name: "Mathieu Larivière",
          title: "Chef d’équipe",
          image: mathieuPortrait,
          imageAlt: "Portrait de Mathieu Larivière",
        },
        {
          name: "Élyse Bibeau",
          title: "Designer",
          image: elisePortrait,
          imageAlt: "Portrait d’Élyse Bibeau",
        },
        {
          name: "Daniel Nduwimana",
          title: "Conception Web",
          image: danielPortrait,
          imageAlt: "Portrait de Daniel Nduwimana",
        },
      ],
    },
    contactPage: {
      eyebrow: "Contact",
      title: "Commençons par cadrer votre projet.",
      lead: "Envoyez-nous les grandes lignes de votre projet. Votre demande et vos documents seront transmis directement à notre équipe.",
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
      submit: "Envoyer ma demande",
      sending: "Envoi en cours…",
      required: "Ce champ est requis.",
      invalidEmail: "Entrez une adresse courriel valide.",
      invalidAttachment:
        "Ajoutez un fichier PDF, Word, HEIC, JPG, PNG ou WebP valide.",
      attachmentTooLarge:
        "La pièce jointe doit peser 20 Mo ou moins.",
      submissionError:
        "L’envoi n’a pas fonctionné. Vérifiez votre connexion et réessayez.",
      rateLimited:
        "Trop de demandes ont été envoyées récemment. Réessayez dans une heure.",
      verificationError:
        "La vérification de sécurité a expiré ou échoué. Réessayez.",
      verificationUnavailable:
        "La vérification de sécurité ne peut pas charger. Désactivez temporairement votre bloqueur de contenu ou écrivez-nous directement.",
      success:
        "Merci — votre demande a bien été envoyée à notre équipe.",
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
      careers: {
        eyebrow: "Careers",
        buttonLabel: "Join our team",
        stripTitle: "Ready to build what’s next with us?",
        stripLead: "Introduce yourself to our team in just a few minutes.",
        title: "Your next project could start here.",
        lead:
          "Tell us about your experience in a few words and attach your résumé or portfolio. We’ll reach out if your profile matches an opportunity.",
      },
      applicationForm: {
        name: "Full name",
        email: "Email",
        phone: "Phone",
        projectType: "Discipline",
        projectTypePlaceholder: "Select a discipline",
        subcategory: "Desired role",
        subcategoryPlaceholder: "Select a role",
        subcategoryDisabledPlaceholder: "Select a discipline first",
        budgetRange: "Availability",
        budgetRangePlaceholder: "Select your availability",
        message: "Tell us briefly about your experience and what you would like to accomplish with us",
        attachment: "Résumé or portfolio — PDF, Word or image (20 MB max.)",
        submit: "Submit my application",
        sending: "Sending…",
        required: "This field is required.",
        invalidEmail: "Enter a valid email address.",
        invalidAttachment:
          "Add a valid PDF, Word, HEIC, JPG, PNG or WebP file.",
        attachmentTooLarge: "The file must be 20 MB or smaller.",
        submissionError:
          "The application could not be sent. Check your connection and try again.",
        rateLimited:
          "Too many requests were sent recently. Please try again in one hour.",
        verificationError:
          "The security verification expired or failed. Please try again.",
        verificationUnavailable:
          "The security verification could not load. Temporarily disable your content blocker or contact us directly.",
        success: "Thank you — your application was sent to our team.",
        options: {
          architecture: "Architecture and design",
          construction: "Construction",
          excavation: "Excavation",
        },
        subcategoryOptions: {
          architecture: [
            "Architectural technologist",
            "Interior designer",
            "Project manager",
            "Intern",
            "General application",
          ],
          construction: [
            "Project manager",
            "Site superintendent",
            "Carpenter",
            "Skilled trade",
            "General labourer",
            "General application",
          ],
          excavation: [
            "Equipment operator",
            "Class 1 or 3 driver",
            "Project manager",
            "General labourer",
            "General application",
          ],
        },
        budgetOptions: [
          "Immediately",
          "Within 30 days",
          "In 1–3 months",
          "Open to future opportunities",
        ],
        emailSubject: "New application",
        emailBodyLabels: {
          name: "Name",
          email: "Email",
          phone: "Phone",
          projectType: "Discipline",
          subcategory: "Desired role",
          budgetRange: "Availability",
          attachment: "Résumé or portfolio",
          message: "Introduction",
        },
      },
      aboutTitle: "About",
      aboutBody:
        "Groupe Pure brings architecture, construction and excavation together under one direction to preserve the cohesion of every project, from first intent to final delivery. Our turnkey approach combines clear vision, disciplined execution and recognized field expertise to deliver corporate, commercial and high-end residential projects.",
      members: [
        {
          name: "Yanick Grenier-Antonacci",
          title: "Founder, CEO / Operations Management",
          image: yanickPortrait,
          imageAlt: "Portrait of Yanick Grenier-Antonacci",
        },
        {
          name: "Maude Desormeaux",
          title: "Administrative Assistant",
          image: maudePortrait,
          imageAlt: "Portrait of Maude Desormeaux",
        },
        {
          name: "Félix Deland",
          title: "Architectural Technologist",
          image: felixPortrait,
          imageAlt: "Portrait of Félix Deland",
        },
        {
          name: "Shannon Matte",
          title: "Project Manager",
          image: shannonPortrait,
          imageAlt: "Portrait of Shannon Matte",
        },
        {
          name: "Thomas Sawadogo",
          title: "Architectural Technologist",
          image: thomasPortrait,
          imageAlt: "Portrait of Thomas Sawadogo",
        },
        {
          name: "Mathis Houde",
          title: "Architectural Technologist",
          image: mathisPortrait,
          imageAlt: "Portrait of Mathis Houde",
        },
        {
          name: "Chloé Lavallée",
          title: "Architectural Technologist",
          image: chloePortrait,
          imageAlt: "Portrait of Chloé Lavallée",
        },
        {
          name: "André Santos",
          title: "Cement Mason",
          image: andrePortrait,
          imageAlt: "Portrait of André Santos",
        },
        {
          name: "William Tremblay",
          title: "Excavator Operator",
          image: williamPortrait,
          imageAlt: "Portrait of William Tremblay",
        },
        {
          name: "Yvon Racine",
          title: "Building Painter",
          image: yvonPortrait,
          imageAlt: "Portrait of Yvon Racine",
        },
        {
          name: "Mathieu Larivière",
          title: "Team Leader",
          image: mathieuPortrait,
          imageAlt: "Portrait of Mathieu Larivière",
        },
        {
          name: "Élyse Bibeau",
          title: "Designer",
          image: elisePortrait,
          imageAlt: "Portrait of Élyse Bibeau",
        },
        {
          name: "Daniel Nduwimana",
          title: "Web Design",
          image: danielPortrait,
          imageAlt: "Portrait of Daniel Nduwimana",
        },
      ],
    },
    contactPage: {
      eyebrow: "Contact",
      title: "Let's start by framing your project.",
      lead: "Send us the broad strokes of your project. Your inquiry and documents will be delivered directly to our team.",
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
      submit: "Send my inquiry",
      sending: "Sending…",
      required: "This field is required.",
      invalidEmail: "Enter a valid email address.",
      invalidAttachment:
        "Add a valid PDF, Word, HEIC, JPG, PNG or WebP file.",
      attachmentTooLarge:
        "The attachment must be 20 MB or smaller.",
      submissionError:
        "The message could not be sent. Check your connection and try again.",
      rateLimited:
        "Too many inquiries were sent recently. Please try again in one hour.",
      verificationError:
        "The security verification expired or failed. Please try again.",
      verificationUnavailable:
        "The security verification could not load. Temporarily disable your content blocker or contact us directly.",
      success:
        "Thank you — your inquiry was sent to our team.",
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
