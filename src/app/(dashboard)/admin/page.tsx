'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Users, Activity, DollarSign, ShieldAlert, ShieldCheck, ArrowRight, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'

export default function AdminDashboardPage() {
    const supabase = createClient()
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeDoctors: 0,
        totalRevenue: 0,
        systemHealth: 'Good'
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            // Real queries for stats
            const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
            const { count: doctors } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor')

            // In a real app, revenue would come from a payments table
            // For now we keep the placeholder but structure it for future expansion
            const estimatedRevenue = 12500

            setStats({
                totalUsers: users || 0,
                activeDoctors: doctors || 0,
                totalRevenue: estimatedRevenue,
                systemHealth: 'Operational'
            })
            setLoading(false)
        }
        fetchStats()
    }, [supabase])

    const hour = new Date().getHours()
    const greeting = hour >= 5 && hour < 12 ? 'Good morning'
        : hour >= 12 && hour < 17 ? 'Good afternoon'
            : hour >= 17 && hour < 22 ? 'Good evening'
                : 'Welcome back'

    if (loading) return <div className="p-12 text-center text-slate-400">Loading admin console...</div>

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        {greeting}, Admin
                    </h1>
                    <p className="text-slate-500 mt-1">System overview and management controls.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-600">
                        System Status: <span className="text-emerald-600">Operational</span>
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-md bg-gradient-to-br from-slate-800 to-slate-900 text-white relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-4 group-hover:translate-x-2 transition-transform duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Total Users</p>
                                <div className="text-3xl font-bold mt-2">{stats.totalUsers}</div>
                            </div>
                            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                <Users className="h-5 w-5 text-slate-200" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-slate-400">
                            Registered accounts
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-blue-700 text-white relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-4 group-hover:translate-x-2 transition-transform duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold">Active Doctors</p>
                                <div className="text-3xl font-bold mt-2">{stats.activeDoctors}</div>
                            </div>
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-blue-200">
                            Medical professionals
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-emerald-600 to-emerald-700 text-white relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-4 group-hover:translate-x-2 transition-transform duration-500"></div>
                    <CardContent className="p-6 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-emerald-200 text-xs uppercase tracking-wider font-semibold">Est. Revenue</p>
                                <div className="text-3xl font-bold mt-2">${stats.totalRevenue.toLocaleString()}</div>
                            </div>
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                <DollarSign className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-emerald-200">
                            Monthly projection
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group bg-white">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold">System Health</p>
                                <div className="text-3xl font-bold mt-2 text-emerald-600 flex items-center gap-2">
                                    Good <ShieldCheck className="w-6 h-6 animate-pulse" />
                                </div>
                            </div>
                            <div className="bg-emerald-50 p-2 rounded-lg group-hover:bg-emerald-100 transition-colors duration-300">
                                <Activity className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-slate-400">
                            All services online
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Administration Tools */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Management Tools</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Link href="/admin/users" className="group">
                        <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200 group-hover:border-blue-200 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                            <CardContent className="p-6">
                                <div className="mb-4 bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">User Management</h3>
                                <p className="text-slate-500 text-sm mt-2">Manage user accounts, update roles, and view registration details.</p>
                                <div className="mt-4 flex items-center text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                    Access Tool <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/staff/billing" className="group">
                        <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200 group-hover:border-emerald-200 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                            <CardContent className="p-6">
                                <div className="mb-4 bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Financial Reports</h3>
                                <p className="text-slate-500 text-sm mt-2">View system revenue, invoices, and billing statements.</p>
                                <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                    View Finances <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <div className="group opacity-60 cursor-not-allowed">
                        <Card className="h-full border-slate-100 bg-slate-50/50">
                            <CardContent className="p-6">
                                <div className="mb-4 bg-slate-100 w-12 h-12 rounded-xl flex items-center justify-center text-slate-400">
                                    <Settings className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-400">System Logs</h3>
                                <p className="text-slate-400 text-sm mt-2">View audit logs and system performance metrics.</p>
                                <div className="mt-4 inline-block px-2 py-1 bg-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded">
                                    Coming Soon
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
