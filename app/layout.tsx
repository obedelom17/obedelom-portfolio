import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'AGBEBAVI Elom Obed | Développeur Full-Stack & Designer Graphique',
  description: 'Portfolio de AGBEBAVI Elom Obed - Développeur Full-Stack et Designer Graphique basé à Lomé, Togo. Spécialisé en Next.js, Django, Flutter et Adobe Photoshop.',
  keywords: ['développeur', 'full-stack', 'designer graphique', 'Togo', 'Lomé', 'Next.js', 'Django', 'Flutter', 'portfolio'],
  authors: [{ name: 'AGBEBAVI Elom Obed' }],
  openGraph: {
    title: 'AGBEBAVI Elom Obed | Développeur Full-Stack & Designer Graphique',
    description: 'Portfolio de AGBEBAVI Elom Obed - Développeur Full-Stack et Designer Graphique basé à Lomé, Togo.',
    type: 'website',
    locale: 'fr_FR',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="bg-background scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
