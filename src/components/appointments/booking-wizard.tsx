"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Stethoscope, CalendarCheck, CheckCircle, ChevronRight, Clock, AlertCircle, ChevronLeft } from "lucide-react"
import { format, addMinutes, parse, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, isSameMonth } from "date-fns"

interface Doctor {
    id: string
    full_name: string
    specialization?: string
    avatar_url?: string
}

interface Schedule {
    day_of_week: number
    start_time: string
    end_time: string
    appointment_duration: number
}

interface WizardProps {
    onComplete: (data: { doctorId: string, doctorName: string, date: Date, time: string, duration: number }) => void
}

export function BookingWizard({ onComplete }: WizardProps) {
    const supabase = createClient()

    // Steps: 1=Specialization, 2=Doctor, 3=Date, 4=Time
    const [step, setStep] = useState(1)

    // Data
    const [specializations, setSpecializations] = useState<string[]>([])
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
    const [schedules, setSchedules] = useState<Schedule[]>([])

    // Selections
    const [selectedSpec, setSelectedSpec] = useState<string>("")
    const [selectedDoctor, setSelectedDoctor] = useState<string>("")
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
    const [viewDate, setViewDate] = useState<Date>(new Date())
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])
    const [selectedTime, setSelectedTime] = useState<string>("")

    // Loading State
    const [loading, setLoading] = useState(true)
    const [calculating, setCalculating] = useState(false)
    const [availableSlots, setAvailableSlots] = useState<{ time: string, available: boolean }[]>([])
    const [duration, setDuration] = useState(30) // Track current duration

    // Load Initial Data
    useEffect(() => {
        async function loadDoctors() {
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, full_name, specialization, avatar_url')
                    .eq('role', 'doctor')

                if (data) {
                    setDoctors(data)
                    const specs = Array.from(new Set(data.map(d => d.specialization || 'General Practice')))
                    setSpecializations(specs)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        loadDoctors()
    }, [])

    // Filter Doctors when Spec changes
    useEffect(() => {
        if (selectedSpec) {
            const filtered = doctors.filter(d => (d.specialization || 'General Practice') === selectedSpec)
            setFilteredDoctors(filtered)
            setStep(2)
        }
    }, [selectedSpec, doctors])

    // Load Schedule when Doctor changes
    useEffect(() => {
        if (selectedDoctor) {
            async function fetchSchedule() {
                const { data } = await supabase
                    .from('doctor_schedules')
                    .select('*')
                    .eq('doctor_id', selectedDoctor)
                setSchedules(data || [])
                setStep(3)
            }
            fetchSchedule()
        }
    }, [selectedDoctor])


    // Calculate slots when Date changes (or Step to ensure freshness)
    useEffect(() => {
        if (selectedDate && selectedDoctor && step === 3) {
            setCalculating(true)
            // Don't clear immediately to prevent flash, but maybe show loading overlay

            async function calculate() {
                try {
                    const dayOfWeek = selectedDate!.getDay()
                    const schedule = schedules.find(s => s.day_of_week === dayOfWeek)

                    if (!schedule) {
                        setCalculating(false)
                        setAvailableSlots([])
                        return
                    }

                    // 1. Generate Slots
                    const currentDuration = schedule.appointment_duration || 30
                    setDuration(currentDuration)
                    const slots: string[] = []
                    const startTime = parse(schedule.start_time, 'HH:mm:ss', new Date())
                    const endTime = parse(schedule.end_time, 'HH:mm:ss', new Date())

                    let current = startTime
                    const cutoff = addMinutes(endTime, -currentDuration)

                    while (current <= cutoff) {
                        slots.push(format(current, 'HH:mm'))
                        current = addMinutes(current, currentDuration)
                    }

                    // 2. Fetch Existing Appointments
                    const startOfDay = new Date(selectedDate!)
                    startOfDay.setHours(0, 0, 0, 0)
                    const endOfDay = new Date(selectedDate!)
                    endOfDay.setHours(23, 59, 59, 999)

                    let bookedTimes: string[] = []

                    const { data: existing, error } = await supabase
                        .from('appointments')
                        .select('start_time')
                        .eq('doctor_id', selectedDoctor)
                        .in('status', ['pending', 'confirmed']) // Only active appointments block slots
                        .gte('start_time', startOfDay.toISOString())
                        .lte('start_time', endOfDay.toISOString())

                    if (error) {
                        console.error("Error fetching appointments:", error)
                    }

                    bookedTimes = (existing || []).map(a => format(new Date(a.start_time), 'HH:mm'))

                    const booked = new Set(bookedTimes)

                    // Return ALL slots but mark availability
                    const slotsWithStatus = slots.map(time => ({
                        time,
                        available: !booked.has(time)
                    }))

                    setAvailableSlots(slotsWithStatus)

                    // Clear selection if it became unavailable
                    if (selectedTime && booked.has(selectedTime)) {
                        setSelectedTime("")
                    }

                } catch (e) {
                    console.error(e)
                } finally {
                    setCalculating(false)
                }
            }
            calculate()

        }
    }, [selectedDate, selectedDoctor, schedules, step, selectedTime])

    // Real-time subscription: Refresh slots when appointments change
    useEffect(() => {
        if (!selectedDoctor || !selectedDate || step !== 3) return

        const startOfDay = new Date(selectedDate)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(selectedDate)
        endOfDay.setHours(23, 59, 59, 999)

        // Subscribe to appointment changes for this doctor
        const channel = supabase
            .channel(`appointments-${selectedDoctor}-${selectedDate.toISOString()}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'appointments',
                    filter: `doctor_id=eq.${selectedDoctor}`
                },
                (payload: any) => {
                    console.log('Appointment change detected:', payload)

                    // Check if the change affects the selected date
                    const startTime = payload.new?.start_time || payload.old?.start_time
                    if (!startTime) return

                    const appointmentDate = new Date(startTime)

                    if (appointmentDate >= startOfDay && appointmentDate <= endOfDay) {
                        // Recalculate slots by toggling calculating state
                        setCalculating(true)
                        // Trigger recalculation by updating a dependency
                        setSelectedTime(prev => prev) // Force re-render
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [selectedDoctor, selectedDate, step])


    const handleTimeClick = (time: string, available: boolean) => {
        if (!available) return
        setSelectedTime(time)
    }

    const handleConfirm = () => {
        if (selectedDoctor && selectedDate && selectedTime) {
            const doc = doctors.find(d => d.id === selectedDoctor)
            onComplete({
                doctorId: selectedDoctor,
                doctorName: doc?.full_name || 'Doctor',
                date: selectedDate,
                time: selectedTime,
                duration: duration
            })
        }
    }

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#004b87]" /></div>

    return (
        <div className="space-y-6">
            {/* Progress / Current Selection Summary */}
            <div className="flex flex-wrap gap-2 text-sm pb-4 border-b border-slate-100">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className={step >= 1 ? "text-[#004b87]" : "text-slate-400"}>
                    <Stethoscope className="w-4 h-4 mr-2" />
                    {selectedSpec || "Specialization"}
                </Button>
                <ChevronRight className="w-4 h-4 text-slate-300 mt-2" />
                <Button variant="ghost" size="sm" onClick={() => setStep(2)} disabled={step < 2} className={step >= 2 ? "text-[#004b87]" : "text-slate-400"}>
                    <User className="w-4 h-4 mr-2" />
                    {doctors.find(d => d.id === selectedDoctor)?.full_name || "Doctor"}
                </Button>
                <ChevronRight className="w-4 h-4 text-slate-300 mt-2" />
                <Button variant="ghost" size="sm" onClick={() => setStep(3)} disabled={step < 3} className={step >= 3 ? "text-[#004b87]" : "text-slate-400"}>
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    {selectedDate ? format(selectedDate, 'MMM d') : "Date"}
                </Button>
            </div>

            {/* Step 1: Specialization */}
            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900">Select Specialization</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {specializations.map(spec => (
                            <Button
                                key={spec}
                                variant="outline"
                                className="h-auto py-4 justify-start text-left hover:border-[#004b87] hover:bg-blue-50/50"
                                onClick={() => setSelectedSpec(spec)}
                            >
                                {spec}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Doctor */}
            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900">Select Specialist</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredDoctors.map(doc => (
                            <div
                                key={doc.id}
                                onClick={() => setSelectedDoctor(doc.id)}
                                className="cursor-pointer flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-[#004b87] hover:bg-blue-50/30 transition-all"
                            >
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden">
                                    {doc.avatar_url ? <img src={doc.avatar_url} className="w-full h-full object-cover" /> : <User className="w-6 h-6" />}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-900">{doc.full_name}</p>
                                    <p className="text-xs text-slate-500">{doc.specialization || 'General Practice'}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3 & 4: Date and Time */}
            {/* Step 3 & 4: Date and Time */}
            {step === 3 && (
                <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
                    <div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h3 className="flex items-center gap-2 text-lg font-semibold mb-6 text-slate-900">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#004b87] text-sm font-bold">1</div>
                                {selectedDate ? format(selectedDate, 'EEEE, MMMM do') : 'Choose Date'}
                            </h3>

                            {/* Custom Calendar Logic */}
                            <div className="space-y-4">
                                {/* Month Navigation */}
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h4 className="font-semibold text-slate-900">{format(viewDate, 'MMMM yyyy')}</h4>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setViewDate(subMonths(viewDate, 1))}
                                            disabled={isSameMonth(viewDate, new Date())}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setViewDate(addMonths(viewDate, 1))}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Available Days Grid */}
                                <div className="grid grid-cols-5 gap-3">
                                    {(() => {
                                        if (!isClient) return <div className="col-span-5 h-60 flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" /></div>

                                        const workingDays = new Set(schedules.map(s => s.day_of_week))
                                        const start = startOfMonth(viewDate)
                                        const end = endOfMonth(viewDate)
                                        const days = eachDayOfInterval({ start, end })

                                        const displayDays = days.filter(date => {
                                            // 1. Must be today or future
                                            if (date < new Date(new Date().setHours(0, 0, 0, 0))) return false
                                            // 2. Must be a working day
                                            return workingDays.has(date.getDay())
                                        })

                                        if (displayDays.length === 0) {
                                            return (
                                                <div className="col-span-5 py-8 text-center text-slate-400 text-sm italic">
                                                    No available dates in this month
                                                </div>
                                            )
                                        }

                                        return displayDays.map(date => {
                                            const isSelected = selectedDate && isSameDay(date, selectedDate)
                                            return (
                                                <button
                                                    key={date.toString()}
                                                    onClick={() => {
                                                        setSelectedDate(date)
                                                        setSelectedTime("")
                                                    }}
                                                    className={`
                                                        aspect-square rounded-xl border flex flex-col items-center justify-center transition-all duration-200
                                                        ${isSelected
                                                            ? "bg-[#004b87] border-[#004b87] text-white shadow-md scale-105"
                                                            : "bg-white border-slate-100 text-slate-700 hover:border-blue-200 hover:shadow-md hover:bg-blue-50/50"
                                                        }
                                                    `}
                                                >
                                                    <span className={`text-xs font-medium uppercase mb-0.5 ${isSelected ? "text-blue-200" : "text-slate-400"}`}>
                                                        {format(date, 'EEE')}
                                                    </span>
                                                    <span className="text-lg font-bold">
                                                        {format(date, 'd')}
                                                    </span>
                                                </button>
                                            )
                                        })
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
                            <h3 className="flex items-center gap-2 text-lg font-semibold mb-6 text-slate-900">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#004b87] text-sm font-bold">2</div>
                                Select Time
                            </h3>

                            <div className="flex-1">
                                {calculating ? (
                                    <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-100 mx-1">
                                        <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#004b87]" />
                                        <span className="text-sm font-medium">Checking availability...</span>
                                    </div>
                                ) : !selectedDate ? (
                                    <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-100 mx-1">
                                        <CalendarCheck className="w-10 h-10 mb-3 opacity-20" />
                                        <span className="text-sm font-medium">Select a date to view slots</span>
                                    </div>
                                ) : availableSlots.length === 0 ? (
                                    <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-red-500 bg-red-50/30 rounded-xl border-2 border-dashed border-red-100 mx-1">
                                        <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
                                        <span className="text-sm font-medium">No active slots available</span>
                                        <span className="text-xs text-red-400 mt-1">Please try another date</span>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {availableSlots.map(({ time, available }) => (
                                                <Button
                                                    key={time}
                                                    variant={selectedTime === time ? "default" : (available ? "outline" : "ghost")}
                                                    className={`
                                                        h-14 relative overflow-hidden transition-all duration-300 group
                                                        ${!available
                                                            ? "bg-gradient-to-br from-red-50 to-rose-50 text-red-400 border-red-100 cursor-not-allowed opacity-90 shadow-sm"
                                                            : selectedTime === time
                                                                ? "bg-[#004b87] shadow-lg scale-105 border-[#004b87] z-10 shadow-blue-900/20"
                                                                : "hover:border-[#004b87] hover:text-[#004b87] hover:bg-blue-50/50 border-slate-200 text-slate-600 hover:shadow-md active:scale-95 active:bg-blue-50"
                                                        }
                                                    `}
                                                    disabled={!available}
                                                    onClick={() => handleTimeClick(time, available)}
                                                >
                                                    {/* Animated background for selected */}
                                                    {selectedTime === time && (
                                                        <div className="absolute inset-0 bg-white/10 animate-pulse" />
                                                    )}

                                                    {/* Diagonal stripes for booked slots */}
                                                    {!available && (
                                                        <div className="absolute inset-0 opacity-5" style={{
                                                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(239, 68, 68, 0.1) 10px, rgba(239, 68, 68, 0.1) 20px)'
                                                        }} />
                                                    )}

                                                    <div className="relative z-10 flex items-center justify-center gap-2">
                                                        {!available ? (
                                                            <>
                                                                <div className="flex items-center gap-2">
                                                                    <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                    <span className="font-semibold line-through decoration-2">{time}</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className={`w-4 h-4 transition-transform duration-300 ${selectedTime === time ? "opacity-100 scale-110" : "opacity-50 group-hover:scale-110"}`} />
                                                                <span className="font-semibold">{time}</span>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* "BOOKED" label for unavailable slots */}
                                                    {!available && (
                                                        <div className="absolute -bottom-1 left-0 right-0 bg-gradient-to-t from-red-100/80 to-transparent pt-3 pb-1">
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 block text-center">
                                                                Booked
                                                            </span>
                                                        </div>
                                                    )}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 mt-6 border-t border-slate-100">
                                <Button
                                    className="w-full h-12 text-lg font-medium shadow-lg shadow-blue-900/10 transition-all hover:shadow-xl hover:-translate-y-0.5 bg-[#004b87] hover:bg-[#003865]"
                                    disabled={!selectedTime}
                                    onClick={handleConfirm}
                                >
                                    Confirm <span className="mx-1">•</span> {selectedTime || "..."} <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    )
}
