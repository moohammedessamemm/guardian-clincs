'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Activity, Shield, Clock } from 'lucide-react'

// Defined in schema but we'll use a local interface for safety
interface Log {
    id: string
    action: string
    details: Record<string, unknown> | null
    ip_address: string
    created_at: string
    user_id: string
}

export default function AdminAnalyticsPage() {
    const supabase = createClient()
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true)
            const { data } = await supabase
                .from('activity_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50)

            if (data) setLogs(data)
            setLoading(false)
        }
        fetchLogs()
    }, [supabase])

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
                <p className="text-muted-foreground">Monitor system performance and user activity.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700">Total Requests (24h)</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">1,248</div>
                        <p className="text-xs text-blue-600 font-medium mt-1">+20.1% from yesterday</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700">Avg. Response Time</CardTitle>
                        <Clock className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">128ms</div>
                        <p className="text-xs text-emerald-600 font-medium mt-1">Optimal performance</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-indigo-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700">Security Incidents</CardTitle>
                        <Shield className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">0</div>
                        <p className="text-xs text-indigo-600 font-medium mt-1">System is secure</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle>Recent Activity Logs</CardTitle>
                    <CardDescription>Real-time audit trail of system actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center border-dashed border-2 rounded-lg bg-slate-50">
                            <Activity className="mx-auto h-8 w-8 text-slate-400 mb-4" />
                            <p className="text-slate-500">No activity logs found recently.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map(log => (
                                <div key={log.id} className="flex items-start justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0 hover:bg-slate-50 p-2 rounded-lg -mx-2 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="bg-blue-100 p-2 rounded-full dark:bg-blue-900 h-fit">
                                            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{log.action}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(log.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    {log.ip_address && (
                                        <div className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">
                                            {log.ip_address}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
