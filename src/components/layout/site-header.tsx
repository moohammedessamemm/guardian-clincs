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
import { Menu } from 'lucide-react'
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
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle>Menu</SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col gap-4 mt-8">
                                    {user && profile ? (
                                        <>
                                            <div className="bg-blue-50 p-4 rounded-lg mb-2">
                                                <p className="font-medium text-[#004b87]">{profile.full_name}</p>
                                                <p className="text-xs text-slate-500 capitalize">{profile.role}</p>
                                            </div>
                                            <Link href={getDashboardLink()} className="text-lg font-medium text-slate-900 px-4 py-2 hover:bg-slate-50 rounded-md transition-colors">
                                                Dashboard Overview
                                            </Link>
                                            <form action="/auth/signout" method="post">
                                                <button type="submit" className="w-full text-left text-lg font-medium text-red-600 px-4 py-2 hover:bg-red-50 rounded-md transition-colors">
                                                    Sign Out
                                                </button>
                                            </form>
                                        </>
                                    ) : (
                                        <>
                                            {['Home', 'Services', 'Doctors', 'Mission', 'Vision', 'Contacts', 'Location'].map((item) => (
                                                <Link
                                                    key={item}
                                                    href={item === 'Home' ? '/' : item === 'Contacts' ? '/contacts' : item === 'Mission' ? '/mission' : item === 'Vision' ? '/vision' : `/#${item.toLowerCase()}`}
                                                    className="text-lg font-medium text-slate-900 px-4 py-2 hover:bg-slate-50 rounded-md transition-colors"
                                                >
                                                    {item}
                                                </Link>
                                            ))}
                                            <Link href="/login" className="text-lg font-medium text-slate-900 px-4 py-2 hover:bg-slate-50 rounded-md transition-colors">
                                                Login
                                            </Link>
                                            <Link href="/register" className="text-lg font-medium text-white bg-[#004b87] px-4 py-2 hover:bg-[#003865] rounded-full shadow-lg transition-all hover:scale-105 active:scale-95">
                                                Book Appointment
                                            </Link>
                                        </>
                                    )}
                                </nav>
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
