'use client'

import { useMemo } from 'react'

export type StatsRangePreset = '7d' | '30d' | '90d'

type StatsRangePickerProps = {
  value: StatsRangePreset
  onChange: (preset: StatsRangePreset) => void
  startDate: Date
  endDate: Date
}

const presetLabels: Record<StatsRangePreset, string> = {
  '7d': '7 derniers jours',
  '30d': '30 derniers jours',
  '90d': '90 derniers jours',
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-DZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function StatsRangePicker({
  value,
  onChange,
  startDate,
  endDate,
}: StatsRangePickerProps): JSX.Element {
  const rangeLabel = useMemo(
    () => `${formatDate(startDate)} – ${formatDate(endDate)}`,
    [startDate, endDate]
  )

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-brand-border bg-white/90 p-4 shadow-card-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-text-muted">PÉRIODE</p>
        <p className="text-sm font-semibold text-text-primary">{rangeLabel}</p>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
          Sélection
        </label>
        <select
          className="rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-dark"
          value={value}
          onChange={(event) => onChange(event.target.value as StatsRangePreset)}
        >
          {Object.entries(presetLabels).map(([preset, label]) => (
            <option key={preset} value={preset}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

