
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/layout/site-header'

import { User as UserIcon } from 'lucide-react'
import Image from 'next/image'

export const metadata = {
    title: 'Our Doctors | Guardian Clinics',
    description: 'Meet our team of experienced and dedicated doctors.',
}

export default async function DoctorsPage() {
    const supabase = await createClient()

    // Fetch only doctors
    const { data: doctors, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'doctor')
        .order('full_name')

    if (error) {
        console.error('Error fetching doctors:', error)
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <SiteHeader />
            {/* Custom Header Design - Doctor Background with Overlay */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 min-h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/doctors-bg.png"
                        alt="Doctors Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Blue Overlay for text contrast - Lighter to show background */}
                    <div className="absolute inset-0 bg-[#004b87]/40 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#004b87] via-transparent to-transparent opacity-80" />
                </div>

                <div className="container mx-auto px-6 max-w-4xl relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-50 text-sm font-bold tracking-wide uppercase mb-6 border border-blue-400/30 backdrop-blur-sm">
                        World-Class Care
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-8 drop-shadow-lg">
                        Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Specialists</span>
                    </h1>
                    <p className="text-xl text-blue-50/90 leading-relaxed font-medium max-w-2xl mx-auto">
                        Dedicated professionals committed to providing excellence in medical care with a personal touch.
                    </p>
                </div>
            </div>

            {/* Doctors Grid */}
            <section className="container mx-auto px-6 -mt-20 relative z-20 pb-24">
                {doctors && doctors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {doctors.map((doctor) => (
                            <div key={doctor.id} className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-blue-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center p-8">
                                {/* Decorative Background Blob */}
                                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-slate-50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Avatar Container */}
                                <div className="relative w-32 h-32 mb-6 rounded-full p-1 bg-gradient-to-br from-slate-100 to-white shadow-inner group-hover:shadow-md transition-all duration-500 group-hover:scale-105 ring-1 ring-slate-100 group-hover:ring-blue-100">
                                    <div className="w-full h-full rounded-full overflow-hidden relative bg-white">
                                        {doctor.avatar_url ? (
                                            <Image
                                                src={doctor.avatar_url}
                                                alt={doctor.full_name || 'Doctor'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                                <UserIcon className="w-12 h-12" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" title="Available"></div>
                                </div>

                                {/* Content */}
                                <div className="relative z-10 w-full">
                                    <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#004b87] transition-colors">
                                        {doctor.full_name}
                                    </h2>

                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#004b87] text-xs font-bold uppercase tracking-wider shadow-sm">
                                        Medical Specialist
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-50 w-full opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                                        <p className="text-xs text-slate-400 font-medium">guardian clinics</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <UserIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Specialists Found</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            We are currently updating our directory. Please check back soon.
                        </p>
                    </div>
                )}
            </section>
        </main>
    )
}
