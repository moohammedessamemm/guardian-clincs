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
import { Search, Loader2, Lock, KeyRound, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { updateUserPassword, deleteUser } from "@/actions/admin-users"

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

    // Password Reset State
    const [resetDialogOpen, setResetDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
    const [newPassword, setNewPassword] = useState('')

    const [resetLoading, setResetLoading] = useState(false)

    // Delete User State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<Profile | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

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

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUser || !newPassword) return

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long')
            return
        }

        setResetLoading(true)
        try {
            const result = await updateUserPassword(selectedUser.id, newPassword)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`Password updated for ${selectedUser.full_name}`)
                setResetDialogOpen(false)
                setNewPassword('')
                setSelectedUser(null)
            }
        } catch (error) {
            toast.error('Failed to update password')
        } finally {
            setResetLoading(false)
        }
    }

    const openResetDialog = (user: Profile) => {
        setSelectedUser(user)
        setNewPassword('')
        setResetDialogOpen(true)
    }

    const openDeleteDialog = (user: Profile) => {
        setUserToDelete(user)
        setDeleteDialogOpen(true)
    }

    const handleDeleteUser = async () => {
        if (!userToDelete) return
        setDeleteLoading(true)
        try {
            const result = await deleteUser(userToDelete.id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`User ${userToDelete.full_name} deleted successfully`)
                setDeleteDialogOpen(false)
                setUserToDelete(null)
                // Optimistically remove from list
                setUsers(users.filter(u => u.id !== userToDelete.id))
            }
        } catch (error) {
            toast.error('Failed to delete user')
        } finally {
            setDeleteLoading(false)
        }
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
                                        <TableHead className="font-bold text-slate-800 uppercase text-xs tracking-wider text-right">Actions</TableHead>
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
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openResetDialog(user)}
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                                        title="Change Password"
                                                    >
                                                        <KeyRound className="h-4 w-4" />
                                                        <span className="sr-only">Change Password</span>
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openDeleteDialog(user)}
                                                        disabled={user.role === 'admin'} // Prevent deleting admins? Maybe allow but be careful. Let's prevent for safety.
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete User</span>
                                                    </Button>
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

            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Enter a new password for <span className="font-medium text-slate-900">{selectedUser?.full_name}</span>.
                            This will immediately update their login credentials.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePasswordReset} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                id="new-password"
                                type="text"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter strong password..."
                                className="font-mono"
                                autoComplete="off"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setResetDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!newPassword || resetLoading} className="bg-[#004b87] hover:bg-[#003865]">
                                {resetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Password
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md border-red-200">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-red-600 mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <DialogTitle className="text-red-700">Delete User Account</DialogTitle>
                        </div>
                        <DialogDescription className="text-slate-600">
                            Are you sure you want to permanently delete <span className="font-bold text-slate-900">{userToDelete?.full_name}</span>?
                            <br /><br />
                            This action cannot be undone. All user data, appointments, and history will be removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteUser}
                            disabled={deleteLoading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
