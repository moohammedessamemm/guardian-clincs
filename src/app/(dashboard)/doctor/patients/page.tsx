'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, User as UserIcon, Mail, Phone, ArrowRight } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface PatientProfile {
    id: string
    full_name: string
    email: string
    phone: string
}

export default function DoctorPatientsPage() {
    const supabase = createClient()
    const [patients, setPatients] = useState<PatientProfile[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true)
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'patient')
                .ilike('full_name', `%${searchTerm}%`)
                .limit(20) // Pagination could be added later

            if (data) setPatients(data as unknown as PatientProfile[])
            setLoading(false)
        }

        const handler = setTimeout(fetchPatients, 500)
        return () => clearTimeout(handler)
    }, [searchTerm, supabase])

    return (
        <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Patient Directory</h1>
                    <p className="text-slate-500 mt-1">Search and view patient medical records.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-lg group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-[#004b87] transition-colors" />
                <Input
                    placeholder="Search by patient name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 bg-white border-slate-200 focus:border-[#004b87] focus:ring-[#004b87] shadow-sm rounded-xl transition-all focus:shadow-md"
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-[#004b87]" /></div>
            ) : patients.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <UserIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No patients found matching "{searchTerm}".</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patients.map((patient) => (
                        <Card key={patient.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm group-hover:scale-110 transition-transform duration-300">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-[#004b87] font-bold">
                                                {patient.full_name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold text-slate-900 leading-tight group-hover:text-[#004b87] transition-colors">{patient.full_name}</h3>
                                            <p className="text-xs text-slate-400 mt-1">Patient ID: {patient.id.slice(0, 8)}...</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2">
                                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg group-hover:bg-blue-50/50 transition-colors">
                                        <Mail className="w-4 h-4 text-slate-400 group-hover:text-[#004b87]" />
                                        <span className="truncate">{patient.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg group-hover:bg-blue-50/50 transition-colors">
                                        <Phone className="w-4 h-4 text-slate-400 group-hover:text-[#004b87]" />
                                        <span>{patient.phone || 'No phone provided'}</span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Button className="w-full bg-white text-[#004b87] border border-blue-100 hover:bg-blue-50 hover:border-[#004b87] group-hover:bg-[#004b87] group-hover:text-white transition-all duration-300 shadow-sm" asChild>
                                        <Link href={`/doctor/patients/${patient.id}`}>
                                            View Full Profile <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
