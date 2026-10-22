import type { Certification, JourneyItem, Project } from "./types"

type Seed<T> = Omit<T, "id">

export const seedProjects: Seed<Project>[] = [
  {
    title: "Gestion Patrimoine",
    description_fr:
      "Plateforme web sécurisée pour inventorier, localiser et gérer les actifs d'entreprise (terrains, bâtiments) avec coordonnées GPS. Cartographie interactive, navigation, import GPX et export PDF.",
    description_en:
      "Secure web platform to inventory, locate and manage company assets (land, buildings) with GPS coordinates. Interactive mapping, navigation, GPX import and PDF export.",
    features_fr: ["Carte interactive", "Navigation GPS", "Import GPX", "Export PDF"],
    features_en: ["Interactive map", "GPS navigation", "GPX import", "PDF export"],
    stack: ["Next.js", "Django", "Leaflet", "PostgreSQL"],
    status: "completed",
    images: [
      "/images/gestion-patrimoine-hero.webp",
      "/images/gestion-patrimoine-map.webp",
      "/images/gestion-patrimoine-add.webp",
      "/images/gestion-patrimoine-pdf.webp",
    ],
    demo_url: "https://gestion-patrimoine-b3hj.onrender.com/",
    code_url: "https://github.com/obedelom17/Gestion-Patrimoine",
    sort_order: 1,
  },
  {
    title: "ObiStyle",
    description_fr:
      "Boutique en ligne de vêtements et pagnes africains. Interface moderne avec panneau d'administration, authentification, panier et livraison internationale. Conçue mobile-first.",
    description_en:
      "Online store for African clothing and pagne fabrics. Modern interface with admin panel, authentication, cart and international delivery. Built mobile-first.",
    features_fr: ["Panneau d'administration", "Authentification", "Panier et livraison"],
    features_en: ["Admin panel", "Authentication", "Cart and delivery"],
    stack: ["Next.js", "Supabase", "Vercel"],
    status: "in_progress",
    images: ["/images/obistyle-hero.webp", "/images/obistyle-admin.webp"],
    demo_url: "https://obistyle.vercel.app/",
    code_url: "https://github.com/obedelom17/obistyle",
    sort_order: 2,
  },
  {
    title: "RestauManager",
    description_fr:
      "Application de bureau pour la gestion d'un restaurant. Tableau de bord avec indicateurs (produits, stock faible, revenus), gestion des catégories, des stocks et des commandes, statistiques par période.",
    description_en:
      "Desktop application for restaurant management. Dashboard with indicators (products, low stock, revenue), category, stock and order management, statistics by period.",
    features_fr: ["Tableau de bord", "Gestion des stocks", "Alertes de stock faible", "Statistiques"],
    features_en: ["Dashboard", "Stock management", "Low stock alerts", "Statistics"],
    stack: ["Java Swing", "Architecture MVC"],
    status: "academic",
    images: ["/images/restau-dashboard.webp", "/images/restau-stats.webp"],
    demo_url: null,
    code_url: "https://github.com/obedelom17/TPPOOJAVA",
    sort_order: 3,
  },
  {
    title: "ObedGPT",
    description_fr:
      "Application web d'IA multimodale. Chat, vision, audio, exécution de code et synthèse vocale via l'API Groq. Rendu Markdown et KaTeX, proxy sécurisé sur Vercel.",
    description_en:
      "Multimodal AI web application. Chat, vision, audio, code execution and text-to-speech through the Groq API. Markdown and KaTeX rendering, secure proxy on Vercel.",
    features_fr: ["Chat IA", "Vision et audio", "Exécution de code", "Synthèse vocale"],
    features_en: ["AI chat", "Vision and audio", "Code execution", "Text-to-speech"],
    stack: ["React", "Groq API", "Vite", "Vercel"],
    status: "in_progress",
    images: ["/images/obedgpt-hero.webp"],
    demo_url: "https://obedgpt.vercel.app/",
    code_url: "https://github.com/obedelom17/obedgpt",
    sort_order: 4,
  },
  {
    title: "HoneyPot Cowrie",
    description_fr:
      "Déploiement d'un honeypot SSH/Telnet avec Cowrie sous Linux pour capturer et analyser les tentatives d'intrusion. Journalisation des sessions, analyse du comportement des attaquants et surveillance réseau.",
    description_en:
      "Deployment of an SSH/Telnet honeypot with Cowrie on Linux to capture and analyze intrusion attempts. Session logging, attacker behavior analysis and network monitoring.",
    features_fr: ["Piège SSH/Telnet", "Journalisation des sessions", "Analyse des attaques", "Surveillance réseau"],
    features_en: ["SSH/Telnet trap", "Session logging", "Attack analysis", "Network monitoring"],
    stack: ["Cowrie", "Linux", "Python", "Kali Linux"],
    status: "security",
    images: ["/images/honeypot-hero.webp"],
    demo_url: null,
    code_url: null,
    sort_order: 5,
  },
  {
    title: "ElomFacture IA",
    description_fr:
      "Capture intelligente de factures par OCR et IA. Traite des photos ou des PDF, extrait montants, dates, fournisseurs et numéros de compte SYSCOHADA, et produit un JSON structuré pour la comptabilité. Plan comptable SYSCOHADA révisé intégré.",
    description_en:
      "Intelligent invoice capture with OCR and AI. Processes photos or PDFs, extracts amounts, dates, suppliers and SYSCOHADA account numbers, and outputs structured JSON for accounting. Revised SYSCOHADA chart of accounts built in.",
    features_fr: ["OCR par IA", "Photos et PDF", "Extraction de données", "Export JSON et CSV"],
    features_en: ["AI OCR", "Photos and PDFs", "Data extraction", "JSON and CSV export"],
    stack: ["React", "TypeScript", "Groq API", "Vercel"],
    status: "production",
    images: ["/images/elomfacture-hero.webp"],
    demo_url: "https://elomfacture.vercel.app",
    code_url: "https://github.com/obedelom17/elomfacture",
    sort_order: 6,
  },
  {
    title: "ElomPaie",
    description_fr:
      "Application de gestion de paie pour entreprises togolaises. Calcul des salaires et retenues SYSCOHADA, bulletins PDF, export comptable Sage, authentification sécurisée et tableau de bord multi-utilisateurs. Conforme au CGI-OTR 2025.",
    description_en:
      "Payroll management application for Togolese businesses. Salary and SYSCOHADA deduction calculation, PDF payslips, Sage accounting export, secure authentication and multi-user dashboard. Compliant with CGI-OTR 2025.",
    features_fr: ["Calcul de paie SYSCOHADA", "Bulletins PDF", "Export Sage", "Tableau de bord"],
    features_en: ["SYSCOHADA payroll", "PDF payslips", "Sage export", "Dashboard"],
    stack: ["React", "TypeScript", "Supabase", "Vercel"],
    status: "production",
    images: ["/images/elompaie-hero.webp"],
    demo_url: "https://elompaie.vercel.app",
    code_url: "https://github.com/obedelom17/elompaie",
    sort_order: 7,
  },
  {
    title: "Les Délices de Norbert",
    description_fr:
      "Site de commande en ligne pour un restaurant togolais de Lomé. Menu interactif, panier, paiement PayGateGlobal. Design qui valorise la cuisine traditionnelle, responsive mobile-first.",
    description_en:
      "Online ordering website for a local restaurant in Lomé. Interactive menu, cart, PayGateGlobal payment. Design that showcases traditional Togolese cuisine, responsive mobile-first.",
    features_fr: ["Menu interactif", "Panier et commandes", "Paiement PayGateGlobal"],
    features_en: ["Interactive menu", "Cart and orders", "PayGateGlobal payment"],
    stack: ["Next.js", "React", "Tailwind CSS", "Vercel"],
    status: "production",
    images: ["/images/delices-norbert-hero.webp"],
    demo_url: "https://lesdelicesdenorbert.vercel.app",
    code_url: "https://github.com/obedelom17/lesdelicesdenorbert",
    sort_order: 8,
  },
]

