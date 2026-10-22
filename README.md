# obedelom-portfolio

[Français](#francais) | [English](#english)

---

<a id="francais"></a>

## Français

Portfolio personnel de AGBEBAVI Elom Obed, ingénieur en informatique basé à Lomé, Togo. Le site est bilingue (français et anglais), adopte un design blanc, noir et vert, et inclut un espace d'administration pour gérer les projets, les certifications et le parcours sans toucher au code.

Site en ligne : https://obedelom-portfolio.vercel.app

### Fonctionnalités

- Présentation, projets, compétences, parcours, certifications et formulaire de contact
- Bascule français / anglais, mémorisée dans le navigateur
- Visionneuse d'images pour les captures de projets et les certificats
- Espace d'administration protégé (`/admin`) : ajout, modification, suppression et réordonnancement des projets, certifications et étapes du parcours, avec téléversement d'images
- Contenu bilingue saisi directement dans l'administration
- Mise à jour du site en quelques secondes après chaque modification
- Données de secours intégrées : le site reste fonctionnel si Supabase n'est pas configuré

### Technologies

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- Supabase (base PostgreSQL, authentification, stockage d'images)
- EmailJS (formulaire de contact)
- Déploiement sur Vercel

### Structure

```
app/                 Pages, layout, route /admin et API de revalidation
components/site/     Sections du site public
components/admin/    Interface d'administration
lib/                 Types, données de départ, traductions, accès Supabase
public/              Images, CV
supabase/schema.sql  Tables, règles de sécurité et stockage
```

### Installation locale

```bash
git clone https://github.com/obedelom17/obedelom-portfolio.git
cd obedelom-portfolio
npm install
cp .env.example .env.local
npm run dev
```

Le site s'ouvre sur http://localhost:3000. Sans variables Supabase, il affiche les données de départ.

### Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | Identifiant du service EmailJS |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | Identifiant du modèle EmailJS |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Clé publique EmailJS |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme (anon public) Supabase |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Email du seul compte autorisé à administrer |

### Activer l'administration

1. Créer un projet sur https://supabase.com.
2. Ouvrir SQL Editor, coller le contenu de `supabase/schema.sql` et l'exécuter. Si votre email administrateur n'est pas `agbebaviobedelom@gmail.com`, le remplacer dans le fichier avant l'exécution.
3. Dans Authentication > Users, créer un utilisateur avec cet email et un mot de passe. Désactiver les inscriptions publiques dans Authentication > Sign In / Providers.
4. Dans Project Settings > API, copier l'URL et la clé `anon public`.
5. Ajouter les trois variables Supabase dans Vercel (Settings > Environment Variables), puis redéployer.
6. Ouvrir `/admin`, se connecter, puis cliquer sur « Importer les données de départ » dans chaque onglet pour charger les contenus actuels.

### Sécurité

- Lecture publique, écriture réservée à l'email administrateur : appliqué côté base de données par des règles RLS, pas seulement dans l'interface.
- La clé `anon` est publique par conception ; seules les règles RLS protègent les données.
- La page `/admin` n'est pas indexée par les moteurs de recherche.

### Scripts

| Commande | Action |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Lance le build de production |
| `npm run lint` | Vérification TypeScript |

### Contact

AGBEBAVI Elom Obed, Lomé, Togo
Email : agbebaviobedelom@gmail.com
GitHub : https://github.com/obedelom17

---

<a id="english"></a>

## English

Personal portfolio of AGBEBAVI Elom Obed, a computer engineer based in Lomé, Togo. The site is bilingual (French and English), uses a white, black and green design, and includes an admin area to manage projects, certifications and journey entries without editing code.

Live site: https://obedelom-portfolio.vercel.app

### Features

- Introduction, education, projects, skills, journey, certifications and contact form
- French / English switch, remembered in the browser
- Image viewer for project screenshots and certificates
- Protected admin area (`/admin`): add, edit, delete and reorder projects, certifications and journey entries, with image upload
- Bilingual content entered directly in the admin
- Site updates within seconds after each change
- Built-in fallback data: the site keeps working if Supabase is not configured

### Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- Supabase (PostgreSQL database, authentication, image storage)
- EmailJS (contact form)
- Deployed on Vercel

### Structure

```
app/                 Pages, layout, /admin route and revalidation API
components/site/     Public site sections
components/admin/    Admin interface
lib/                 Types, seed data, translations, Supabase access
public/              Images, resume
supabase/schema.sql  Tables, security rules and storage
```

### Local setup

```bash
git clone https://github.com/obedelom17/obedelom-portfolio.git
cd obedelom-portfolio
npm install
cp .env.example .env.local
npm run dev
```

The site opens at http://localhost:3000. Without Supabase variables, it shows the seed data.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | EmailJS service ID |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | EmailJS template ID |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Email of the only account allowed to administer |

### Enabling the admin area

1. Create a project at https://supabase.com.
2. Open SQL Editor, paste the contents of `supabase/schema.sql` and run it. If your admin email is not `agbebaviobedelom@gmail.com`, replace it in the file first.
3. In Authentication > Users, create a user with that email and a password. Disable public sign-ups in Authentication > Sign In / Providers.
4. In Project Settings > API, copy the URL and the `anon public` key.
5. Add the three Supabase variables in Vercel (Settings > Environment Variables), then redeploy.
6. Open `/admin`, sign in, then click "Importer les données de départ" in each tab to load the current content.

### Security

- Public read, writes restricted to the admin email: enforced at the database level with RLS policies, not only in the interface.
- The `anon` key is public by design; only the RLS policies protect the data.
- The `/admin` page is excluded from search engine indexing.

### Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | TypeScript check |

### Contact

AGBEBAVI Elom Obed, Lomé, Togo
Email: agbebaviobedelom@gmail.com
GitHub: https://github.com/obedelom17
