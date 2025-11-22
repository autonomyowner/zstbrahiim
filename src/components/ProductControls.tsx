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
    <div className="rounded-2xl border border-brand-border/40 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          <span className="font-semibold text-brand-dark">{productCount.toLocaleString('fr-DZ')}</span>
          <span className="ml-1">{productCount === 1 ? 'article' : 'articles'}</span>
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-stretch rounded-full border border-brand-border/50 bg-white p-0.5">
            {displayModes.map((mode) => {
              const isActive = displayMode === mode.value
              return (
                <button
                  key={mode.value}
                  onClick={() => onDisplayModeChange(mode.value)}
                  type="button"
                  aria-label={`Vue en ${mode.label.toLowerCase()}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-dark text-white shadow-sm'
                      : 'text-text-muted hover:text-brand-dark'
                  }`}
                >
                  {mode.label}
                </button>
              )
            })}
          </div>

          <select
            value={sortOption}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            className="rounded-full border border-brand-border/50 bg-white px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:border-brand-dark/30 focus:border-brand-dark focus:outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}



