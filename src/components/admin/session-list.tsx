'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Laptop, Smartphone, Globe, Clock, AlertTriangle, Trash2 } from 'lucide-react'
import { getUserSessions, revokeSession } from '@/actions/security' // Adjust import path
import { toast } from 'sonner'
import { UAParser } from 'ua-parser-js'
import { formatDistanceToNow } from 'date-fns'

interface Session {
    id: string
    session_id: string
    ip_address: string
    user_agent: string
    last_active_at: string
    is_revoked: boolean
    created_at: string
}

export function SessionList({ userId }: { userId: string }) {
    const [sessions, setSessions] = useState<Session[]>([])
    const [locations, setLocations] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSessions()
    }, [userId])

    // Fetch locations when sessions change
    useEffect(() => {
        const fetchLocations = async () => {
            const uniqueIps = Array.from(new Set(sessions.map(s => s.ip_address).filter(ip => ip)))

            uniqueIps.forEach(async (ip) => {
                if (locations[ip]) return // Already fetched

                // Localhost check
                if (ip === '127.0.0.1' || ip === '::1' || ip.includes('127.0.0.1')) {
                    setLocations(prev => ({ ...prev, [ip]: 'Local Development' }))
                    return
                }

                try {
                    // Using ipapi.co (Free tier, strictly client-side)
                    const res = await fetch(`https://ipapi.co/${ip}/json/`)
                    const data = await res.json()
                    if (data.city && data.country_name) {
                        setLocations(prev => ({ ...prev, [ip]: `${data.city}, ${data.country_name}` }))
                    } else if (data.reason === 'Reserved') {
                        setLocations(prev => ({ ...prev, [ip]: 'Private Network' }))
                    }
                } catch (e) {
                    console.error('GeoIP fetch error:', e)
                }
            })
        }

        if (sessions.length > 0) fetchLocations()
    }, [sessions, locations]) // Added locations to dependency array to prevent re-fetching already known locations

    const loadSessions = async () => {
        try {
            const res = await getUserSessions(userId)
            if (res.error) {
                toast.error('Failed to load sessions', { description: res.error })
            } else {
                setSessions(res.sessions || [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleRevoke = async (sessionId: string) => {
        const confirm = window.confirm('Are you sure you want to revoke this session? The user will be logged out.')
        if (!confirm) return

        toast.loading('Revoking session...')
        const res = await revokeSession(sessionId, userId)

        if (res.error) {
            toast.error('Revocation failed', { description: res.error })
        } else {
            toast.success('Session revoked')
            loadSessions() // Refresh list
        }
    }

    const parseUA = (uaString: string) => {
        const parser = new UAParser(uaString)
        const result = parser.getResult()
        return {
            browser: result.browser.name || 'Unknown Browser',
            os: result.os.name || 'Unknown OS',
            device: result.device.type || 'Desktop' // device.type is undefined for desktop usually
        }
    }

    if (loading) return <div className="p-4 text-slate-400">Loading active sessions...</div>

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    Active Sessions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {sessions.length === 0 ? (
                    <p className="text-sm text-slate-500">No active tracking data found for this user.</p>
                ) : (
                    sessions.map((session) => {
                        const { browser, os, device } = parseUA(session.user_agent)
                        const isCurrent = false // We could check against current session if we passed it down
                        const isMobile = device === 'mobile' || device === 'tablet'
                        const location = locations[session.ip_address] || 'Unknown Location'

                        return (
                            <div key={session.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border ${session.is_revoked ? 'bg-red-50 border-red-100 opacity-75' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="flex items-start gap-4 mb-4 sm:mb-0">
                                    <div className={`p-2 rounded-full ${isMobile ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {isMobile ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-slate-900">{browser} on {os}</h4>
                                            {session.is_revoked && <Badge variant="destructive" className="text-[10px] h-5">Revoked</Badge>}
                                            {/* {isCurrent && <Badge variant="outline" className="text-[10px] h-5 border-green-200 text-green-700 bg-green-50">Current</Badge>} */}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                            <span className="font-mono bg-white px-1.5 rounded border border-slate-200 text-xs py-0.5">{session.ip_address}</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-slate-700 font-medium flex items-center gap-1">
                                                {locations[session.ip_address] ? (
                                                    <span className="text-[#004b87]">{locations[session.ip_address]}</span>
                                                ) : (
                                                    <span className="animate-pulse text-slate-400">Locating...</span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                            <span className="flex items-center gap-1" title={session.last_active_at}>
                                                <Clock className="w-3 h-3" />
                                                Active {formatDistanceToNow(new Date(session.last_active_at))} ago
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {!session.is_revoked && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRevoke(session.session_id)}
                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Revoke
                                    </Button>
                                )}
                            </div>
                        )
                    })
                )}
            </CardContent>
        </Card>
    )
}
