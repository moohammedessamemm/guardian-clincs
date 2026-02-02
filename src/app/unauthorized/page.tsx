import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 animate-in fade-in zoom-in duration-500">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
                <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    You do not have permission to access this page. This area is restricted to authorized personnel only.
                </p>
                <div className="space-y-3">
                    <Button asChild className="w-full bg-slate-900 hover:bg-slate-800" size="lg">
                        <Link href="/">Return Home</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full" size="lg">
                        <Link href="/login">Sign in with different account</Link>
                    </Button>
                </div>
                <p className="text-xs text-slate-400 mt-8">
                    Security ID: {Math.random().toString(36).substring(7).toUpperCase()}
                </p>
            </div>
        </div>
    )
}
