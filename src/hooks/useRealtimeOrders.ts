import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

type Order = {
  id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  seller_id: string
  created_at: string
  updated_at: string
}

type UseRealtimeOrdersOptions = {
  sellerId: string | null
  enabled?: boolean
}

type UseRealtimeOrdersReturn = {
  pendingCount: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to subscribe to real-time order changes for a seller
 * Automatically calculates pending order count and provides real-time updates
 */
export function useRealtimeOrders({
  sellerId,
  enabled = true,
}: UseRealtimeOrdersOptions): UseRealtimeOrdersReturn {
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch pending orders count
  const fetchPendingCount = useCallback(async () => {
    if (!sellerId || !enabled) {
      setPendingCount(0)
      setLoading(false)
      return
    }

    try {
      setError(null)
      const { count, error: fetchError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerId)
        .eq('status', 'pending')

      if (fetchError) {
        console.error('Error fetching pending orders count:', fetchError)
        setError('Failed to fetch pending orders')
        return
      }

      setPendingCount(count || 0)
    } catch (err) {
      console.error('Error in fetchPendingCount:', err)
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }, [sellerId, enabled])

  // Subscribe to real-time changes
  useEffect(() => {
    if (!sellerId || !enabled) {
      setLoading(false)
      return
    }

    // Initial fetch
    fetchPendingCount()

    let channel: RealtimeChannel | null = null

    // Set up real-time subscription
    channel = supabase
      .channel(`orders:seller_id=eq.${sellerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `seller_id=eq.${sellerId}`,
        },
        async (payload) => {
          console.log('Real-time order change:', payload)

          // Recalculate pending count based on the event
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order
            if (newOrder.status === 'pending') {
              setPendingCount((prev) => prev + 1)
            }
          } else if (payload.eventType === 'UPDATE') {
            const oldOrder = payload.old as Order
            const newOrder = payload.new as Order

            // If status changed from pending to something else
            if (oldOrder.status === 'pending' && newOrder.status !== 'pending') {
              setPendingCount((prev) => Math.max(0, prev - 1))
            }
            // If status changed to pending from something else
            else if (oldOrder.status !== 'pending' && newOrder.status === 'pending') {
              setPendingCount((prev) => prev + 1)
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedOrder = payload.old as Order
            if (deletedOrder.status === 'pending') {
              setPendingCount((prev) => Math.max(0, prev - 1))
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to order changes')
        } else if (status === 'CHANNEL_ERROR') {
          setError('Failed to subscribe to real-time updates')
        }
      })

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [sellerId, enabled, fetchPendingCount])

  return {
    pendingCount,
    loading,
    error,
    refetch: fetchPendingCount,
  }
}
