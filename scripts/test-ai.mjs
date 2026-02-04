
import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const hf = new HfInference(process.env.HUGGING_FACE_ACCESS_TOKEN);


async function testConnection() {
    console.log("Token present:", !!process.env.HUGGING_FACE_ACCESS_TOKEN);
    try {
        // Trying a very standard, reliable model for free inference
        const response = await hf.chatCompletion({
            model: "meta-llama/Llama-3.2-3B-Instruct",
            messages: [{ role: "user", content: "Hello" }],
            max_tokens: 50
        });
        console.log("Success:", response.choices[0].message.content);
    } catch (error) {
        console.error("Test failed with status:", error.statusCode);
        if (error.response) {
            console.error("Error body:", await error.response.json());
        } else {
            console.error("Full Error:", JSON.stringify(error, null, 2));
        }
    }
}

testConnection();