export const seedCertifications: Seed<Certification>[] = [
  {
    title_fr: "Cisco CCNA 1 – Introduction to Networks",
    title_en: "Cisco CCNA 1 – Introduction to Networks",
    year: "2024",
    image_url: "/images/certifications/ccna-presentation-reseaux.webp",
    sort_order: 1,
  },
  {
    title_fr: "Cisco CCNA 2 – Switching, Routing & Wireless Essentials",
    title_en: "Cisco CCNA 2 – Switching, Routing & Wireless Essentials",
    year: "2025",
    image_url: "/images/certifications/ccna-switching-routing.webp",
    sort_order: 2,
  },
  {
    title_fr: "English Language Certificate – Youth Level 1",
    title_en: "English Language Certificate – Youth Level 1",
    year: "2024",
    image_url: "/images/certifications/english-language-center.webp",
    sort_order: 3,
  },
  {
    title_fr: "Utilisation d'ordinateurs et équipements mobiles",
    title_en: "Computer and Mobile Device Usage",
    year: "2024",
    image_url: "/images/certifications/utilisation-ordinateurs.webp",
    sort_order: 4,
  },
  {
    title_fr: "Sensibilisation au numérique",
    title_en: "Digital Awareness",
    year: "2024",
    image_url: "/images/certifications/sensibilisation-numerique.webp",
    sort_order: 5,
  },
]

