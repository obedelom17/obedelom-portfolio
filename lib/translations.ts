export type Lang = "fr" | "en"

export const translations = {
  fr: {
    nav: {
      home: "Accueil",
      about: "À propos",
      skills: "Compétences",
      projects: "Projets",
      design: "Design",
      timeline: "Parcours",
      certifications: "Certifications",
      contact: "Contact",
      downloadCV: "Télécharger CV",
    },
    hero: {
      greeting: "Bonjour, je suis",
      location: "Lomé, Togo",
      role: "Full-Stack",
      stats: {
        certifications: "certifications",
        projects: "projets",
        languages: "langues",
        passion: "passion",
      },
      cta: {
        projects: "Voir mes projets",
        contact: "Me contacter",
      },
    },
    about: {
      title: "À propos",
      titleHighlight: "de moi",
      description:
        "Étudiant en Génie Logiciel à l'IAI-Togo, je combine développement full-stack et créativité graphique pour créer des solutions numériques complètes. Passionné par le web, le mobile et le design visuel, je maîtrise aussi bien le code que Photoshop.",
      skills: [
        { title: "Développement", desc: "Full-Stack Web & Mobile" },
        { title: "Design", desc: "UI/UX & Graphisme" },
        { title: "Passion", desc: "Innovation & Créativité" },
      ],
    },
    skills: {
      title: "Mes",
      titleHighlight: "Compétences",
      levels: {
        "Intermédiaire": "Intermédiaire",
        "Deb.+": "Deb.+",
        "Débutant": "Débutant",
      },
      categories: {
        "Web": "Web",
        "Backend": "Backend",
        "Frameworks": "Frameworks",
        "Mobile": "Mobile",
        "Base de données": "Base de données",
        "Déploiement": "Déploiement",
        "Réseaux": "Réseaux",
        "Design": "Design",
      },
    },
    projects: {
      title: "Mes",
      titleHighlight: "Projets",
      status: {
        "En cours": "En cours",
        "Projet académique": "Projet académique",
        "Terminé": "Terminé",
        "Cybersécurité": "Cybersécurité",
        "Production": "Production",
      },
      viewDemo: "Voir le site",
      viewCode: "Code",
      items: [
        {
          title: "Gestion Patrimoine",
          description:
            "Plateforme web sécurisée pour inventorier, localiser et gérer les actifs d'entreprise (terrains, bâtiments) avec coordonnées GPS. Cartographie interactive, navigation, import GPX et export PDF.",
          features: ["Carte interactive", "Navigation GPS", "Import GPX", "Export PDF"],
        },
        {
          title: "ObiStyle",
          description:
            "Site e-commerce élégant de vêtements et pagnes africains. Interface boutique moderne avec panel admin, authentification, panier et livraison mondiale. Design mobile-first.",
          features: ["Homepage élégante", "Panel Admin", "Authentification", "Panier & Livraison"],
        },
        {
          title: "RestauManager",
          description:
            "Application desktop de gestion de restaurant. Dashboard avec KPIs (total produits, stock faible, revenus), gestion des catégories, stocks et commandes avec statistiques par période.",
          features: ["Dashboard KPIs", "Gestion Stocks", "Alertes Stock Faible", "Statistiques"],
        },
        {
          title: "ObedGPT",
          description:
            "Application web IA multimodale full-stack. Intègre Chat, Vision, Audio, Code et Text-to-Speech via l'API Groq. Interface moderne avec rendu Markdown/KaTeX, thème orange/crème et proxy sécurisé Vercel.",
          features: ["Chat IA", "Vision & Audio", "Exécution de Code", "Text-to-Speech"],
        },
        {
          title: "HoneyPot avec Cowrie",
          description:
            "Déploiement d'un honeypot SSH/Telnet avec Cowrie sur Linux pour capturer et analyser les tentatives d'intrusion. Journalisation complète des sessions attackantes, analyse comportementale et surveillance réseau en temps réel.",
          features: ["Piège SSH/Telnet", "Journalisation Sessions", "Analyse Attaques", "Surveillance Réseau"],
        },
        {
          title: "ElomFacture IA",
          description:
            "Application web de capture intelligente de factures avec OCR et IA. Traite photos ou PDFs, extrait automatiquement les données (montants, dates, fournisseurs, numero de compte SYSCOHADA), génère JSON structuré pour intégration comptable. Optimisé pour le contexte togolais. Plan comptable SYSCOHADA révisé intégré",
          features: ["OCR IA Groq", "Upload Photos/PDFs", "Extraction Données", "Export JSON/CSV"],
        },
        {
          title: "ElomPaie",
          description:
            "SaaS complet de gestion de paie pour entreprises togolaises. Calcul automatique salaires, retenues SYSCOHADA, génération bulletins PDF, export comptable Sage. Authentification sécurisée, dashboard analytique multi-utilisateurs. Conforme CGI-OTR 2025.",
          features: ["Calcul Paie SYSCOHADA", "Bulletins PDF", "Export Sage", "Dashboard Analytics"],
        },
        {
          title: "Les Délices de Norbert",
          description:
            "Site restaurant e-commerce pour restaurant togolais local à Lomé. Présentation menu, commande en ligne avec paiement PayGateGlobal, gestion panier. Design authentique valorisant cuisine traditionnelle togolaise. Responsive mobile-first.",
          features: ["Menu Intéractif", "Panier & Commandes", "Paiement PayGateGlobal", "Contact Restaurant"],
        },
      ],
    },
    design: {
      title: "Créations",
      titleHighlight: "Graphiques",
    },
    timeline: {
      title: "Mon",
      titleHighlight: "Parcours",
      items: [
        { year: "2024", title: "BAC D", description: "MathFinEco International School" },
        { year: "2024", title: "Entrée à l'IAI-Togo", description: "Génie Logiciel" },
        { year: "2024", title: "Cisco CCNA 1", description: "Introduction to Networks" },
        { year: "2025", title: "Cisco CCNA 2", description: "Switching, Routing & Wireless Essentials" },
        { year: "2025", title: "RestauManager", description: "Projet académique Java" },
        { year: "2025", title: "Lancement ObiStyle", description: "E-commerce Next.js" },
        { year: "2025", title: "Gestion Patrimoine", description: "Plateforme web Django & Leaflet" },
        { year: "2025", title: "HoneyPot Cowrie", description: "Projet Cybersécurité Linux" },
        { year: "2026", title: "2ème année IAI-Togo", description: "En cours" },
      ],
    },
    certifications: {
      title: "Mes",
      titleHighlight: "Certifications",
      items: [
        { title: "Cisco CCNA 1 – Introduction to Networks", year: "2024" },
        { title: "Cisco CCNA 2 – Switching, Routing & Wireless Essentials", year: "2025" },
        { title: "English Language Certificate – Youth Level 1", year: "2024" },
        { title: "Utilisation d'ordinateurs et équipements mobiles", year: "2024" },
        { title: "Sensibilisation au numérique", year: "2024" },
      ],
    },
    contact: {
      title: "Me",
      titleHighlight: "Contacter",
      form: {
        name: "Nom",
        namePlaceholder: "Votre nom",
        email: "Email",
        emailPlaceholder: "votre@email.com",
        message: "Message",
        messagePlaceholder: "Votre message...",
        send: "Envoyer",
        sending: "Envoi en cours...",
        successTitle: "Message envoyé !",
        successDesc: "Merci de m'avoir contacté. Je vous répondrai bientôt.",
        errorDesc: "Une erreur s'est produite. Réessayez ou envoyez un email directement.",
      },
      info: {
        title: "Restons en contact !",
        description:
          "N'hésitez pas à me contacter pour discuter de vos projets, collaborations ou simplement pour dire bonjour. Je suis toujours ouvert aux nouvelles opportunités.",
        location: "Lomé, Togo",
        whatsapp: "+228 97 45 95 18",
      },
    },
    footer: {
      rights: "© 2026 AGBEBAVI Elom Obed",
    },
  },

  en: {
    nav: {
      home: "Home",
      about: "About",
      skills: "Skills",
      projects: "Projects",
      design: "Design",
      timeline: "Journey",
      certifications: "Certifications",
      contact: "Contact",
      downloadCV: "Download CV",
    },
    hero: {
      greeting: "Hello, I'm",
      location: "Lomé, Togo",
      role: "Full-Stack",
      stats: {
        certifications: "certifications",
        projects: "projects",
        languages: "languages",
        passion: "passion",
      },
      cta: {
        projects: "View my projects",
        contact: "Contact me",
      },
    },
    about: {
      title: "About",
      titleHighlight: "me",
      description:
        "Software Engineering student at IAI-Togo, I combine full-stack development and graphic creativity to build complete digital solutions. Passionate about web, mobile and visual design, I'm equally comfortable with code and Photoshop.",
      skills: [
        { title: "Development", desc: "Full-Stack Web & Mobile" },
        { title: "Design", desc: "UI/UX & Graphics" },
        { title: "Passion", desc: "Innovation & Creativity" },
      ],
    },
    skills: {
      title: "My",
      titleHighlight: "Skills",
      levels: {
        "Intermédiaire": "Intermediate",
        "Deb.+": "Beg.+",
        "Débutant": "Beginner",
      },
      categories: {
        "Web": "Web",
        "Backend": "Backend",
        "Frameworks": "Frameworks",
        "Mobile": "Mobile",
        "Base de données": "Databases",
        "Déploiement": "Deployment",
        "Réseaux": "Networking",
        "Design": "Design",
      },
    },
    projects: {
      title: "My",
      titleHighlight: "Projects",
      status: {
        "En cours": "In progress",
        "Projet académique": "Academic project",
        "Terminé": "Completed",
        "Cybersécurité": "Cybersecurity",
        "Production": "Production",
      },
      viewDemo: "View site",
      viewCode: "Code",
      items: [
        {
          title: "Gestion Patrimoine",
          description:
            "Secure web platform to inventory, locate and manage company assets (land, buildings) with GPS coordinates. Interactive mapping, navigation, GPX import and PDF export.",
          features: ["Interactive Map", "GPS Navigation", "GPX Import", "PDF Export"],
        },
        {
          title: "ObiStyle",
          description:
            "Elegant e-commerce website for African clothing and pagne fabrics. Modern boutique interface with admin panel, authentication, cart and worldwide delivery. Mobile-first design.",
          features: ["Elegant Homepage", "Admin Panel", "Authentication", "Cart & Delivery"],
        },
        {
          title: "RestauManager",
          description:
            "Desktop restaurant management application. Dashboard with KPIs (total products, low stock, revenue), category management, inventory and orders with period-based statistics.",
          features: ["KPI Dashboard", "Stock Management", "Low Stock Alerts", "Statistics"],
        },
        {
          title: "ObedGPT",
          description:
            "Full-stack multimodal AI web app. Integrates Chat, Vision, Audio, Code and Text-to-Speech via the Groq API. Modern interface with Markdown/KaTeX rendering, orange/cream theme and secure Vercel proxy.",
          features: ["AI Chat", "Vision & Audio", "Code Execution", "Text-to-Speech"],
        },
        {
          title: "HoneyPot with Cowrie",
          description:
            "Deployment of an SSH/Telnet honeypot with Cowrie on Linux to capture and analyze intrusion attempts. Full session logging, behavioral analysis and real-time network monitoring.",
          features: ["SSH/Telnet Trap", "Session Logging", "Attack Analysis", "Network Monitoring"],
        },
        {
          title: "ElomFacture IA",
          description:
            "AI-powered invoice capture app with OCR. Processes photos or PDFs, auto-extracts data (amounts, dates, suppliers, SYSCOHADA account number), generates structured JSON for accounting integration. Optimized for the Togolese context. Integrated Revised SYSCOHADA Chart of Accounts",
          features: ["Groq AI OCR", "Photo/PDF Upload", "Data Extraction", "JSON/CSV Export"],
        },
        {
          title: "ElomPaie",
          description:
            "Complete payroll management SaaS for Togolese businesses. Automatic salary calculation, SYSCOHADA deductions, PDF payslip generation, Sage accounting export. Secure auth, multi-user analytics dashboard. CGI-OTR 2025 compliant.",
          features: ["SYSCOHADA Payroll", "PDF Payslips", "Sage Export", "Analytics Dashboard"],
        },
        {
          title: "Les Délices de Norbert",
          description:
            "E-commerce restaurant website for a local Togolese restaurant in Lomé. Menu presentation, online ordering with PayGateGlobal payment, cart management. Authentic design showcasing traditional Togolese cuisine. Responsive mobile-first.",
          features: ["Interactive Menu", "Cart & Orders", "PayGateGlobal Payment", "Restaurant Contact"],
        },
      ],
    },
    design: {
      title: "Graphic",
      titleHighlight: "Creations",
    },
    timeline: {
      title: "My",
      titleHighlight: "Journey",
      items: [
        { year: "2024", title: "High School Diploma", description: "MathFinEco International School" },
        { year: "2024", title: "Joined IAI-Togo", description: "Software Engineering" },
        { year: "2024", title: "Cisco CCNA 1", description: "Introduction to Networks" },
        { year: "2025", title: "Cisco CCNA 2", description: "Switching, Routing & Wireless Essentials" },
        { year: "2025", title: "RestauManager", description: "Academic Java project" },
        { year: "2025", title: "ObiStyle Launch", description: "Next.js E-commerce" },
        { year: "2025", title: "Gestion Patrimoine", description: "Django & Leaflet web platform" },
        { year: "2025", title: "HoneyPot Cowrie", description: "Linux Cybersecurity project" },
        { year: "2026", title: "2nd Year at IAI-Togo", description: "Ongoing" },
      ],
    },
    certifications: {
      title: "My",
      titleHighlight: "Certifications",
      items: [
        { title: "Cisco CCNA 1 – Introduction to Networks", year: "2024" },
        { title: "Cisco CCNA 2 – Switching, Routing & Wireless Essentials", year: "2025" },
        { title: "English Language Certificate – Youth Level 1", year: "2024" },
        { title: "Computer and Mobile Device Usage", year: "2024" },
        { title: "Digital Awareness", year: "2024" },
      ],
    },
    contact: {
      title: "Get in",
      titleHighlight: "Touch",
      form: {
        name: "Name",
        namePlaceholder: "Your name",
        email: "Email",
        emailPlaceholder: "your@email.com",
        message: "Message",
        messagePlaceholder: "Your message...",
        send: "Send",
        sending: "Sending...",
        successTitle: "Message sent!",
        successDesc: "Thanks for reaching out. I'll get back to you soon.",
        errorDesc: "Something went wrong. Please try again or email me directly.",
      },
      info: {
        title: "Let's stay in touch!",
        description:
          "Feel free to contact me to discuss your projects, collaborations, or just to say hi. I'm always open to new opportunities.",
        location: "Lomé, Togo",
        whatsapp: "+228 97 45 95 18",
      },
    },
    footer: {
      rights: "© 2026 AGBEBAVI Elom Obed",
    },
  },
}
