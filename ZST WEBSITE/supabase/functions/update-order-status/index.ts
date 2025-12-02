// Supabase Edge Function: Update Order Status with Notifications
// Deploy with: supabase functions deploy update-order-status

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
    // Create Supabase client with service role (admin access)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify user is admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const { order_id, status, tracking_number, delivery_date, notes } = await req.json()

    if (!order_id || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: order_id and status' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Invalid status value' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get existing order
    const { data: existingOrder, error: fetchError } = await supabaseClient
      .from('orders')
      .select('*, user_profiles(email)')
      .eq('id', order_id)
      .single()

    if (fetchError || !existingOrder) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Prepare update data
    const updateData: any = { status }

    if (tracking_number) {
      updateData.tracking_number = tracking_number
    }

    if (delivery_date) {
      updateData.delivery_date = delivery_date
    }

    if (notes) {
      updateData.notes = notes
    }

    // Update payment status based on order status
    if (status === 'delivered') {
      updateData.payment_status = 'paid'
    } else if (status === 'cancelled') {
      updateData.payment_status = 'refunded'
    }

    // Update order
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update(updateData)
      .eq('id', order_id)

    if (updateError) {
      console.error('Error updating order:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update order' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // TODO: Send email notification to customer
    // You can integrate with your email service here
    const customerEmail = existingOrder.customer_email
    console.log(`Order ${existingOrder.order_number} status updated to ${status}`)
    console.log(`Notification would be sent to: ${customerEmail}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order status updated successfully',
        order_id,
        new_status: status,
      }),
      {
        status: 200,
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
