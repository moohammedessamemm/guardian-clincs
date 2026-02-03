"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Heart, Stethoscope, User, Microscope, Activity } from "lucide-react"

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <Link
                href={props.href as string}
                ref={ref as any}
                className={cn(
                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    className
                )}
                {...props}
            >
                <div className="text-sm font-medium leading-none text-slate-900 group-hover:text-[#004b87]">{title}</div>
                <p className="line-clamp-2 text-sm leading-snug text-slate-500">
                    {children}
                </p>
            </Link>
        </li>
    )
})
ListItem.displayName = "ListItem"

export function MegaMenu() {
    const [activeMenu, setActiveMenu] = React.useState<string | null>(null)

    const services = [
        {
            title: "Cardiology",
            href: "/#services",
            description: "Expert heart care and diagnostics.",
            icon: Heart
        },
        {
            title: "Surgery",
            href: "/#services",
            description: "Advanced surgical procedures.",
            icon: Stethoscope
        },
        {
            title: "Pediatrics",
            href: "/#services",
            description: "Comprehensive care for children.",
            icon: User
        },
        {
            title: "Laboratory",
            href: "/#services",
            description: "Precise and quick lab results.",
            icon: Microscope
        },
    ]

    return (
        <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-blue-100 hover:text-white transition-all px-4 py-2 rounded-full hover:bg-white/10">
                Home
            </Link>

            {/* Services Dropdown */}
            <div
                className="relative group"
                onMouseEnter={() => setActiveMenu('services')}
                onMouseLeave={() => setActiveMenu(null)}
            >
                <button className="text-sm font-medium text-blue-100 group-hover:text-white transition-all px-4 py-2 rounded-full group-hover:bg-white/10">
                    Services
                </button>

                <div className={cn(
                    "absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-white rounded-xl shadow-xl border border-slate-100 p-6 transition-all duration-200 origin-top",
                    activeMenu === 'services' ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                )}>
                    <div className="grid grid-cols-2 gap-4">
                        {services.map((service) => (
                            <Link
                                key={service.title}
                                href={service.href}
                                className="group/item flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#004b87] flex items-center justify-center group-hover/item:bg-[#004b87] group-hover/item:text-white transition-colors">
                                    <service.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-1">{service.title}</h4>
                                    <p className="text-xs text-slate-500 leading-snug">{service.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-900">Not sure what you need?</h4>
                                <p className="text-sm text-slate-500">Check our symptom checker or call us.</p>
                            </div>
                            <button
                                onClick={() => window.dispatchEvent(new Event('open-chat'))}
                                className="text-sm font-bold text-[#004b87] hover:underline"
                            >
                                Contact Support →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Doctors Link */}
            <Link href="/doctors" className="text-sm font-medium text-blue-100 hover:text-white transition-all px-4 py-2 rounded-full hover:bg-white/10">
                Doctors
            </Link>

            <Link href="/mission" className="text-sm font-medium text-blue-100 hover:text-white transition-all px-4 py-2 rounded-full hover:bg-white/10">
                Mission
            </Link>

            <Link href="/vision" className="text-sm font-medium text-blue-100 hover:text-white transition-all px-4 py-2 rounded-full hover:bg-white/10">
                Vision
            </Link>

            <Link href="/contacts" className="text-sm font-medium text-blue-100 hover:text-white transition-all px-4 py-2 rounded-full hover:bg-white/10">
                Contacts
            </Link>
        </nav>
    )
}
