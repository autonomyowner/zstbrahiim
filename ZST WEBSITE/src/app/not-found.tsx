import Link from 'next/link'

export default function NotFound(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-elegant font-bold text-kitchen-lux-dark-green-800 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-kitchen-lux-dark-green-700 mb-6">
          Page non trouvée
        </h2>
        <p className="text-kitchen-lux-dark-green-600 mb-8 max-w-md mx-auto">
          Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-kitchen-lux-dark-green-800 px-8 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition-colors duration-200 hover:bg-kitchen-lux-dark-green-700"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
