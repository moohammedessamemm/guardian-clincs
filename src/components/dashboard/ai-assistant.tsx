'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Bot, X, Send, Loader2, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
}

export function AiAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I am your Guardian Health Assistant. How can I help you today?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input }
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
            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response }
            setMessages(prev => [...prev, aiMsg])
        } catch (err) {
            console.error(err)
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: "I'm having trouble connecting right now. Please try again later." }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[350px] shadow-2xl rounded-xl overflow-hidden border border-border"
                    >
                        <Card className="h-[500px] flex flex-col border-0">
                            <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center space-x-2">
                                    <Bot className="h-6 w-6" />
                                    <CardTitle className="text-base">Guardian AI</CardTitle>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary/80" onClick={() => setIsOpen(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-background" ref={scrollRef}>
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                                            msg.role === 'user'
                                                ? "ml-auto bg-primary text-primary-foreground"
                                                : "bg-muted"
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                ))}
                                {loading && (
                                    <div className="bg-muted w-max rounded-lg px-3 py-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="p-3 bg-muted/20 border-t">
                                <form
                                    className="flex w-full items-center space-x-2"
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        handleSend()
                                    }}
                                >
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="ask a question..."
                                        className="flex-1"
                                    />
                                    <Button type="submit" size="icon" disabled={loading}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
                >
                    <MessageCircle className="h-8 w-8 text-white" />
                </Button>
            )}
        </div>
    )
}
