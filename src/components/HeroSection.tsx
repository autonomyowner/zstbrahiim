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
    <section className="mx-auto max-w-6xl px-4 pt-6 sm:pt-8 sm:px-6 lg:px-8">
      <div className="relative grid gap-0 overflow-hidden rounded-3xl sm:rounded-[2rem] bg-black text-white shadow-card-lg lg:grid-cols-2" style={{ borderBottomLeftRadius: '60% 8%', borderBottomRightRadius: '60% 8%' }}>
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/5 via-transparent to-transparent pointer-events-none" />

        {/* Content Side */}
        <div className="relative flex flex-col gap-6 sm:gap-8 p-6 sm:p-10 lg:p-12 xl:p-14">
          {/* Badge */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/25 px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-[#C9A227] tracking-wide">
                Verified Sellers
              </span>
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="heading-elegant text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] leading-[1.1] tracking-tight">
              Quality products,{' '}
              <span className="text-[#C9A227]">trusted</span>{' '}
              Algerian suppliers.
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-md leading-relaxed">
              Discover premium perfumes, fashion, and wholesale goods from verified local sellers across Algeria.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-3 sm:gap-4 grid-cols-3 mt-2">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`group relative overflow-hidden rounded-2xl border border-[#C9A227]/10 bg-[#C9A227]/5 px-3 sm:px-5 py-3 sm:py-4 transition-all duration-300 hover:bg-[#C9A227]/10 hover:border-[#C9A227]/20 animate-slide-up stagger-${index + 1}`}
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <p className="relative text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="relative text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-[0.2em] text-white/50 mt-1 leading-tight">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* Image Gallery Side */}
        <div className="relative grid grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6 lg:p-8">
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/50 to-black pointer-events-none lg:hidden" />

          {heroColumns.map((columnImages, columnIndex) => {
            const loopingImages = createLoopingImages(columnImages)

            return (
              <div
                key={`hero-column-${columnIndex}`}
                className="relative h-[18rem] sm:h-[24rem] lg:h-[28rem] xl:h-[32rem] overflow-hidden rounded-2xl sm:rounded-3xl border border-[#C9A227]/10 bg-[#C9A227]/5"
              >
                <div
                  className="flex flex-col gap-3 sm:gap-4 animate-hero-scroll will-change-transform"
                  style={{ animationDelay: `${columnIndex * 4}s` }}
                >
                  {loopingImages.map((src, index) => (
                    <div
                      key={`${src}-${index}`}
                      className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl sm:rounded-2xl border border-white/[0.06] bg-white/5"
                    >
                      <Image
                        src={src}
                        alt="Featured product"
                        fill
                        sizes="(max-width: 768px) 40vw, 20vw"
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        priority={columnIndex === 0 && index === 0}
                      />
                    </div>
                  ))}
                </div>

                {/* Fade overlays */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-black via-black/60 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-black via-black/60 to-transparent" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
