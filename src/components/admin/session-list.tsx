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
    // Store full location object now
    const [locations, setLocations] = useState<Record<string, { label: string, isp?: string, lat?: number, lon?: number }>>({})
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
                    setLocations(prev => ({ ...prev, [ip]: { label: 'Local Development', isp: 'Your Computer' } }))
                    return
                }

                try {
                    // Using ipapi.co (Free tier, strictly client-side)
                    const res = await fetch(`https://ipapi.co/${ip}/json/`)
                    const data = await res.json()

                    if (data.city && data.country_name) {
                        setLocations(prev => ({
                            ...prev,
                            [ip]: {
                                label: `${data.city}, ${data.country_name}`,
                                isp: data.org,
                                lat: data.latitude,
                                lon: data.longitude
                            }
                        }))
                    } else if (data.reason === 'Reserved') {
                        setLocations(prev => ({ ...prev, [ip]: { label: 'Private Network' } }))
                    }
                } catch (e) {
                    console.error('GeoIP fetch error:', e)
                }
            })
        }

        if (sessions.length > 0) fetchLocations()
    }, [sessions, locations])

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
            device: result.device.type || 'Desktop'
        }
    }

    if (loading) return <div className="p-4 text-slate-400">Loading active sessions...</div>

    const isRecent = (dateStr: string) => {
        const time = new Date(dateStr).getTime()
        const now = Date.now()
        // If active in last 2 minutes, consider it active regardless of flag (handles sync/race conditions)
        return (now - time) < 2 * 60 * 1000
    }

    const activeSessions = sessions.filter(s => !s.is_revoked || isRecent(s.last_active_at))
    const inactiveSessions = sessions
        .filter(s => !(!s.is_revoked || isRecent(s.last_active_at))) // Inverse of active
        .sort((a, b) => new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime())

    // Helper to render a single session card
    const renderSessionCard = (session: Session, isInactive: boolean = false) => {
        const { browser, os, device } = parseUA(session.user_agent)
        const isMobile = device === 'mobile' || device === 'tablet'
        const locData = locations[session.ip_address]

        return (
            <div key={session.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border transition-all ${isInactive ? 'bg-slate-50 border-slate-100 opacity-60 grayscale-[0.5]' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-start gap-4 mb-4 sm:mb-0">
                    <div className={`p-2 rounded-full ${isInactive ? 'bg-slate-200 text-slate-500' : (isMobile ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600')}`}>
                        {isMobile ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className={`font-semibold ${isInactive ? 'text-slate-600' : 'text-slate-900'}`}>{browser} on {os}</h4>
                            {session.is_revoked && <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-slate-500 border-slate-300">Inactive</Badge>}
                        </div>

                        <div className="flex flex-col gap-1 mt-1">
                            {/* IP & Location */}
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span className={`font-mono px-1.5 rounded border text-xs py-0.5 ${isInactive ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>{session.ip_address}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-700 font-medium flex items-center gap-1">
                                    {locData ? (
                                        <span className={isInactive ? 'text-slate-600' : 'text-[#004b87]'}>{locData.label}</span>
                                    ) : (
                                        <span className="animate-pulse text-slate-400">Locating...</span>
                                    )}
                                </span>
                            </div>

                            {/* ISP & Map Link */}
                            {locData && (
                                <div className="flex items-center gap-3 text-xs text-slate-500 pl-1">
                                    {locData.isp && <span>{locData.isp}</span>}
                                    {locData.lat && locData.lon && (
                                        <a
                                            href={`https://www.google.com/maps?q=${locData.lat},${locData.lon}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-1 hover:underline ${isInactive ? 'text-slate-500 hover:text-slate-700' : 'text-blue-600 hover:text-blue-700'}`}
                                        >
                                            <Globe className="w-3 h-3" />
                                            View on Map
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 pl-1">
                            <span className="flex items-center gap-1" title={session.last_active_at}>
                                <Clock className="w-3 h-3" />
                                {isInactive ? 'Last active' : 'Active'} {formatDistanceToNow(new Date(session.last_active_at))} ago
                            </span>
                        </div>
                    </div>
                </div>

                {/* Only show revoke for active sessions */}
                {!isInactive && !session.is_revoked && (
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
    }

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="p-0 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="w-5 h-5 text-blue-600" />
                    Session Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-0">

                {/* Group 1: Active Sessions */}
                <div className="space-y-3">
                    {activeSessions.length > 0 && (
                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Active Now
                        </h3>
                    )}

                    {activeSessions.length > 0 ? (
                        activeSessions.map(session => renderSessionCard(session, false))
                    ) : (
                        <div className="text-sm text-slate-500 italic py-2">
                            No active sessions found. User is currently offline.
                        </div>
                    )}
                </div>

                {/* Group 2: Last Session (Only if exists) */}
                {inactiveSessions.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider text-[11px]">
                            Last Session
                        </h3>
                        {/* Show only the MOST RECENT inactive session */}
                        {renderSessionCard(inactiveSessions[0], true)}
                    </div>
                )}

            </CardContent>
        </Card>
    )
}
