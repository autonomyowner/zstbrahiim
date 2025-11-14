'use client'

import Image from 'next/image'

type HeroSectionProps = {
  stats: { label: string; value: string }[]
}

const heroImages = [
  '/perfums/6800.jpg',
  '/perfums/7500.jpg',
  '/winter/addidaswhite.png',
  '/winter/grey.png',
]

const heroColumns = [
  heroImages.filter((_, index) => index % 2 === 0),
  heroImages.filter((_, index) => index % 2 !== 0),
]

const createLoopingImages = (images: string[]) => [...images, ...images]

export const HeroSection = ({ stats }: HeroSectionProps): JSX.Element => {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="grid gap-8 overflow-hidden rounded-3xl bg-black text-text-inverted shadow-card-lg lg:grid-cols-2">
        <div className="flex flex-col gap-6 p-6 sm:p-10 lg:p-12">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em]">
              Verified
              <span className="material-symbols-outlined text-xs sm:text-sm">verified</span>
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight break-words">
              Quality products, trusted Algerian suppliers.
            </h1>
          </div>

          <div className="grid gap-3 sm:gap-4 text-sm text-white/80 grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-2 sm:px-4 py-2 sm:py-3"
              >
                <p className="text-lg sm:text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-[8px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] break-words leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-black p-6 sm:p-10">
          {heroColumns.map((columnImages, columnIndex) => {
            const loopingImages = createLoopingImages(columnImages)

            return (
              <div
                key={`hero-column-${columnIndex}`}
                className="relative h-[22rem] sm:h-[28rem] lg:h-[32rem] overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03]"
              >
                <div
                  className="flex flex-col gap-4 animate-hero-scroll will-change-transform"
                  style={{ animationDelay: `${columnIndex * 4}s` }}
                >
                  {loopingImages.map((src, index) => (
                    <div
                      key={`${src}-${index}`}
                      className="relative aspect-square w-full shrink-0 overflow-hidden rounded-[1.75rem] border border-white/5 bg-brand-light/10"
                    >
                      <Image
                        src={src}
                        alt="Trending product"
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                        priority={columnIndex === 0 && index === 0}
                      />
                    </div>
                  ))}
                </div>

                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black via-black/50 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
