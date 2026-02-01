import Link from 'next/link'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, FileText, Plus, Pill, FlaskConical, Settings, Clock, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

export default async function PatientDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch Profile
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user!.id).single()

    // Fetch upcoming appointments (pending or confirmed only)
    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            *,
            doctor:doctor_id(full_name)
        `)
        .eq('patient_id', user!.id)
        .in('status', ['pending', 'confirmed'])
        .order('start_time', { ascending: true })
        .limit(1)

    // Fetch medical records count
    const { count: recordsCount } = await supabase
        .from('medical_records')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', user!.id)

    // Fetch notifications
    const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5)

    const nextAppointment = appointments?.[0]
    const hour = new Date().getHours()
    const greeting = hour >= 5 && hour < 12 ? 'Good morning'
        : hour >= 12 && hour < 17 ? 'Good afternoon'
            : hour >= 17 && hour < 22 ? 'Good evening'
                : 'Welcome back'

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* 1. Hero / Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        {greeting}, {profile?.full_name?.split(' ')[0] || 'Patient'}
                    </h1>
                    <p className="text-slate-500 mt-1">Here is what's happening with your health today.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-full border border-gray-100 shadow-sm pr-4 hover:shadow-md transition-shadow duration-300">
                    <div className="bg-blue-50 p-2 rounded-full">
                        <Clock className="w-4 h-4 text-[#004b87]" />
                    </div>
                    <span className="text-sm font-medium text-slate-600">
                        {format(new Date(), 'EEEE, MMMM do')}
                    </span>
                </div>
            </div>

            {/* 2. Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/appointments/new" className="group">
                    <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out border-none bg-gradient-to-br from-[#004b87] to-[#003865] text-white">
                        <CardContent className="p-6 flex flex-col items-center text-center justify-center gap-3 h-full">
                            <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="font-semibold">Book Appointment</span>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/patient/records" className="group">
                    <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out border-slate-200 hover:border-[#004b87]/50">
                        <CardContent className="p-6 flex flex-col items-center text-center justify-center gap-3 h-full">
                            <div className="bg-emerald-50 p-3 rounded-full text-emerald-600 group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-300">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-slate-700">Medical History</span>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/patient/prescriptions" className="group">
                    <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out border-slate-200 hover:border-[#004b87]/50">
                        <CardContent className="p-6 flex flex-col items-center text-center justify-center gap-3 h-full">
                            <div className="bg-purple-50 p-3 rounded-full text-purple-600 group-hover:bg-purple-100 group-hover:scale-110 transition-all duration-300">
                                <Pill className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-slate-700">Prescriptions</span>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/patient/labs" className="group">
                    <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out border-slate-200 hover:border-[#004b87]/50">
                        <CardContent className="p-6 flex flex-col items-center text-center justify-center gap-3 h-full">
                            <div className="bg-amber-50 p-3 rounded-full text-amber-600 group-hover:bg-amber-100 group-hover:scale-110 transition-all duration-300">
                                <FlaskConical className="w-6 h-6" />
                            </div>
                            <span className="font-semibold text-slate-700">Lab Results</span>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* 3. Main Content Split */}
            <div className="grid gap-8 md:grid-cols-3">
                {/* Left Column: Next Appointment (Priority) */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Next Appointment</h2>
                        {nextAppointment && (
                            <Link href="/patient/appointments" className="text-sm font-medium text-[#004b87] hover:underline flex items-center group transition-colors">
                                View all <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}
                    </div>

                    {nextAppointment ? (
                        <Card className="border-l-4 border-l-[#004b87] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    <div className="bg-[#f0f7ff] p-6 flex flex-col items-center justify-center text-center min-w-[200px] border-r border-blue-100">
                                        <div className="text-3xl font-bold text-[#004b87]">
                                            {format(new Date(nextAppointment.start_time), 'd')}
                                        </div>
                                        <div className="text-sm font-bold uppercase tracking-wider text-blue-600 mt-1">
                                            {format(new Date(nextAppointment.start_time), 'MMM')}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-2">
                                            {format(new Date(nextAppointment.start_time), 'h:mm a')}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-slate-800">
                                                Consultation with Dr. {nextAppointment.doctor?.full_name || 'Assigned Doctor'}
                                            </h3>
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold uppercase animate-pulse">
                                                {nextAppointment.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-sm mb-4">
                                            General Checkup
                                        </p>
                                        <div className="flex gap-3 mt-auto">
                                            <Button size="sm" variant="outline" className="w-full hover:bg-slate-50 transition-colors" asChild>
                                                <Link href="/patient/appointments">Reschedule</Link>
                                            </Button>
                                            <Button size="sm" className="w-full bg-[#004b87] hover:bg-[#003865] hover:shadow-md transition-all" asChild>
                                                <Link href="/patient/appointments">Details</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-dashed bg-slate-50/50 hover:bg-slate-50 transition-colors duration-500">
                            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                                <Calendar className="w-12 h-12 text-slate-300 mb-4 animate-bounce duration-[2000ms]" />
                                <h3 className="font-medium text-slate-900">No upcoming appointments</h3>
                                <p className="text-slate-500 text-sm mt-1 mb-6 max-w-xs">
                                    You have no appointments scheduled. Book one now to stay on top of your health.
                                </p>
                                <Button asChild variant="outline" className="hover:scale-105 transition-transform">
                                    <Link href="/appointments/new">Schedule Visit</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Stats & Notifications */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Health Overview</h2>

                    <Card className="hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <FileText className="w-5 h-5 text-[#004b87]" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Records</p>
                                <p className="text-2xl font-bold text-slate-900">{recordsCount || 0}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Recent Notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {notifications && notifications.length > 0 ? (
                                notifications.map((notification: any) => (
                                    <div key={notification.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0 hover:bg-slate-50 p-2 rounded-lg -mx-2 transition-colors">
                                        <div className={`h-2 w-2 mt-2 rounded-full ${notification.type === 'error' ? 'bg-red-500' : notification.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{notification.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{format(new Date(notification.created_at), 'MMM d, h:mm a')}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">No recent notifications</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
