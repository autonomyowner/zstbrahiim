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
    <section className="mx-auto max-w-6xl px-4 pt-2 sm:pt-6 sm:px-6 lg:px-8">
      {/* Mobile: Compact brand strip */}
      <div className="lg:hidden">
        <div className="relative rounded-2xl bg-black text-white overflow-hidden shadow-card-lg">
          {/* Gold accent line */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#C9A227] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl font-bold tracking-tight text-[#C9A227]">ZST</span>
                <span className="text-[10px] font-medium text-white/40 tracking-wide">Marketplace</span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/20 px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
                <span className="text-[9px] font-semibold text-[#C9A227] tracking-wider uppercase">Verified</span>
              </span>
            </div>

            <p className="text-[13px] text-white/50 leading-relaxed mb-5 max-w-[280px]">
              Produits premium, fournisseurs vérifiés à travers l&apos;Algérie.
            </p>

            <div className="flex gap-3">
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex-1 text-center">
                  <p className="text-lg font-bold text-white tracking-tight">{stat.value}</p>
                  <p className="text-[8px] uppercase tracking-[0.15em] text-white/35 mt-0.5">{stat.label}</p>
                  {i < stats.length - 1 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-6 bg-white/10 hidden" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Full hero with image gallery */}
      <div className="hidden lg:block">
        <div className="relative grid gap-0 overflow-hidden rounded-[2rem] bg-black text-white shadow-card-lg lg:grid-cols-2" style={{ borderBottomLeftRadius: '60% 8%', borderBottomRightRadius: '60% 8%' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative flex flex-col gap-8 p-12 xl:p-14">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/25 px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
                <span className="text-sm font-semibold text-[#C9A227] tracking-wide">Verified Sellers</span>
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="heading-elegant text-5xl xl:text-[3.5rem] leading-[1.1] tracking-tight">
                Quality products,{' '}
                <span className="text-[#C9A227]">trusted</span>{' '}
                Algerian suppliers.
              </h1>
              <p className="text-base text-white/60 max-w-md leading-relaxed">
                Discover premium products from verified local sellers across Algeria.
              </p>
            </div>

            <div className="grid gap-4 grid-cols-3 mt-2">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`group relative overflow-hidden rounded-2xl border border-[#C9A227]/10 bg-[#C9A227]/5 px-5 py-4 transition-all duration-300 hover:bg-[#C9A227]/10 hover:border-[#C9A227]/20 animate-slide-up stagger-${index + 1}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C9A227]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <p className="relative text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                  <p className="relative text-xs uppercase tracking-[0.2em] text-white/50 mt-1 leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative grid grid-cols-2 gap-4 p-8">
            {heroColumns.map((columnImages, columnIndex) => {
              const loopingImages = createLoopingImages(columnImages)
              return (
                <div
                  key={`hero-column-${columnIndex}`}
                  className="relative h-[28rem] xl:h-[32rem] overflow-hidden rounded-3xl border border-[#C9A227]/10 bg-[#C9A227]/5"
                >
                  <div
                    className="flex flex-col gap-4 animate-hero-scroll will-change-transform"
                    style={{ animationDelay: `${columnIndex * 4}s` }}
                  >
                    {loopingImages.map((src, index) => (
                      <div
                        key={`${src}-${index}`}
                        className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/5"
                      >
                        <Image
                          src={src}
                          alt="Featured product"
                          fill
                          sizes="20vw"
                          className="object-cover transition-transform duration-700 hover:scale-105"
                          priority={columnIndex === 0 && index === 0}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black via-black/60 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
