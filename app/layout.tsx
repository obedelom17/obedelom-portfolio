import type { Metadata, Viewport } from "next"
import { Providers } from "@/components/providers"
import "./globals.css"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://obedelom-portfolio.pages.dev"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AGBEBAVI Elom Obed | Ingénieur en informatique",
  description:
    "Portfolio de AGBEBAVI Elom Obed, ingénieur en informatique à Lomé, Togo. Développement logiciel, applications web, bases de données, réseaux et sécurité.",
  keywords: ["ingénieur en informatique", "développeur full-stack", "Togo", "Lomé", "Next.js", "React", "Django", "SYSCOHADA", "portfolio"],
  authors: [{ name: "AGBEBAVI Elom Obed" }],
  openGraph: {
    title: "AGBEBAVI Elom Obed | Ingénieur en informatique",
    description: "Ingénieur en informatique à Lomé, Togo. Solutions logicielles de la conception au déploiement.",
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
  },
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}try{if(!sessionStorage.getItem("seen"))document.documentElement.dataset.loader="on"}catch(e){}',
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
