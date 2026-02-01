'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/landing/header'
import { Button } from '@/components/ui/button'
import { ArrowRight, Eye, Landmark, Megaphone } from 'lucide-react'
import { VideoModal } from '@/components/landing/video-modal'

export default function VisionPage() {
    const visionPoints = [
        {
            icon: Eye,
            title: "Reliability & Trust",
            text: "To be the most reliable medical and health tourism agency in Egypt, setting the gold standard for care."
        },
        {
            icon: Landmark,
            title: "Cultural Bridge",
            text: "To be the best organization which conveys Egyptian culture and history to tourists and create a solid bridge between Egypt and other countries."
        },
        {
            icon: Megaphone,
            title: "Global Promotion",
            text: "To be the most active organization which works to promote medical and health tourism in Egypt to the world."
        }
    ]

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <Header />

            {/* Custom Header Design - Doctor Background with Overlay */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 min-h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/about/vision-header-doctor-v2.png"
                        alt="Vision Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Blue Overlay for text contrast */}
                    <div className="absolute inset-0 bg-[#004b87]/80 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#004b87] via-transparent to-transparent opacity-90" />
                </div>

                <div className="container mx-auto px-6 max-w-4xl relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-50 text-sm font-bold tracking-wide uppercase mb-6 border border-blue-400/30 backdrop-blur-sm">
                        Future Focused
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-8 drop-shadow-lg">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Vision</span>
                    </h1>
                    <p className="text-xl text-blue-50/90 leading-relaxed font-medium max-w-2xl mx-auto">
                        Connect cultures, promote wellness, and establish Egypt as the premier destination for world-class healthcare.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <section className="py-20 bg-slate-50 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                        {/* Video Column - Left */}
                        <div className="relative lg:pt-12 order-last lg:order-first">
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/10 border-8 border-white bg-white">
                                <VideoModal
                                    videoId="9W1o2WFlk4Q"
                                    thumbnailSrc="/images/about/vision-doctor-thumb.png"
                                    title="Our Vision Video"
                                />
                            </div>

                            {/* Decorative Element */}
                            <div className="absolute -bottom-10 -right-10 -z-10 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl opacity-60" />
                            <div className="absolute -top-10 -left-10 -z-10 w-64 h-64 bg-[#004b87]/5 rounded-full blur-3xl opacity-60" />
                        </div>

                        {/* Vision Points Column - Right */}
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold text-slate-900">Our Vision</h2>
                                <p className="text-slate-500">The pillars that guide our growth and service.</p>
                            </div>

                            <div className="space-y-8">
                                {visionPoints.map((point, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#004b87] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            <point.icon className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#004b87] transition-colors">{point.title}</h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                {point.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8">
                                <Button size="lg" className="bg-[#004b87] hover:bg-[#003865] text-white rounded-full px-10 h-14 text-lg shadow-xl shadow-blue-900/10 transition-transform hover:scale-105" asChild>
                                    <Link href="/">
                                        Learn More <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    )
}
