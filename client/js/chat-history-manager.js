/**
 * Gestisce la cronologia delle chat e la sidebar
 */
export class ChatHistoryManager {
    constructor() {
        this.currentSessionId = null;
        this.isAuthenticated = false;
    }

    /**
     * Genera un nuovo ID sessione
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Inizializza il manager delle chat
     */
    async initialize() {
        const userData = await this.checkAuthStatus();
        if (this.isAuthenticated) {
            await this.loadChatHistory();
        }
        this.setupEventListeners();
        
        // Avvia una nuova chat di default
        this.startNewChat();
    }

    /**
     * Verifica lo stato di autenticazione
     */
    async checkAuthStatus() {
        try {
            const response = await fetch('/auth/profile');
            if (response.ok) {
                this.isAuthenticated = true;
                const userData = await response.json();
                document.getElementById('welcomeMessage').textContent = `Ciao, ${userData.username}!`;
                document.getElementById('userInfo').classList.remove('d-none');
                document.getElementById('guestInfo').classList.add('d-none');
                return userData;
            } else {
                this.isAuthenticated = false;
                document.getElementById('userInfo').classList.add('d-none');
                document.getElementById('guestInfo').classList.remove('d-none');
                return null;
            }
        } catch (error) {
            console.error('Errore nel controllo autenticazione:', error);
            this.isAuthenticated = false;
            return null;
        }
    }

    /**
     * Carica le sessioni di chat dal server
     */
    async loadChatHistory() {
        if (!this.isAuthenticated) return;
        
        try {
            const response = await fetch('/ai/chat-sessions');
            if (response.ok) {
                const data = await response.json();
                console.log('Sessioni caricate:', data);
                this.renderChatSessions(data.sessions || []);
            }
        } catch (error) {
            console.error('Errore nel caricamento sessioni:', error);
        }
    }

    /**
     * Renderizza la lista delle sessioni nella sidebar
     */
    renderChatSessions(sessions) {
        const historyContainer = document.getElementById('chatHistoryList');
        
        if (!sessions || sessions.length === 0) {
            historyContainer.innerHTML = '<p class="text-muted small text-center">Nessuna chat precedente</p>';
            return;
        }

        historyContainer.innerHTML = '';
        
        sessions.forEach((session, index) => {
            const sessionItem = document.createElement('div');
            sessionItem.className = 'chat-history-item';
            sessionItem.setAttribute('data-session-id', session.session_id);
            
            if (session.session_id === this.currentSessionId) {
                sessionItem.classList.add('active');
            }
            
            sessionItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="chat-history-preview">
                            Chat ${index + 1} (${session.message_count} messaggi)
                        </div>
                        <div class="chat-history-date">
                            ${this.formatDate(new Date(session.last_message_time))}
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="event.stopPropagation(); window.chatHistoryManager.deleteSession('${session.session_id}')" title="Elimina chat">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            
            sessionItem.addEventListener('click', () => this.loadSession(session.session_id));
            historyContainer.appendChild(sessionItem);
        });
    }

    /**
     * Raggruppa i messaggi per sessioni di chat
     */
    groupMessagesBySession(history) {
        if (!history || history.length === 0) return [];
        
        const sessions = [];
        let currentSession = null;
        let lastTimestamp = null;

        history.forEach(message => {
            const messageTime = new Date(message.timestamp);
            
            // Nuova sessione se passa più di 1 ora dall'ultimo messaggio
            if (!currentSession || !lastTimestamp || 
                (messageTime - lastTimestamp) > 60 * 60 * 1000) {
                
                currentSession = {
                    messages: [],
                    startTime: messageTime
                };
                sessions.push(currentSession);
            }
            
            currentSession.messages.push(message);
            lastTimestamp = messageTime;
        });

        return sessions.reverse(); // Mostra le più recenti per prime
    }

