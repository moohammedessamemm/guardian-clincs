import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AppointmentsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No appointments scheduled.</p>
                </CardContent>
            </Card>
        </div>
    )
}
