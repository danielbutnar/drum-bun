import type {Metadata} from 'next'
import {Archivo} from 'next/font/google'
import Link from 'next/link'

import {SITE} from '@/lib/site'

import './globals.css'

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
})

const DESCRIPTION =
  'Vignettes, tolls, winter tyres and emission zones from Romania through Hungary to Austria or Germany, priced for your dates, every source shown.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'Drum Bun: what your car needs, Romania to Germany',
  description: DESCRIPTION,
  alternates: {canonical: '/'},
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Drum Bun',
    title: 'Drum Bun: what your car needs between Romania and Germany or Austria',
    description: DESCRIPTION,
    images: [{url: '/og.png', width: 2000, height: 840, alt: 'Drum bun! A route from Romania through Hungary and Austria to Germany, drawn as a strip map.'}],
  },
  twitter: {card: 'summary_large_image'},
}

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="min-h-dvh flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:m-3 focus:bg-paper focus:p-2">
          Skip to content
        </a>
        <header className="border-b border-land-2 bg-paper">
          <nav aria-label="Main" className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-6 gap-y-2 px-4 py-3">
            <Link href="/" className="type-expanded text-lg font-bold tracking-tight">
              Drum Bun
            </Link>
            <Link href="/#plan" className="type-condensed text-ink-2 hover:text-ink">
              Plan a trip
            </Link>
            <Link href="/#ask" className="type-condensed text-ink-2 hover:text-ink">
              Ask the agent
            </Link>
            <Link href="/knowledge" className="type-condensed text-ink-2 hover:text-ink">
              How it knows
            </Link>
          </nav>
        </header>
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <footer className="border-t border-land-2 bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-ink-2">
            <p>
              Facts checked on 29 September 2026 against official sources. Rules change; the planner shows when a price is an
              estimate or a law change is pending. Not legal advice.
            </p>
            <p className="mt-2">
              Content lives in Sanity (project <code>pd5e7gez</code>, dataset <code>production</code>, public). Built for the DEV
              Sanity Challenge.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
