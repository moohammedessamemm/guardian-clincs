'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Search, Filter, MoreHorizontal, CalendarPlus } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Input } from "@/components/ui/input"

interface Appointment {
    id: string
    start_time: string
    end_time: string
    status: string
    reason: string
    doctor: {
        full_name: string
        avatar_url?: string
    } | null
    created_at: string
}

export default function PatientAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchAppointments() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    id,
                    start_time,
                    end_time,
                    status,
                    reason,
                    created_at,
                    doctor:doctor_id (full_name, avatar_url)
                `)
                .eq('patient_id', user.id)
                .order('start_time', { ascending: false })

            if (!error && data) {
                setAppointments(data as any)
            }
            setLoading(false)
        }

        fetchAppointments()
    }, [supabase])

    const upcomingAppointments = appointments.filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed')
    const pastAppointments = appointments.filter(apt => apt.status === 'cancelled' || apt.status === 'completed')

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100'
            case 'completed': return 'bg-slate-100 text-slate-600 border-slate-200'
            default: return 'bg-gray-100 text-gray-800'
        }
    }



    const AppointmentCard = ({ apt, isHistory }: { apt: Appointment, isHistory?: boolean }) => {
        const dateObj = new Date(apt.start_time)
        return (
            <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row">
                {/* Date Column */}
                <div className="bg-slate-50 border-r border-slate-100 p-6 flex flex-col items-center justify-center min-w-[140px]">
                    <span className="text-3xl font-bold text-slate-800">{format(dateObj, 'd')}</span>
                    <span className="text-sm font-bold text-[#004b87] uppercase tracking-wider">{format(dateObj, 'MMM')}</span>
                    <span className="text-xs text-slate-400 mt-2">{format(dateObj, 'yyyy')}</span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">
                                Dr. {apt.doctor?.full_name || 'Assigned Doctor'}
                            </h3>
                            <p className="text-slate-500 text-sm">General Consultation</p>
                        </div>
                        <Badge variant="outline" className={`capitalize ${getStatusStyle(apt.status)}`}>
                            {apt.status}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-6 mt-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#004b87]" />
                            {format(dateObj, 'h:mm a')}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#004b87]" />
                            Clinic Room 1
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t md:border-t-0 md:border-l border-slate-100 p-4 flex md:flex-col justify-center gap-2 bg-slate-50/30 min-w-[160px]">
                    {isHistory && (
                        <Button variant="outline" size="sm" className="w-full" disabled>View Details</Button>
                    )}
                </div>
            </div>
        )
    }

    if (loading) return <div className="p-12 text-center text-slate-400">Loading appointments...</div>

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Appointments</h1>
                    <p className="text-slate-500 mt-1">Manage your upcoming visits and view past history.</p>
                </div>
                <Link href="/appointments/new">
                    <Button className="bg-[#004b87] hover:bg-[#003865] text-white shadow-lg shadow-blue-900/10 transition-all rounded-full px-6">
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Book Appointment
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <TabsList className="bg-slate-100 rounded-full p-1 h-12 w-full md:w-auto">
                        <TabsTrigger
                            value="upcoming"
                            className="rounded-full px-8 h-10 data-[state=active]:bg-white data-[state=active]:text-[#004b87] data-[state=active]:shadow-sm transition-all"
                        >
                            Upcoming
                        </TabsTrigger>
                        <TabsTrigger
                            value="past"
                            className="rounded-full px-8 h-10 data-[state=active]:bg-white data-[state=active]:text-[#004b87] data-[state=active]:shadow-sm transition-all"
                        >
                            History
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search doctor or date..." className="pl-9 bg-white rounded-full border-slate-200" />
                    </div>
                </div>

                <TabsContent value="upcoming" className="space-y-4 animate-in fade-in-50 duration-500">
                    {upcomingAppointments.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
                            <Calendar className="h-16 w-16 mx-auto text-slate-200 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900">No Upcoming Appointments</h3>
                            <p className="text-slate-500 mb-6 max-w-sm mx-auto">You have no scheduled visits at the moment. Regular checkups are key to good health.</p>
                            <Link href="/appointments/new">
                                <Button variant="outline" className="border-[#004b87] text-[#004b87] hover:bg-blue-50">Schedule Visit</Button>
                            </Link>
                        </div>
                    ) : (
                        upcomingAppointments.map(apt => (
                            <AppointmentCard key={apt.id} apt={apt} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4 animate-in fade-in-50 duration-500">
                    {pastAppointments.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl">
                            No appointment history found.
                        </div>
                    ) : (
                        pastAppointments.map(apt => (
                            <AppointmentCard key={apt.id} apt={apt} isHistory={true} />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
