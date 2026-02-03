import {
    LayoutDashboard,
    Calendar,
    FileText,
    Pill,
    Settings,
    Users,
    FlaskConical,
    Clock,
    Home
} from 'lucide-react'

export type Role = 'patient' | 'doctor' | 'staff' | 'admin'

export const dashboardLinks = [
    // Common Links
    { label: 'Home', href: '/', icon: Home, roles: ['patient', 'doctor', 'staff', 'admin'] },

    // Patient Links
    { label: 'Overview', href: '/patient', icon: LayoutDashboard, roles: ['patient'] },
    { label: 'My Appointments', href: '/patient/appointments', icon: Calendar, roles: ['patient'] },
    { label: 'Book Appointment', href: '/patient/appointments', icon: Calendar, roles: ['patient'] },
    { label: 'Medical History', href: '/patient/records', icon: FileText, roles: ['patient'] },
    { label: 'Prescriptions', href: '/patient/prescriptions', icon: Pill, roles: ['patient'] },
    { label: 'Lab Results', href: '/patient/labs', icon: FileText, roles: ['patient'] },

    // Doctor Links
    { label: 'Dashboard', href: '/doctor', icon: LayoutDashboard, roles: ['doctor'] },
    { label: 'Appointments', href: '/doctor/appointments', icon: Calendar, roles: ['doctor'] },
    { label: 'Schedule', href: '/doctor/schedule', icon: Clock, roles: ['doctor'] },
    { label: 'My Patients', href: '/doctor/patients', icon: Users, roles: ['doctor'] },
    { label: 'Lab Results', href: '/doctor/labs', icon: FlaskConical, roles: ['doctor'] },


    // Staff Links
    { label: 'Dashboard', href: '/staff', icon: LayoutDashboard, roles: ['staff'] },
    { label: 'Pending Requests', href: '/staff/appointments', icon: Calendar, roles: ['staff'] },
    { label: 'Confirmed Log', href: '/staff/confirmed', icon: FileText, roles: ['staff'] },
    { label: 'Billing', href: '/staff/billing', icon: FileText, roles: ['staff'] },

    // Admin Links
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['admin'] },
    { label: 'All Appointments', href: '/admin/appointments', icon: Calendar, roles: ['admin'] },
    { label: 'Users', href: '/admin/users', icon: Users, roles: ['admin'] },
    { label: 'Analytics', href: '/admin/analytics', icon: LayoutDashboard, roles: ['admin'] },
    { label: 'Settings', href: '/settings', icon: Settings, roles: ['patient', 'doctor', 'staff', 'admin'] },
]
