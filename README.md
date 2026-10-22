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
- Espace d'administration protégé par mot de passe (`/admin`) : gestion des projets, certifications et étapes du parcours, avec téléversement d'images
- Contenu bilingue saisi directement dans l'administration
- Mise à jour immédiate du site après chaque enregistrement

### Technologies

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- EmailJS (formulaire de contact)
- Déploiement sur Vercel
- Neon (base PostgreSQL serverless) pour le contenu modifiable depuis l'administration

### Structure

```
app/                 Pages, layout, route /admin et API d'administration
components/site/     Sections du site public
components/admin/    Interface d'administration
data/                Données de départ (JSON), utilisées aussi comme secours
lib/                 Types, traductions, accès Neon, authentification
public/              Images, logos des technologies, CV
```

### Installation locale

```bash
git clone https://github.com/obedelom17/obedelom-portfolio.git
cd obedelom-portfolio
npm install
cp .env.example .env.local
npm run dev
```

Le site s'ouvre sur http://localhost:3000.

### Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | Identifiant du service EmailJS |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | Identifiant du modèle EmailJS |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Clé publique EmailJS |
| `ADMIN_PASSWORD` | Mot de passe de l'administration |
| `SESSION_SECRET` | Chaîne aléatoire longue qui signe la session (facultatif, sinon dérivée du mot de passe) |
| `DATABASE_URL` | Chaîne de connexion Neon (PostgreSQL) |

### Fonctionnement de l'administration

La page `/admin` permet d'ajouter, modifier, supprimer et réordonner les projets, les certifications et les étapes du parcours, avec téléversement d'images. Les données sont enregistrées dans la base Neon (tables créées automatiquement) et les images y sont stockées, puis servies par `/api/img/...`. Le site est mis à jour dès l'enregistrement. À la première connexion, les contenus actuels du dossier `data/` sont importés automatiquement. Sans `DATABASE_URL`, le site affiche ces données de départ.

### Activer l'administration

1. Créer un compte et un projet sur https://neon.tech (ou, dans Vercel, Storage > Neon, qui ajoute `DATABASE_URL` automatiquement).
2. Dans le tableau de bord Neon, copier la chaîne de connexion (Connect > Connection string).
3. Dans Vercel : Settings > Environment Variables, ajouter `DATABASE_URL`, `ADMIN_PASSWORD` (mot de passe long) et `SESSION_SECRET` (chaîne aléatoire).
4. Redéployer le projet.
5. Ouvrir `/admin` et se connecter avec `ADMIN_PASSWORD`.

### Sécurité

- Le mot de passe et la chaîne de connexion restent côté serveur ; ils ne sont jamais envoyés au navigateur.
- La session est un cookie HttpOnly, SameSite strict, signé et valable 12 heures.
- Toutes les routes d'écriture vérifient la session ; la base n'est jamais accessible directement depuis le navigateur.
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
- Password-protected admin area (`/admin`): manage projects, certifications and journey entries, with image upload
- Bilingual content entered directly in the admin
- Immediate site update after each save

### Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- EmailJS (contact form)
- Deployed on Vercel
- Neon (serverless PostgreSQL) for content editable from the admin

### Structure

```
app/                 Pages, layout, /admin route and admin API
components/site/     Public site sections
components/admin/    Admin interface
data/                Seed data (JSON), also used as a fallback
lib/                 Types, translations, Neon access, authentication
public/              Images, technology logos, resume
```

### Local setup

```bash
git clone https://github.com/obedelom17/obedelom-portfolio.git
cd obedelom-portfolio
npm install
cp .env.example .env.local
npm run dev
```

The site opens at http://localhost:3000.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | EmailJS service ID |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | EmailJS template ID |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | EmailJS public key |
| `ADMIN_PASSWORD` | Admin area password |
| `SESSION_SECRET` | Long random string that signs the session (optional, derived from the password otherwise) |
| `DATABASE_URL` | Neon connection string (PostgreSQL) |

### How the admin works

The `/admin` page lets you add, edit, delete and reorder projects, certifications and journey entries, with image upload. Data is saved in the Neon database (tables are created automatically) and images are stored there too, then served through `/api/img/...`. The site updates as soon as you save. On first sign-in, the current content of the `data/` folder is imported automatically. Without `DATABASE_URL`, the site shows this seed data.

### Enabling the admin area

1. Create an account and a project at https://neon.tech (or, in Vercel, Storage > Neon, which adds `DATABASE_URL` automatically).
2. In the Neon dashboard, copy the connection string (Connect > Connection string).
3. In Vercel: Settings > Environment Variables, add `DATABASE_URL`, `ADMIN_PASSWORD` (a long password) and `SESSION_SECRET` (a random string).
4. Redeploy the project.
5. Open `/admin` and sign in with `ADMIN_PASSWORD`.

### Security

- The password and the connection string stay on the server and are never sent to the browser.
- The session is an HttpOnly, SameSite strict, signed cookie valid for 12 hours.
- All write routes check the session; the database is never directly reachable from the browser.
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
