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

export function SiteHeader() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#004b87]/95 backdrop-blur-md shadow-lg py-3' : 'bg-[#004b87] py-4'}`}>
            <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Full White Logo */}
                    <Link href="/" className="relative w-48 h-12">
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
                                    {['Services', 'Doctors', 'Location'].map((item) => (
                                        <Link
                                            key={item}
                                            href={`/#${item.toLowerCase()}`}
                                            className="text-lg font-medium text-slate-900 px-4 py-2 hover:bg-slate-50 rounded-md transition-colors"
                                        >
                                            {item}
                                        </Link>
                                    ))}
                                    <Link href="/mission" className="text-lg font-medium text-slate-900 px-4 py-2 hover:bg-slate-50 rounded-md transition-colors">
                                        Our Mission
                                    </Link>
                                    <Link href="/vision" className="text-lg font-medium text-slate-900 px-4 py-2 hover:bg-slate-50 rounded-md transition-colors">
                                        Our Vision
                                    </Link>
                                    <div className="h-px bg-slate-100 my-2" />
                                    <Link href="/login" className="text-lg font-medium text-slate-900 px-4 py-2 hover:bg-slate-50 rounded-md transition-colors">
                                        Login
                                    </Link>
                                    <Link href="/register" className="text-lg font-medium text-[#004b87] px-4 py-2 hover:bg-blue-50 rounded-md transition-colors">
                                        Book Appointment
                                    </Link>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Button variant="ghost" className="hidden sm:flex text-blue-100 hover:text-white hover:bg-white/10" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button className="hidden sm:flex bg-white text-[#004b87] hover:bg-blue-50 rounded-full px-6 shadow-lg transition-all hover:scale-105 active:scale-95" asChild>
                        <Link href="/register">Book Appointment</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
