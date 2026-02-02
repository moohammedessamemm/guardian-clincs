import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { query } = await req.json()

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        // 1. Search Knowledge Base (Simple text match for now)
        // In a real app, we'd use pg_vector embeddings here
        const { data: kbArticles, error } = await supabase
            .from('knowledge_base')
            .select('question, answer')
            .or(`question.ilike.%${query}%,tags.cs.{${query}}`)
            .limit(3)

        if (error) {
            console.error('KB Search Error:', error)
            // Fallback: Don't fail, just return no results
        }

        // 2. Formatting the response
        let responseText = "I couldn't find specific information in my database about that."

        if (kbArticles && kbArticles.length > 0) {
            responseText = "Here is what I found:\n\n" +
                kbArticles.map(a => `**${a.question}**\n${a.answer}`).join('\n\n')
        } else {
            // 3. Fallback to a simple rule-based response if KB is empty
            if (query.toLowerCase().includes('appointment')) {
                responseText = "You can book an appointment by navigating to the 'Appointments' tab on the left."
            } else if (query.toLowerCase().includes('prescription')) {
                responseText = "Prescriptions are managed by your doctor. You can view them in the 'Medical Records' section."
            }
        }

        return NextResponse.json({
            response: responseText,
            sources: kbArticles || []
        })

    } catch (err) {
        console.error('AI Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
