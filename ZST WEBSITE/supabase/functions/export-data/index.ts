// Supabase Edge Function: Export Data (Orders/Products) to TXT
// Deploy with: supabase functions deploy export-data

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { type } = await req.json()

    if (!type || !['orders', 'products'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid export type. Must be "orders" or "products"' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    let txtContent = ''

    if (type === 'orders') {
      // Fetch all orders with items
      const { data: orders, error } = await supabaseClient
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            quantity,
            price,
            subtotal
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Generate TXT content
      txtContent = '='.repeat(80) + '\n'
      txtContent += 'RAPPORT COMPLET DES COMMANDES - ZST\n'
      txtContent += `Date d'export: ${new Date().toLocaleString('fr-DZ')}\n`
      txtContent += '='.repeat(80) + '\n\n'

      for (const order of orders || []) {
        txtContent += `COMMANDE #${order.order_number}\n`
        txtContent += '-'.repeat(80) + '\n'
        txtContent += `Date: ${new Date(order.created_at).toLocaleString('fr-DZ')}\n`
        txtContent += `Client: ${order.customer_name}\n`
        txtContent += `Email: ${order.customer_email}\n`
        txtContent += `Téléphone: ${order.customer_phone}\n`
        txtContent += `Adresse: ${order.customer_address}, ${order.customer_wilaya}\n`
        txtContent += `Statut: ${order.status}\n`
        txtContent += `Paiement: ${order.payment_status}\n`

        if (order.tracking_number) {
          txtContent += `Numéro de suivi: ${order.tracking_number}\n`
        }

        txtContent += '\nArticles:\n'
        for (const item of (order as any).order_items || []) {
          txtContent += `  - ${item.product_name} x${item.quantity} = ${item.subtotal} DA\n`
        }

        txtContent += `\nTotal: ${order.total} DA\n`
        txtContent += '\n' + '='.repeat(80) + '\n\n'
      }
    } else if (type === 'products') {
      // Fetch all products
      const { data: products, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // Generate TXT content
      txtContent = '='.repeat(80) + '\n'
      txtContent += 'CATALOGUE DES PRODUITS - ZST\n'
      txtContent += `Date d'export: ${new Date().toLocaleString('fr-DZ')}\n`
      txtContent += '='.repeat(80) + '\n\n'

      for (const product of products || []) {
        txtContent += `PRODUIT: ${product.name}\n`
        txtContent += '-'.repeat(80) + '\n'
        txtContent += `ID: ${product.id}\n`
        txtContent += `Marque: ${product.brand}\n`
        txtContent += `Prix: ${product.price} DA\n`
        txtContent += `Catégorie: ${product.category}\n`
        txtContent += `Type: ${product.product_type}\n`
        txtContent += `En stock: ${product.in_stock ? 'Oui' : 'Non'}\n`
        txtContent += `Promotion: ${product.is_promo ? 'Oui' : 'Non'}\n`
        txtContent += `Note: ${product.rating || 'N/A'}/5\n`
        txtContent += `Vues: ${product.viewers_count}\n`
        txtContent += `\nDescription:\n${product.description}\n`
        txtContent += '\n' + '='.repeat(80) + '\n\n'
      }
    }

    return new Response(txtContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="zst-export-${type}-${Date.now()}.txt"`,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
