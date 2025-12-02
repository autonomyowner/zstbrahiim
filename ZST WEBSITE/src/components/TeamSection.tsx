
type TeamMember = {
  name: string
  role: string
  description: string
  image: string
  experience: string
}

const teamMembers: TeamMember[] = [
  {
    name: 'Sarah Benali',
    role: 'Directrice artistique',
    description:
      'Plus de cinq ans d experience en direction artistique et scenographie pour evenements sur mesure.',
    image: '',
    experience: '5+ ans',
  },
  {
    name: 'Ahmed Mansouri',
    role: 'Coordinateur technique',
    description:
      'Specialiste de l installation et de la logistique, il veille a la fluidite de chaque mise en place.',
    image: '',
    experience: '3+ ans',
  },
  {
    name: 'Fatima Zerrouki',
    role: 'Designer decoratrice',
    description:
      'Conceptrice de decor, elle traduit vos inspirations en decors coherents et subtils.',
    image: '',
    experience: '4+ ans',
  },
]

export const TeamSection = (): JSX.Element => {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">
            Equipe
          </p>
          <h2 className="mt-5 text-4xl font-elegant font-semibold text-neutral-900 sm:text-5xl">
            Des profils complementaires a votre service
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-neutral-600">
            Notre equipe reunit design, coordination technique et accompagnement
            client pour vous offrir des prestations fluides du premier rendez-vous
            au demontage final.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="overflow-hidden rounded-3xl border border-kitchen-lux-dark-green-200 bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-kitchen-lux-dark-green-200/20"
            >
              <div className="relative h-72 bg-neutral-100 flex items-center justify-center">
                <div className="text-center text-neutral-400">
                  <div className="text-6xl mb-4">👤</div>
                  <p className="text-lg">Photo à venir</p>
                </div>
              </div>
              <div className="space-y-3 px-6 py-6">
                <p className="text-xs uppercase tracking-[0.3em] text-kitchen-lux-dark-green-600">
                  {member.experience} d experience
                </p>
                <h3 className="text-xl font-elegant font-semibold text-kitchen-lux-dark-green-800">
                  {member.name}
                </h3>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-kitchen-lux-dark-green-600">
                  {member.role}
                </p>
                <p className="text-sm leading-relaxed text-kitchen-lux-dark-green-700">
                  {member.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-3xl border border-kitchen-lux-dark-green-200 bg-gradient-to-br from-kitchen-lux-dark-green-50 to-kitchen-lux-dark-green-100 px-6 py-12 text-center shadow-sm sm:px-12">
          <h3 className="text-2xl font-elegant font-semibold text-kitchen-lux-dark-green-800">
            Notre philosophie
          </h3>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-kitchen-lux-dark-green-700">
            Nous accordons une importance toute particuliere a l ecoute et a la
            preparation. Chaque membre de l equipe est implique dans le suivi des
            projets afin d assurer une execution harmonieuse et un rendu haut de
            gamme.
          </p>
        </div>
      </div>
    </section>
  )
}
