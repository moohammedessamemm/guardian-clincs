import { AppointmentList } from "@/components/dashboard/appointment-list"

export default function AdminAppointmentsPage() {
    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">All Appointments Log</h1>
                    <p className="text-slate-500 mt-1">Comprehensive log of all system appointments.</p>
                </div>
            </div>

            <AppointmentList />
        </div>
    )
}
