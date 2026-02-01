'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Check, Info, AlertTriangle, XCircle } from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from 'date-fns'

interface Notification {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    created_at: string
    read: boolean
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [open, setOpen] = useState(false)
    const supabase = createClient()

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) {
            setNotifications(data as Notification[])
            setUnreadCount(data.filter((n: Notification) => !n.read).length)
        }
    }

    // Initial fetch and subscribe to changes
    useEffect(() => {
        fetchNotifications()

        const channel = supabase
            .channel('notifications_schema')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    // Check if it belongs to current user is tricky in RLS subscription without filter, 
                    // but RLS might not filter realtime. Best to refresh or check user_id if included in payload.
                    // For simplicity, just refresh.
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)

        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const markAllRead = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false)

        fetchNotifications()
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <Check className="h-4 w-4 text-green-500" />
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            default: return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 rounded-full h-10 w-10">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border border-white ring-1 ring-white" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50/50">
                    <h4 className="font-semibold text-sm text-gray-900">Notifications</h4>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
                <div className="max-h-[80vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/30' : ''}`}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`flex-shrink-0 mt-0.5 p-1.5 rounded-full ${!notification.read ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-500 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
