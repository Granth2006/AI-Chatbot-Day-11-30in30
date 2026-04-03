// Handles localStorage operations
export class StorageHandler {
    static CHATS_KEY = 'ai_chatbot_sessions';
    static CURRENT_CHAT_KEY = 'ai_chatbot_current';
    static SETTINGS_KEY = 'ai_chatbot_settings';

    // Settings
    static getSettings() {
        const settings = localStorage.getItem(this.SETTINGS_KEY);
        return settings ? JSON.parse(settings) : null;
    }

    static saveSettings(settings) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    }

    // Get all chat sessions
    static getChats() {
        const chats = localStorage.getItem(this.CHATS_KEY);
        return chats ? JSON.parse(chats) : {};
    }

    // Save chat sessions
    static saveChats(chats) {
        localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats));
    }

    // Create a new chat session
    static createNewChat() {
        const chatId = 'chat_' + Date.now();
        const chats = this.getChats();
        
        chats[chatId] = {
            id: chatId,
            title: 'New Chat',
            createdAt: Date.now(),
            messages: []
        };
        
        this.saveChats(chats);
        this.setCurrentChatId(chatId);
        return chatId;
    }

    // Get a specific chat
    static getChat(chatId) {
        const chats = this.getChats();
        return chats[chatId] || null;
    }

    // Update a chat's messages and potentially its title
    static updateChat(chatId, messages, title = null) {
        const chats = this.getChats();
        if (chats[chatId]) {
            chats[chatId].messages = messages;
            if (title) {
                chats[chatId].title = title;
            }
            this.saveChats(chats);
        }
    }

    // Get current chat ID
    static getCurrentChatId() {
        let currentId = localStorage.getItem(this.CURRENT_CHAT_KEY);
        const chats = this.getChats();
        
        // Validate if currentId still exists
        if (!currentId || !chats[currentId]) {
            currentId = this.createNewChat();
        }
        return currentId;
    }

    // Set current chat ID
    static setCurrentChatId(chatId) {
        localStorage.setItem(this.CURRENT_CHAT_KEY, chatId);
    }

    // Delete a specific chat
    static deleteChat(chatId) {
        const chats = this.getChats();
        if (chats[chatId]) {
            delete chats[chatId];
            this.saveChats(chats);
            // If current chat is deleted, reset current chat key
            if (localStorage.getItem(this.CURRENT_CHAT_KEY) === chatId) {
                localStorage.removeItem(this.CURRENT_CHAT_KEY);
            }
        }
    }

    // Clear all memory
    static clearAll() {
        localStorage.removeItem(this.CHATS_KEY);
        localStorage.removeItem(this.CURRENT_CHAT_KEY);
    }
    
    // Auto generate title based on first user message
    static generateTitle(message) {
        // Take first 30 chars
        const title = message.substring(0, 30);
        return title.length === 30 ? title + '...' : title;
    }
}
