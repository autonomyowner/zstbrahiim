// B2B Notifications API service
import { supabase, getCurrentUser } from './client'
import type { B2BNotification, B2BNotificationType } from './types'

// Get notifications for the current user
export const getNotifications = async (filters?: {
  read?: boolean
  type?: B2BNotificationType
  limit?: number
}): Promise<B2BNotification[]> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    let query = supabase
      .from('b2b_notifications' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (filters?.read !== undefined) {
      query = query.eq('read', filters.read)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }

    return (data as unknown as B2BNotification[]) || []
  } catch (error) {
    console.error('Error in getNotifications:', error)
    return []
  }
}

// Get unread notification count
export const getUnreadCount = async (): Promise<number> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return 0
    }

    const { data, error } = await supabase
      .from('b2b_unread_notification_counts' as any)
      .select('unread_count')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }

    return (data as any)?.unread_count || 0
  } catch (error) {
    console.error('Error in getUnreadCount:', error)
    return 0
  }
}

// Mark a notification as read
export const markAsRead = async (notificationId: string): Promise<B2BNotification> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('b2b_notifications' as any)
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }

    return data as unknown as B2BNotification
  } catch (error) {
    console.error('Error in markAsRead:', error)
    throw error
  }
}

// Mark all notifications as read
export const markAllAsRead = async (): Promise<void> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('b2b_notifications' as any)
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in markAllAsRead:', error)
    throw error
  }
}

// Delete a notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('b2b_notifications' as any)
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in deleteNotification:', error)
    throw error
  }
}

// Delete all read notifications
export const deleteAllRead = async (): Promise<void> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('b2b_notifications' as any)
      .delete()
      .eq('user_id', user.id)
      .eq('read', true)

    if (error) {
      console.error('Error deleting read notifications:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in deleteAllRead:', error)
    throw error
  }
}

// Subscribe to real-time notification updates
export const subscribeToNotifications = (
  userId: string,
  callback: (notification: B2BNotification) => void
) => {
  const channel = supabase
    .channel('b2b_notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'b2b_notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as B2BNotification)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Notify about expiring auctions (to be called periodically - e.g., via a cron job)
export const notifyExpiringAuctions = async (): Promise<number> => {
  try {
    const { data, error } = await (supabase as any).rpc('notify_expiring_auctions')

    if (error) {
      console.error('Error notifying expiring auctions:', error)
      throw error
    }

    return data as number
  } catch (error) {
    console.error('Error in notifyExpiringAuctions:', error)
    return 0
  }
}

// Get notifications for a specific offer
export const getOfferNotifications = async (offerId: string): Promise<B2BNotification[]> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('b2b_notifications' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('offer_id', offerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching offer notifications:', error)
      throw error
    }

    return (data as unknown as B2BNotification[]) || []
  } catch (error) {
    console.error('Error in getOfferNotifications:', error)
    return []
  }
}

// Get recent notifications (last 24 hours)
export const getRecentNotifications = async (limit: number = 10): Promise<B2BNotification[]> => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return []
    }

    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const { data, error } = await supabase
      .from('b2b_notifications' as any)
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent notifications:', error)
      return []
    }

    return (data as unknown as B2BNotification[]) || []
  } catch (error) {
    console.error('Error in getRecentNotifications:', error)
    return []
  }
}
