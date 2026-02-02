import { redirect } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { MobileDashboardNav } from '@/components/layout/mobile-dashboard-nav'
import { UserNav } from '@/components/dashboard/user-nav'
import { AiAssistant } from '@/components/dashboard/ai-assistant'
import { NotificationBell } from '@/components/dashboard/notification-bell'
import { DashboardSearch } from '@/components/dashboard/dashboard-search'
import { RoleGuard } from '@/components/auth/role-guard'


export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch profile for role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Default role fallback
    const role = profile?.role || 'patient'

    return (
        <RoleGuard>
            <div className="flex min-h-screen">
                <DashboardSidebar role={role} />
                <div className="flex-1 flex flex-col">
                    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-100 bg-white/80 px-8 backdrop-blur-md transition-all">
                        {/* Modern Centered Search - "Spotlight" feel */}
                        <div className="flex items-center gap-4">
                            <MobileDashboardNav role={role} />
                            <DashboardSearch />
                        </div>

                        <div className="flex items-center gap-4">
                            <NotificationBell />

                            {/* Profile Dropdown Trigger Area */}
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                                <div className="hidden flex-col items-end md:flex">
                                    <span className="text-sm font-semibold text-slate-900 leading-tight">{profile?.full_name || user.email?.split('@')[0]}</span>
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded-full mt-0.5",
                                        role === 'admin' ? "bg-red-50 text-red-600" :
                                            role === 'doctor' ? "bg-blue-50 text-[#004b87]" :
                                                "bg-slate-50 text-slate-500"
                                    )}>
                                        {role}
                                    </span>
                                </div>
                                <UserNav />
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 p-6 bg-white relative">
                        {children}
                        <AiAssistant />
                    </main>
                </div>
            </div>
        </RoleGuard>
    )
}
