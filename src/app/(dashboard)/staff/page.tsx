'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Users, CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function StaffDashboard() {
    const supabase = createClient()
    const [stats, setStats] = useState({
        pendingAppointments: 0,
        activePatients: 0,
        todayConfirmed: 0
    })
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        const fetchStats = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
                setProfile(data)
            }

            // pending
            const { count: pending } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending')

            // active patients
            const { count: patients } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'patient')

            // confirmed today
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const { count: confirmed } = await supabase
                .from('appointments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'confirmed')
                .gte('start_time', today.toISOString())

            setStats({
                pendingAppointments: pending || 0,
                activePatients: patients || 0,
                todayConfirmed: confirmed || 0
            })
        }
        fetchStats()
    }, [supabase])

    const hour = new Date().getHours()
    const greeting = hour >= 5 && hour < 12 ? 'Good morning'
        : hour >= 12 && hour < 17 ? 'Good afternoon'
            : hour >= 17 && hour < 22 ? 'Good evening'
                : 'Welcome back'

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* 1. Hero / Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        {greeting}, {profile?.full_name?.split(' ')[0] || 'Staff'}
                    </h1>
                    <p className="text-slate-500 mt-1">Welcome to the Staff Portal. Here is today's overview.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-full border border-gray-100 shadow-sm pr-4 hover:shadow-md transition-shadow duration-300">
                    <div className="bg-blue-50 p-2 rounded-full">
                        <Clock className="w-4 h-4 text-[#004b87]" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                        {format(new Date(), 'EEEE, MMMM do')}
                    </span>
                </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Pending Requests</p>
                                <div className="text-3xl font-bold text-slate-900 mt-2">{stats.pendingAppointments}</div>
                            </div>
                            <div className="bg-amber-50 p-3 rounded-xl group-hover:bg-amber-100 transition-colors">
                                <AlertCircle className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Requires confirmation</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[#004b87] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Patients</p>
                                <div className="text-3xl font-bold text-slate-900 mt-2">{stats.activePatients}</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
                                <Users className="h-6 w-6 text-[#004b87]" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Registered in system</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Confirmed Today</p>
                                <div className="text-3xl font-bold text-slate-900 mt-2">{stats.todayConfirmed}</div>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-xl group-hover:bg-emerald-100 transition-colors">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Appointments for today</p>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Quick Actions Grid */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/staff/appointments" className="group">
                        <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-none bg-gradient-to-br from-[#004b87] to-[#003865] text-white">
                            <CardContent className="p-8 flex flex-row items-center gap-6 h-full">
                                <div className="bg-white/20 p-4 rounded-full group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                    <Calendar className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Manage Requests</h3>
                                    <p className="text-blue-100 mt-1">Review and confirm pending appointments.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/staff/billing" className="group">
                        <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200 hover:border-[#004b87]/50">
                            <CardContent className="p-8 flex flex-row items-center gap-6 h-full">
                                <div className="bg-blue-50 p-4 rounded-full text-[#004b87] group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
                                    <CreditCard className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Billing & Invoices</h3>
                                    <p className="text-slate-500 mt-1">Generate invoices and track payments.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    )
}
