'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Calendar, Clock, User, FileText, Search, Phone, History } from 'lucide-react'
import { format, isToday, isFuture, isPast, parseISO } from 'date-fns'

interface Appointment {
    id: string
    start_time: string
    end_time: string
    status: string
    reason: string
    symptoms?: string
    patient: {
        full_name: string
        phone?: string
        gender?: string
    }
}

export default function DoctorAppointmentsPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        async function loadAppointments() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('appointments')
                .select(`
                    id,
                    start_time,
                    end_time,
                    status,
                    reason,
                    symptoms,
                    patient:patient_id ( full_name, phone, gender )
                `)
                .eq('doctor_id', user.id)
                .order('start_time', { ascending: true })

            if (data) {
                setAppointments(data as any)
            }
            setLoading(false)
        }
        loadAppointments()
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700'
            case 'pending': return 'bg-amber-100 text-amber-700'
            case 'cancelled': return 'bg-red-50 text-red-600'
            case 'completed': return 'bg-blue-100 text-blue-700'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    const filteredAppointments = appointments.filter(appt =>
        appt.patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appt.reason.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Helper to check if active
    const isActive = (status: string) => ['pending', 'confirmed'].includes(status)

    // 1. History: Any completed/cancelled OR past appointments
    const pastAppointments = filteredAppointments.filter(a =>
        ['completed', 'cancelled'].includes(a.status) ||
        (isPast(parseISO(a.start_time)) && !isToday(parseISO(a.start_time)) && !isActive(a.status))
    )

    // 2. Today: ONLY active appts for Today
    const todayAppointments = filteredAppointments.filter(a =>
        isToday(parseISO(a.start_time)) &&
        isActive(a.status)
    )

    // 3. Upcoming: Active appts in the future (excluding today)
    const upcomingAppointments = filteredAppointments.filter(a =>
        isFuture(parseISO(a.start_time)) &&
        !isToday(parseISO(a.start_time)) &&
        isActive(a.status)
    )

    const AppointmentCard = ({ appt }: { appt: Appointment }) => (
        <Card className="mb-4 hover:shadow-md transition-shadow border-slate-200">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center justify-center min-w-[80px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-lg font-bold text-slate-900">
                                {format(parseISO(appt.start_time), 'd')}
                            </span>
                            <span className="text-xs uppercase text-slate-500 font-medium">
                                {format(parseISO(appt.start_time), 'MMM')}
                            </span>
                            <div className="w-full h-px bg-slate-200 my-2"></div>
                            <span className="text-sm font-semibold text-slate-700">
                                {format(parseISO(appt.start_time), 'h:mm a')}
                            </span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg text-slate-900">{appt.patient.full_name}</h3>
                                <Badge className={getStatusColor(appt.status) + " shadow-none border-none"}>
                                    {appt.status}
                                </Badge>
                            </div>

                            <div className="space-y-1 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {appt.patient.phone || 'No phone'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    <span className="font-medium text-slate-700">Reason:</span> {appt.reason}
                                </div>
                                {appt.symptoms && (
                                    <p className="mt-2 text-slate-600 bg-slate-50 p-2 rounded text-xs">
                                        "{appt.symptoms}"
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* Placeholder actions - could be expanded */}
                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                            View Details
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin text-[#004b87]" /></div>

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Appointments</h1>
                    <p className="text-slate-500 mt-1">Manage your patient visits and schedule.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search patient or reason..."
                        className="pl-9 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="today" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="today">Today ({todayAppointments.length})</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
                    <TabsTrigger value="history">History ({pastAppointments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    {todayAppointments.length > 0 ? (
                        todayAppointments.map(appt => <AppointmentCard key={appt.id} appt={appt} />)
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No appointments scheduled for today.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map(appt => <AppointmentCard key={appt.id} appt={appt} />)
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No upcoming appointments found.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    {pastAppointments.length > 0 ? (
                        pastAppointments.map(appt => <AppointmentCard key={appt.id} appt={appt} />)
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                            <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No past appointments found.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
