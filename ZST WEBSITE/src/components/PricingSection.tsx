'use client'

export const PricingSection = (): JSX.Element => {
  const handleContactClick = (): void => {
    const phoneNumber = '+213673734578'
    const message =
      'Bonjour! Je souhaite obtenir un devis pour vos services de decoration evennementielle.'
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message,
    )}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <section className="mt-24 rounded-3xl border border-kitchen-lux-dark-green-200 bg-white/85 px-6 py-16 shadow-sm sm:px-10">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-kitchen-lux-dark-green-600">
          Tarification
        </p>
        <h2 className="mt-4 text-4xl font-elegant font-semibold text-kitchen-lux-dark-green-800 sm:text-5xl">
          Des devis personnalises selon vos besoins
        </h2>
        <p className="mt-6 text-base leading-relaxed text-kitchen-lux-dark-green-700">
          Chaque projet est unique. Nous construisons des offres modulables en
          fonction de l ampleur du decor, du lieu et de vos contraintes
          logistiques.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            title: 'Mariages',
            description: 'Scenographie complete et coordination le jour J.',
            points: [
              'Etude et proposition creative',
              'Installation equipee le jour J',
              'Demontage planifie',
            ],
          },
          {
            title: 'Anniversaires',
            description: 'Decor festif adapte a votre theme et votre budget.',
            points: [
              'Design personnalise',
              'Selection des accessoires',
              'Installation rapide',
            ],
          },
          {
            title: 'Ceremonies',
            description: 'Ambiance sobre et elegante pour les moments forts.',
            points: [
              'Respect des codes et symboles',
              'Coordination logistique discrete',
              'Presence technique sur site',
            ],
          },
        ].map((offer) => (
          <div
            key={offer.title}
            className="flex flex-col rounded-3xl border border-kitchen-lux-dark-green-200 bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-6 py-8 text-left shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-kitchen-lux-dark-green-200/20"
          >
            <h3 className="text-xl font-semibold text-kitchen-lux-dark-green-800">
              {offer.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-kitchen-lux-dark-green-700">
              {offer.description}
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-kitchen-lux-dark-green-700">
              {offer.points.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-kitchen-lux-dark-green-600">
              Sur devis
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h3 className="text-2xl font-elegant font-semibold text-kitchen-lux-dark-green-800">
          Parlons de votre projet
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-kitchen-lux-dark-green-700">
          Nous ecoutons vos attentes, selectionnons les meilleurs prestataires
          et composons une proposition detaillee pour garantir un rendu
          harmonieux.
        </p>
        <button
          onClick={handleContactClick}
          className="mt-7 rounded-full bg-kitchen-lux-dark-green-800 px-10 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white transition-colors duration-200 hover:bg-kitchen-lux-dark-green-700"
          type="button"
        >
          Demander un devis
        </button>
      </div>
    </section>
  )
}
