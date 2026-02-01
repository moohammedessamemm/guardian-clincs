'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DashboardSearch() {
    const router = useRouter()
    const [query, setQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        }
    }

    return (
        <form onSubmit={handleSearch} className="flex w-full max-w-2xl items-center gap-4">
            <div className="relative w-full max-w-md group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#004b87]">
                    <Search className="h-5 w-5" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search appointments, records, doctors..."
                    className={cn(
                        "h-11 w-full rounded-full border border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm text-gray-800",
                        "outline-none transition-all placeholder:text-gray-400",
                        "focus:border-[#004b87] focus:bg-white focus:ring-4 focus:ring-[#004b87]/10"
                    )}
                />
            </div>
        </form>
    )
}
