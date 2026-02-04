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

        const { query } = await req.json()

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        // 1. Search Knowledge Base for Context
        const { data: kbArticles, error } = await supabase
            .from('knowledge_base')
            .select('question, answer')
            .or(`question.ilike.%${query}%,tags.cs.{${query}}`)
            .limit(3)

        if (error) {
            console.error('KB Search Error:', error)
        }

        // 2. Construct System Prompt with Context
        let context = ""
        if (kbArticles && kbArticles.length > 0) {
            context = "Here is some relevant information from the internal database to help you answer:\n" +
                kbArticles.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n')
        }

        const systemPrompt = `You are Guardian AI, a helpful, professional, and empathetic medical assistant for Guardian Medical Systems.
Your goal is to assist users (patients or staff) with their inquiries about the platform, appointments, and general medical guidance.
${context ? `\n${context}\nUse the above information to answer the user's question if relevant.` : ""}
If the user asks about appointments or prescriptions and you don't have specific data, guide them to the appropriate sections of the dashboard ('Appointments' or 'Medical Records').
Keep your answers concise, friendly, and helpful. Do not make up medical advice not present in the context.`

        // 3. Call Hugging Face Inference API
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

    } catch (err) {
        console.error('AI Error:', err)
        // Fallback if AI service is down or rate limited
        return NextResponse.json({
            response: "I apologize, but I'm having trouble connecting to my AI brain right now. Please try again in a moment.",
            sources: []
        })
        // return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
