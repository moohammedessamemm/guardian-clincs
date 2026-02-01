'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, User, Check, X, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { EditAppointmentDialog } from '@/components/dashboard/edit-appointment-dialog'

interface Appointment {
    id: string
    start_time: string
    end_time: string
    status: string
    reason: string
    patient: {
        full_name: string
        phone: string
        email: string
    } | null
    doctor: {
        id: string
        full_name: string
    } | null
    doctor_id?: string
}

export default function StaffAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchAppointments = async () => {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                patient:patient_id (full_name, phone, email),
                doctor:doctor_id (id, full_name)
            `)
            .eq('status', 'pending')
            .order('start_time', { ascending: true })

        if (!error && data) {
            setAppointments(data as unknown as Appointment[])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchAppointments()
    }, [supabase])

    const handleQuickAction = async (id: string, newStatus: 'confirmed' | 'cancelled') => {
        setLoading(true)
        await supabase.from('appointments').update({ status: newStatus }).eq('id', id)
        await fetchAppointments()
    }

    if (loading) return <div className="p-12 text-center text-slate-400">Loading pending requests...</div>

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pending Requests</h1>
                <p className="text-slate-500 mt-1">Review and manage patient appointment requests.</p>
            </div>

            {appointments.length === 0 ? (
                <Card className="border-dashed bg-slate-50/50 hover:bg-slate-50 transition-colors duration-500">
                    <CardContent className="p-12 text-center">
                        <Check className="h-12 w-12 text-emerald-300 mx-auto mb-4 animate-bounce duration-[2000ms]" />
                        <p className="text-lg font-medium text-slate-700">All caught up!</p>
                        <p className="text-sm text-slate-500 mt-2">There are no pending appointment requests to review.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {appointments.map((apt) => {
                        const dateObj = new Date(apt.start_time)
                        return (
                            <div key={apt.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col md:flex-row">
                                {/* Status Strip */}
                                <div className="hidden md:block w-2 bg-amber-400" />

                                {/* Date Column */}
                                <div className="bg-slate-50 border-r border-slate-100 p-6 flex flex-col items-center justify-center min-w-[140px]">
                                    <span className="text-3xl font-bold text-slate-800">{format(dateObj, 'd')}</span>
                                    <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">{format(dateObj, 'MMM')}</span>
                                    <span className="text-xs text-slate-400 mt-2">{format(dateObj, 'yyyy')}</span>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col justify-center">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                                {apt.patient?.full_name || 'Unknown Patient'}
                                                <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs animate-pulse">Pending</Badge>
                                            </h3>
                                            <div className="text-slate-500 text-sm flex gap-3 mt-1">
                                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {apt.patient?.phone || 'No Phone'}</span>
                                                <span className="text-slate-300">|</span>
                                                <span>{apt.patient?.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50 p-4 rounded-lg group-hover:bg-slate-100 transition-colors">
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Medical Reason</p>
                                            <p className="text-sm text-slate-700 mt-1 font-medium">{apt.reason || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Requested Time</p>
                                            <p className="text-sm text-slate-700 mt-1 flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-[#004b87]" />
                                                {format(dateObj, 'h:mm a')} ({format(dateObj, 'EEEE')})
                                            </p>
                                        </div>
                                    </div>

                                    {!apt.doctor_id && (
                                        <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm bg-amber-50 p-2 rounded w-fit">
                                            <AlertCircle className="w-4 h-4" />
                                            Needs Doctor Assignment
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="border-t md:border-t-0 md:border-l border-slate-100 p-6 flex flex-col justify-center gap-3 bg-slate-50/30 min-w-[200px]">
                                    <Button
                                        className="w-full bg-[#004b87] hover:bg-[#003865] hover:shadow-lg transition-all flex items-center gap-2"
                                        onClick={() => handleQuickAction(apt.id, 'confirmed')}
                                    >
                                        <Check className="w-4 h-4" /> Confirm
                                    </Button>

                                    <div className="grid grid-cols-2 gap-2">
                                        <EditAppointmentDialog appointment={apt} onUpdate={fetchAppointments} />
                                        <Button
                                            variant="outline"
                                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                                            onClick={() => handleQuickAction(apt.id, 'cancelled')}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
