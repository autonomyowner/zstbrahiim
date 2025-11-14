'use client'

type QuickAction = {
  title: string
  description: string
  icon: string
  accent: string
  onClick: () => void
}

function QuickActionButton({ title, description, icon, accent, onClick }: QuickAction): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-xl sm:rounded-2xl border border-brand-border bg-white p-5 sm:p-6 text-left shadow-card-sm hover:shadow-card-md hover:border-brand-dark transition-all duration-300 hover:-translate-y-1"
    >
      <div>
        <h3 className="text-base sm:text-lg font-bold text-text-primary group-hover:text-brand-dark transition-colors">{title}</h3>
        <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed">{description}</p>
      </div>
    </button>
  )
}

type QuickActionsProps = {
  onViewOrders: () => void
  onAddProduct: () => void
  onManageInventory: () => void
  onViewAnalytics: () => void
}

export function QuickActions({
  onViewOrders,
  onAddProduct,
  onManageInventory,
  onViewAnalytics,
}: QuickActionsProps): JSX.Element {
  const actions: QuickAction[] = [
    {
      title: 'Voir Commandes',
      description: 'Suivez les statuts et imprimez les factures.',
      icon: 'receipt_long',
      accent: 'bg-brand-dark text-brand-primary',
      onClick: onViewOrders,
    },
    {
      title: 'Ajouter Produit',
      description: 'Publiez rapidement une nouvelle référence.',
      icon: 'add_box',
      accent: 'bg-green-100 text-green-600',
      onClick: onAddProduct,
    },
    {
      title: 'Gérer Inventaire',
      description: 'Ajustez les stocks et promotions.',
      icon: 'inventory',
      accent: 'bg-purple-100 text-purple-600',
      onClick: onManageInventory,
    },
    {
      title: 'Voir Analytiques',
      description: 'Consultez vos performances de vente.',
      icon: 'insights',
      accent: 'bg-blue-100 text-blue-600',
      onClick: onViewAnalytics,
    },
  ]

  return (
    <div className="mb-10 space-y-4 sm:space-y-6">
      <div>
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-text-muted">
          Actions rapides
        </p>
        <h2 className="text-xl sm:text-2xl font-black text-text-primary mt-1">
          Pilotez votre boutique
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <QuickActionButton key={action.title} {...action} />
        ))}
      </div>
    </div>
  )
}