export const seedJourney: Seed<JourneyItem>[] = [
  { year: "2024", title_fr: "BAC D", title_en: "High School Diploma (BAC D)", description_fr: "MathFinEco International School", description_en: "MathFinEco International School", sort_order: 1 },
  { year: "2024", title_fr: "Entrée à l'IAI-Togo", title_en: "Joined IAI-Togo", description_fr: "Génie Logiciel", description_en: "Software Engineering", sort_order: 2 },
  { year: "2024", title_fr: "Cisco CCNA 1", title_en: "Cisco CCNA 1", description_fr: "Introduction to Networks", description_en: "Introduction to Networks", sort_order: 3 },
  { year: "2025", title_fr: "Cisco CCNA 2", title_en: "Cisco CCNA 2", description_fr: "Switching, Routing & Wireless Essentials", description_en: "Switching, Routing & Wireless Essentials", sort_order: 4 },
  { year: "2025", title_fr: "RestauManager", title_en: "RestauManager", description_fr: "Projet académique Java", description_en: "Academic Java project", sort_order: 5 },
  { year: "2025", title_fr: "Lancement d'ObiStyle", title_en: "ObiStyle launch", description_fr: "E-commerce Next.js", description_en: "Next.js e-commerce", sort_order: 6 },
  { year: "2025", title_fr: "Gestion Patrimoine", title_en: "Gestion Patrimoine", description_fr: "Plateforme web Django et Leaflet", description_en: "Django and Leaflet web platform", sort_order: 7 },
  { year: "2025", title_fr: "HoneyPot Cowrie", title_en: "HoneyPot Cowrie", description_fr: "Projet de cybersécurité sous Linux", description_en: "Linux cybersecurity project", sort_order: 8 },
  { year: "2026", title_fr: "Deuxième année à l'IAI-Togo", title_en: "Second year at IAI-Togo", description_fr: "En cours", description_en: "Ongoing", sort_order: 9 },
]

function withIds<T extends { id: string }>(rows: Seed<T>[], prefix: string): T[] {
  return rows.map((r, i) => ({ ...r, id: `${prefix}-${i + 1}` }) as unknown as T)
}

export const fallbackProjects = withIds<Project>(seedProjects, "seed-project")
export const fallbackCertifications = withIds<Certification>(seedCertifications, "seed-cert")
export const fallbackJourney = withIds<JourneyItem>(seedJourney, "seed-journey")
