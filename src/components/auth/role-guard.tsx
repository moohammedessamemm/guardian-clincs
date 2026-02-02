'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Role, isAuthorized } from '@/lib/auth/utils'
import { Loader2 } from 'lucide-react'

interface RoleGuardProps {
    children: React.ReactNode
}

export function RoleGuard({ children }: RoleGuardProps) {
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    useEffect(() => {
        const checkAuth = async () => {
            // 1. Get Session
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                // If path is protected, redirect to login
                if (pathname.startsWith('/admin') || pathname.startsWith('/patient') || pathname.startsWith('/doctor') || pathname.startsWith('/staff')) {
                    router.replace(`/login?next=${pathname}`)
                    return
                }
                setAuthorized(true) // Public page
                setLoading(false)
                return
            }

            // 2. Get User Role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single()

            const role = profile?.role as Role

            // 3. Verify Access
            if (!isAuthorized(role, pathname)) {
                router.replace('/unauthorized')
                return
            }

            setAuthorized(true)
            setLoading(false)
        }

        checkAuth()
    }, [pathname, router, supabase])

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!authorized) return null

    return <>{children}</>
}
