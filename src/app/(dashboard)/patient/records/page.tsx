'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Calendar, User, FileText, Activity } from 'lucide-react'
import { format } from 'date-fns'

interface MedicalRecord {
    id: string
    visit_date: string
    soap_note: {
        subjective: string
        objective: string
        assessment: string
        plan: string
    }
    diagnosis: string[]
    doctor: {
        full_name: string
    }
}

export default function PatientRecordsPage() {
    const supabase = createClient()
    const [records, setRecords] = useState<MedicalRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    useEffect(() => {
        const fetchRecords = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('medical_records')
                .select(`
                    *,
                    doctor:doctor_id ( full_name )
                `)
                .eq('patient_id', user.id)
                .order('visit_date', { ascending: false })

            if (data) setRecords(data as unknown as MedicalRecord[])
            setLoading(false)
        }
        fetchRecords()
    }, [supabase])

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setExpandedId(expandedId === id ? null : id)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-slate-400">Loading your medical history...</div>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Medical History</h1>
                <p className="text-slate-500 mt-1">A complete timeline of your visits, diagnoses, and treatments.</p>
            </div>

            {/* Timeline View */}
            <div className="relative border-l border-slate-200 ml-4 space-y-8 pb-12">
                {records.length === 0 ? (
                    <div className="pl-8 pt-2">
                        <Card className="border-dashed bg-slate-50/50">
                            <CardContent className="p-12 text-center">
                                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-lg font-medium text-slate-700">No medical records found</p>
                                <p className="text-sm text-slate-500 mt-2">Your visit notes will appear here.</p>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    records.map((record) => {
                        const isExpanded = expandedId === record.id
                        const visitDate = new Date(record.visit_date)

                        return (
                            <div key={record.id} className="relative pl-8">
                                {/* Timeline Dot */}
                                <div className={`absolute -left-[9px] top-6 h-4 w-4 rounded-full border-2 border-white transition-colors ${isExpanded ? 'bg-[#004b87]' : 'bg-slate-300'}`} />

                                <Card
                                    className={`transition-all duration-300 cursor-pointer overflow-hidden ${isExpanded ? 'shadow-lg ring-1 ring-[#004b87]/10' : 'shadow-sm hover:shadow-md border-slate-200'}`}
                                    onClick={(e) => toggleExpand(record.id, e)}
                                >
                                    <CardHeader className="p-6 bg-white">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-bold text-[#004b87] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wide">
                                                        {format(visitDate, 'MMM d, yyyy')}
                                                    </span>
                                                    <span className="text-sm text-slate-400">
                                                        {format(visitDate, 'h:mm a')}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                    Visit with Dr. {record.doctor?.full_name || 'Unknown'}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {record.diagnosis && record.diagnosis.length > 0 && (
                                                    <div className="flex gap-1">
                                                        {record.diagnosis.slice(0, 2).map((d, i) => (
                                                            <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                                                                {d}
                                                            </Badge>
                                                        ))}
                                                        {record.diagnosis.length > 2 && (
                                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                                                +{record.diagnosis.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                                <button onClick={(e) => toggleExpand(record.id, e)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                                    {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
                                                </button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {isExpanded && (
                                        <CardContent className="p-6 pt-0 bg-slate-50/30 animate-in slide-in-from-top-4 duration-300">
                                            <div className="h-px w-full bg-slate-100 mb-6" />

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm text-blue-600 mt-1">
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-900">Patient Complaint (Subjective)</h4>
                                                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{record.soap_note?.subjective || 'No notes.'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm text-emerald-600 mt-1">
                                                            <Activity className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-900">Observations (Objective)</h4>
                                                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{record.soap_note?.objective || 'No notes.'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                        <h4 className="text-sm font-bold text-amber-700 mb-2">Assessment</h4>
                                                        <p className="text-sm text-slate-700">{record.soap_note?.assessment || 'No assessment recorded.'}</p>
                                                    </div>

                                                    <div className="bg-[#f0f9ff] p-4 rounded-xl border border-blue-100">
                                                        <h4 className="text-sm font-bold text-[#004b87] mb-2">Treatment Plan</h4>
                                                        <p className="text-sm text-slate-700">{record.soap_note?.plan || 'No plan recorded.'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
