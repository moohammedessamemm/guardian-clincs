'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import { Play } from 'lucide-react'

interface VideoModalProps {
    videoId: string
    thumbnailSrc: string
    title: string
}

export function VideoModal({ videoId, thumbnailSrc, title }: VideoModalProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="relative rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer group aspect-video w-full bg-slate-100 active:scale-[0.98] active:shadow-sm">
                    <Image
                        src={thumbnailSrc}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform duration-300 animate-pulse">
                            <Play className="w-6 h-6 sm:w-8 sm:h-8 text-[#e11d48] fill-[#e11d48]" />
                        </div>
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black border-none aspect-video">
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="aspect-video w-full h-full"
                />
            </DialogContent>
        </Dialog>
    )
}
