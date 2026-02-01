'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { FlaskConical, FileText, Image as ImageIcon, Download, Eye, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LabResult {
    id: string
    test_name: string
    test_date: string
    file_url: string
    file_type: string
    notes: string
    created_at: string
    doctor: {
        full_name: string
    }
}

export default function PatientLabsPage() {
    const supabase = createClient()
    const [labResults, setLabResults] = useState<LabResult[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLabResults()
    }, [])

    const fetchLabResults = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('lab_results')
                .select(`
                    *,
                    doctor:doctor_id ( full_name )
                `)
                .eq('patient_id', user.id)
                .order('test_date', { ascending: false })

            if (data) setLabResults(data as unknown as LabResult[])
        } catch (error) {
            console.error('Error fetching lab results:', error)
        } finally {
            setLoading(false)
        }
    }

    const downloadFile = async (fileUrl: string, fileName: string) => {
        try {
            const response = await fetch(fileUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = fileName
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Error downloading file:', error)
            alert('Failed to download file')
        }
    }

    const viewFile = (fileUrl: string) => {
        window.open(fileUrl, '_blank')
    }

    if (loading) return <div className="p-12 text-center text-slate-400">Loading lab results...</div>

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lab Results</h1>
                    <p className="text-slate-500 mt-1">Access reports and findings from your tests.</p>
                </div>
            </div>

            {labResults.length === 0 ? (
                <Card className="border-dashed bg-slate-50/50">
                    <CardContent className="p-12 text-center">
                        <FlaskConical className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-lg font-medium text-slate-700">No lab results available</p>
                        <p className="text-sm text-slate-500 mt-2">Reports uploaded by your doctor will show up here.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {labResults.map((result) => {
                        const isPdf = result.file_type === 'pdf'
                        return (
                            <Card key={result.id} className="group overflow-hidden border-slate-200 hover:border-[#004b87]/50 hover:shadow-lg transition-all duration-300">
                                <CardHeader className="p-0">
                                    <div className="bg-slate-100 h-32 flex items-center justify-center group-hover:bg-blue-50 transition-colors relative">
                                        {isPdf ? (
                                            <FileText className="h-12 w-12 text-slate-400 group-hover:text-[#004b87] transition-colors" />
                                        ) : (
                                            <ImageIcon className="h-12 w-12 text-slate-400 group-hover:text-[#004b87] transition-colors" />
                                        )}
                                        <Badge className="absolute top-3 right-3 bg-white/90 text-slate-700 hover:bg-white shadow-sm font-mono text-xs uppercase tracking-wide">
                                            {result.file_type}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5">
                                    <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1" title={result.test_name}>
                                        {result.test_name}
                                    </h3>

                                    <div className="space-y-2 mt-3 mb-5">
                                        <div className="flex items-center text-sm text-slate-500">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {new Date(result.test_date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center text-sm text-slate-500">
                                            <User className="w-4 h-4 mr-2" />
                                            Dr. {result.doctor?.full_name}
                                        </div>
                                    </div>

                                    {result.notes && (
                                        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg mb-4 line-clamp-2 italic">
                                            "{result.notes}"
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => viewFile(result.file_url)}
                                            className="w-full"
                                        >
                                            <Eye className="h-4 w-4 mr-2" /> View
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => downloadFile(result.file_url, `${result.test_name}.${result.file_type}`)}
                                            className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100"
                                        >
                                            <Download className="h-4 w-4 mr-2" /> Save
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
