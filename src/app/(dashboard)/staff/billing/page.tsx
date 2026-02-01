'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreditCard, Download, Plus, Search, FileText, CheckCircle2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

export default function StaffBillingPage() {
    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Billing & Invoices</h1>
                    <p className="text-slate-500 mt-1">Manage patient payments and generate invoices.</p>
                </div>
                <Button className="bg-[#004b87] hover:bg-[#003865] rounded-full px-6 shadow-lg shadow-blue-900/10">
                    <Plus className="mr-2 h-4 w-4" /> Create New Invoice
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input placeholder="Search invoice ID or patient name..." className="pl-9 bg-white border-slate-200" />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="bg-white">Filter</Button>
                    <Button variant="outline" className="bg-white">Export</Button>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#f8fafc] text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="p-5 font-semibold">Invoice Details</th>
                                <th className="p-5 font-semibold">Patient</th>
                                <th className="p-5 font-semibold">Date</th>
                                <th className="p-5 font-semibold">Amount</th>
                                <th className="p-5 font-semibold">Status</th>
                                <th className="p-5 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <tr className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-50 p-2 rounded text-[#004b87]">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">INV-001</div>
                                            <div className="text-xs text-slate-400">General Checkup</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5 font-medium text-slate-700">John Doe</td>
                                <td className="p-5 text-slate-500">Oct 24, 2024</td>
                                <td className="p-5 font-bold text-slate-900">$150.00</td>
                                <td className="p-5">
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">
                                        Pending
                                    </Badge>
                                </td>
                                <td className="p-5 text-right">
                                    <Button size="sm" variant="ghost" className="text-[#004b87] hover:bg-blue-50">
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-50 p-2 rounded text-emerald-600">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">INV-002</div>
                                            <div className="text-xs text-slate-400">Lab Tests (Blood)</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5 font-medium text-slate-700">Jane Smith</td>
                                <td className="p-5 text-slate-500">Oct 23, 2024</td>
                                <td className="p-5 font-bold text-slate-900">$75.00</td>
                                <td className="p-5">
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">
                                        Paid
                                    </Badge>
                                </td>
                                <td className="p-5 text-right">
                                    <Button size="sm" variant="ghost" className="text-slate-500 hover:text-[#004b87]">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
