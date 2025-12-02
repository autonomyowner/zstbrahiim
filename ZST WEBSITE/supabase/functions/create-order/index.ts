// Supabase Edge Function: Create Order with Transaction Safety
// Deploy with: supabase functions deploy create-order

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Parse request body
    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      customer_wilaya,
      items,
    } = await req.json()

    // Validate input
    if (!customer_name || !customer_email || !customer_phone || !customer_address || !customer_wilaya) {
      return new Response(
        JSON.stringify({ error: 'Missing required customer information' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order must contain at least one item' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get current user (if authenticated)
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    // Calculate total and fetch product details
    let total = 0
    const orderItems = []

    for (const item of items) {
      // Fetch product
      const { data: product, error: productError } = await supabaseClient
        .from('products')
        .select('id, name, price, in_stock, product_images(image_url)')
        .eq('id', item.product_id)
        .single()

      if (productError || !product) {
        return new Response(
          JSON.stringify({ error: `Product not found: ${item.product_id}` }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Check stock
      if (!product.in_stock) {
        return new Response(
          JSON.stringify({ error: `Product out of stock: ${product.name}` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      const price = Number(product.price)
      const subtotal = price * item.quantity

      total += subtotal

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        product_image: (product as any).product_images?.[0]?.image_url || '',
        quantity: item.quantity,
        price,
        subtotal,
      })
    }

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: user?.id || null,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        customer_wilaya,
        total,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create order items
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(itemsWithOrderId)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Rollback: delete the order
      await supabaseClient.from('orders').delete().eq('id', order.id)

      return new Response(
        JSON.stringify({ error: 'Failed to create order items' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // TODO: Send confirmation email to customer
    // You can integrate with Resend, SendGrid, or Mailgun here

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        order_number: order.order_number,
        total: order.total,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
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
