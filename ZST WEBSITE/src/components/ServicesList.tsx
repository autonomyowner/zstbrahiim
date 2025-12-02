
import Image from 'next/image'

type Service = {
  id: string
  title: string
  description: string
  features: string[]
  image: string
  signature: string
}

const services: Service[] = [
  {
    id: 'parfums-feminins',
    title: 'Parfums feminins',
    description:
      'Collection exclusive de fragrances feminines authentiques, des notes florales aux accords orientaux pour sublimer votre personnalite.',
    features: [
      'Parfums de luxe authentiques',
      'Notes florales, fruitees et orientales',
      'Eaux de parfum et extraits',
      'Fragrances rares et exclusives',
      'Conseils personnalises par nos experts',
    ],
    image: '/picturs/3.jpg',
    signature: 'Femininite et elegance',
  },
  {
    id: 'parfums-masculins',
    title: 'Parfums masculins',
    description:
      'Selection de fragrances masculines intemporelles, des notes boisees aux accords aquatiques pour affirmer votre style.',
    features: [
      'Parfums de luxe authentiques',
      'Notes boisees, epicees et aquatiques',
      'Eaux de parfum et extraits',
      'Fragrances rares et exclusives',
      'Conseils personnalises par nos experts',
    ],
    image: '/picturs/7.jpg',
    signature: 'Masculinite et caractere',
  },
  {
    id: 'parfums-unisexes',
    title: 'Parfums unisexes',
    description:
      'Fragrances universelles qui transcendent les genres, des creations audacieuses pour une identite olfactive unique.',
    features: [
      'Parfums de luxe authentiques',
      'Notes universelles et modernes',
      'Eaux de parfum et extraits',
      'Fragrances rares et exclusives',
      'Conseils personnalises par nos experts',
    ],
    image: '/picturs/9.jpg',
    signature: 'Modernite et audace',
  },
  {
    id: 'fragrances-rares',
    title: 'Fragrances rares',
    description:
      'Collection limitee de parfums rares et exclusifs, des creations d exception pour les amateurs de fragrances uniques.',
    features: [
      'Parfums de niche et exclusifs',
      'Creations limitees et rares',
      'Notes exceptionnelles et complexes',
      'Emballage premium et soigne',
      'Conseils specialises par nos experts',
    ],
    image: '/picturs/7.jpg',
    signature: 'Exclusivite et raffinement',
  },
  {
    id: 'eaux-de-parfum',
    title: 'Eaux de parfum',
    description:
      'Selection d eaux de parfum haut de gamme avec une tenue exceptionnelle et des notes de tete, de coeur et de fond harmonieuses.',
    features: [
      'Eaux de parfum authentiques',
      'Tenue longue et persistante',
      'Notes equilibrees et complexes',
      'Formats varies (50ml, 100ml)',
      'Garantie d authenticite',
    ],
    image: '/picturs/10.jpg',
    signature: 'Qualite et authenticite',
  },
  {
    id: 'coffrets-decouverte',
    title: 'Coffrets decouverte',
    description:
      'Coffrets elegants contenant plusieurs echantillons de parfums pour vous permettre de decouvrir et tester nos fragrances.',
    features: [
      'Coffrets elegants et soignes',
      'Echantillons de parfums selectionnes',
      'Guide des fragrances inclus',
      'Parfait pour offrir ou decouvrir',
      'Livraison soignee et emballage premium',
    ],
    image: '/picturs/2.jpg',
    signature: 'Decouverte et partage',
  },
]

export const ServicesList = (): JSX.Element => {
  return (
    <div className="space-y-20">
      {services.map((service, index) => {
        const isReversed = index % 2 === 1
        return (
          <section
            key={service.id}
            id={service.id}
            className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2"
          >
            <div
              className={`relative overflow-hidden rounded-[32px] border border-kitchen-lux-dark-green-200 bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-kitchen-lux-dark-green-200/20 ${
                isReversed ? 'lg:order-2' : ''
              }`}
            >
            <div className="relative aspect-[4/3] bg-neutral-100 flex items-center justify-center">
              {service.image ? (
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="text-center text-neutral-400">
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-sm">Image à venir</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-6 py-5">
              <span className="text-xs uppercase tracking-[0.35em] text-kitchen-lux-dark-green-600">
                {service.signature}
              </span>
              <span className="text-xs uppercase tracking-[0.35em] text-kitchen-lux-dark-green-500">
                ZST
              </span>
            </div>
            </div>

            <div className={`space-y-6 ${isReversed ? 'lg:order-1' : ''}`}>
            <div>
              <h2 className="text-3xl font-elegant font-semibold text-kitchen-lux-dark-green-800">
                {service.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-kitchen-lux-dark-green-700">
                {service.description}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-kitchen-lux-dark-green-600">
                Compris dans la prestation
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-kitchen-lux-dark-green-700">
                {service.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>

            <div>
              <button
                type="button"
                className="rounded-full border border-kitchen-lux-dark-green-400 px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-kitchen-lux-dark-green-700 transition-colors duration-200 hover:border-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-800 hover:bg-kitchen-lux-dark-green-50"
              >
                Decouvrir la collection
              </button>
            </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
