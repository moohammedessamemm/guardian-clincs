'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Users, Clock, FileText, ChevronRight, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface Appointment {
    id: string
    start_time: string
    end_time: string
    status: string
    reason: string
    patient: {
        full_name: string
    }
}

export default function DoctorDashboard() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalPatients: 0,
        appointmentsToday: 0
    })
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // Fetch Profile
                const { data: profileData } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
                setProfile(profileData)

                // Get today's date range
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const tomorrow = new Date(today)
                tomorrow.setDate(tomorrow.getDate() + 1)

                // Fetch today's appointments
                const { data: todayAppts } = await supabase
                    .from('appointments')
                    .select(`
                        id,
                        start_time,
                        end_time,
                        status,
                        reason,
                        patient:patient_id ( full_name )
                    `)
                    .eq('doctor_id', user.id)
                    .in('status', ['pending', 'confirmed']) // Only active appointments
                    .gte('start_time', today.toISOString())
                    .lt('start_time', tomorrow.toISOString())
                    .order('start_time', { ascending: true })

                // Count unique patients
                const { data: patients } = await supabase
                    .from('medical_records')
                    .select('patient_id')
                    .eq('doctor_id', user.id)

                const uniquePatients = new Set(patients?.map(p => p.patient_id) || [])

                setStats({
                    totalPatients: uniquePatients.size,
                    appointmentsToday: todayAppts?.length || 0
                })

                setTodayAppointments((todayAppts as any) || [])
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [supabase])

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700'
            case 'pending': return 'bg-amber-100 text-amber-700'
            case 'cancelled': return 'bg-red-50 text-red-600'
            case 'completed': return 'bg-blue-100 text-blue-700'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    const hour = new Date().getHours()
    const greeting = hour >= 5 && hour < 12 ? 'Good morning'
        : hour >= 12 && hour < 17 ? 'Good afternoon'
            : hour >= 17 && hour < 22 ? 'Good evening'
                : 'Welcome back'

    if (loading) return <div className="p-8 text-center text-slate-400">Loading dashboard...</div>

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* 1. Hero Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        {greeting}, <span className="text-[#004b87]">{profile?.full_name ? `Dr. ${profile.full_name}` : 'Doctor'}</span>
                    </h1>
                    <p className="text-slate-500 mt-1">Here is your daily medical overview.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-full border border-slate-100 shadow-sm pr-4 self-start md:self-auto hover:shadow-md transition-shadow duration-300">
                    <div className="bg-blue-50 p-2 rounded-full">
                        <Calendar className="w-4 h-4 text-[#004b87]" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                        {format(new Date(), 'EEEE, MMMM do')}
                    </span>
                </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-none shadow-sm bg-gradient-to-br from-[#004b87] to-[#003865] text-white overflow-hidden relative hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-8 group-hover:translate-x-4 transition-transform duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 font-medium mb-1">Appointments Today</p>
                                <div className="text-4xl font-bold">{stats.appointmentsToday}</div>
                            </div>
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                <Clock className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-blue-100">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-white text-xs">Today</span>
                            Remaining visits
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 font-medium mb-1 uppercase tracking-wide text-xs">Total Patients</p>
                                <div className="text-4xl font-bold text-slate-900">{stats.totalPatients}</div>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-xl group-hover:bg-emerald-100 transition-colors duration-300">
                                <Users className="h-8 w-8 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                            Unique patients under your care
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* 3. Today's Schedule List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Today's Schedule</h2>
                        <Link href="/doctor/schedule" className="text-sm text-[#004b87] font-medium hover:underline flex items-center group">
                            View Full Schedule <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-0">
                            {todayAppointments.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <Clock className="w-12 h-12 mx-auto text-slate-200 mb-3 animate-bounce duration-[2000ms]" />
                                    <p>No appointments scheduled for today.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {todayAppointments.map((appt) => (
                                        <div key={appt.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                                            <div className="flex flex-col items-center justify-center min-w-[80px] bg-slate-50 p-2 rounded-lg border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-colors duration-300">
                                                <span className="text-sm font-bold text-slate-700">
                                                    {format(new Date(appt.start_time), 'h:mm')}
                                                </span>
                                                <span className="text-xs text-slate-400 uppercase">
                                                    {format(new Date(appt.start_time), 'a')}
                                                </span>
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-900">{appt.patient?.full_name || 'Unknown Patient'}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className={`${getStatusStyle(appt.status)} border-none shadow-none animate-in fade-in`}>
                                                        {appt.status}
                                                    </Badge>
                                                    <span className="text-xs text-slate-400 truncate max-w-[200px]">
                                                        {appt.reason}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-[#004b87] hover:bg-blue-50 transition-colors" asChild>
                                                <Link href="/doctor/schedule">Details</Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* 4. Quick Actions */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
                    <div className="grid gap-3">
                        <Link href="/doctor/patients">
                            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-slate-200 group cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">Patient Directory</h3>
                                        <p className="text-xs text-slate-500">Search and view records</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/doctor/schedule">
                            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-slate-200 group cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="bg-blue-50 p-3 rounded-lg text-[#004b87] group-hover:scale-110 transition-transform duration-300">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">Manage Schedule</h3>
                                        <p className="text-xs text-slate-500">View upcoming visits</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/doctor/prescriptions">
                            <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-slate-200 group cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                                        <Stethoscope className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">Prescriptions</h3>
                                        <p className="text-xs text-slate-500">Issue new prescriptions</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
