import { type Order, formatOrderDate, formatPrice } from '@/data/orders'
import { type Product } from '@/data/products'
import { type AdaptedProduct } from '@/lib/supabase/products'

// Export Orders to CSV
export function exportOrdersToCSV(orders: Order[]): void {
  const headers = [
    'Numéro Commande',
    'Date',
    'Client',
    'Email',
    'Téléphone',
    'Wilaya',
    'Adresse',
    'Articles',
    'Quantité Total',
    'Montant Total',
    'Statut',
    'Paiement',
    'Suivi',
    'Notes',
  ]

  const rows = orders.map((order) => {
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
    const itemsDescription = order.items
      .map((item) => `${item.productName} (x${item.quantity})`)
      .join('; ')

    return [
      order.orderNumber,
      formatOrderDate(order.createdAt),
      order.customer.name,
      order.customer.email,
      order.customer.phone,
      order.customer.wilaya,
      order.customer.address,
      itemsDescription,
      totalQuantity,
      order.total,
      order.status,
      order.paymentStatus,
      order.trackingNumber || '',
      order.notes || '',
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  downloadFile(csvContent, `commandes_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
}

// Export Products to CSV
export function exportProductsToCSV(products: Product[]): void {
  const headers = [
    'ID',
    'Nom',
    'Marque',
    'Prix',
    'Prix Original',
    'Catégorie',
    'Type',
    'Besoin',
    'En Stock',
    'Promotion',
    'Nouveau',
    'Note',
    'Description',
    'Livraison',
  ]

  const rows = products.map((product) => [
    product.id,
    product.name,
    product.brand,
    product.price,
    product.originalPrice || '',
    product.category,
    product.productType,
    product.need || '',
    product.inStock ? 'Oui' : 'Non',
    product.isPromo ? 'Oui' : 'Non',
    product.isNew ? 'Oui' : 'Non',
    product.rating || '',
    product.description.substring(0, 100) + '...',
    product.deliveryEstimate,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  downloadFile(csvContent, `produits_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
}

// Export Orders to Excel-compatible format (HTML table)
export function exportOrdersToExcel(orders: Order[]): void {
  const excelContent = `
    <html xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Commandes</x:Name>
              <x:WorksheetOptions>
                <x:Print>
                  <x:ValidPrinterInfo/>
                </x:Print>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <style>
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #2E8B57; color: white; font-weight: bold; border: 1px solid #ccc; padding: 8px; }
        td { border: 1px solid #ccc; padding: 8px; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>
            <th>N° Commande</th>
            <th>Date</th>
            <th>Client</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Wilaya</th>
            <th>Articles</th>
            <th>Quantité</th>
            <th>Total (DA)</th>
            <th>Statut</th>
            <th>Paiement</th>
            <th>Suivi</th>
          </tr>
        </thead>
        <tbody>
          ${orders
            .map((order) => {
              const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0)
              const itemsDescription = order.items
                .map((item) => `${item.productName} (x${item.quantity})`)
                .join('; ')

              return `
                <tr>
                  <td>${order.orderNumber}</td>
                  <td>${formatOrderDate(order.createdAt)}</td>
                  <td>${order.customer.name}</td>
                  <td>${order.customer.email}</td>
                  <td>${order.customer.phone}</td>
                  <td>${order.customer.wilaya}</td>
                  <td>${itemsDescription}</td>
                  <td>${totalQuantity}</td>
                  <td>${order.total}</td>
                  <td>${order.status}</td>
                  <td>${order.paymentStatus}</td>
                  <td>${order.trackingNumber || ''}</td>
                </tr>
              `
            })
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `

  downloadFile(
    excelContent,
    `commandes_${new Date().toISOString().split('T')[0]}.xls`,
    'application/vnd.ms-excel'
  )
}

// Export Products to Excel-compatible format (HTML table)
export function exportProductsToExcel(products: Product[]): void {
  const excelContent = `
    <html xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Produits</x:Name>
              <x:WorksheetOptions>
                <x:Print>
                  <x:ValidPrinterInfo/>
                </x:Print>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <style>
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #2E8B57; color: white; font-weight: bold; border: 1px solid #ccc; padding: 8px; }
        td { border: 1px solid #ccc; padding: 8px; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Marque</th>
            <th>Prix (DA)</th>
            <th>Prix Original (DA)</th>
            <th>Catégorie</th>
            <th>Type</th>
            <th>Stock</th>
            <th>Promotion</th>
            <th>Nouveau</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${products
            .map(
              (product) => `
                <tr>
                  <td>${product.id}</td>
                  <td>${product.name}</td>
                  <td>${product.brand}</td>
                  <td>${product.price}</td>
                  <td>${product.originalPrice || ''}</td>
                  <td>${product.category}</td>
                  <td>${product.productType}</td>
                  <td>${product.inStock ? 'Oui' : 'Non'}</td>
                  <td>${product.isPromo ? 'Oui' : 'Non'}</td>
                  <td>${product.isNew ? 'Oui' : 'Non'}</td>
                  <td>${product.rating || ''}</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `

  downloadFile(
    excelContent,
    `produits_${new Date().toISOString().split('T')[0]}.xls`,
    'application/vnd.ms-excel'
  )
}

// Helper function to download file
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob(['\ufeff' + content], { type: `${mimeType};charset=utf-8;` })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Export summary report
export function exportSummaryReport(orders: Order[], products: (Product | AdaptedProduct)[]): void {
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const averageOrderValue = totalRevenue / totalOrders
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const completedOrders = orders.filter((o) => o.status === 'delivered').length

  const reportContent = `
RAPPORT RÉCAPITULATIF - ${new Date().toLocaleDateString('fr-DZ')}
================================================================

STATISTIQUES DES COMMANDES
--------------------------
Total des commandes: ${totalOrders}
Commandes en attente: ${pendingOrders}
Commandes livrées: ${completedOrders}
Revenu total: ${formatPrice(totalRevenue)}
Valeur moyenne par commande: ${formatPrice(averageOrderValue)}

STATISTIQUES DES PRODUITS
--------------------------
Total des produits: ${products.length}
Produits en stock: ${products.filter((p) => p.inStock).length}
Produits en rupture: ${products.filter((p) => !p.inStock).length}
Produits en promotion: ${products.filter((p) => p.isPromo).length}

PRODUITS LES PLUS VENDUS
--------------------------
${getTopProducts(orders, products, 5)
  .map((item, idx) => `${idx + 1}. ${item.name} - ${item.quantity} vendus`)
  .join('\n')}

CLIENTS PAR WILAYA
--------------------------
${getOrdersByWilaya(orders)
  .map((item) => `${item.wilaya}: ${item.count} commandes`)
  .join('\n')}

================================================================
Généré le ${new Date().toLocaleString('fr-DZ')}
ZST - Bouzareah, Algérie
  `

  downloadFile(reportContent, `rapport_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain')
}

// Helper: Get top selling products
function getTopProducts(orders: Order[], products: (Product | AdaptedProduct)[], limit: number) {
  const productSales: Record<string, { name: string; quantity: number }> = {}

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const productId = item.productId || item.productName
      if (!productSales[productId]) {
        productSales[productId] = { name: item.productName, quantity: 0 }
      }
      productSales[productId].quantity += item.quantity
    })
  })

  return Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
}

// Helper: Get orders by wilaya
function getOrdersByWilaya(orders: Order[]) {
  const wilayaCounts: Record<string, number> = {}

  orders.forEach((order) => {
    const wilaya = order.customer.wilaya
    wilayaCounts[wilaya] = (wilayaCounts[wilaya] || 0) + 1
  })

  return Object.entries(wilayaCounts)
    .map(([wilaya, count]) => ({ wilaya, count }))
    .sort((a, b) => b.count - a.count)
}
