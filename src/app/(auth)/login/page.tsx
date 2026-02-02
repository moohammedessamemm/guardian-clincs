'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight } from 'lucide-react'
import { Turnstile } from '@marsidev/react-turnstile'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!captchaToken) {
            setError('Please complete the security check.')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
                options: {
                    captchaToken
                }
            })

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    setError('Invalid email or password. Please try again.')
                } else {
                    console.error('Login error:', error)
                    setError(error.message)
                }
            } else {
                router.refresh()
                router.push('/dashboard')
            }
        } catch (err: any) {
            console.error('Unexpected login error:', err)
            if (err instanceof TypeError && err.message === 'Failed to fetch') {
                setError('Unable to connect to the server. Please check your internet connection.')
            } else {
                setError('An unexpected error occurred. Please try again.')
            }
        } finally {
            setLoading(false)
            // Reset captcha on failure/success to force re-verification if needed? 
            // Usually not needed for simple flows, but good practice if failures persist.
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Visual Side */}
            <div className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden text-white p-12 bg-slate-900">
                {/* Animated Background Image (Doctor) */}
                <div className="absolute inset-0 bg-[url('/auth-bg.jpg')] bg-cover bg-center opacity-60 animate-ken-burns"></div>

                {/* Gradient Overlay (Tint) */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-[#004b87]/80 to-blue-950/90 mix-blend-multiply"></div>

                <div className="relative z-10 max-w-xl text-center space-y-8 backdrop-blur-sm bg-black/10 p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <Link href="/" className="flex items-center justify-center mx-auto hover:opacity-90 transition-opacity">
                        <Image src="/guardian-logo.png" alt="Guardian Clinics" width={220} height={110} className="object-contain drop-shadow-lg" />
                    </Link>
                    <p className="text-lg text-blue-50 leading-relaxed font-light drop-shadow-md">
                        Experience healthcare reimagined. Access your records, schedule appointments, and connect with top specialists seamlessly.
                    </p>
                </div>
            </div>

            {/* Login Form Side */}
            <div className="flex flex-col justify-center items-center p-8 bg-slate-50 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                <div className="w-full max-w-md space-y-8 bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                        <p className="text-slate-500 mt-2 text-sm">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="mb-8 flex justify-center">
                            <Link href="/">
                                <div className="relative w-24 h-24 bg-white rounded-2xl shadow-sm p-3 ring-1 ring-slate-100 flex items-center justify-center hover:scale-105 transition-transform duration-300 cursor-pointer">
                                    <Image
                                        src="/guardian-logo.png"
                                        alt="Guardian Clinics"
                                        fill
                                        className="object-contain p-1"
                                        priority
                                    />
                                </div>
                            </Link>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 bg-slate-50 border-slate-200 focus:ring-[#004b87] focus:border-[#004b87] transition-all duration-200 hover:bg-slate-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                                <Link href="#" className="text-xs text-[#004b87] hover:underline font-medium transition-colors">Forgot password?</Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11 bg-slate-50 border-slate-200 focus:ring-[#004b87] focus:border-[#004b87] transition-all duration-200 hover:bg-slate-100"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2 animate-in zoom-in-95">
                                <span className="font-bold">Error:</span> {error}
                            </div>
                        )}

                        <div className="flex justify-center py-2">
                            <Turnstile
                                siteKey="0x4AAAAAACWjvXebVN0X5Kfl"
                                onSuccess={(token) => setCaptchaToken(token)}
                                options={{ theme: 'light' }}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-[#004b87] hover:bg-[#003865] text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-900/10"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-400">Or</span>
                        </div>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-slate-500">Don&apos;t have an account? </span>
                        <Link href="/register" className="font-semibold text-[#004b87] hover:underline inline-flex items-center hover:translate-x-1 transition-transform">
                            Create Account <ArrowRight className="ml-1 w-3 h-3" />
                        </Link>
                    </div>
                </div>

                <p className="mt-8 text-xs text-slate-400">
                    © {new Date().getFullYear()} Guardian Clinics. All rights reserved.
                </p>
            </div>
        </div>
    )
}
