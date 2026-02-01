'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tag, Plus, Trash2, Shield } from 'lucide-react'
import { useState } from "react"

export default function AdminSettingsPage() {
    const [services, setServices] = useState([
        { id: 1, name: 'General Consultation', price: 50 },
        { id: 2, name: 'Specialist Consultation', price: 100 },
        { id: 3, name: 'Blood Test (CBC)', price: 30 },
        { id: 4, name: 'X-Ray', price: 80 },
    ])

    const [newName, setNewName] = useState('')
    const [newPrice, setNewPrice] = useState('')

    const addService = () => {
        if (!newName || !newPrice) return
        setServices([...services, { id: Date.now(), name: newName, price: Number(newPrice) }])
        setNewName('')
        setNewPrice('')
    }

    const removeService = (id: number) => {
        setServices(services.filter(s => s.id !== id))
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Services & Pricing</h1>
                    <p className="text-slate-500 mt-1">Manage hospital service catalog and insurance configurations.</p>
                </div>
                <Button className="bg-[#004b87] hover:bg-[#003865] transition-all hover:scale-105 shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> Add Service
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-[#004b87]">
                    <CardHeader>
                        <CardTitle>Manage Services</CardTitle>
                        <CardDescription>Configure standard prices for hospital services.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Service Name"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="focus:border-[#004b87] focus:ring-[#004b87] transition-all"
                            />
                            <Input
                                placeholder="Price ($)"
                                type="number"
                                className="w-24 focus:border-[#004b87] focus:ring-[#004b87] transition-all"
                                value={newPrice}
                                onChange={e => setNewPrice(e.target.value)}
                            />
                            <Button onClick={addService} className="hover:bg-slate-800 transition-colors">Add</Button>
                        </div>

                        <div className="rounded-md border overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                                    <tr>
                                        <th className="p-3">Service</th>
                                        <th className="p-3">Price</th>
                                        <th className="p-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {services.map(service => (
                                        <tr key={service.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-3 font-medium flex items-center gap-2 text-slate-700 group-hover:text-[#004b87] transition-colors">
                                                <Tag className="h-3 w-3 text-slate-400 group-hover:text-[#004b87]" />
                                                {service.name}
                                            </td>
                                            <td className="p-3 font-mono text-slate-600">${service.price.toFixed(2)}</td>
                                            <td className="p-3 text-right">
                                                <Button variant="ghost" size="icon" onClick={() => removeService(service.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors h-8 w-8">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-slate-400">
                    <CardHeader>
                        <CardTitle>Insurance Providers</CardTitle>
                        <CardDescription>Accepted insurance plans.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-400">
                            <Shield className="h-12 w-12 mb-3 opacity-20" />
                            <p className="text-sm font-medium">Insurance compatibility settings coming soon.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
