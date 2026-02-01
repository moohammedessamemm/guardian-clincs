'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Activity, FlaskConical, Save, Pill, Plus, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Types
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
    doctor_id: string
}

interface Medication {
    name: string
    dosage: string
    frequency: string
    duration: string
}

interface Prescription {
    id: string
    issued_at: string
    medications: Medication[]
    record_id: string | null
    doctor: {
        full_name: string
    }
}

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const patientId = resolvedParams.id;

    const supabase = createClient()
    const [patient, setPatient] = useState<{ full_name: string; email: string; role: string } | null>(null)
    const [records, setRecords] = useState<MedicalRecord[]>([])
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [loading, setLoading] = useState(true)

    // SOAP Form State
    const [subjective, setSubjective] = useState('')
    const [objective, setObjective] = useState('')
    const [assessment, setAssessment] = useState('')
    const [plan, setPlan] = useState('')
    const [diagnosis, setDiagnosis] = useState('')
    const [saving, setSaving] = useState(false)

    // Prescription Form State
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false)
    const [medications, setMedications] = useState<Medication[]>([
        { name: '', dosage: '', frequency: '', duration: '' }
    ])
    const [linkedRecordId, setLinkedRecordId] = useState<string | null>(null)
    const [sendingPrescription, setSendingPrescription] = useState(false)

    useEffect(() => {
        fetchData()
    }, [patientId])

    const fetchData = async () => {
        setLoading(true)

        // Get Profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', patientId).single()
        setPatient(profile)

        // Get Medical Records
        const { data: medicalRecords } = await supabase
            .from('medical_records')
            .select('*')
            .eq('patient_id', patientId)
            .order('visit_date', { ascending: false })

        if (medicalRecords) setRecords(medicalRecords as unknown as MedicalRecord[])

        // Get Prescriptions
        const { data: prescriptionsData } = await supabase
            .from('prescriptions')
            .select(`
                *,
                doctor:doctor_id (
                    full_name
                )
            `)
            .eq('patient_id', patientId)
            .order('issued_at', { ascending: false })

        if (prescriptionsData) setPrescriptions(prescriptionsData as unknown as Prescription[])

        setLoading(false)
    }

    const handleSaveSOAP = async () => {
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase.from('medical_records').insert({
            patient_id: patientId,
            doctor_id: user.id,
            visit_date: new Date().toISOString(),
            soap_note: {
                subjective,
                objective,
                assessment,
                plan
            },
            diagnosis: diagnosis.split(',').map(d => d.trim()).filter(Boolean)
        }).select()

        if (!error && data) {
            // Reset form
            setSubjective('')
            setObjective('')
            setAssessment('')
            setPlan('')
            setDiagnosis('')

            // Refresh records
            await fetchData()

            // Ask if they want to add a prescription
            if (confirm('SOAP note saved! Would you like to add a prescription for this visit?')) {
                setLinkedRecordId(data[0].id)
                setShowPrescriptionForm(true)
            }
        } else {
            console.error(error)
            alert('Failed to save record')
        }
        setSaving(false)
    }

    const addMedication = () => {
        setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }])
    }

    const removeMedication = (index: number) => {
        if (medications.length > 1) {
            setMedications(medications.filter((_, i) => i !== index))
        }
    }

    const updateMedication = (index: number, field: keyof Medication, value: string) => {
        const updated = [...medications]
        updated[index][field] = value
        setMedications(updated)
    }

    const handleCreatePrescription = async () => {
        const validMedications = medications.filter(
            med => med.name && med.dosage && med.frequency && med.duration
        )

        if (validMedications.length === 0) {
            alert('Please add at least one complete medication')
            return
        }

        setSendingPrescription(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('prescriptions')
                .insert({
                    patient_id: patientId,
                    doctor_id: user.id,
                    medications: validMedications,
                    record_id: linkedRecordId
                })

            if (error) throw error

            // Reset form
            setMedications([{ name: '', dosage: '', frequency: '', duration: '' }])
            setLinkedRecordId(null)
            setShowPrescriptionForm(false)

            // Refresh prescriptions
            await fetchData()

            alert('✅ Prescription created successfully!')
        } catch (error) {
            console.error('Error creating prescription:', error)
            alert('Failed to create prescription. Please try again.')
        } finally {
            setSendingPrescription(false)
        }
    }

    if (loading) return <div className="p-8">Loading patient data...</div>
    if (!patient) return <div className="p-8">Patient not found</div>

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">{patient.full_name}</h1>
                    <p className="text-slate-500 mt-1">{patient.email} • <span className="capitalize">{patient.role}</span></p>
                </div>
                <Button onClick={() => setShowPrescriptionForm(true)} className="bg-[#004b87] hover:bg-[#003865] transition-all hover:scale-105 shadow-sm">
                    <Pill className="mr-2 h-4 w-4" />
                    Create Prescription
                </Button>
            </div>

            {/* Prescription Form Modal/Card */}
            {showPrescriptionForm && (
                <Card className="border-2 border-[#004b87] shadow-xl animate-in zoom-in-95 duration-200">
                    <CardHeader className="bg-blue-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-[#004b87]">Create New Prescription</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setShowPrescriptionForm(false)} className="hover:bg-red-50 hover:text-red-600 transition-colors rounded-full h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardDescription>
                            {linkedRecordId ? 'Prescription linked to recent visit' : 'Standalone prescription'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold text-slate-700">Medications</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addMedication} className="hover:bg-blue-50 text-[#004b87] border-blue-200 hover:border-[#004b87]">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Medication
                            </Button>
                        </div>

                        {medications.map((med, index) => (
                            <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm text-slate-700">Medication {index + 1}</h4>
                                    {medications.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeMedication(index)}
                                            className="hover:bg-red-50 hover:text-red-600 transition-colors h-8 w-8 p-0 text-slate-400"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Medication Name</Label>
                                        <Input
                                            value={med.name}
                                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                            placeholder="e.g., Amoxicillin"
                                            className="bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Dosage</Label>
                                        <Input
                                            value={med.dosage}
                                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                            placeholder="e.g., 500mg"
                                            className="bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Frequency</Label>
                                        <Input
                                            value={med.frequency}
                                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                            placeholder="e.g., 3 times daily"
                                            className="bg-white"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Duration</Label>
                                        <Input
                                            value={med.duration}
                                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                            placeholder="e.g., 7 days"
                                            className="bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button onClick={handleCreatePrescription} disabled={sendingPrescription} className="w-full bg-[#004b87] hover:bg-[#003865] transition-all hover:scale-[1.01] shadow-md">
                            {sendingPrescription ? 'Creating...' : 'Create Prescription'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-slate-100 p-1">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#004b87]">Overview</TabsTrigger>
                    <TabsTrigger value="soap" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#004b87]">SOAP Note Entry</TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#004b87]">Medical History</TabsTrigger>
                    <TabsTrigger value="prescriptions" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#004b87]">Prescriptions</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-semibold text-slate-700">Total Visits</CardTitle>
                                <Activity className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{records.length}</div>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-green-500">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-semibold text-slate-700">Prescriptions</CardTitle>
                                <Pill className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{prescriptions.length}</div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* SOAP ENTRY TAB */}
                <TabsContent value="soap" className="animate-in fade-in slide-in-from-left-2 duration-300">
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-[#004b87]">New Clinical Note (SOAP)</CardTitle>
                            <CardDescription>Record clinical observations and plan for today&apos;s visit.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Subjective (Symptoms)</Label>
                                    <Textarea className="focus:border-[#004b87] focus:ring-[#004b87] transition-all bg-slate-50/50" placeholder="Patient complains of..." value={subjective} onChange={e => setSubjective(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Objective (Vitals/Exam)</Label>
                                    <Textarea className="focus:border-[#004b87] focus:ring-[#004b87] transition-all bg-slate-50/50" placeholder="BP 120/80, HR 72..." value={objective} onChange={e => setObjective(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Assessment (Diagnosis)</Label>
                                    <Textarea className="focus:border-[#004b87] focus:ring-[#004b87] transition-all bg-slate-50/50" placeholder="Primary diagnosis..." value={assessment} onChange={e => setAssessment(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Plan (Treatment)</Label>
                                    <Textarea className="focus:border-[#004b87] focus:ring-[#004b87] transition-all bg-slate-50/50" placeholder="Prescribe X, follow up in Y..." value={plan} onChange={e => setPlan(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Diagnosis Tags (comma separated)</Label>
                                <Input className="focus:border-[#004b87] focus:ring-[#004b87] transition-all bg-slate-50/50" placeholder="e.g. Hypertension, Diabetes Type 2" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
                            </div>
                            <Button onClick={handleSaveSOAP} disabled={saving} className="bg-[#004b87] hover:bg-[#003865] transition-all hover:scale-[1.01] shadow-sm">
                                <Save className="mr-2 h-4 w-4" />
                                {saving ? 'Saving...' : 'Save Record'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* HISTORY TAB */}
                <TabsContent value="history" className="animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="space-y-4">
                        {records.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No medical records found for this patient.</p>
                            </div>
                        ) : records.map(record => (
                            <Card key={record.id} className="hover:shadow-md transition-all duration-300 border-slate-200 group">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                                    <CardTitle className="text-base flex justify-between items-center text-slate-800">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#004b87]"></div>
                                            <span>Visit on {new Date(record.visit_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    </CardTitle>
                                    <div className="flex gap-2 mt-2">
                                        {record.diagnosis?.map((d, i) => (
                                            <Badge key={i} variant="secondary" className="bg-blue-100 text-[#004b87] hover:bg-blue-200 border-blue-200">{d}</Badge>
                                        ))}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4 text-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <span className="font-bold text-[#004b87] text-xs uppercase tracking-wide">Subjective</span>
                                            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{record.soap_note?.subjective}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-bold text-[#004b87] text-xs uppercase tracking-wide">Objective</span>
                                            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{record.soap_note?.objective}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-bold text-[#004b87] text-xs uppercase tracking-wide">Assessment</span>
                                            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{record.soap_note?.assessment}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="font-bold text-[#004b87] text-xs uppercase tracking-wide">Plan</span>
                                            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{record.soap_note?.plan}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* PRESCRIPTIONS TAB */}
                <TabsContent value="prescriptions" className="animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="space-y-4">
                        {prescriptions.length === 0 ? (
                            <Card className="border-dashed border-2 bg-slate-50">
                                <CardContent className="py-12 text-center text-slate-500">
                                    <Pill className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No prescriptions yet.</p>
                                    <Button variant="link" onClick={() => setShowPrescriptionForm(true)} className="text-[#004b87]">
                                        Create the first prescription
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            prescriptions.map((px) => (
                                <Card key={px.id} className="border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                                    <CardHeader className="bg-slate-50/80 pb-4 border-b border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-2">
                                                <div className="p-1.5 bg-blue-100 rounded-md group-hover:bg-[#004b87] group-hover:text-white transition-colors duration-300">
                                                    <Pill className="h-5 w-5 text-[#004b87] group-hover:text-white" />
                                                </div>
                                                <CardTitle className="text-lg text-slate-800">Prescription</CardTitle>
                                            </div>
                                            <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200 shadow-sm">
                                                {new Date(px.issued_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="mt-1 font-medium text-slate-600 flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>Prescribed by: {px.doctor?.full_name}</span>
                                            {px.record_id && (
                                                <Badge variant="outline" className="text-[10px] h-5 bg-blue-50 text-blue-700 border-blue-200">
                                                    Linked to visit
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-slate-100">
                                            {px.medications.map((med, idx) => (
                                                <div key={idx} className="p-4 flex justify-between items-start hover:bg-slate-50 transition-colors">
                                                    <div>
                                                        <p className="font-semibold text-base text-slate-800">{med.name}</p>
                                                        <p className="text-sm text-slate-500">{med.dosage}</p>
                                                    </div>
                                                    <div className="text-right text-sm">
                                                        <p className="font-medium text-slate-700">{med.frequency}</p>
                                                        <p className="text-slate-400">{med.duration}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
