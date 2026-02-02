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
                        <div className="w-48 h-32 relative transform transition-transform duration-500 group-hover:scale-105">
                            <Image src="/guardian-logo.png" alt="Guardian Clinics" fill className="object-contain relative z-10" priority />
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
