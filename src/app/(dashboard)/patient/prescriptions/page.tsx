'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Pill, Clock, Calendar, CheckCircle2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface Prescription {
    id: string
    issued_at: string
    medications: Array<{
        name: string
        dosage: string
        frequency: string
        duration: string
    }>
    doctor: {
        full_name: string
    }
}

export default function PatientPrescriptionsPage() {
    const supabase = createClient()
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRx = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('prescriptions')
                .select(`
                    *,
                    doctor:doctor_id ( full_name )
                `)
                .eq('patient_id', user.id)
                .order('issued_at', { ascending: false })

            if (data) setPrescriptions(data as unknown as Prescription[])
            setLoading(false)
        }
        fetchRx()
    }, [supabase])

    if (loading) return <div className="p-12 text-center text-slate-400">Loading prescriptions...</div>

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Prescriptions</h1>
                    <p className="text-slate-500 mt-1">Manage your active medications and history.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {prescriptions.length} Active Scripts
                </div>
            </div>

            {prescriptions.length === 0 ? (
                <Card className="border-dashed bg-slate-50/50">
                    <CardContent className="p-12 text-center">
                        <Pill className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-lg font-medium text-slate-700">No active prescriptions</p>
                        <p className="text-sm text-slate-500 mt-2">Medications prescribed by your doctor will appear here.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    {prescriptions.map((px) => (
                        <Card key={px.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-white pb-4 border-b border-slate-100">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100 text-[#004b87]">
                                            <Pill className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold text-slate-900">Prescription</CardTitle>
                                            <CardDescription className="text-xs">
                                                ID: #{px.id.slice(0, 8)} • {new Date(px.issued_at).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-white text-slate-500 font-normal">
                                        Dr. {px.doctor?.full_name}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {px.medications.map((med, idx) => (
                                        <div key={idx} className="p-5 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-[#004b87]">{med.name}</h3>
                                                <span className="font-mono text-sm font-medium bg-slate-100 px-2 py-1 rounded text-slate-700">
                                                    {med.dosage}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mt-3">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    {med.frequency}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    {med.duration}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
