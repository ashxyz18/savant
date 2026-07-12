import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
  preload: false,
})

export const metadata = {
  title: 'SAVANT | Premium Leather Bags',
  description: 'Discover premium leather bags crafted with precision and timeless design.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'SAVANT | Premium Leather Bags',
    description: 'Discover premium leather bags crafted with precision and timeless design.',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body className="font-sans bg-neutral-50 text-neutral-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
