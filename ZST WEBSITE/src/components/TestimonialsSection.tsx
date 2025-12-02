export const TestimonialsSection = (): JSX.Element => {
  return (
    <section className="border-y border-kitchen-lux-dark-green-200 bg-white/80 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-kitchen-lux-dark-green-600">
            Découvrez notre produit
          </p>
          <h2 className="mt-5 text-4xl font-elegant font-semibold text-kitchen-lux-dark-green-800 sm:text-5xl">
            ZST Collection
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-kitchen-lux-dark-green-700">
            Decouvrez notre collection exclusive de parfums de luxe et fragrances authentiques.
          </p>
        </div>

        <div className="mt-16">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-kitchen-lux-dark-green-200 bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 shadow-lg">
            <video
              className="w-full h-auto"
              controls
              autoPlay
              loop
              muted
              playsInline
              poster="/picturs/hero.jpg"
            >
              <source src="/sectionhgero.mp4" type="video/mp4" />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
        </div>
      </div>
    </section>
  )
}
