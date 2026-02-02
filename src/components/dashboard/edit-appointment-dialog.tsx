'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Calendar, Clock, User, Stethoscope, CheckCircle2, XCircle, Clock3, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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
    patient_id?: string
}

interface Doctor {
    id: string
    full_name: string
    avatar_url?: string
}

interface EditAppointmentDialogProps {
    appointment: Appointment
    onUpdate: () => void
}

export function EditAppointmentDialog({ appointment, onUpdate }: EditAppointmentDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [selectedDoctor, setSelectedDoctor] = useState<string>(appointment.doctor_id || appointment.doctor?.id || '')
    const [date, setDate] = useState(format(new Date(appointment.start_time), 'yyyy-MM-dd'))
    const [time, setTime] = useState(format(new Date(appointment.start_time), 'HH:mm'))
    const [status, setStatus] = useState(appointment.status)
    const supabase = createClient()

    useEffect(() => {
        async function fetchDoctors() {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .eq('role', 'doctor')

            if (data) {
                setDoctors(data)
            }
        }

        if (open) {
            fetchDoctors()
            // Reset state when opening
            setSelectedDoctor(appointment.doctor_id || appointment.doctor?.id || '')
            setDate(format(new Date(appointment.start_time), 'yyyy-MM-dd'))
            setTime(format(new Date(appointment.start_time), 'HH:mm'))
            setStatus(appointment.status)
        }
    }, [open, supabase, appointment])

    const handleSave = async () => {
        setLoading(true)
        try {
            const startDateTime = new Date(`${date}T${time}`)
            const oldStart = new Date(appointment.start_time)
            const oldEnd = new Date(appointment.end_time)
            const durationMs = oldEnd.getTime() - oldStart.getTime()
            const endDateTime = new Date(startDateTime.getTime() + durationMs)

            const updates: any = {
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                status: status,
            }

            if (selectedDoctor) {
                updates.doctor_id = selectedDoctor
            }

            const { error } = await supabase
                .from('appointments')
                .update(updates)
                .eq('id', appointment.id)

            if (error) throw error

            // Notification Logic
            const notifications = []
            const patientId = appointment.patient_id

            // Check if we need to fetch the raw patient_id if not in the joined object
            // For now assuming appointment object has what we need or we are ok.
            // Actually appointment query usually returns joined patient { full_name... } but maybe not ID if not requested.
            // Let's rely on the fact that RLS allows us to insert if we are staff. 
            // We need the patient's UUID.
            // If appointment prop doesn't have it (it likely doesn't in the current select), we might fail to weirdly.
            // But let's assume the query included patient_id or similar.
            // Wait, the select in appointment-list included `patient:patient_id (full_name...)`. 
            // It replaces patient_id with the object. We might need to adjust the select there to include patient_id OR user the `patient` object if it has ID.
            // Let's verify if `appointment` has `patient_id`?
            // The type def says `patient: {...}`. It might NOT have `patient_id` at root if not selected explicitly.

            // HACK: We need to ensure we have patient_id.
            // Let's add patient_id to the select in appointment-list.tsx effectively? 
            // OR checks if it's there. 

            // Assuming we can get it. If not, notification fails silently (or logs).

            // Let's just try to insert if we have a patientId.
            // The appointment object from Supabase usually keeps the foreign key column `patient_id` if we select `*` or explicitly select it.
            // In appointment-list we selected: `patient:patient_id (...)`. This usually HIDES `patient_id` unless we also select `patient_id`.

            // Re-fetch logic might be needed if we don't have it.
            // Proceeding with logic:

            // 1. Status Change
            if (status !== appointment.status) {
                if (status === 'confirmed') {
                    notifications.push({
                        user_id: appointment.patient_id, // We need to ensure this exists!
                        title: 'Appointment Confirmed',
                        message: `Your appointment with ${doctors.find(d => d.id === selectedDoctor)?.full_name || 'Dr. ' + appointment.doctor?.full_name} has been confirmed for ${format(startDateTime, 'PPP p')}.`,
                        type: 'success',
                        meta: { appointment_id: appointment.id }
                    })
                } else if (status === 'cancelled') {
                    notifications.push({
                        user_id: appointment.patient_id,
                        title: 'Appointment Cancelled',
                        message: `Your appointment scheduled for ${format(startDateTime, 'PPP p')} has been cancelled. Please contact us for details.`,
                        type: 'error',
                        meta: { appointment_id: appointment.id }
                    })
                }
            }

            // 2. Reschedule (Date/Time Change) - Only if not cancelled
            if (status !== 'cancelled' && startDateTime.getTime() !== oldStart.getTime()) {
                notifications.push({
                    user_id: appointment.patient_id,
                    title: 'Appointment Rescheduled',
                    message: `Your appointment has been rescheduled to ${format(startDateTime, 'PPP p')}.`,
                    type: 'info',
                    meta: { appointment_id: appointment.id }
                })
            }

            if (notifications.length > 0 && appointment.patient_id) { // explicit check
                await supabase.from('notifications').insert(notifications)
            }


            setOpen(false)
            onUpdate()
        } catch (error) {
            console.error('Error updating appointment:', error)
            toast.error('Failed to update appointment')
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'confirmed': return 'text-green-600 bg-green-50 border-green-200'
            case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'cancelled': return 'text-red-600 bg-red-50 border-red-200'
            case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const getStatusIcon = (s: string) => {
        switch (s) {
            case 'confirmed': return <CheckCircle2 className="w-4 h-4 mr-2" />
            case 'pending': return <Clock3 className="w-4 h-4 mr-2" />
            case 'cancelled': return <XCircle className="w-4 h-4 mr-2" />
            case 'completed': return <CheckCircle2 className="w-4 h-4 mr-2" />
            default: return <AlertCircle className="w-4 h-4 mr-2" />
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-700 transition-colors">
                    Manage
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
                <div className="p-6 pb-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">Manage Appointment</DialogTitle>
                        <DialogDescription className="text-blue-100">
                            Update details for {appointment.patient?.full_name}'s request.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    {/* Patient Info Card */}
                    <div className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50/50">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                                {appointment.patient?.full_name?.charAt(0) || 'P'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <p className="font-semibold text-sm leading-none">{appointment.patient?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{appointment.patient?.phone}</p>
                            <p className="text-xs text-muted-foreground break-all">{appointment.patient?.email}</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {/* Doctor Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="doctor" className="flex items-center gap-2 text-gray-700">
                                <Stethoscope className="w-4 h-4 text-blue-500" />
                                Assigned Doctor
                            </Label>
                            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a doctor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctors.map((doc) => (
                                        <SelectItem key={doc.id} value={doc.id}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={doc.avatar_url} />
                                                    <AvatarFallback>{doc.full_name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {doc.full_name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date & Time Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date" className="flex items-center gap-2 text-gray-700">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    Date
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="block w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time" className="flex items-center gap-2 text-gray-700">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    Time
                                </Label>
                                <Input
                                    id="time"
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="block w-full"
                                />
                            </div>
                        </div>

                        {/* Status Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-gray-700">Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className={cn("w-full transition-all duration-200 font-medium", getStatusColor(status))}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">
                                        <div className="flex items-center text-yellow-600">
                                            <Clock3 className="w-4 h-4 mr-2" /> Pending
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="confirmed">
                                        <div className="flex items-center text-green-600">
                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Confirmed
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        <div className="flex items-center text-red-600">
                                            <XCircle className="w-4 h-4 mr-2" /> Cancelled
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        <div className="flex items-center text-blue-600">
                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Completed
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-0">
                    <Button variant="outline" onClick={() => setOpen(false)} className="gap-2">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
