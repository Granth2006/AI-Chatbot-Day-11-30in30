import { APIHandler } from './api.js';
import { StorageHandler } from './storage.js';
import { PROVIDERS, DEFAULT_SETTINGS } from './config.js';

class ChatApp {
    constructor() {
        // DOM Elements
        this.chatContainer = document.getElementById('chat-container');
        this.messagesWrapper = document.getElementById('messages-wrapper');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.voiceBtn = document.getElementById('voice-btn');
        this.newChatBtn = document.getElementById('new-chat-btn');
        this.chatList = document.getElementById('chat-history-list');
        this.clearBtn = document.getElementById('clear-all-btn');
        this.themeBtn = document.getElementById('theme-toggle-btn');
        this.menuBtn = document.getElementById('menu-btn');
        this.sidebar = document.getElementById('sidebar');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.currentChatTitle = document.getElementById('current-chat-title');
        this.exportBtn = document.getElementById('export-chat-btn');

        // Settings DOM
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.closeSettingsBtn = document.getElementById('close-settings-btn');
        this.providerSelect = document.getElementById('provider-select');
        this.modelSelect = document.getElementById('model-select');
        this.apiKeyInput = document.getElementById('api-key-input');
        this.saveSettingsBtn = document.getElementById('save-settings-btn');
        
        // Context Menu elements
        this.contextMenu = document.getElementById('context-menu');
        this.contextRenameBtn = document.getElementById('context-rename');
        this.contextDeleteBtn = document.getElementById('context-delete');
        this.contextChatId = null;

        // State
        this.currentChatId = null;
        this.messages = [];
        this.isTyping = false;

        // Configure marked.js with highlight.js
        marked.setOptions({
            highlight: function(code, lang) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            },
            langPrefix: 'hljs language-'
        });

