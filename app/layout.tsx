import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/react"
import { Providers } from "@/components/providers"
import "./globals.css"

const siteUrl = "https://obedelom-portfolio.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AGBEBAVI Elom Obed | Développeur Full-Stack",
  description:
    "Portfolio de AGBEBAVI Elom Obed, développeur full-stack à Lomé, Togo. Applications web de facturation, de paie et de commerce en ligne avec Next.js, React et Django.",
  keywords: ["développeur full-stack", "Togo", "Lomé", "Next.js", "React", "Django", "SYSCOHADA", "portfolio"],
  authors: [{ name: "AGBEBAVI Elom Obed" }],
  openGraph: {
    title: "AGBEBAVI Elom Obed | Développeur Full-Stack",
    description: "Développeur full-stack à Lomé, Togo. Applications web pour les entreprises togolaises.",
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
