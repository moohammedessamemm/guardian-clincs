'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import { dashboardLinks, Role } from './nav-config'

interface SidebarProps {
    role: Role
}

export function DashboardSidebar({ role }: SidebarProps) {
    const pathname = usePathname()



    const filteredLinks = dashboardLinks.filter(link => link.roles.includes(role))

    return (
        <div className="pb-12 min-h-screen w-64 bg-white text-slate-900 border-r border-slate-200 hidden md:block shadow-sm">
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    {/* Logo Area */}
                    <div className="mb-8 px-6 flex flex-col items-center group cursor-default">
                        <div className="w-20 h-20 relative mb-4 bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 flex items-center justify-center transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1">
                            <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-tr from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <Image src="/guardian-clinics-logo.png" alt="Guardian Clinics" fill className="object-contain p-2 relative z-10" priority />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 text-center leading-none flex flex-col gap-0.5">
                            <span className="text-slate-800">Guardian</span>
                            <span className="text-[#004b87] bg-clip-text text-transparent bg-gradient-to-r from-[#004b87] to-[#0062b1]">Clinics</span>
                        </h2>
                        <div className="mt-3 flex items-center gap-2">
                            <div className="h-[1px] w-3 bg-slate-200"></div>
                            <p className="text-[10px] text-slate-400 font-bold tracking-[0.25em] uppercase">Enterprise</p>
                            <div className="h-[1px] w-3 bg-slate-200"></div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {filteredLinks.map((link) => (
                            <Button
                                key={link.href}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start font-medium transition-all duration-300 mb-1 group relative overflow-hidden",
                                    pathname === link.href
                                        ? "bg-[#004b87] text-white shadow-md hover:bg-[#003865] hover:text-white translate-x-1"
                                        : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-[#004b87] hover:translate-x-1"
                                )}
                                asChild
                            >
                                <Link href={link.href}>
                                    <div className={cn(
                                        "absolute inset-0 w-1 bg-[#004b87] transition-transform duration-300 origin-left",
                                        pathname === link.href ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100 opacity-50"
                                    )} />
                                    <link.icon className={cn(
                                        "mr-3 h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                                        pathname === link.href ? "text-white" : "text-slate-400 group-hover:text-[#004b87]"
                                    )} />
                                    <span className="relative z-10">{link.label}</span>
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
