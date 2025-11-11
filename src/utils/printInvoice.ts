import { type Order, formatOrderDate, formatPrice } from '@/data/orders'

export function printInvoice(order: Order): void {
  const invoiceWindow = window.open('', '_blank')

  if (!invoiceWindow) {
    alert('Veuillez autoriser les pop-ups pour imprimer la facture')
    return
  }

  const deliveryFee = order.total >= 20000 ? 0 : 500
  const totalWithDelivery = order.total + deliveryFee

  const invoiceHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${order.orderNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', sans-serif;
      padding: 20px;
      background: white;
      color: #1a1a1a;
    }

    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #2E8B57;
      padding: 40px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2E8B57;
    }

    .company-info h1 {
      color: #2E8B57;
      font-size: 32px;
      margin-bottom: 10px;
    }

    .company-info p {
      color: #666;
      line-height: 1.6;
    }

    .invoice-info {
      text-align: right;
    }

    .invoice-info h2 {
      color: #2E8B57;
      font-size: 24px;
      margin-bottom: 10px;
    }

    .invoice-info p {
      color: #666;
      margin-bottom: 5px;
    }

    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin-top: 10px;
    }

    .status-paid {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }

    .customer-section {
      margin: 30px 0;
      padding: 20px;
      background: #f8f9fa;
      border-left: 4px solid #2E8B57;
    }

    .customer-section h3 {
      color: #2E8B57;
      margin-bottom: 15px;
      font-size: 18px;
    }

    .customer-section p {
      margin-bottom: 8px;
      color: #333;
    }

    .items-table {
      width: 100%;
      margin: 30px 0;
      border-collapse: collapse;
    }

    .items-table thead {
      background: #2E8B57;
      color: white;
    }

    .items-table th {
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }

    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }

    .items-table tbody tr:hover {
      background: #f8f9fa;
    }

    .text-right {
      text-align: right;
    }

    .totals-section {
      margin-top: 30px;
      display: flex;
      justify-content: flex-end;
    }

    .totals-table {
      width: 300px;
    }

    .totals-table tr {
      border-bottom: 1px solid #ddd;
    }

    .totals-table td {
      padding: 10px;
    }

    .totals-table .total-row {
      border-top: 2px solid #2E8B57;
      font-weight: bold;
      font-size: 18px;
      color: #2E8B57;
    }

    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #2E8B57;
      text-align: center;
      color: #666;
      font-size: 14px;
    }

    .footer p {
      margin-bottom: 5px;
    }

    .notes-section {
      margin: 30px 0;
      padding: 15px;
      background: #fff3cd;
      border-left: 4px solid #ffc107;
    }

    .notes-section h4 {
      color: #856404;
      margin-bottom: 10px;
    }

    @media print {
      body {
        padding: 0;
      }

      .invoice-container {
        border: none;
        padding: 20px;
      }

      @page {
        margin: 1cm;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1>ZST Parfumerie</h1>
        <p>Bouzareah, Algérie</p>
        <p>Tél: +213 79 733 94 51</p>
        <p>Email: contact@brahim-perfum.com</p>
      </div>
      <div class="invoice-info">
        <h2>FACTURE</h2>
        <p><strong>${order.orderNumber}</strong></p>
        <p>Date: ${formatOrderDate(order.createdAt)}</p>
        <span class="status-badge ${order.paymentStatus === 'paid' ? 'status-paid' : 'status-pending'}">
          ${order.paymentStatus === 'paid' ? 'PAYÉE' : 'EN ATTENTE'}
        </span>
      </div>
    </div>

    <!-- Customer Info -->
    <div class="customer-section">
      <h3>Facturer à:</h3>
      <p><strong>${order.customer.name}</strong></p>
      <p>${order.customer.address}</p>
      <p>${order.customer.wilaya}, Algérie</p>
      <p>Tél: ${order.customer.phone}</p>
      <p>Email: ${order.customer.email}</p>
    </div>

    ${order.trackingNumber ? `
    <div style="margin: 20px 0; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3;">
      <p style="margin: 0; color: #1976d2;"><strong>Numéro de Suivi:</strong> ${order.trackingNumber}</p>
    </div>
    ` : ''}

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Article</th>
          <th>ID Produit</th>
          <th class="text-right">Prix Unit.</th>
          <th class="text-right">Qté</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
          <tr>
            <td>${item.productName}</td>
            <td>${item.productId}</td>
            <td class="text-right">${formatPrice(item.price)}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right"><strong>${formatPrice(item.subtotal)}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <table class="totals-table">
        <tr>
          <td>Sous-total:</td>
          <td class="text-right">${formatPrice(order.total)}</td>
        </tr>
        <tr>
          <td>Frais de livraison:</td>
          <td class="text-right">${deliveryFee === 0 ? 'Gratuite' : formatPrice(deliveryFee)}</td>
        </tr>
        <tr class="total-row">
          <td>TOTAL:</td>
          <td class="text-right">${formatPrice(totalWithDelivery)}</td>
        </tr>
      </table>
    </div>

    ${order.notes ? `
    <div class="notes-section">
      <h4>Notes:</h4>
      <p>${order.notes}</p>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <p><strong>Merci pour votre commande!</strong></p>
      <p>Livraison gratuite pour toute commande supérieure à 20 000 DA</p>
      <p>Délai de livraison: 2-3 jours ouvrables</p>
      <p style="margin-top: 20px;">www.brahim-perfum.com</p>
    </div>
  </div>

  <script>
    // Auto-print when page loads
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
  `

  invoiceWindow.document.write(invoiceHTML)
  invoiceWindow.document.close()
}
