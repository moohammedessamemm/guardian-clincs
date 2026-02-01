'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Bell, Shield, Loader2, CheckCircle, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
    const supabase = createClient()

    // Password state
    const [isPasswordLoading, setIsPasswordLoading] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    // Profile state
    const [isProfileLoading, setIsProfileLoading] = useState(true)
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        phone: ''
    })
    const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    // Load Profile Data
    useEffect(() => {
        async function loadProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, phone')
                    .eq('id', user.id)
                    .single()

                setProfileData({
                    fullName: profile?.full_name || '',
                    email: user.email || '',
                    phone: profile?.phone || ''
                })
            } catch (error) {
                console.error('Error loading profile:', error)
            } finally {
                setIsProfileLoading(false)
            }
        }
        loadProfile()
    }, [])

    const handleProfileUpdate = async () => {
        setProfileStatus(null)
        setIsSavingProfile(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profileData.fullName,
                    phone: profileData.phone
                })
                .eq('id', user.id)

            if (error) throw error

            setProfileStatus({ type: 'success', message: 'Profile updated successfully.' })
        } catch (error: any) {
            setProfileStatus({ type: 'error', message: error.message || 'Failed to update profile.' })
        } finally {
            setIsSavingProfile(false)
        }
    }

    const handlePasswordUpdate = async () => {
        setPasswordStatus(null)
        if (!currentPassword || !newPassword) {
            setPasswordStatus({ type: 'error', message: 'Please fill in both fields.' })
            return
        }

        setIsPasswordLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user || !user.email) throw new Error("User not valid")

            // 1. Verify current password
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword
            })

            if (signInError) {
                throw new Error("Current password is incorrect.")
            }

            // 2. Update to new password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) throw updateError

            setPasswordStatus({ type: 'success', message: 'Password updated successfully.' })
            setCurrentPassword("")
            setNewPassword("")
        } catch (error: any) {
            setPasswordStatus({ type: 'error', message: error.message || 'Failed to update password.' })
        } finally {
            setIsPasswordLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
                <p className="text-slate-500 mt-1">Manage your account preferences and security.</p>
            </div>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="bg-slate-100 p-1 rounded-xl w-full md:w-auto grid grid-cols-3 md:flex gap-1">
                    <TabsTrigger value="account" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Account</TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Notifications</TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-6 mt-6 animate-in fade-in-50">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-[#004b87]" />
                                Profile Information
                            </CardTitle>
                            <CardDescription>Update your personal details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isProfileLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                                </div>
                            ) : (
                                <>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullname">Full Name</Label>
                                            <Input
                                                id="fullname"
                                                value={profileData.fullName}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                value={profileData.email}
                                                disabled
                                                className="bg-slate-50 text-slate-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                                placeholder="+1..."
                                            />
                                        </div>
                                    </div>

                                    {profileStatus && (
                                        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${profileStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {profileStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                            {profileStatus.message}
                                        </div>
                                    )}

                                    <div className="pt-4 flex justify-end">
                                        <Button
                                            className="bg-[#004b87] hover:bg-[#003865]"
                                            onClick={handleProfileUpdate}
                                            disabled={isSavingProfile}
                                        >
                                            {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6 mt-6 animate-in fade-in-50">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-[#004b87]" />
                                Notification Preferences
                            </CardTitle>
                            <CardDescription>Control how we contact you.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-slate-400">
                                Notification settings coming soon.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6 mt-6 animate-in fade-in-50">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-[#004b87]" />
                                Security Settings
                            </CardTitle>
                            <CardDescription>Manage your password and sessions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-pass">Current Password</Label>
                                <Input
                                    id="current-pass"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-pass">New Password</Label>
                                <Input
                                    id="new-pass"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>

                            {passwordStatus && (
                                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${passwordStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {passwordStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                    {passwordStatus.message}
                                </div>
                            )}

                            <div className="pt-4 flex justify-end">
                                <Button
                                    className="bg-[#004b87] hover:bg-[#003865]"
                                    onClick={handlePasswordUpdate}
                                    disabled={isPasswordLoading}
                                >
                                    {isPasswordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Password'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
