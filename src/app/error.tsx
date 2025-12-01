'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log to error reporting service in production
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-brand-light px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-card-lg border border-brand-border/50 p-8 md:p-10">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 text-3xl font-black">
              !
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-text-primary mb-3">
            Une erreur est survenue
          </h1>

          <p className="text-text-muted mb-8">
            Nous nous excusons pour ce d&eacute;sagr&eacute;ment. Veuillez r&eacute;essayer ou retourner &agrave; la page d&apos;accueil.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-brand-dark text-brand-primary rounded-xl font-semibold transition-all hover:bg-black hover:shadow-card-md"
            >
              R&eacute;essayer
            </button>

            <Link
              href="/"
              className="px-6 py-3 border border-brand-border text-text-primary rounded-xl font-semibold transition-all hover:bg-neutral-50"
            >
              Retour &agrave; l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
