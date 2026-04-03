export const PROVIDERS = {
    groq: {
        name: "Groq",
        url: "https://api.groq.com/openai/v1/chat/completions",
        models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"]
    },
    openai: {
        name: "OpenAI",
        url: "https://api.openai.com/v1/chat/completions",
        models: ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo", "gpt-4o", "gpt-4o-mini"]
    },
    gemini: {
        name: "Google Gemini",
        url: "", // Dynamically defined in api.js due to key parameter
        models: ["gemini-1.5-flash", "gemini-1.5-pro"]
    }
};

export const DEFAULT_SETTINGS = {
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    apiKey: ""
};

export const SYSTEM_PROMPT = "You are a helpful, respectful, and honest assistant. Always answer as helpfully as possible, using Markdown format for better readability.";
