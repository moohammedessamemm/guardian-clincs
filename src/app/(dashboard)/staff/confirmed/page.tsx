'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, User, Check, X, Search, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { Input } from "@/components/ui/input"

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

export default function StaffConfirmedAppointmentsPage() {
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
            .in('status', ['confirmed', 'completed', 'cancelled'])
            .order('start_time', { ascending: false })

        if (!error && data) {
            setAppointments(data as unknown as Appointment[])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchAppointments()
    }, [supabase])

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100'
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const handleRevert = async (id: string) => {
        if (!confirm('Revert this appointment to Pending status?')) return

        const { error } = await supabase
            .from('appointments')
            .update({ status: 'pending' })
            .eq('id', id)

        if (!error) {
            setAppointments(current => current.filter(a => a.id !== id))
        }
    }

    if (loading) return <div className="p-12 text-center text-slate-400">Loading history...</div>

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Appointment Log</h1>
                    <p className="text-slate-500 mt-1">History of confirmed, completed, and cancelled visits.</p>
                </div>
                <div className="relative w-full md:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-[#004b87] transition-colors" />
                    <Input placeholder="Search patient..." className="pl-9 bg-white focus-visible:ring-[#004b87] transition-all" />
                </div>
            </div>

            {appointments.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No history found.</div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((apt) => {
                        const dateObj = new Date(apt.start_time)
                        return (
                            <div key={apt.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col md:flex-row relative">
                                {/* Date Column */}
                                <div className="bg-slate-50 border-r border-slate-100 p-6 flex flex-col items-center justify-center min-w-[120px] transition-colors group-hover:bg-slate-100">
                                    <span className="text-2xl font-bold text-slate-700">{format(dateObj, 'd')}</span>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{format(dateObj, 'MMM yyyy')}</span>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col justify-center">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-lg text-slate-800">{apt.patient?.full_name || 'Unknown Patient'}</h3>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`capitalize ${getStatusStyle(apt.status)} animate-in fade-in`}>
                                                {apt.status}
                                            </Badge>

                                            {apt.status === 'confirmed' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 px-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                                    title="Revert to Pending"
                                                    onClick={() => handleRevert(apt.id)}
                                                >
                                                    <RotateCcw className="w-4 h-4 mr-1 group-hover:rotate-180 transition-transform duration-500" />
                                                    Undo
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-500 flex gap-4 mb-3">
                                        <span className="flex items-center gap-1"><User className="w-3 h-3 text-[#004b87]" /> Dr. {apt.doctor?.full_name || 'Unassigned'}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#004b87]" /> {format(dateObj, 'h:mm a')}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded max-w-md truncate group-hover:bg-slate-100 transition-colors">
                                        Reason: {apt.reason || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
