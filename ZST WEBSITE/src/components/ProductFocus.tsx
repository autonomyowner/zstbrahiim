import Link from 'next/link'
import Image from 'next/image'

const benefits = [
  {
    title: 'Fragrance Authentique',
    description: 'Parfum de luxe authentique avec des notes equilibrees et complexes.',
  },
  {
    title: 'Tenue Exceptionnelle',
    description: 'Tenue longue et persistante pour une experience olfactive durable.',
  },
  {
    title: 'Notes Harmonieuses',
    description: 'Composition unique avec des notes de tete, de coeur et de fond harmonieuses.',
  },
]

export const ProductFocus = (): JSX.Element => {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-kitchen-lux-dark-green-600">
            Le produit à l&apos;honneur
          </p>
          <h2 className="mt-5 text-4xl font-elegant font-semibold text-kitchen-lux-dark-green-800 sm:text-5xl">
            Collection Signature ZST
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-kitchen-lux-dark-green-700">
            Pour chaque moment de votre vie et chaque occasion, votre personnalite merite la fragrance parfaite. 
            Notre collection signature est concue pour vous offrir des parfums authentiques avec une tenue exceptionnelle.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[32px] border border-kitchen-lux-dark-green-200 bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 shadow-lg">
            <div className="relative aspect-[4/3] bg-neutral-100 flex items-center justify-center">
              <Image
                src="/unnamed (2).jpg"
                alt="ZST - Collection de parfums de luxe"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-elegant font-semibold text-kitchen-lux-dark-green-800">
                EAU DE PARFUM PREMIUM
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-kitchen-lux-dark-green-600">
                Avantages clés
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-2 w-2 rounded-full bg-kitchen-lux-dark-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-kitchen-lux-dark-green-800">
                        {benefit.title}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-kitchen-lux-dark-green-700">
                        {benefit.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Link
                href="/services"
                className="inline-flex rounded-full border border-kitchen-lux-dark-green-400 px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-kitchen-lux-dark-green-700 transition-colors duration-200 hover:border-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-800 hover:bg-kitchen-lux-dark-green-50"
              >
                VOIR LA FICHE PRODUIT
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

