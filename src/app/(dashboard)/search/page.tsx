import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { q: string }
}) {
    const query = searchParams.q
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch profile for role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const role = profile?.role || 'patient'
    const searchResults: any[] = []

    if (query) {
        if (role === 'patient') {
            // Search Appointments (My appointments)
            const { data: appointments } = await supabase
                .from('appointments')
                .select(`
                    id, start_time, status, reason,
                    doctor:doctor_id(full_name)
                `)
                .eq('patient_id', user.id)
                .ilike('reason', `%${query}%`)
                .limit(5)

            if (appointments) {
                searchResults.push(...appointments.map((a: any) => ({ ...a, type: 'appointment', title: `Consultation: ${a.doctor?.full_name}`, subtitle: a.reason })))
            }

            // Search Doctors (for booking) - Placeholder if doctor table existed search logic would be here
            // Checking profiles for doctors
            const { data: doctors } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('role', 'doctor')
                .ilike('full_name', `%${query}%`)
                .limit(5)

            if (doctors) {
                searchResults.push(...doctors.map(d => ({ ...d, type: 'doctor', title: `Dr. ${d.full_name}`, subtitle: 'Medical Professional' })))
            }
        }
        else if (role === 'doctor') {
            // Search Patients
            // Warning: This is a simplified search. Ideally we join appointments or use a more comprehensive search.
            // Searching profiles that are patients
            const { data: patients } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('role', 'patient')
                .ilike('full_name', `%${query}%`)
                .limit(5)

            if (patients) {
                searchResults.push(...patients.map(p => ({ ...p, type: 'patient', title: p.full_name, subtitle: p.email })))
            }

            // Search My Appointments (by patient name or reason)
            // Note: Supabase doesn't support easy deep joining ILIKE filtering on related tables in one go efficiently without RPC or complex query.
            // We'll search by reason for now.
            const { data: appointments } = await supabase
                .from('appointments')
                .select(`
                    id, start_time, status, reason,
                    patient:patient_id(full_name)
                `)
                .eq('doctor_id', user.id)
                .ilike('reason', `%${query}%`)
                .limit(5)

            if (appointments) {
                searchResults.push(...appointments.map((a: any) => ({ ...a, type: 'appointment', title: `Appt: ${a.patient?.full_name}`, subtitle: a.reason })))
            }
        }
        else {
            // Admin / Staff - Search everything (Users)
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email, role')
                .ilike('full_name', `%${query}%`)
                .limit(10)

            if (profiles) {
                searchResults.push(...profiles.map(p => ({ ...p, type: 'user', title: p.full_name, subtitle: `${p.role} • ${p.email}` })))
            }
        }
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Search Results</h1>
                <p className="text-slate-500">
                    {query ? `Showing results for "${query}"` : 'Please enter a search term'}
                </p>
            </div>

            {query && searchResults.length === 0 && (
                <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500">No results found matching your query.</p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {searchResults.map((item, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={cn(
                                "p-3 rounded-lg",
                                item.type === 'appointment' ? "bg-blue-50 text-blue-600" :
                                    item.type === 'doctor' ? "bg-purple-50 text-purple-600" :
                                        item.type === 'patient' ? "bg-emerald-50 text-emerald-600" :
                                            "bg-slate-100 text-slate-600"
                            )}>
                                {item.type === 'appointment' && <Calendar className="w-5 h-5" />}
                                {item.type === 'doctor' && <User className="w-5 h-5" />}
                                {item.type === 'patient' && <User className="w-5 h-5" />}
                                {item.type === 'user' && <User className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 group-hover:text-[#004b87] transition-colors">{item.title}</h3>
                                <p className="text-sm text-slate-500">{item.subtitle}</p>
                                {item.start_time && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        {format(new Date(item.start_time), 'PPP p')}
                                    </p>
                                )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#004b87] group-hover:translate-x-1 transition-all" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}
