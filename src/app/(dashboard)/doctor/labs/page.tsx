'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FlaskConical, Upload, FileText, Image as ImageIcon, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface Patient {
    id: string
    full_name: string
}

interface LabResult {
    id: string
    test_name: string
    test_date: string
    file_url: string
    file_type: string
    notes: string
    created_at: string
    patient: {
        full_name: string
    }
}

export default function DoctorLabsPage() {
    const supabase = createClient()
    const [patients, setPatients] = useState<Patient[]>([])
    const [labResults, setLabResults] = useState<LabResult[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [searchPatient, setSearchPatient] = useState('')
    // Form state
    const [selectedPatient, setSelectedPatient] = useState('')
    const [testName, setTestName] = useState('')
    const [testDate, setTestDate] = useState('')
    const [notes, setNotes] = useState('')
    const [file, setFile] = useState<File | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch all patients
            const { data: patientsData } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('role', 'patient')
                .order('full_name')

            if (patientsData) setPatients(patientsData)

            // Fetch lab results uploaded by this doctor
            const { data: labData } = await supabase
                .from('lab_results')
                .select(`
                    *,
                    patient:patient_id (
                        full_name
                    )
                `)
                .eq('doctor_id', user.id)
                .order('created_at', { ascending: false })

            if (labData) setLabResults(labData as unknown as LabResult[])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            const fileType = selectedFile.type

            // Validate file type
            if (!fileType.includes('pdf') && !fileType.includes('image')) {
                toast.warning('Please upload a PDF or image file')
                return
            }

            setFile(selectedFile)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedPatient || !testName || !testDate || !file) {
            toast.warning('Please fill in all required fields and select a file')
            return
        }

        setUploading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Upload file to Supabase Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${selectedPatient}/${Date.now()}.${fileExt}`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('lab-results')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('lab-results')
                .getPublicUrl(fileName)

            // Save lab result to database
            const fileType = file.type.includes('pdf') ? 'pdf' : 'image'

            const { error: insertError } = await supabase
                .from('lab_results')
                .insert({
                    patient_id: selectedPatient,
                    doctor_id: user.id,
                    test_name: testName,
                    test_date: testDate,
                    file_url: publicUrl,
                    file_type: fileType,
                    notes: notes
                })

            if (insertError) throw insertError

            // Reset form
            setSelectedPatient('')
            setTestName('')
            setTestDate('')
            setNotes('')
            setFile(null)

            // Refresh lab results
            await fetchData()

            toast.success('Lab result uploaded successfully!')
        } catch (error) {
            console.error('Error uploading lab result:', error)
            toast.error('Failed to upload lab result. Please try again.')
        } finally {
            setUploading(false)
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
            toast.error('Failed to download file')
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Lab Results Management</h1>
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Lab Results Management</h1>
                <Badge variant="outline" className="text-sm border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                    <FlaskConical className="mr-2 h-4 w-4" />
                    {labResults.length} Results Uploaded
                </Badge>
            </div>

            {/* Upload Form */}
            <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                        <Upload className="h-5 w-5 text-[#004b87]" />
                        Upload Lab Result
                    </CardTitle>
                    <CardDescription>
                        Upload lab results as PDF or image files for your patients
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="patient">Patient * ({patients.length} patients)</Label>
                                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                                    <SelectTrigger id="patient" className="focus:ring-[#004b87] transition-all">
                                        <SelectValue placeholder="Search and select patient..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="px-2 pb-2">
                                            <Input
                                                placeholder="Search patient name..."
                                                value={searchPatient}
                                                onChange={(e) => setSearchPatient(e.target.value)}
                                                className="h-8 border-slate-200 focus:border-[#004b87]"
                                            />
                                        </div>
                                        <div className="max-h-[200px] overflow-y-auto">
                                            {patients
                                                .filter(patient =>
                                                    patient.full_name.toLowerCase().includes(searchPatient.toLowerCase())
                                                )
                                                .map((patient) => (
                                                    <SelectItem key={patient.id} value={patient.id} className="cursor-pointer hover:bg-slate-50">
                                                        {patient.full_name}
                                                    </SelectItem>
                                                ))}
                                            {patients.filter(patient =>
                                                patient.full_name.toLowerCase().includes(searchPatient.toLowerCase())
                                            ).length === 0 && (
                                                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                                        No patients found
                                                    </div>
                                                )}
                                        </div>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="testName">Test Name *</Label>
                                <Input
                                    id="testName"
                                    value={testName}
                                    onChange={(e) => setTestName(e.target.value)}
                                    placeholder="e.g., Blood Test, X-Ray"
                                    required
                                    className="focus:border-[#004b87] focus:ring-[#004b87] transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="testDate">Test Date *</Label>
                                <Input
                                    id="testDate"
                                    type="date"
                                    value={testDate}
                                    onChange={(e) => setTestDate(e.target.value)}
                                    required
                                    className="focus:border-[#004b87] focus:ring-[#004b87] transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file">File (PDF or Image) *</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    accept=".pdf,image/*"
                                    onChange={handleFileChange}
                                    required
                                    className="file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-3 file:text-sm file:font-semibold hover:file:bg-blue-100 transition-all cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any additional notes about the test results..."
                                rows={3}
                                className="focus:border-[#004b87] focus:ring-[#004b87] transition-all"
                            />
                        </div>

                        <Button type="submit" disabled={uploading} className="bg-[#004b87] hover:bg-[#003865] transition-all hover:scale-[1.02]">
                            {uploading ? (
                                <>Uploading...</>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Lab Result
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Lab Results List */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="text-slate-800">Uploaded Lab Results</CardTitle>
                    <CardDescription>
                        View and manage all lab results you've uploaded
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {labResults.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8 bg-slate-50 rounded-lg border border-dashed">
                            No lab results uploaded yet. Upload your first lab result above.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {labResults.map((result) => (
                                <div
                                    key={result.id}
                                    className="flex items-center justify-between border border-slate-100 rounded-lg p-4 hover:bg-slate-50 hover:shadow-md hover:border-slate-200 transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                            {result.file_type === 'pdf' ? (
                                                <FileText className="h-6 w-6 text-blue-600" />
                                            ) : (
                                                <ImageIcon className="h-6 w-6 text-blue-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 group-hover:text-[#004b87] transition-colors">{result.test_name}</p>
                                            <p className="text-sm text-slate-500">
                                                Patient: <span className="font-medium text-slate-700">{result.patient?.full_name}</span>
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Test Date: {new Date(result.test_date).toLocaleDateString()} •
                                                Uploaded: {new Date(result.created_at).toLocaleDateString()}
                                            </p>
                                            {result.notes && (
                                                <p className="text-xs text-slate-500 mt-2 bg-slate-100 p-2 rounded block">
                                                    <span className="font-semibold px-1">Note:</span> {result.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="hover:bg-[#004b87] hover:text-white transition-colors border-slate-200"
                                        onClick={() => downloadFile(result.file_url, `${result.test_name}.${result.file_type === 'pdf' ? 'pdf' : 'jpg'}`)}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
