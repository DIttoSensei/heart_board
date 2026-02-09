import { OpenAI } from "openai";

const client = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HF_TOKEN, // Vercel will inject this securely
});

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message } = req.body;

    try {
        const chatCompletion = await client.chat.completions.create({
            model: "meta-llama/Llama-3.1-8B-Instruct:novita",
            messages: [
                {
                    role: "system",
                    content: `You are a "Vibe Checker" for a romance board. 
                    Your ONLY job is to say "PASS" if the message is about love, longing, a person, or a story.
                    Even short sweet messages like "I love you" or "Miss you" are a PASS.
                    Only say "REJECT" if it is total gibberish like "asdfghjkl" or aggressive hate.
                    Respond with ONLY one word: PASS or REJECT.`
                },

                {
                    role: "user",
                    content: `Analyze this message: "${message}"`
                },
            ],
            max_tokens: 10,
            temperature: 0.5,
        });

        const decision = chatCompletion.choices[0].message.content.trim().toUpperCase();
        
        // Return true if the AI says PASS
        return res.status(200).json({ isSafe: decision.includes("PASS") });

    } catch (error) {
        console.error("AI Error:", error);
        // If AI fails, we allow it (fallback) or reject—your choice.
        return res.status(500).json({ isSafe: true, error: "AI logic bypassed" });
    }
}