'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from '@/lib/supabase/client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Profile {
    id: string
    email: string
    full_name: string
    role: 'patient' | 'doctor' | 'staff' | 'admin'
    created_at: string
}

export default function AdminUsersPage() {
    const supabase = createClient()
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) setUsers(data as Profile[])
            if (error) console.error('Error fetching users:', error)
            setLoading(false)
        }
        fetchUsers()
    }, [supabase])

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdating(userId)
        // Optimistic update
        const originalUsers = [...users]
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as Profile['role'] } : u))

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)

        if (error) {
            console.error('Error updating role:', error)
            toast.error('Failed to update role. Check console for details.')
            setUsers(originalUsers) // Revert
        }
        setUpdating(null)
    }

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            case 'doctor': return 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            case 'staff': return 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            default: return 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
                <p className="text-slate-500 mt-1">View and manage user roles and permissions.</p>
            </div>

            <Card className="border-none shadow-lg shadow-slate-200/50 bg-white">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-sm group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            <Input
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all focus:shadow-sm"
                            />
                        </div>
                        <div className="ml-auto text-sm text-slate-500">
                            Showing {filteredUsers.length} of {users.length} users
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-500" />
                            <p>Loading user database...</p>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-slate-100 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                                    <TableRow className="hover:bg-slate-50/80 border-b border-slate-200">
                                        <TableHead className="font-bold text-slate-800 uppercase text-xs tracking-wider">User Profile</TableHead>
                                        <TableHead className="font-bold text-slate-800 uppercase text-xs tracking-wider">Assigned Role</TableHead>
                                        <TableHead className="font-bold text-slate-800 uppercase text-xs tracking-wider">Contact Email</TableHead>
                                        <TableHead className="font-bold text-slate-800 uppercase text-xs tracking-wider">Joined</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                                No users found matching your search.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-slate-50/80 transition-all duration-200 group border-b border-slate-100 last:border-0">
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm bg-slate-100 group-hover:scale-105 transition-transform duration-300">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name}`} />
                                                            <AvatarFallback className="text-slate-600 font-medium">
                                                                {user.full_name?.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-semibold text-slate-900 group-hover:text-[#004b87] transition-colors">{user.full_name || 'Unknown'}</div>
                                                            <div className="text-xs text-slate-400 font-mono">ID: {user.id.slice(0, 8)}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Select
                                                            defaultValue={user.role}
                                                            onValueChange={(val) => handleRoleChange(user.id, val)}
                                                            disabled={updating === user.id || user.role === 'admin'}
                                                        >
                                                            <SelectTrigger className={`w-[130px] h-9 border-none shadow-sm font-medium focus:ring-1 focus:ring-offset-0 transition-all hover:shadow-md ${getRoleColor(user.role)}`}>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="patient">Patient</SelectItem>
                                                                <SelectItem value="doctor">Doctor</SelectItem>
                                                                <SelectItem value="staff">Staff</SelectItem>
                                                                <SelectItem value="admin">Admin</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {updating === user.id && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-600">{user.email}</TableCell>
                                                <TableCell className="text-slate-400 text-sm">
                                                    {new Date(user.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
