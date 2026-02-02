'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, Clock, Calendar } from 'lucide-react'
import { toast } from 'sonner'

const DAYS = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
]

interface ScheduleItem {
    day_of_week: number
    start_time: string
    end_time: string
    is_active: boolean
}

export default function DoctorSchedulePage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [duration, setDuration] = useState(30)
    // Initialize with all days inactive
    const [schedule, setSchedule] = useState<ScheduleItem[]>(
        DAYS.map(d => ({ day_of_week: d.value, start_time: '09:00', end_time: '17:00', is_active: false }))
    )
    const [profileId, setProfileId] = useState<string | null>(null)

    useEffect(() => {
        async function loadSchedule() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                setProfileId(user.id)

                const { data: existingSchedules, error } = await supabase
                    .from('doctor_schedules')
                    .select('*')
                    .eq('doctor_id', user.id)

                if (existingSchedules && existingSchedules.length > 0) {
                    // Set duration from the first record (assuming uniform duration for now)
                    setDuration(existingSchedules[0].appointment_duration || 30)

                    // Merge existing with default
                    setSchedule(prev => prev.map(day => {
                        const found = existingSchedules.find(s => s.day_of_week === day.day_of_week)
                        if (found) {
                            return {
                                ...day,
                                start_time: found.start_time.slice(0, 5), // HH:MM
                                end_time: found.end_time.slice(0, 5),
                                is_active: true
                            }
                        }
                        return day
                    }))
                }
            } catch (error) {
                console.error('Error loading schedule:', error)
            } finally {
                setLoading(false)
            }
        }
        loadSchedule()
    }, [])

    const handleDayChange = (index: number, field: keyof ScheduleItem, value: any) => {
        const newSchedule = [...schedule]
        newSchedule[index] = { ...newSchedule[index], [field]: value }
        setSchedule(newSchedule)
    }

    const handleSave = async () => {
        if (!profileId) return
        setSaving(true)

        try {
            // 1. Identify inactive days to remove
            const inactiveDayIndices = schedule
                .filter(s => !s.is_active)
                .map(s => s.day_of_week)

            if (inactiveDayIndices.length > 0) {
                const { error: delError } = await supabase
                    .from('doctor_schedules')
                    .delete()
                    .eq('doctor_id', profileId)
                    .in('day_of_week', inactiveDayIndices)

                if (delError) {
                    console.error("Delete Error:", delError)
                    throw delError
                }
            }

            // 2. Upsert active days
            const toUpsert = schedule
                .filter(s => s.is_active)
                .map(s => ({
                    doctor_id: profileId,
                    day_of_week: s.day_of_week,
                    start_time: s.start_time,
                    end_time: s.end_time,
                    appointment_duration: duration
                }))

            if (toUpsert.length > 0) {
                const { error: upsertError } = await supabase
                    .from('doctor_schedules')
                    .upsert(toUpsert, { onConflict: 'doctor_id, day_of_week' })

                if (upsertError) {
                    console.error("Upsert Error:", upsertError)
                    throw upsertError
                }
            }

            toast.success('Schedule updated successfully!')
        } catch (error: any) {
            console.error('Save failed detailed:', JSON.stringify(error, null, 2))
            toast.error('Failed to save schedule: ' + (error.message || 'Check console for details'))
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin text-[#004b87]" /></div>

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Availability Management</h1>
                <p className="text-slate-500 mt-2">Manage your weekly schedule and appointment duration.</p>
            </div>

            <div className="grid gap-6">
                {/* Configuration Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#004b87]" />
                            General Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-w-xs">
                            <Label className="mb-2 block">Appointment Duration</Label>
                            <Select value={duration.toString()} onValueChange={(val) => setDuration(parseInt(val))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">15 Minutes</SelectItem>
                                    <SelectItem value="30">30 Minutes</SelectItem>
                                    <SelectItem value="45">45 Minutes</SelectItem>
                                    <SelectItem value="60">1 Hour</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500 mt-2">
                                This will determine the length of time slots generated for patients.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Weekly Schedule Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-[#004b87]" />
                            Weekly Hours
                        </CardTitle>
                        <CardDescription>Toggle days on/off and set your working hours.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {schedule.map((day, index) => (
                            <div key={day.day_of_week} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border transition-all ${day.is_active ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent opacity-70'}`}>

                                <div className="flex items-center justify-between sm:w-48">
                                    <span className={`font-medium ${day.is_active ? 'text-slate-900' : 'text-slate-400'}`}>
                                        {DAYS.find(d => d.value === day.day_of_week)?.label}
                                    </span>
                                    <Switch
                                        checked={day.is_active}
                                        onCheckedChange={(checked) => handleDayChange(index, 'is_active', checked)}
                                    />
                                </div>

                                {day.is_active && (
                                    <div className="flex items-center gap-2 flex-1 animate-in fade-in slide-in-from-left-4">
                                        <div className="flex-1">
                                            <Label className="text-xs text-slate-500 mb-1 block">Start Time</Label>
                                            <Input
                                                type="time"
                                                value={day.start_time}
                                                onChange={(e) => handleDayChange(index, 'start_time', e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                        <span className="text-slate-300 mt-5">-</span>
                                        <div className="flex-1">
                                            <Label className="text-xs text-slate-500 mb-1 block">End Time</Label>
                                            <Input
                                                type="time"
                                                value={day.end_time}
                                                onChange={(e) => handleDayChange(index, 'end_time', e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button
                        size="lg"
                        className="bg-[#004b87] hover:bg-[#003865] min-w-[150px]"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <>
                            <Save className="mr-2 h-5 w-5" /> Save Availability
                        </>}
                    </Button>
                </div>
            </div>
        </div>
    )
}