        this.init();
    }

    init() {
        this.loadTheme();
        this.initSettings();
        this.setupEventListeners();
        this.loadSessions();
        this.loadCurrentChat();
    }

    initSettings() {
        let settings = StorageHandler.getSettings();
        if (!settings) {
            settings = DEFAULT_SETTINGS;
            StorageHandler.saveSettings(settings);
        }

        this.providerSelect.value = settings.provider || DEFAULT_SETTINGS.provider;
        this.populateModels(this.providerSelect.value);
        this.modelSelect.value = settings.model || DEFAULT_SETTINGS.model;
        this.apiKeyInput.value = settings.apiKey || '';
        
        // Adjust model if not valid for provider
        if (!PROVIDERS[this.providerSelect.value].models.includes(this.modelSelect.value)) {
            this.modelSelect.value = PROVIDERS[this.providerSelect.value].models[0];
            
            // Automatically patch memory if they had a deprecated/invalid model stored
            settings.model = this.modelSelect.value;
            StorageHandler.saveSettings(settings);
        }
    }

    populateModels(providerKey) {
        this.modelSelect.innerHTML = '';
        if (PROVIDERS[providerKey]) {
            PROVIDERS[providerKey].models.forEach(model => {
                const opt = document.createElement('option');
                opt.value = model;
                opt.textContent = model;
                this.modelSelect.appendChild(opt);
            });
        }
    }

    loadTheme() {
        const theme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        this.themeBtn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }

    setupEventListeners() {
        // Input text area auto-resize
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = (this.messageInput.scrollHeight) + 'px';
            if (this.messageInput.value.trim() !== '') {
                this.sendBtn.classList.add('active');
            } else {
                this.sendBtn.classList.remove('active');
            }
        });

        // Enter key to send (Shift+Enter for newline)
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        this.sendBtn.addEventListener('click', () => this.handleSend());
        this.newChatBtn.addEventListener('click', () => this.createNewChat());
        this.clearBtn.addEventListener('click', () => this.clearAllChats());
        this.themeBtn.addEventListener('click', () => this.toggleTheme());
        this.exportBtn.addEventListener('click', () => this.exportChat());

        // Settings Modal Listeners
        this.settingsBtn.addEventListener('click', () => {
            this.initSettings();
            this.settingsModal.classList.add('active');
        });
        
        this.closeSettingsBtn.addEventListener('click', () => {
            this.settingsModal.classList.remove('active');
        });

        // Close on overlay click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.settingsModal.classList.remove('active');
            }
        });

        // Context Menu outside click
        document.addEventListener('click', (e) => {
            if (e.target !== this.contextMenu && !this.contextMenu.contains(e.target)) {
                this.contextMenu.classList.remove('active');
            }
        });

        // Context menu actions
        this.contextRenameBtn.addEventListener('click', () => this.handleRenameChat());
        this.contextDeleteBtn.addEventListener('click', () => this.handleDeleteChat());

        this.providerSelect.addEventListener('change', (e) => {
            this.populateModels(e.target.value);
        });

        this.saveSettingsBtn.addEventListener('click', () => {
            const newSettings = {
                provider: this.providerSelect.value,
                model: this.modelSelect.value,
                apiKey: this.apiKeyInput.value.trim()
            };
            StorageHandler.saveSettings(newSettings);
            this.settingsModal.classList.remove('active');
        });

        // Mobile sidebar toggle
        this.menuBtn.addEventListener('click', () => {
            this.sidebar.classList.toggle('open');
        });

        // Voice Input
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.setupVoiceInput();
        } else {
            this.voiceBtn.style.display = 'none';
        }
    }

    setupVoiceInput() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.recognition.onstart = () => {
            this.voiceBtn.classList.add('recording');
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.messageInput.value += (this.messageInput.value ? ' ' : '') + transcript;
            this.sendBtn.classList.add('active');
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            this.voiceBtn.classList.remove('recording');
        };

        this.recognition.onend = () => {
            this.voiceBtn.classList.remove('recording');
        };

        this.voiceBtn.addEventListener('click', () => {
            if (this.voiceBtn.classList.contains('recording')) {
                this.recognition.stop();
            } else {
                this.recognition.start();
            }
        });
    }

    loadSessions() {
        const chats = StorageHandler.getChats();
        this.chatList.innerHTML = '';
        
        Object.values(chats).sort((a, b) => b.createdAt - a.createdAt).forEach(chat => {
            const item = document.createElement('div');
            item.className = 'chat-item' + (chat.id === this.currentChatId ? ' active' : '');
            item.dataset.id = chat.id;
            item.innerHTML = `
                <i class="fa-regular fa-message"></i>
                <span class="chat-title-text">${this.escapeHtml(chat.title)}</span>
            `;
            item.addEventListener('click', () => this.switchChat(chat.id));
            
            // Context menu event
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.contextChatId = chat.id;
                this.contextMenu.style.top = `${e.clientY}px`;
                this.contextMenu.style.left = `${e.clientX}px`;
                this.contextMenu.classList.add('active');
            });
            
            this.chatList.appendChild(item);
        });
    }

    loadCurrentChat() {
        this.currentChatId = StorageHandler.getCurrentChatId();
        const chat = StorageHandler.getChat(this.currentChatId);
        
        if (chat) {
            this.messages = chat.messages || [];
            this.currentChatTitle.textContent = chat.title;
            this.renderMessages();
            this.updateActiveSessionSidebar();
        }
    }

    switchChat(chatId) {
        StorageHandler.setCurrentChatId(chatId);
        if(window.innerWidth <= 768) {
            this.sidebar.classList.remove('open');
        }
        this.loadCurrentChat();
    }

    createNewChat() {
        StorageHandler.createNewChat();
        this.loadSessions();
        this.loadCurrentChat();
    }

    clearAllChats() {
        if(confirm("Are you sure you want to delete all chats? This cannot be undone.")) {
            StorageHandler.clearAll();
            this.createNewChat();
        }
    }

    handleRenameChat() {
        this.contextMenu.classList.remove('active');
        if (!this.contextChatId) return;

        const chat = StorageHandler.getChat(this.contextChatId);
        if (!chat) return;

        const newTitle = prompt("Enter new name for chat:", chat.title);
        if (newTitle !== null && newTitle.trim() !== "") {
            StorageHandler.updateChat(this.contextChatId, chat.messages, newTitle.trim());
            this.loadSessions();
            if (this.currentChatId === this.contextChatId) {
                this.currentChatTitle.textContent = newTitle.trim();
            }
        }
    }

    handleDeleteChat() {
        this.contextMenu.classList.remove('active');
        if (!this.contextChatId) return;
        
        if (confirm("Are you sure you want to delete this chat?")) {
            StorageHandler.deleteChat(this.contextChatId);
            if (this.currentChatId === this.contextChatId) {
                this.createNewChat();
            } else {
                this.loadSessions();
            }
        }
    }

    updateActiveSessionSidebar() {
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.id === this.currentChatId) {
                item.classList.add('active');
            }
        });
    }

    renderMessages() {
        this.messagesWrapper.innerHTML = '';
        if (this.messages.length === 0) {
            this.welcomeScreen.style.display = 'flex';
        } else {
            this.welcomeScreen.style.display = 'none';
            this.messages.forEach(msg => {
                this.appendMessage(msg.role, msg.content, msg.timestamp, false);
            });
            this.scrollToBottom();
        }
    }

    appendMessage(role, content, timestamp = Date.now(), scrollToBottom = true) {
        this.welcomeScreen.style.display = 'none';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const avatarIcon = role === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
        const formattedTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const displayContent = role === 'assistant' ? marked.parse(content) : `<p>${this.escapeHtml(content)}</p>`;
        
        messageDiv.innerHTML = `
            <div class="message-inner">
                <div class="avatar">${avatarIcon}</div>
                <div class="message-content markdown-body">
                    ${displayContent}
                    <div class="timestamp">${formattedTime}</div>
                </div>
                ${role === 'assistant' ? `
                <div class="message-actions">
                    <button class="copy-btn" title="Copy text" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(content)}'))">
                        <i class="fa-regular fa-clipboard"></i>
                    </button>
                </div>
                ` : ''}
            </div>
        `;
        
        this.messagesWrapper.appendChild(messageDiv);
        
        if (scrollToBottom) {
            this.scrollToBottom();
        }
    }

    escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;")
             .replace(/\n/g, "<br>");
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    async handleSend() {
        if (this.isTyping) return;
        
        const content = this.messageInput.value.trim();
        if (!content) return;

        // Reset input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.sendBtn.classList.remove('active');

        // Add user message via appendMessage and save state
        const userMessage = { role: 'user', content: content, timestamp: Date.now() };
        this.messages.push(userMessage);
        this.appendMessage('user', content, userMessage.timestamp);
        
        // Update title if it's the first message
        let titleUpdate = null;
        if (this.messages.length === 1) {
            titleUpdate = StorageHandler.generateTitle(content);
            this.currentChatTitle.textContent = titleUpdate;
            this.loadSessions();
        }

        StorageHandler.updateChat(this.currentChatId, this.messages, titleUpdate);

        // Show typing indicator
        this.isTyping = true;
        this.typingIndicator.classList.remove('hidden');
        this.scrollToBottom();

        // Get limited context (last 10 messages to save tokens)
        const contextMessages = this.messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
        }));

        try {
            const responseContent = await APIHandler.sendMessage(contextMessages);
            
            const aiMessage = { role: 'assistant', content: responseContent, timestamp: Date.now() };
            this.messages.push(aiMessage);
            StorageHandler.updateChat(this.currentChatId, this.messages);
            
            this.typingIndicator.classList.add('hidden');
            this.appendMessage('assistant', responseContent, aiMessage.timestamp);
            
        } catch (error) {
            this.typingIndicator.classList.add('hidden');
            const errorMsg = "**Error:** " + error.message;
            this.appendMessage('assistant', errorMsg);
        } finally {
            this.isTyping = false;
        }
    }

    exportChat() {
        if (this.messages.length === 0) return;
        
        let txData = `Chat Transcript: ${this.currentChatTitle.textContent}\nDate: ${new Date().toLocaleString()}\n\n`;
        this.messages.forEach(m => {
            const roleName = m.role === 'user' ? 'User' : 'AI Assistant';
            txData += `[${roleName}] - ${new Date(m.timestamp).toLocaleTimeString()}:\n${m.content}\n\n`;
        });
        
        const blob = new Blob([txData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat_export_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});
