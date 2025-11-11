'use client'

type QuickActionProps = {
  title: string
  description: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

function QuickActionButton({ title, description, onClick, variant = 'secondary' }: QuickActionProps): JSX.Element {
  const bgColor = variant === 'primary'
    ? 'bg-kitchen-lux-dark-green-600 hover:bg-kitchen-lux-dark-green-700 text-white'
    : 'bg-white hover:bg-kitchen-lux-dark-green-50 text-kitchen-lux-dark-green-900 border border-kitchen-lux-dark-green-200'

  return (
    <button
      onClick={onClick}
      className={`${bgColor} rounded-lg p-6 text-left transition-all shadow-md hover:shadow-lg w-full`}
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className={`text-sm ${variant === 'primary' ? 'text-white/90' : 'text-kitchen-lux-dark-green-600'}`}>
        {description}
      </p>
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
  onViewAnalytics
}: QuickActionsProps): JSX.Element {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-elegant font-semibold text-kitchen-lux-dark-green-900 mb-6">
        Actions Rapides
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionButton
          title="Voir Commandes"
          description="Gérer toutes les commandes"
          onClick={onViewOrders}
          variant="primary"
        />
        <QuickActionButton
          title="Ajouter Produit"
          description="Ajouter nouveau produit"
          onClick={onAddProduct}
        />
        <QuickActionButton
          title="Gérer Inventaire"
          description="Mettre à jour le stock"
          onClick={onManageInventory}
        />
        <QuickActionButton
          title="Voir Analytiques"
          description="Rapports et statistiques"
          onClick={onViewAnalytics}
        />
      </div>
    </div>
  )
}
