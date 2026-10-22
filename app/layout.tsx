import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/react"
import { Providers } from "@/components/providers"
import "./globals.css"

const siteUrl = "https://obedelom-portfolio.vercel.app"

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
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
