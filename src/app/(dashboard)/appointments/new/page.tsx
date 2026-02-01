'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea'
import { Loader2, User, ChevronLeft, CalendarCheck, Stethoscope, AlertTriangle, Edit, Check } from 'lucide-react'
import { BookingWizard } from '@/components/appointments/booking-wizard'
import { format, addMinutes } from 'date-fns'

interface BookingParams {
    doctorId: string
    doctorName: string
    date: Date
    time: string
    duration: number
}

export default function NewAppointmentPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)
    const [hasActiveAppointment, setHasActiveAppointment] = useState(false)

    // The "Wizard" result
    const [bookingParams, setBookingParams] = useState<BookingParams | null>(null)

    const [formData, setFormData] = useState({
        phone: '',
        gender: '',
        reason: '',
        symptoms: '',
        symptomDuration: '',
    })
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Check for active appointments
            const { data: appointments } = await supabase
                .from('appointments')
                .select('id, start_time, status')
                .eq('patient_id', user.id)
                .in('status', ['pending', 'confirmed'])
                .limit(1)

            if (appointments && appointments.length > 0) {
                setHasActiveAppointment(true)
                setLoading(false)
                return
            }

            // 2. Load Profile
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            setProfile(data)
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    phone: data.phone || '',
                    gender: data.gender || ''
                }))
            }
            setLoading(false)
        }
        loadData()
    }, [])

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!bookingParams) return

        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Construct times
            const timeParts = bookingParams.time.split(':')
            const startDate = new Date(bookingParams.date)
            startDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0)

            const endDate = addMinutes(startDate, bookingParams.duration)

            // Update profile first if needed
            if (formData.gender !== profile?.gender || formData.phone !== profile?.phone) {
                await supabase.from('profiles').update({ phone: formData.phone, gender: formData.gender }).eq('id', user.id)
            }

            const { error: aptError } = await supabase.from('appointments').insert({
                patient_id: user.id,
                doctor_id: bookingParams.doctorId, // Link to selected doctor
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                status: 'pending',
                reason: formData.reason,
                symptoms: formData.symptoms,
                symptom_duration: formData.symptomDuration,
            })

            if (aptError) throw aptError

            router.refresh()
            router.push('/patient')
        } catch (err: any) {
            setError(err.message || 'Failed to book appointment')
        } finally {
            setLoading(false)
        }
    }

    if (loading && !hasActiveAppointment) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-[#004b87]" /></div>

    if (hasActiveAppointment) {
        return (
            <div className="max-w-md mx-auto py-12 text-center">
                <Card className="border-l-4 border-l-yellow-400 shadow-md">
                    <CardContent className="pt-6">
                        <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarCheck className="w-8 h-8 text-yellow-700" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Active Appointment Found</h2>
                        <p className="text-slate-500 mb-6">
                            You already have a pending or confirmed appointment scheduled.
                            Please complete or cancel your existing appointment before booking a new one.
                        </p>
                        <Button className="w-full bg-[#004b87]" onClick={() => router.push('/patient')}>
                            View Appointments
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <Button variant="ghost" className="mb-6 text-slate-500 hover:text-slate-900" onClick={() => router.back()}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Book Appointment</h1>
                    <p className="text-slate-500 mt-1">Schedule a visit with our specialists.</p>
                </div>
            </div>

            {/* If no booking params selected, show Wizard. If selected, show Form. */}
            {!bookingParams ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 bg-blue-50 text-[#004b87] rounded-full">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            Select Specialist & Time
                        </CardTitle>
                        <CardDescription>Choose who you want to see and when.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BookingWizard onComplete={setBookingParams} />
                    </CardContent>
                </Card>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4">

                    {/* Summary Card with Edit Button */}
                    <Card className="bg-blue-50/50 border-blue-200">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-[#004b87] text-white flex items-center justify-center">
                                    <Check className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-[#004b87]">{bookingParams.doctorName}</p>
                                    <p className="text-sm text-slate-600">
                                        {format(bookingParams.date, 'EEEE, MMM d, yyyy')} at {bookingParams.time}
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setBookingParams(null)} className="text-slate-500 hover:text-slate-900">
                                <Edit className="w-4 h-4 mr-2" /> Change
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="border-slate-200 shadow-sm md:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <User className="h-5 w-5 text-[#004b87]" />
                                    Patient Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={profile?.full_name || ''} disabled className="bg-slate-50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone *</Label>
                                    <Input value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} required placeholder="+1..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender *</Label>
                                    <Select value={formData.gender} onValueChange={(val) => handleChange('gender', val)} disabled={!!profile?.gender}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm md:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Stethoscope className="h-5 w-5 text-[#004b87]" />
                                    Medical Concerns
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Reason for Visit *</Label>
                                    <Input placeholder="E.g. Fever, Checkup" value={formData.reason} onChange={(e) => handleChange('reason', e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Describe Symptoms</Label>
                                    <Textarea placeholder="Share details..." value={formData.symptoms} onChange={(e) => handleChange('symptoms', e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
                            <AlertTriangle className="h-5 w-5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <Button type="submit" className="w-full bg-[#004b87] hover:bg-[#003865] text-white py-6 text-lg shadow-lg shadow-blue-900/10" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm Booking'}
                    </Button>
                </form>
            )}
        </div>
    )
}
