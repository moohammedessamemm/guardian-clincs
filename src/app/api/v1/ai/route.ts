import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGING_FACE_ACCESS_TOKEN)

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { query, context } = await req.json()

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        // 1. Fetch User Role & Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', user.id)
            .single()

        const userRole = profile?.role || 'patient'
        const userName = profile?.full_name || 'User'
        const currentPath = context?.path || 'unknown'

        // 2. Search Knowledge Base for Context
        const { data: kbArticles, error } = await supabase
            .from('knowledge_base')
            .select('question, answer')
            .or(`question.ilike.%${query}%,tags.cs.{${query}}`)
            .limit(3)

        if (error) {
            console.error('KB Search Error:', error)
        }

        // 3. Construct System Prompt with Rich Context
        let kbContext = ""
        if (kbArticles && kbArticles.length > 0) {
            kbContext = "Here is some relevant information from the internal database:\n" +
                kbArticles.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n')
        }

        const systemPrompt = `You are Guardian AI, a smart helper for Guardian Medical Systems.
        
CURRENT CONTEXT:
- User: ${userName} (${userRole})
- Current Page: ${currentPath}

Your goal is to assist the ${userRole} specifically.
${userRole === 'doctor' ? "Using medical terminology is appropriate. Focus on efficiency and patient management." : "Use simple, clear language. Be empathetic and comforting."}

${currentPath.includes('appointments') ? "The user is currently looking at the appointment scheduler. Offer help with booking or managing slots." : ""}
${currentPath.includes('dashboard') ? "The user is on the main dashboard. Help them find their way around." : ""}

KNOWLEDGE BASE:
${kbContext ? kbContext : "No specific database articles found for this query."}

INSTRUCTIONS:
- Answer the user's question using the context above.
- If the user asks something you don't know, guide them to the appropriate section based on their role (e.g., Doctors see all records, Patients see only theirs).
- Keep answers concise.`

        // 4. Call Hugging Face Inference API
        const chatCompletion = await hf.chatCompletion({
            model: "meta-llama/Llama-3.2-3B-Instruct",
            messages: [
                { role: "user", content: systemPrompt + "\n\nUser Question: " + query }
            ],
            max_tokens: 500,
            temperature: 0.7
        })

        const aiResponse = chatCompletion.choices[0].message.content

        return NextResponse.json({
            response: aiResponse,
            sources: kbArticles || []
        })

    } catch (err: any) {
        console.error('AI Error:', err)

        // Critical: Check if the token is missing and warn the user
        if (!process.env.HUGGING_FACE_ACCESS_TOKEN) {
            return NextResponse.json({
                response: "⚠️ Configuration Error: The Hugging Face API Token is missing. Please add HUGGING_FACE_ACCESS_TOKEN to your Vercel Environment Variables.",
                sources: []
            })
        }

        return NextResponse.json({
            response: `I'm having trouble connecting to my AI brain. (Error: ${err.message || 'Unknown'})`,
            sources: []
        })
    }
}
