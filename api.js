import { PROVIDERS, SYSTEM_PROMPT } from './config.js';
import { StorageHandler } from './storage.js';

export class APIHandler {
    static async sendMessage(messages) {
        const settings = StorageHandler.getSettings();
        if (!settings || !settings.apiKey) {
            throw new Error("API Key is missing. Please open Settings (gear icon bottom left) and enter your API Key.");
        }

        const providerData = PROVIDERS[settings.provider];
        if (!providerData) throw new Error("Invalid provider logic");

        if (settings.provider === 'openai' || settings.provider === 'groq') {
            return this.callOpenAIFormat(settings, providerData, messages);
        } else if (settings.provider === 'gemini') {
            return this.callGeminiFormat(settings, messages);
        }
    }

    static async callOpenAIFormat(settings, providerData, messages) {
        const payload = {
            model: settings.model,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages
            ],
            temperature: 0.7,
        };

        const response = await fetch(providerData.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${settings.apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    static async callGeminiFormat(settings, messages) {
        // Construct the URL dynamically for Gemini REST API map
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`;
        
        let geminiMessages = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const payload = {
            system_instruction: {
                parts: { text: SYSTEM_PROMPT }
            },
            contents: geminiMessages,
            generationConfig: {
                temperature: 0.7
            }
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Return structured Gemini response payload text
        if(data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
           return data.candidates[0].content.parts[0].text;
        }
        return "Received an empty or malformed response from Gemini.";
    }
}
