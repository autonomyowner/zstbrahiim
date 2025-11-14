'use client'

type DisplayMode = 'grid' | 'list'
type SortOption = 'best-sellers' | 'price-asc' | 'price-desc' | 'newest' | 'highest-rated'

type ProductControlsProps = {
  productCount: number
  displayMode: DisplayMode
  onDisplayModeChange: (mode: DisplayMode) => void
  sortOption: SortOption
  onSortChange: (option: SortOption) => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'best-sellers', label: 'Meilleures ventes' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'newest', label: 'Nouveautés' },
  { value: 'highest-rated', label: 'Mieux notés' },
]

const displayModes: {
  value: DisplayMode
  label: string
}[] = [
  { value: 'grid', label: 'Grille' },
  { value: 'list', label: 'Liste' },
]

export const ProductControls = ({
  productCount,
  displayMode,
  onDisplayModeChange,
  sortOption,
  onSortChange,
}: ProductControlsProps): JSX.Element => {
  return (
    <div className="rounded-3xl border border-brand-border bg-gradient-to-br from-white/95 via-white/80 to-brand-primary/5 p-5 shadow-card-md">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">Résultats filtrés</p>
          <p className="text-3xl font-elegant text-brand-dark">
            {productCount.toLocaleString('fr-DZ')}
            <span className="ml-2 text-sm font-sans text-text-muted">{productCount === 1 ? 'résultat' : 'résultats'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex items-stretch rounded-full border border-brand-border/60 bg-white/90 p-1 shadow-inner shadow-black/5 backdrop-blur">
            {displayModes.map((mode) => {
              const isActive = displayMode === mode.value
              return (
                <button
                  key={mode.value}
                  onClick={() => onDisplayModeChange(mode.value)}
                  type="button"
                  aria-label={`Vue en ${mode.label.toLowerCase()}`}
                  className={`flex min-w-[120px] flex-1 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-brand-dark text-text-inverted shadow-lg'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <span>{mode.label}</span>
                </button>
              )
            })}
          </div>

          <label className="flex flex-col text-sm font-semibold text-text-primary">
            <span className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-text-muted">Trier par</span>
            <div className="relative rounded-full border border-brand-border/60 bg-white/90 px-4 pr-4 py-2 shadow-inner shadow-black/5 backdrop-blur">
            <select
              value={sortOption}
              onChange={(event) => onSortChange(event.target.value as SortOption)}
              className="w-full appearance-none bg-transparent text-sm font-semibold text-text-primary focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}