    /**
     * Carica una sessione di chat specifica
     */
    async loadSession(sessionId) {
        try {
            const response = await fetch(`/ai/chat-sessions/${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                this.loadMessagesIntoChat(data.messages || []);
                this.currentSessionId = sessionId;
                
                // Aggiorna l'UI per mostrare quale chat è attiva
                document.querySelectorAll('.chat-history-item').forEach(item => {
                    item.classList.remove('active');
                });
                document.querySelector(`[data-session-id="${sessionId}"]`)?.classList.add('active');
                
                // Aggiorna il titolo della chat
                const sessionNumber = Array.from(document.querySelectorAll('.chat-history-item')).findIndex(item => 
                    item.getAttribute('data-session-id') === sessionId) + 1;
                document.getElementById('chatTitle').textContent = `Chat ${sessionNumber}`;
            }
        } catch (error) {
            console.error('Errore nel caricamento sessione:', error);
        }
    }

    /**
     * Elimina una sessione di chat
     */
    async deleteSession(sessionId) {
        if (!confirm('Sei sicuro di voler eliminare questa chat?')) {
            return;
        }

        try {
            const response = await fetch(`/ai/chat-sessions/${sessionId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Se stiamo cancellando la sessione corrente, avvia una nuova chat
                if (sessionId === this.currentSessionId) {
                    this.startNewChat();
                }
                
                // Ricarica la lista delle sessioni
                await this.loadChatHistory();
            } else {
                alert('Errore nella cancellazione della chat');
            }
        } catch (error) {
            console.error('Errore nella cancellazione sessione:', error);
            alert('Errore nella cancellazione della chat');
        }
    }

    /**
     * Ottiene l'ID della sessione corrente
     */
    getCurrentSessionId() {
        if (!this.currentSessionId) {
            this.currentSessionId = this.generateSessionId();
        }
        return this.currentSessionId;
    }

    /**
     * Carica i messaggi nell'area della chat
     */
    loadMessagesIntoChat(messages) {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';

        messages.forEach(message => {
            this.addMessageToChat(message.content, message.role === 'user' ? 'user' : 'ai', false);
        });

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Formatta il messaggio dell'AI con link cliccabili e interruzioni di linea
     */
    formatAIMessage(message) {
        // Prima converti le interruzioni di linea in <br>
        let formatted = message.replace(/\n/g, '<br>');
        
        // Rendi i link cliccabili
        const urlRegex = /(https?:\/\/[^\s<]+)/g;
        formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" style="color: #007bff; text-decoration: none;">$1</a>');
        
        return formatted;
    }

    /**
     * Aggiunge un messaggio alla chat
     */
    addMessageToChat(content, sender, isNew = true) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = sender === 'user' ? '👤' : '🤖';
        const bubbleClass = sender === 'user' ? 'bg-primary text-white' : 'bg-light';
        
        // Usa formatAIMessage per i messaggi dell'AI
        const formattedContent = sender === 'ai' ? this.formatAIMessage(content) : content;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-bubble ${bubbleClass}" style="
                max-width: 70%; 
                padding: 15px 20px; 
                border-radius: 20px; 
                margin: 0 10px;
                word-wrap: break-word;
                ${sender === 'user' ? 'margin-left: auto;' : 'margin-right: auto;'}
            ">
                ${formattedContent}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        
        if (isNew) {
            // Scroll to bottom per nuovi messaggi
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    /**
     * Inizia una nuova chat
     */
    startNewChat() {
        // Genera un nuovo ID sessione
        this.currentSessionId = this.generateSessionId();
        
        // Reset dell'area chat
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = `
            <div class="message ai">
                <div class="message-avatar">🤖</div>
                <div class="message-bubble bg-light" style="
                    max-width: 70%; 
                    padding: 15px 20px; 
                    border-radius: 20px; 
                    margin: 0 10px;
                    word-wrap: break-word;
                    margin-right: auto;
                ">
                    Ciao! Sono il tuo assistente AI. Come posso aiutarti oggi?
                </div>
            </div>
        `;

        // Rimuovi selezione dalla cronologia
        document.querySelectorAll('.chat-history-item').forEach(item => {
            item.classList.remove('active');
        });

        // Reset del titolo
        document.getElementById('chatTitle').textContent = 'Nuova Chat';
        
        // Clear input
        document.getElementById('userInput').value = '';
        
        // Scroll to top
        chatMessages.scrollTop = 0;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Enter key per inviare messaggio
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (window.sendMessage) {
                    window.sendMessage();
                }
            }
        });
    }

    /**
     * Utility: tronca il testo
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Utility: formatta la data
     */
    formatDate(date) {
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Ieri';
        } else if (diffDays < 7) {
            return `${diffDays} giorni fa`;
        } else {
            return date.toLocaleDateString('it-IT');
        }
    }
}

// Istanza globale
window.chatHistoryManager = new ChatHistoryManager();