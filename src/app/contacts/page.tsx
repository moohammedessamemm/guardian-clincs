'use client'

import { Phone, Facebook, Instagram, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { SiteHeader } from '@/components/layout/site-header'
import { Badge } from '@/components/ui/badge'

export default function ContactsPage() {
    const contacts = [
        {
            icon: Phone,
            title: 'Call Us',
            value: '011 22742277',
            href: 'tel:01122742277',
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            icon: Facebook,
            title: 'Facebook',
            value: 'Guardian Clinics',
            href: 'https://www.facebook.com/guardian.clinics/?locale=ar_AR',
            color: 'text-blue-700',
            bg: 'bg-blue-100'
        },
        {
            icon: Instagram,
            title: 'Instagram',
            value: '@guardianclinics',
            href: 'https://www.instagram.com/guardianclinics/?hl=ar',
            color: 'text-pink-600',
            bg: 'bg-pink-100'
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 font-sans text-slate-900">
            <SiteHeader />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-[#004b87] py-24 sm:py-32">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
                        Get in Touch
                    </h1>
                    <p className="text-lg leading-8 text-blue-100 max-w-2xl mx-auto">
                        We're here to help. Reach out to us for appointments, inquiries, or just to say hello.
                    </p>
                </div>
            </div>

            {/* Contact Cards */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 -mt-16 pb-24 relative z-10">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {contacts.map((contact, index) => (
                        <Card key={index} className="group hover:-translate-y-1 transition-all duration-300 hover:shadow-xl border-none shadow-lg bg-white overflow-hidden">
                            <CardContent className="p-8 flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-2xl ${contact.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <contact.icon className={`h-8 w-8 ${contact.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{contact.title}</h3>
                                <p className="text-slate-500 mb-6 font-medium">{contact.value}</p>
                                <Button
                                    asChild
                                    className="w-full bg-slate-900 hover:bg-[#004b87] transition-colors rounded-full group-hover:shadow-lg"
                                >
                                    <Link href={contact.href} target={contact.icon !== Phone ? "_blank" : undefined}>
                                        Connect Now <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Additional Info Section */}
                <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Map & Info */}
                    <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden h-full flex flex-col">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
                        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

                        <h3 className="text-2xl font-bold mb-6 relative z-10">Visit Our Clinic</h3>

                        {/* Map Iframe */}
                        <div className="relative w-full h-64 bg-slate-800 rounded-2xl overflow-hidden shadow-inner border border-slate-700 mb-8 z-10">
                            <iframe
                                src="https://maps.google.com/maps?q=Above%20Pinocchio%20Kids%20Store,%20Little%20Havana%20Mall,%20Genena%20City%20St,%20Second%20Sharm%20El%20Sheikh&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>

                        <div className="space-y-6 relative z-10 mt-auto">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-blue-100">Guardian Clinics</p>
                                    <p className="text-slate-400 mt-1 leading-relaxed">
                                        Above Pinocchio Kids Store, Little Havana Mall<br />
                                        Genena City St, Second Sharm El Sheikh
                                    </p>
                                    <Button variant="link" className="text-blue-400 p-0 h-auto mt-2" asChild>
                                        <Link href="https://www.google.com/maps?q=Above%20Pinocchio%20Kids%20Store,%20Little%20Havana%20Mall,%20Genena%20City%20St,%20Second%20Sharm%20El%20Sheikh" target="_blank">
                                            Get Directions &rarr;
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hours */}
                    <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 h-full">
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Working Hours</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center py-4 border-b border-slate-100">
                                <span className="font-medium text-slate-600">Saturday - Thursday</span>
                                <span className="font-bold text-[#004b87] text-lg">11:00 AM - 11:00 PM</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-slate-100">
                                <span className="font-medium text-slate-600">Friday</span>
                                <span className="font-bold text-red-500 text-lg">Closed</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="font-medium text-slate-600">Emergency</span>
                                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 px-3 py-1">24/7 Available</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 mt-12">
                <div className="container mx-auto px-6 max-w-7xl text-center">
                    <h2 className="text-2xl font-bold text-white mb-6">Ready to prioritize your health?</h2>
                    <p className="mb-8 max-w-xl mx-auto text-slate-400">Book your appointment today with Guardian Clinic and experience the difference.</p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                        <Button size="lg" className="bg-white text-[#004b87] hover:bg-blue-50 rounded-full font-bold px-8 h-12" asChild>
                            <Link href="/appointments/new">Book Now</Link>
                        </Button>
                    </div>

                    <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                        <p>&copy; {new Date().getFullYear()} Guardian Clinics. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
