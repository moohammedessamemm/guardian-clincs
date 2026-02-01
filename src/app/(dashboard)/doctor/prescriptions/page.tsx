'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pill, Plus, X, Send } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Patient {
    id: string
    full_name: string
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
    patient: {
        full_name: string
    }
}

export default function DoctorPrescriptionsPage() {
    const supabase = createClient()
    const [patients, setPatients] = useState<Patient[]>([])
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [searchPatient, setSearchPatient] = useState('')
    // Form state
    const [selectedPatient, setSelectedPatient] = useState('')
    const [medications, setMedications] = useState<Medication[]>([
        { name: '', dosage: '', frequency: '', duration: '' }
    ])

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

            // Fetch prescriptions issued by this doctor
            const { data: prescriptionsData } = await supabase
                .from('prescriptions')
                .select(`
                    *,
                    patient:patient_id (
                        full_name
                    )
                `)
                .eq('doctor_id', user.id)
                .order('issued_at', { ascending: false })

            if (prescriptionsData) setPrescriptions(prescriptionsData as unknown as Prescription[])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
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


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        console.log('Starting prescription submission...')

        if (!selectedPatient) {
            alert('Please select a patient')
            return
        }

        // Validate medications
        const validMedications = medications.filter(
            med => med.name && med.dosage && med.frequency && med.duration
        )

        console.log('Valid medications:', validMedications)

        if (validMedications.length === 0) {
            alert('Please add at least one complete medication')
            return
        }

        setSending(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            console.log('Inserting prescription for patient:', selectedPatient)
            console.log('Doctor ID:', user.id)
            console.log('Medications:', validMedications)

            const { data, error } = await supabase
                .from('prescriptions')
                .insert({
                    patient_id: selectedPatient,
                    doctor_id: user.id,
                    medications: validMedications,
                    record_id: null
                })
                .select()

            if (error) {
                console.error('Supabase error:', error)
                throw error
            }

            console.log('Prescription created successfully:', data)

            // Reset form
            setSelectedPatient('')
            setMedications([{ name: '', dosage: '', frequency: '', duration: '' }])
            setSearchPatient('')

            // Refresh prescriptions
            await fetchData()

            alert('✅ Prescription sent successfully to patient!')
        } catch (error: any) {
            console.error('Error sending prescription:', error)
            const errorMessage = error?.message || 'Unknown error'
            const errorDetails = error?.details || ''
            const errorHint = error?.hint || ''

            alert(`❌ Failed to send prescription.\n\nError: ${errorMessage}\n${errorDetails}\n${errorHint}\n\nPlease check the browser console for more details.`)
        } finally {
            setSending(false)
        }
    }


    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Prescription Management</h1>
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Prescription Management</h1>
                <Badge variant="outline" className="text-sm border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                    <Pill className="mr-2 h-4 w-4" />
                    {prescriptions.length} Prescriptions Issued
                </Badge>
            </div>

            {/* Create Prescription Form */}
            <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                        <Send className="h-5 w-5 text-[#004b87]" />
                        Create New Prescription
                    </CardTitle>
                    <CardDescription>
                        Create and send a prescription to your patient
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="patient">Select Patient * ({patients.length} patients)</Label>
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

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Medications *</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addMedication}
                                    className="hover:bg-blue-50 hover:text-[#004b87] border-blue-200 transition-all hover:scale-[1.02]"
                                >
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
                                                className="hover:bg-red-50 hover:text-red-600 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor={`med-name-${index}`}>Medication Name</Label>
                                            <Input
                                                id={`med-name-${index}`}
                                                value={med.name}
                                                onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                                placeholder="e.g., Amoxicillin"
                                                required
                                                className="bg-white focus:border-[#004b87] focus:ring-[#004b87] transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`med-dosage-${index}`}>Dosage</Label>
                                            <Input
                                                id={`med-dosage-${index}`}
                                                value={med.dosage}
                                                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                                placeholder="e.g., 500mg"
                                                required
                                                className="bg-white focus:border-[#004b87] focus:ring-[#004b87] transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`med-frequency-${index}`}>Frequency</Label>
                                            <Input
                                                id={`med-frequency-${index}`}
                                                value={med.frequency}
                                                onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                                placeholder="e.g., 3 times daily"
                                                required
                                                className="bg-white focus:border-[#004b87] focus:ring-[#004b87] transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`med-duration-${index}`}>Duration</Label>
                                            <Input
                                                id={`med-duration-${index}`}
                                                value={med.duration}
                                                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                                placeholder="e.g., 7 days"
                                                required
                                                className="bg-white focus:border-[#004b87] focus:ring-[#004b87] transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button type="submit" disabled={sending} className="bg-[#004b87] hover:bg-[#003865] transition-all hover:scale-[1.02] active:scale-[0.98]">
                            {sending ? (
                                <>Sending...</>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Prescription
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Issued Prescriptions */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="text-slate-800">Issued Prescriptions</CardTitle>
                    <CardDescription>
                        View all prescriptions you've issued to patients
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {prescriptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8 bg-slate-50 rounded-lg border border-dashed">
                            No prescriptions issued yet. Create your first prescription above.
                        </p>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {prescriptions.map((px) => (
                                <Card key={px.id} className="overflow-hidden border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
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
                                        <CardDescription className="mt-1 font-medium text-slate-600">
                                            Patient: {px.patient?.full_name}
                                        </CardDescription>
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
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
