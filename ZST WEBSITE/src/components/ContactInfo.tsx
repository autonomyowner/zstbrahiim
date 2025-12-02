'use client'

export const ContactInfo = (): JSX.Element => {
  const handleWhatsAppClick = (): void => {
    const phoneNumber = '+213673734578'
    const message =
      'Bonjour! Je souhaite decouvrir votre collection de parfums de luxe.'
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message,
    )}`
    window.open(whatsappUrl, '_blank')
  }

  const handlePhoneClick = (): void => {
    window.open('tel:+213673734578', '_self')
  }

  const handleEmailClick = (): void => {
    window.open('mailto:contact@zst.com', '_self')
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-kitchen-lux-dark-green-200 bg-white/90 px-6 py-10 shadow-sm">
        <p className="text-xs uppercase tracking-[0.4em] text-kitchen-lux-dark-green-600">
          Coordonnees
        </p>
        <h2 className="mt-4 text-3xl font-elegant font-semibold text-kitchen-lux-dark-green-800">
          Echanger avec notre equipe
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-kitchen-lux-dark-green-700">
          Nous sommes disponibles pour vous conseiller sur nos parfums de luxe, repondre
          a vos questions et vous aider a trouver la fragrance qui vous correspond parfaitement.
        </p>
      </div>

      <div className="rounded-3xl border border-kitchen-lux-dark-green-200 bg-white/85 px-6 py-8 shadow-sm">
        <h3 className="text-sm uppercase tracking-[0.3em] text-kitchen-lux-dark-green-600">
          WhatsApp
        </h3>
        <p className="mt-2 text-lg font-semibold text-kitchen-lux-dark-green-800">
          +213 79 733 94 51
        </p>
        <p className="mt-2 text-sm text-kitchen-lux-dark-green-700">
          Reponse rapide et conseils personnalises sur nos fragrances.
        </p>
        <button
          onClick={handleWhatsAppClick}
          className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-800 underline underline-offset-4 transition-colors duration-200"
          type="button"
        >
          Ouvrir WhatsApp
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-3xl border border-kitchen-lux-dark-green-200 bg-white/85 px-6 py-8 shadow-sm">
          <h3 className="text-sm uppercase tracking-[0.3em] text-kitchen-lux-dark-green-600">
            Telephone
          </h3>
          <p className="mt-2 text-lg font-semibold text-kitchen-lux-dark-green-800">
            +213 79 733 94 51
          </p>
        <p className="mt-2 text-sm text-kitchen-lux-dark-green-700">
          Pour des informations sur nos parfums ou une commande.
        </p>
          <button
            onClick={handlePhoneClick}
            className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-800 underline underline-offset-4 transition-colors duration-200"
            type="button"
          >
            Appeler
          </button>
        </div>
        <div className="rounded-3xl border border-kitchen-lux-dark-green-200 bg-white/85 px-6 py-8 shadow-sm">
          <h3 className="text-sm uppercase tracking-[0.3em] text-kitchen-lux-dark-green-600">
            Email
          </h3>
          <p className="mt-2 text-lg font-semibold text-kitchen-lux-dark-green-800">
            contact@zst.com
          </p>
        <p className="mt-2 text-sm text-kitchen-lux-dark-green-700">
          Pour des questions sur nos produits et commandes.
        </p>
          <button
            onClick={handleEmailClick}
            className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-kitchen-lux-dark-green-600 hover:text-kitchen-lux-dark-green-800 underline underline-offset-4 transition-colors duration-200"
            type="button"
          >
            Ecrire un message
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-kitchen-lux-dark-green-200 bg-white/80 px-6 py-8 text-sm uppercase tracking-[0.3em] text-kitchen-lux-dark-green-600 shadow-sm">
        Horaires : lundi a samedi 9h - 18h • Dimanche sur rendez-vous
      </div>
    </div>
  )
}
