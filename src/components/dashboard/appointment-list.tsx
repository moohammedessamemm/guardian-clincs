'use client'

import { EditAppointmentDialog } from '@/components/dashboard/edit-appointment-dialog'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

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

interface AppointmentListProps {
    statusFilter?: string[]
}

export function AppointmentList({ statusFilter }: AppointmentListProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchAppointments = async () => {
        try {
            // Start building the query
            let query = supabase
                .from('appointments')
                .select(`
                    id,
                    start_time,
                    end_time,
                    status,
                    reason,
                    doctor_id,
                    patient_id,
                    patient:patient_id (full_name, phone, email),
                    doctor:doctor_id (id, full_name)
                `)
                .order('start_time', { ascending: false })

            // Apply filter if provided
            if (statusFilter && statusFilter.length > 0) {
                query = query.in('status', statusFilter)
            }

            const { data, error } = await query

            if (error) throw error

            setAppointments(data as unknown as Appointment[])
        } catch (err) {
            console.error('Error fetching appointments:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAppointments()
    }, [supabase, statusFilter])

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
    }

    if (appointments.length === 0) {
        return <div className="text-center p-8 text-gray-500">No appointments found.</div>
    }

    return (
        <div className="bg-white rounded-md shadow border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Assigned Doctor</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {appointments.map((apt) => (
                        <TableRow key={apt.id}>
                            <TableCell>
                                <div className="font-medium">
                                    {format(new Date(apt.start_time), 'MMM d, yyyy')}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {format(new Date(apt.start_time), 'h:mm a')}
                                </div>
                            </TableCell>
                            <TableCell>
                                {apt.patient?.full_name || 'Unknown Patient'}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col text-sm">
                                    <span>{apt.patient?.phone || 'N/A'}</span>
                                    <span className="text-gray-400 text-xs">{apt.patient?.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {apt.doctor?.full_name ? (
                                    <span className="text-blue-600 font-medium">{apt.doctor.full_name}</span>
                                ) : (
                                    <span className="text-orange-500 italic">Unassigned</span>
                                )}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate" title={apt.reason || 'N/A'}>
                                {apt.reason || 'N/A'}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    className={`
                                        ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                                        ${apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                                        ${apt.status === 'cancelled' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
                                        ${apt.status === 'completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}
                                    `}
                                >
                                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <EditAppointmentDialog appointment={apt} onUpdate={fetchAppointments} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
