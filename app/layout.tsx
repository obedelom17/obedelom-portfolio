import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/contexts/language-context'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'AGBEBAVI Elom Obed | Développeur Full-Stack & Designer Graphique',
  description: 'Portfolio de AGBEBAVI Elom Obed - Développeur Full-Stack basé à Lomé, Togo. Spécialisé en Next.js, Django, Flutter et Adobe Photoshop.',
  keywords: ['développeur', 'full-stack', 'designer graphique', 'Togo', 'Lomé', 'Next.js', 'Django', 'Flutter', 'portfolio'],
  authors: [{ name: 'AGBEBAVI Elom Obed' }],
  openGraph: {
    title: 'AGBEBAVI Elom Obed | Développeur Full-Stack & Designer Graphique',
    description: 'Portfolio de AGBEBAVI Elom Obed - Développeur Full-Stack basé à Lomé, Togo.',
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
    <html lang="fr" suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LanguageProvider>
            {children}
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
