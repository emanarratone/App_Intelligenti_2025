import { AIManager } from './AI-manager.js';
import './chat-history-manager.js';

// Array per memorizzare la cronologia dei messaggi della chat corrente
let chatHistory = [];
let isAuthenticated = false;
let currentUser = null;

// Inizializza il controller
window.addEventListener('DOMContentLoaded', async function() {
    console.log('AI Controller caricato');
    
    // Inizializza il manager della cronologia chat
    await window.chatHistoryManager.initialize();
    
    // Aggiungi event listener per invio con Enter
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

// Funzione globale per iniziare una nuova chat
window.startNewChat = function() {
    chatHistory = [];
    window.chatHistoryManager.startNewChat();
};

// Controlla lo stato di autenticazione
async function checkAuthStatus() {
    try {
        const response = await fetch('/auth/profile');
        
        if (response.ok) {
            const userData = await response.json();
            isAuthenticated = true;
            currentUser = userData;
            showUserInfo(userData);
            
            // Carica la cronologia chat se l'utente è autenticato
            await loadChatHistory();
        } else {
            isAuthenticated = false;
            showGuestInfo();
        }
    } catch (error) {
        console.error('Errore nel controllo autenticazione:', error);
        isAuthenticated = false;
        showGuestInfo();
    }
}

// Mostra le informazioni dell'utente autenticato
function showUserInfo(userData) {
    const userInfo = document.getElementById('userInfo');
    const guestInfo = document.getElementById('guestInfo');
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    if (userInfo && guestInfo && welcomeMessage) {
        welcomeMessage.textContent = `Benvenuto, ${userData.username}!`;
        userInfo.classList.remove('d-none');
        guestInfo.classList.add('d-none');
    }
}

// Mostra le informazioni per gli utenti guest
function showGuestInfo() {
    const userInfo = document.getElementById('userInfo');
    const guestInfo = document.getElementById('guestInfo');
    
    if (userInfo && guestInfo) {
        userInfo.classList.add('d-none');
        guestInfo.classList.remove('d-none');
    }
}

// Carica la cronologia chat per utenti autenticati
async function loadChatHistory() {
    try {
        const response = await fetch('/ai/chat-history');
        
        if (response.ok) {
            const data = await response.json();
            if (data.messages && data.messages.length > 0) {
                // Pulisci l'area messaggi
                const chatMessages = document.getElementById('chatMessages');
                chatMessages.innerHTML = '';
                
                // Carica i messaggi dalla cronologia
                data.messages.forEach(message => {
                    const sender = message.role === 'user' ? 'user' : 'ai';
                    addMessageToChat(sender, message.content);
                });
                
                // Aggiorna la cronologia locale
                chatHistory = data.messages;
            }
        }
    } catch (error) {
        console.error('Errore nel caricamento cronologia:', error);
    }
}

// Funzione per visualizzare il profilo
window.viewProfile = function() {
    window.location.href = 'profile.html';
};

// Funzione per logout
window.logout = async function() {
    if (confirm('Sei sicuro di voler effettuare il logout?')) {
        try {
            const response = await fetch('/auth/logout', {
                method: 'POST'
            });
            
            if (response.ok) {
                window.location.href = 'login.html';
            } else {
                alert('Errore durante il logout');
            }
        } catch (error) {
            console.error('Errore durante il logout:', error);
            alert('Errore durante il logout');
        }
    }
};


window.isSending = false;

window.sendMessage = async function() {
    if (window.isSending) {
        // Se è già in corso un invio, non fare nulla
        return;
    }

    const userInput = document.getElementById('userInput');
    let message = userInput.value.trim();

    if (!message && currentImageData) {
        message = 'Analizza questa immagine e dammi consigli di moda';
    }

    if (!message && !currentImageData) {
      alert("Inserisci almeno un testo o un'immagine");    
        return;
    }

    window.isSending = true;

    try {
        // Prepara messaggio finale da mostrare in chat
        let displayMessage = message;
        if (currentImageData) {
            displayMessage += ' 📷';
        }

        // Aggiungi messaggio utente alla chat
        window.chatHistoryManager.addMessageToChat(displayMessage, 'user', true);

        // Aggiungi alla cronologia locale
        chatHistory.push({ role: 'user', content: message });

        // Pulisci input e rimuovi immagine
        userInput.value = '';
        const imageData = currentImageData;
        if (currentImageData) {
            removeImage();
        }

        // Mostra caricamento e disabilita bottoni
        showLoadingIndicator(true);
        toggleButtons(false);

        // Invia il messaggio all'AI
        const sessionId = window.chatHistoryManager.getCurrentSessionId();
        const response = await AIManager.sendMessage(chatHistory, sessionId, imageData);

        if (response && response.response) {
            window.chatHistoryManager.addMessageToChat(response.response, 'ai', true);
            chatHistory.push({ role: 'assistant', content: response.response });

            if (window.chatHistoryManager.isAuthenticated) {
                setTimeout(() => {
                    window.chatHistoryManager.loadChatHistory();
                }, 500);
            }
        } else {
            throw new Error('Risposta AI non valida');
        }

    } catch (error) {
        console.error('Errore nell\'invio del messaggio:', error);
        window.chatHistoryManager.addMessageToChat(
            'Spiacente, si è verificato un errore. Riprova più tardi.',
            'ai',
            true
        );
    } finally {
        // Nascondi caricamento, riabilita bottoni, resetta stato invio e focus input
        showLoadingIndicator(false);
        toggleButtons(true);
        window.isSending = false;
        userInput.focus();
    }
};


// Funzione per resettare la chat
window.resetChat = function() {
    if (confirm('Sei sicuro di voler resettare la chat?')) {
        window.startNewChat();
    }
};

// Funzione per mostrare/nascondere l'indicatore di caricamento
function showLoadingIndicator(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        if (show) {
            loadingIndicator.classList.remove('d-none');
        } else {
            loadingIndicator.classList.add('d-none');
        }
    }
}

// Funzione per abilitare/disabilitare i pulsanti
function toggleButtons(enabled) {
    const sendBtn = document.getElementById('sendBtn');
    const resetBtn = document.getElementById('resetBtn');
    const userInput = document.getElementById('userInput');
    
    if (sendBtn) sendBtn.disabled = !enabled;
    if (resetBtn) resetBtn.disabled = !enabled;
    if (userInput) userInput.disabled = !enabled;
}

// Funzione per formattare il messaggio dell'AI
function formatAIMessage(message) {
    // Prima converti le interruzioni di linea in <br>
    let formatted = message.replace(/\n/g, '<br>');
    
    // Rendi i link cliccabili
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" style="color: #007bff; text-decoration: none;">$1</a>');
    
    return formatted;
}

// Funzione per aggiungere un messaggio alla chat
function addMessageToChat(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = sender === 'user' ? '👤' : '🤖';
    
    // Usa formatAIMessage per i messaggi dell'AI, escapeHtml per l'utente
    const formattedMessage = sender === 'ai' ? formatAIMessage(message) : escapeHtml(message);
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-bubble">${formattedMessage}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll automatico verso il basso
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Funzione per mostrare/nascondere il loading
function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const sendBtn = document.getElementById('sendBtn');
    
    if (show) {
        loadingIndicator.classList.remove('d-none');
        sendBtn.disabled = true;
    } else {
        loadingIndicator.classList.add('d-none');
        sendBtn.disabled = false;
    }
}

// Funzione per resettare la chat
window.resetChat = async function() {
    if (confirm('Sei sicuro di voler resettare la chat? Tutti i messaggi verranno eliminati.')) {
        try {
            // Se l'utente è autenticato, cancella anche la cronologia server-side
            if (isAuthenticated) {
                const response = await fetch('/ai/chat-history', {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    console.error('Errore nella cancellazione cronologia server-side');
                }
            }
            
            // Pulisci la cronologia locale
            chatHistory = [];
            
            // Pulisci l'area messaggi
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = `
                <div class="message ai">
                    <div class="message-avatar">🤖</div>
                    <div class="message-bubble">
                        Ciao! Sono il tuo assistente AI. Come posso aiutarti oggi?
                    </div>
                </div>
            `;
            
            // Pulisci l'input
            document.getElementById('userInput').value = '';
            document.getElementById('userInput').focus();
            
        } catch (error) {
            console.error('Errore durante il reset della chat:', error);
        }
    }
};

// Funzione di utilità per escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Variabile per memorizzare l'immagine corrente
let currentImageData = null;

// Funzione per gestire la selezione di un'immagine
window.handleImageSelect = function(event) {
    const file = event.target.files[0];
    
    if (file) {
        // Controlla che sia un'immagine
        if (!file.type.startsWith('image/')) {
            alert('Per favore seleziona un file immagine valido.');
            return;
        }
        
        // Controlla la dimensione (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('L\'immagine è troppo grande. Massimo 5MB.');
            return;
        }
        
        // Leggi il file e convertilo in base64
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            
            // Estrai solo la parte base64 (rimuovi il prefisso data:image/...)
            const base64 = imageData.split(',')[1];
            currentImageData = base64;
            
            // Mostra l'anteprima
            document.getElementById('previewImg').src = imageData;
            document.getElementById('imagePreview').classList.remove('d-none');
            
            // Aggiungi testo suggerito se il campo è vuoto
            const userInput = document.getElementById('userInput');
            if (!userInput.value.trim()) {
                userInput.value = 'Analizza questa immagine e dammi consigli di moda';
            }
        };
        
        reader.readAsDataURL(file);
    }
};

// Funzione per rimuovere l'immagine selezionata
window.removeImage = function() {
    currentImageData = null;
    document.getElementById('imagePreview').classList.add('d-none');
    document.getElementById('imageInput').value = '';
    
    // Pulisci il testo se è quello suggerito
    const userInput = document.getElementById('userInput');
    if (userInput.value === 'Analizza questa immagine e dammi consigli di moda') {
        userInput.value = '';
    }
};
