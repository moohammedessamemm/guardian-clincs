'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Menu,
    Home,
    HeartPulse,
    Stethoscope,
    Users,
    Flag,
    Eye,
    Phone,
    MapPin,
    LayoutDashboard,
    LogOut,
    Calendar,
    ChevronRight
} from 'lucide-react'
import { MegaMenu } from './mega-menu'

import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function SiteHeader() {
    const [scrolled, setScrolled] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setProfile(data)
            }
            setLoading(false)
        }
        getUser()
    }, [])

    const getDashboardLink = () => {
        if (!profile) return '/dashboard'
        const role = profile.role?.toLowerCase()
        switch (role) {
            case 'patient': return '/patient'
            case 'doctor': return '/doctor'
            case 'staff': return '/staff'
            case 'admin': return '/admin'
            default: return '/dashboard'
        }
    }

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#004b87]/85 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
            <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Full White Logo */}
                    {/* Logo - Always White for Dark Theme */}
                    <Link href="/" className="relative w-48 h-12 transition-transform hover:scale-105 duration-300">
                        <Image
                            src="/images/landing/logo-white-final.png"
                            alt="Guardian Clinics"
                            fill
                            className="object-contain"
                            priority
                        />
                    </Link>
                </div>

                {/* Mega Menu */}
                <MegaMenu />

                <div className="flex items-center gap-4">
                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0 border-l border-slate-100 bg-white">
                                <SheetHeader className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                                    <SheetTitle className="text-left text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#004b87] to-blue-500">Menu</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col h-full overflow-y-auto pb-20">
                                    <nav className="flex-1 px-4 py-6 space-y-2">
                                        {[
                                            { label: 'Home', href: '/', icon: Home },
                                            { label: 'Services', href: '/#services', icon: HeartPulse },
                                            { label: 'Doctors', href: '/#doctors', icon: Stethoscope },
                                            { label: 'Mission', href: '/mission', icon: Flag },
                                            { label: 'Vision', href: '/vision', icon: Eye },
                                            { label: 'Contacts', href: '/contacts', icon: Phone },
                                            { label: 'Location', href: '/#location', icon: MapPin }
                                        ].map((item) => (
                                            <Link
                                                key={item.label}
                                                href={item.href}
                                                className="group flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 hover:text-[#004b87] hover:bg-blue-50 transition-all duration-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-[#004b87] group-hover:shadow-sm flex items-center justify-center transition-all duration-200">
                                                        <item.icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-base">{item.label}</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                            </Link>
                                        ))}
                                    </nav>

                                    <div className="px-6 pb-8 mt-auto space-y-4">
                                        <div className="h-px bg-slate-100 mb-6" />

                                        {user && profile ? (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-[#004b87] text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-900/10">
                                                        {profile.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{profile.full_name}</p>
                                                        <p className="text-xs font-medium text-[#004b87] bg-blue-100/50 px-2 py-0.5 rounded-full inline-block capitalize mt-1">
                                                            {profile.role}
                                                        </p>
                                                    </div>
                                                </div>

                                                <Link href={getDashboardLink()}>
                                                    <Button className="w-full justify-start h-12 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#004b87] hover:border-blue-200 rounded-xl shadow-sm group">
                                                        <LayoutDashboard className="w-4 h-4 mr-3 text-slate-400 group-hover:text-[#004b87]" />
                                                        Dashboard Overview
                                                    </Button>
                                                </Link>

                                                <form action="/auth/signout" method="post">
                                                    <Button variant="ghost" className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl">
                                                        <LogOut className="w-4 h-4 mr-3" />
                                                        Sign Out
                                                    </Button>
                                                </form>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <Link href="/login" className="block">
                                                    <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#004b87] font-medium">
                                                        Log In
                                                    </Button>
                                                </Link>
                                                <Link href="/register" className="block">
                                                    <Button className="w-full h-12 rounded-xl bg-[#004b87] hover:bg-[#003865] text-white font-medium shadow-lg shadow-blue-900/20 group">
                                                        <Calendar className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                                                        Book Appointment
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {!loading && (
                        user && profile ? (
                            <div className="hidden sm:flex items-center gap-4">
                                <div className="text-right hidden lg:block">
                                    <p className="text-sm font-medium text-white">{profile.full_name}</p>
                                    <span className="text-[10px] uppercase tracking-wider text-blue-200 bg-white/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                        {profile.role}
                                    </span>
                                </div>
                                <Button className="bg-white text-[#004b87] hover:bg-blue-50 rounded-full px-6 shadow-lg transition-all hover:scale-105 active:scale-95" asChild>
                                    <Link href={getDashboardLink()}>Overview</Link>
                                </Button>
                                {/* Simple Sign Out Icon */}
                                <form action="/auth/signout" method="post">
                                    <Button variant="ghost" size="icon" className="text-blue-100 hover:text-white hover:bg-white/10 rounded-full" title="Sign Out">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <>
                                <Button variant="ghost" className="hidden sm:flex text-blue-100 hover:text-white hover:bg-white/10" asChild>
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button className="hidden sm:flex bg-[#004b87] text-white hover:bg-[#003865] rounded-full px-6 shadow-lg transition-all hover:scale-105 active:scale-95 border border-white/10" asChild>
                                    <Link href="/register">Book Appointment</Link>
                                </Button>
                            </>
                        )
                    )}
                </div>
            </div>
        </header>
    )
}
