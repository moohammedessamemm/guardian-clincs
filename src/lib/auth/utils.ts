import { createClient } from "@/lib/supabase/client"
import { redirect } from "next/navigation"

export type Role = 'patient' | 'doctor' | 'staff' | 'admin'

export const ROLES = {
    PATIENT: 'patient' as Role,
    DOCTOR: 'doctor' as Role,
    STAFF: 'staff' as Role,
    ADMIN: 'admin' as Role,
}

export const PROTECTED_PATHS = {
    '/admin': [ROLES.ADMIN],
    '/doctor': [ROLES.DOCTOR, ROLES.ADMIN],
    '/staff': [ROLES.STAFF, ROLES.ADMIN],
    '/patient': [ROLES.PATIENT, ROLES.ADMIN], // Admins can view patient dashboards? Maybe not by default, but for support.
}

export async function getUserRole(userId: string): Promise<Role | null> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

    if (error || !data) return null
    return data.role as Role
}

export function isAuthorized(role: Role, path: string): boolean {
    // Check for exact path match or sub-path
    for (const [prefix, allowedRoles] of Object.entries(PROTECTED_PATHS)) {
        if (path.startsWith(prefix)) {
            return allowedRoles.includes(role)
        }
    }
    return true // Public path
}

export async function requireRole(allowedRoles: Role[]): Promise<void> {
    const role = await getCurrentUserRole()
    if (!role || !allowedRoles.includes(role)) {
        redirect('/unauthorized')
    }
}

export async function getCurrentUserRole(): Promise<Role | null> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return data?.role as Role
}
