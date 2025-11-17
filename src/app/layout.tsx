import type { Metadata } from 'next'
import { Inter, Playfair_Display, Great_Vibes } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-great-vibes',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ZST - Marketplace B2B et B2C Multi-vendeurs à Bouzareah | Parfums, Mode, Services',
  description:
    'ZST : Plateforme marketplace B2B et B2C à Bouzareah. Parfums de luxe, vêtements d\'hiver, services freelance. Espace professionnel pour fournisseurs, importateurs et grossistes.',
  keywords:
    'marketplace B2B, marketplace B2C, multi-vendeurs, Bouzareah, parfums de luxe, vêtements hiver, services freelance, importateur, grossiste, fournisseur, e-commerce Algérie',
  authors: [{ name: 'ZST' }],
  creator: 'ZST',
  publisher: 'ZST',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.zst.xyz'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ZST - Marketplace B2B et B2C Multi-vendeurs à Bouzareah',
    description:
      'Plateforme marketplace professionnelle à Bouzareah. Parfums de luxe, mode, services freelance. Espace B2B pour importateurs, grossistes et fournisseurs.',
    url: 'https://www.zst.xyz',
    siteName: 'ZST',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ZST - Marketplace B2B et B2C Multi-vendeurs',
      },
    ],
    locale: 'fr_DZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZST - Marketplace B2B et B2C Multi-vendeurs à Bouzareah',
    description:
      'Plateforme marketplace professionnelle à Bouzareah. Parfums de luxe, mode, services freelance. Espace B2B pour importateurs, grossistes et fournisseurs.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable} ${greatVibes.variable}`}>
      <body className={`${inter.className} bg-brand-light text-text-primary antialiased`}>
        <div className="flex min-h-screen flex-col bg-brand-light">
          <Navbar />
          <main className="flex-1 bg-brand-light pt-10 pb-16">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
