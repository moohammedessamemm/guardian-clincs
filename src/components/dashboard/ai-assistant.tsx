'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Bot, X, Send, Sparkles, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
}

export function AiAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hi there! I am Guardian AI. How can I assist you with your health today?',
            timestamp: ''
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Set initial timestamp on mount to avoid hydration mismatch
        setMessages(prev => prev.map(msg =>
            msg.id === '1' && !msg.timestamp
                ? { ...msg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                : msg
        ))
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true)
        window.addEventListener('open-chat', handleOpenChat)
        return () => window.removeEventListener('open-chat', handleOpenChat)
    }, [])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const res = await fetch('/api/v1/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMsg.content }),
            })

            if (!res.ok) throw new Error('Failed to fetch response')

            const data = await res.json()
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            setMessages(prev => [...prev, aiMsg])
        } catch (err) {
            console.error(err)
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm encountering a temporary issue. Please try again shortly.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.9, transition: { duration: 0.2 } }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="pointer-events-auto mb-4 w-[calc(100vw-32px)] sm:w-[380px] h-[600px] flex flex-col rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 bg-white/80 backdrop-blur-xl relative"
                    >
                        {/* Ambient Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-white to-purple-50 -z-10" />

                        {/* Header */}
                        <div className="p-5 flex items-center justify-between border-b border-black/5 bg-white/50 backdrop-blur-md sticky top-0 z-20">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#004b87] to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                        <Sparkles className="w-5 h-5 fill-white" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base leading-tight">Guardian AI</h3>
                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        Always Active
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full hover:bg-black/5 text-slate-500 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 scroll-smooth" ref={scrollRef}>
                            <div className="space-y-6">
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        key={msg.id}
                                        className={cn(
                                            "flex flex-col gap-1 max-w-[85%]",
                                            msg.role === 'user' ? "ml-auto items-end" : "items-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed",
                                            msg.role === 'user'
                                                ? "bg-[#004b87] text-white rounded-tr-sm"
                                                : "bg-white text-slate-700 border border-slate-100 rounded-tl-sm shadow-sm"
                                        )}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-slate-400 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {msg.timestamp}
                                        </span>
                                    </motion.div>
                                ))}
                                {loading && (
                                    <div className="flex items-center gap-2 text-slate-400 p-2">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                        </div>
                                        <span className="text-xs font-medium">Guardian AI is typing...</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-white/20">
                            <form
                                className="relative flex items-center"
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    handleSend()
                                }}
                            >
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Message Guardian AI..."
                                    className="w-full pl-5 pr-14 py-6 rounded-full border-slate-200 bg-white shadow-sm focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all placeholder:text-slate-400"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={loading || !input.trim()}
                                    className="absolute right-2 h-9 w-9 rounded-full bg-[#004b87] hover:bg-[#003865] text-white shadow-md transition-all hover:scale-105 active:scale-95"
                                >
                                    <Send className="h-4 w-4 ml-0.5" />
                                </Button>
                            </form>
                            <div className="text-center mt-2.5">
                                <p className="text-[10px] text-slate-400">Powered by Guardian Medical Systems</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trigger Button */}
            {!isOpen && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="pointer-events-auto group relative"
                >
                    <span className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping duration-1000" />
                    <Button
                        onClick={() => setIsOpen(true)}
                        className="relative h-14 w-14 rounded-full shadow-xl shadow-blue-600/30 bg-gradient-to-tr from-[#004b87] to-blue-500 text-white border border-white/20 flex items-center justify-center overflow-hidden"
                    >
                        <Sparkles className="w-6 h-6 fill-white text-blue-50" />
                    </Button>
                </motion.div>
            )}
        </div>
    )
}
