import type { Metadata } from 'next'
import { Inter, Playfair_Display, Great_Vibes } from 'next/font/google'
import './globals.css'
import { PromotionalBanner } from '@/components/PromotionalBanner'
import { Navbar } from '@/components/Navbar'
import { WhatsAppButton } from '@/components/WhatsAppButton'

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
  title: 'ZST - Parfums de luxe et fragrances authentiques a Bouzareah',
  description:
    'Decouvrez notre collection exclusive de parfums de luxe et fragrances authentiques a Bouzareah. Parfums originaux, eaux de parfum haut de gamme et fragrances rares.',
  keywords:
    'parfum, parfums de luxe, fragrances authentiques, eau de parfum, parfum original, Bouzareah, parfumerie, fragrances rares, parfums importes',
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
  metadataBase: new URL('https://brahim-perfum.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ZST - Parfums de luxe et fragrances authentiques a Bouzareah',
    description:
      'Decouvrez notre collection exclusive de parfums de luxe et fragrances authentiques a Bouzareah. Parfums originaux, eaux de parfum haut de gamme et fragrances rares.',
    url: 'https://brahim-perfum.com',
    siteName: 'ZST',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ZST - Parfums de luxe et fragrances authentiques a Bouzareah',
      },
    ],
    locale: 'fr_DZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZST - Parfums de luxe et fragrances authentiques a Bouzareah',
    description:
      'Decouvrez notre collection exclusive de parfums de luxe et fragrances authentiques a Bouzareah. Parfums originaux, eaux de parfum haut de gamme et fragrances rares.',
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
      <body
        className={`${inter.className} bg-gradient-elegant min-h-screen text-slate-900`}
      >
        <Navbar />
        <main className="pt-28 md:pt-32 pb-20">{children}</main>
        <footer 
          className="backdrop-blur-md border-t border-green-600/20 text-white py-4"
          style={{
            background: 'linear-gradient(to right, #2E8B57 0%, #9AFE2E 50%, #2E8B57 100%)'
          }}
        >
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
              Made by{' '}
              <a
                href="https://www.sitedz.store"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white/80 transition-colors underline"
              >
                www.sitedz.store
              </a>
            </p>
          </div>
        </footer>
        <WhatsAppButton />
      </body>
    </html>
  )
}
