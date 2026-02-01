'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { dashboardLinks, Role } from './nav-config'

interface MobileDashboardNavProps {
    role: Role
}

export function MobileDashboardNav({ role }: MobileDashboardNavProps) {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    const filteredLinks = dashboardLinks.filter(link => link.roles.includes(role))

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6 text-slate-600" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] sm:w-[350px] p-0">
                <SheetHeader className="p-6 border-b border-slate-100">
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="py-4 px-4 overflow-y-auto max-h-[calc(100vh-80px)]">
                    <div className="space-y-1">
                        {filteredLinks.map((link) => (
                            <Button
                                key={link.href}
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start font-medium transition-all duration-300 mb-1 group relative overflow-hidden",
                                    pathname === link.href
                                        ? "bg-[#004b87] text-white shadow-md"
                                        : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-[#004b87]"
                                )}
                                asChild
                                onClick={() => setOpen(false)}
                            >
                                <Link href={link.href}>
                                    <link.icon className={cn(
                                        "mr-3 h-5 w-5",
                                        pathname === link.href ? "text-white" : "text-slate-400 group-hover:text-[#004b87]"
                                    )} />
                                    <span>{link.label}</span>
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
