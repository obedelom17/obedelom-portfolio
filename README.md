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
- Publication automatique : chaque modification crée un commit et Vercel redéploie le site

### Technologies

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- EmailJS (formulaire de contact)
- Déploiement sur Vercel
- Contenu stocké dans des fichiers JSON du dépôt, modifiés par l'administration via l'API GitHub (aucun service externe de base de données)

### Structure

```
app/                 Pages, layout, route /admin et API d'administration
components/site/     Sections du site public
components/admin/    Interface d'administration
data/                Projets, certifications et parcours (JSON)
lib/                 Types, traductions, accès GitHub, authentification
public/              Images, logos des technologies, CV, images téléversées
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
| `GITHUB_TOKEN` | Jeton GitHub autorisé à écrire dans le dépôt |
| `GITHUB_REPO` | Dépôt au format `utilisateur/nom` |
| `GITHUB_BRANCH` | Branche déployée par Vercel (par défaut `main`) |

### Fonctionnement de l'administration

La page `/admin` permet d'ajouter, modifier, supprimer et réordonner les projets, les certifications et les étapes du parcours, avec téléversement d'images. Chaque enregistrement crée un commit dans le dépôt GitHub (fichiers `data/*.json` et `public/uploads/`). Vercel détecte le commit et redéploie le site : les changements apparaissent en 1 à 2 minutes.

### Activer l'administration

1. Sur GitHub : Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token.
2. Limiter le jeton au seul dépôt `obedelom-portfolio`, avec la permission Repository permissions > Contents : Read and write. Copier le jeton.
3. Dans Vercel : Settings > Environment Variables, ajouter `ADMIN_PASSWORD` (mot de passe long), `SESSION_SECRET` (chaîne aléatoire), `GITHUB_TOKEN`, `GITHUB_REPO` (`obedelom17/obedelom-portfolio`) et `GITHUB_BRANCH` (`main`).
4. Redéployer le projet.
5. Ouvrir `/admin` et se connecter avec `ADMIN_PASSWORD`.

### Sécurité

- Le mot de passe et le jeton GitHub restent côté serveur ; ils ne sont jamais envoyés au navigateur.
- La session est un cookie HttpOnly, SameSite strict, signé et valable 12 heures.
- Toutes les routes d'écriture vérifient la session. Le jeton GitHub ne doit avoir accès qu'à ce dépôt.
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
- Automatic publishing: each change creates a commit and Vercel redeploys the site

### Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- EmailJS (contact form)
- Deployed on Vercel
- Content stored in JSON files in the repository, edited by the admin through the GitHub API (no external database service)

### Structure

```
app/                 Pages, layout, /admin route and admin API
components/site/     Public site sections
components/admin/    Admin interface
data/                Projects, certifications and journey (JSON)
lib/                 Types, translations, GitHub access, authentication
public/              Images, technology logos, resume, uploaded images
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
| `GITHUB_TOKEN` | GitHub token allowed to write to the repository |
| `GITHUB_REPO` | Repository as `user/name` |
| `GITHUB_BRANCH` | Branch deployed by Vercel (default `main`) |

### How the admin works

The `/admin` page lets you add, edit, delete and reorder projects, certifications and journey entries, with image upload. Each save creates a commit in the GitHub repository (`data/*.json` files and `public/uploads/`). Vercel detects the commit and redeploys the site: changes appear within 1 to 2 minutes.

### Enabling the admin area

1. On GitHub: Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token.
2. Restrict the token to the `obedelom-portfolio` repository only, with Repository permissions > Contents: Read and write. Copy the token.
3. In Vercel: Settings > Environment Variables, add `ADMIN_PASSWORD` (a long password), `SESSION_SECRET` (a random string), `GITHUB_TOKEN`, `GITHUB_REPO` (`obedelom17/obedelom-portfolio`) and `GITHUB_BRANCH` (`main`).
4. Redeploy the project.
5. Open `/admin` and sign in with `ADMIN_PASSWORD`.

### Security

- The password and the GitHub token stay on the server and are never sent to the browser.
- The session is an HttpOnly, SameSite strict, signed cookie valid for 12 hours.
- All write routes check the session. The GitHub token should only have access to this repository.
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
