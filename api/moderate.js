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
            model: "meta-llama/Llama-3.1-8B-Instruct", 
            messages: [
                {
                    role: "system",
                    content: `You are a moderator for a "Missed Connections" board. 
                    The theme is love, romance, longing, and chance encounters.
                    
                    RULES:
                    1. ALLOW subjective, raw, or "crazy" stories. 
                    2. ALLOW swearing (fuck, etc.) if it's part of a story or emotional expression.
                    3. REJECT messages that are plain rubbish, incoherent gibberish, or pure aggressive hate speech unrelated to a connection.
                    4. REJECT spam or advertisements.
                    
                    Respond ONLY with the word "PASS" or "REJECT".`
                },
                {
                    role: "user",
                    content: `Analyze this message: "${message}"`
                },
            ],
            max_tokens: 5,
            temperature: 0.1, // Keep it consistent
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