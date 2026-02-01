'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
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

                <nav className="hidden md:flex items-center gap-8">
                    {/* Landing Page Sections (Hash Links) */}
                    {['Services', 'Doctors', 'Location'].map((item) => (
                        <Link key={item} href={`/#${item.toLowerCase()}`} className="text-sm font-medium text-blue-100 hover:text-white transition-colors">
                            {item}
                        </Link>
                    ))}

                    {/* New Pages */}
                    <Link href="/mission" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">
                        Our Mission
                    </Link>
                    <Link href="/vision" className="text-sm font-medium text-blue-100 hover:text-white transition-colors">
                        Our Vision
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="hidden sm:flex text-blue-100 hover:text-white hover:bg-white/10" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button className="bg-white text-[#004b87] hover:bg-blue-50 rounded-full px-6 shadow-lg transition-all hover:scale-105 active:scale-95" asChild>
                        <Link href="/register">Book Appointment</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
