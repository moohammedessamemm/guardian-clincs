'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'


import { createClient } from '@/lib/supabase/client'
import { countries } from '@/lib/data/countries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, ArrowLeft, CheckCircle2, User, FileText, HeartPulse } from 'lucide-react'

// Steps Config
const STEPS = [
    { number: 1, title: 'Account', icon: User },
    { number: 2, title: 'Personal', icon: FileText },
    { number: 3, title: 'Emergency', icon: HeartPulse }
]

export default function RegisterPage() {
    const router = useRouter()
    const supabase = createClient()

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
        phone: '',
        dob: '',
        gender: '',
        country: '',
        ec_name: '',
        ec_phone: '',
        ec_relation: '',
        gdpr_consent: false
    })

    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleSelectChange = (val: string, field: string) => {
        setFormData(prev => ({ ...prev, [field]: val }))
    }

    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, gdpr_consent: checked }))
    }

    const validateStep = (step: number) => {
        setError(null)
        if (step === 1) {
            if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone || !formData.password || !formData.confirm_password) {
                setError("Please fill in all required fields.")
                return false
            }
            if (formData.password !== formData.confirm_password) {
                setError("Passwords do not match.")
                return false
            }
            if (!formData.gdpr_consent) {
                setError("You must consent to GDPR processing.")
                return false
            }
        }
        if (step === 2) {
            if (!formData.dob) {
                setError("Date of Birth is required.")
                return false
            }
        }
        return true
    }

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault()
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault()
        setCurrentStep(prev => prev - 1)
        setError(null)
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateStep(3)) return



        setLoading(true)
        setError(null)

        const fullName = `${formData.first_name} ${formData.middle_name ? formData.middle_name + ' ' : ''}${formData.last_name}`.trim()

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'patient',
                        phone: formData.phone,
                    },
                },
            })

            if (signUpError) throw signUpError

            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                await supabase
                    .from('profiles')
                    .update({
                        first_name: formData.first_name,
                        middle_name: formData.middle_name,
                        last_name: formData.last_name,
                        full_name: fullName,
                        phone: formData.phone,
                        date_of_birth: formData.dob,
                        gender: formData.gender,
                        country: formData.country,
                        emergency_contact: {
                            name: formData.ec_name,
                            phone: formData.ec_phone,
                            relation: formData.ec_relation
                        }
                    })
                    .eq('id', user.id)
            }

            router.push('/login?registered=true')

        } catch (err: unknown) {
            console.error('Registration Error:', err)
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-900">
            {/* Immersive Background (Fixed) */}
            <div className="absolute inset-0 z-0">
                {/* Animated Background Image (Doctor) */}
                <div className="absolute inset-0 bg-[url('/auth-bg.jpg')] bg-cover bg-center opacity-50 animate-ken-burns"></div>

                {/* Gradient Overlay (Tint) */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-[#004b87]/80 to-blue-950/90 mix-blend-multiply"></div>

                {/* Floating Particles (Subtle) */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-0"></div>
                </div>
            </div>

            <Link href="/login" className="absolute top-8 left-8 text-white/80 hover:text-white flex items-center gap-2 transition-all hover:-translate-x-1 duration-200 z-50 bg-black/20 hover:bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>

            {/* Floating Glass Card */}
            <div className="relative z-10 w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-white/20">
                <div className="flex flex-col md:flex-row h-full">

                    {/* Left Panel: Branding & Steps (Desktop) */}
                    <div className="bg-slate-50/50 p-8 md:w-1/3 border-r border-slate-100 flex flex-col items-center justify-center space-y-8">
                        <div className="text-center space-y-4">
                            {/* Logo */}
                            <Link href="/" className="mb-12 block transform hover:scale-105 transition-transform duration-300">
                                <div className="relative w-24 h-24 bg-white rounded-xl shadow-sm p-2 ring-1 ring-slate-100">
                                    <Image src="/guardian-logo.png" alt="Guardian Clinics" fill className="object-contain" />
                                </div>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Join Guardian</h1>
                                <p className="text-slate-500 text-sm mt-1">Healthcare Reimagined</p>
                            </div>
                        </div>

                        {/* Vertical Steps (Desktop optimized) */}
                        <div className="w-full space-y-2">
                            {STEPS.map((step) => {
                                const isActive = currentStep === step.number
                                const isCompleted = currentStep > step.number
                                const Icon = step.icon

                                return (
                                    <div key={step.number} className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-white shadow-md' : 'text-slate-400'}`}>
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300
                                            ${isActive ? 'bg-[#004b87] text-white border-[#004b87]' :
                                                isCompleted ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 bg-white'}
                                        `}>
                                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{step.title}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right Panel: Form */}
                    <div className="p-8 md:w-2/3 bg-white">
                        <form onSubmit={handleRegister} className="h-full flex flex-col justify-between space-y-6">
                            <div>
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">
                                        {currentStep === 1 && "Account Information"}
                                        {currentStep === 2 && "Personal Details"}
                                        {currentStep === 3 && "Emergency Contact"}
                                    </h2>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 italic flex items-center gap-2">
                                        <span className="font-bold">Error:</span> {error}
                                    </div>
                                )}

                                {/* Step 1: Account Information */}
                                {currentStep === 1 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="first_name">First Name *</Label>
                                                <Input id="first_name" value={formData.first_name} onChange={handleChange} className="bg-slate-50 focus:bg-white transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="middle_name">Middle</Label>
                                                <Input id="middle_name" value={formData.middle_name} onChange={handleChange} className="bg-slate-50 focus:bg-white transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="last_name">Last Name *</Label>
                                                <Input id="last_name" value={formData.last_name} onChange={handleChange} className="bg-slate-50 focus:bg-white transition-colors" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address *</Label>
                                                <Input id="email" type="email" value={formData.email} onChange={handleChange} className="bg-slate-50 focus:bg-white transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number *</Label>
                                                <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} className="bg-slate-50 focus:bg-white transition-colors" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="password">Password *</Label>
                                                <Input id="password" type="password" value={formData.password} onChange={handleChange} className="bg-slate-50 focus:bg-white transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirm_password">Confirm Password *</Label>
                                                <Input id="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} className="bg-slate-50 focus:bg-white transition-colors" />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 pt-2">
                                            <Checkbox id="gdpr_consent" onCheckedChange={handleCheckboxChange} checked={formData.gdpr_consent} />
                                            <Label htmlFor="gdpr_consent" className="text-sm cursor-pointer text-slate-600">
                                                I consent to the processing of personal data.
                                            </Label>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Personal Information */}
                                {currentStep === 2 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="dob">Date of Birth *</Label>
                                                <Input id="dob" type="date" value={formData.dob} onChange={handleChange} className="bg-slate-50 focus:bg-white transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="gender">Gender</Label>
                                                <Select value={formData.gender} onValueChange={(val) => handleSelectChange(val, 'gender')}>
                                                    <SelectTrigger className="bg-slate-50 focus:bg-white transition-colors">
                                                        <SelectValue placeholder="Select Gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="country">Country</Label>
                                            <Select value={formData.country} onValueChange={(val) => handleSelectChange(val, 'country')}>
                                                <SelectTrigger className="bg-slate-50">
                                                    <SelectValue placeholder="Select Country" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px]">
                                                    {countries.map((c) => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Emergency Contact */}
                                {currentStep === 3 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-2">
                                            <Label htmlFor="ec_name">Emergency Contact Name</Label>
                                            <Input id="ec_name" value={formData.ec_name} onChange={handleChange} className="bg-slate-50 focus:bg-white transition-colors" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="ec_phone">Contact Phone</Label>
                                                <Input id="ec_phone" value={formData.ec_phone} onChange={handleChange} className="bg-slate-50 focus:bg-white transition-colors" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="ec_relation">Relationship to Patient</Label>
                                                <Input id="ec_relation" value={formData.ec_relation} onChange={handleChange} className="bg-slate-50 focus:bg-white transition-colors" />
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                                {currentStep > 1 ? (
                                    <Button type="button" variant="outline" onClick={handleBack} disabled={loading} className="border-slate-200 text-slate-600 hover:bg-slate-50">
                                        Back
                                    </Button>
                                ) : (
                                    <span />
                                )}

                                {currentStep < 3 ? (
                                    <Button type="button" onClick={handleNext} className="bg-[#004b87] hover:bg-[#003865] px-8 rounded-full transition-all hover:scale-105 shadow-md">
                                        Continue
                                    </Button>
                                ) : (
                                    <Button type="submit" className="bg-[#004b87] hover:bg-[#003865] px-8 rounded-full transition-all hover:scale-105 shadow-md" disabled={loading}>
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Registration"}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
