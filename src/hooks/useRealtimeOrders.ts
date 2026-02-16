/**
 * @deprecated This hook is no longer needed. Convex queries are reactive by default.
 * Use `useQuery(api.orders.getPendingOrderCount, { sellerId })` directly instead.
 *
 * This file is kept temporarily for backwards compatibility during migration.
 * It re-exports a simple wrapper that uses Convex under the hood.
 */

import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

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

export function useRealtimeOrders({
  sellerId,
  enabled = true,
}: UseRealtimeOrdersOptions): UseRealtimeOrdersReturn {
  const pendingCount = useQuery(
    api.orders.getPendingOrderCount,
    sellerId && enabled ? { sellerId: sellerId as Id<"userProfiles"> } : 'skip'
  ) ?? 0

  return {
    pendingCount,
    loading: false,
    error: null,
    refetch: async () => {},
  }
}
