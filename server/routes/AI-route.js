const express = require('express');
const { spawn } = require('child_process');
const usersDao = require('../database/users-dao');

const router = express.Router();
const path = require('path');
const llmPath = path.resolve(__dirname, '../AI/llm.py');
const venvPython = path.resolve(__dirname, '../../venv/bin/python');

router.post('/llm', async (req, res) => {
    const messages = req.body.messages;
    const sessionId = req.body.sessionId; // Nuovo parametro per identificare la sessione
    const imageData = req.body.image; // Dati dell'immagine in base64

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Array di messaggi mancante o vuoto' });
    }

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID mancante' });
    }

    console.log('Ricevuti messaggi per sessione:', sessionId, messages);
    if (imageData) {
        console.log('Ricevuta anche un\'immagine per l\'analisi');
    }

    try {
        let user_preferences = null;
        let userId = null;

        // Se l'utente è autenticato, carica le preferenze
        if (req.session && req.session.userId) {
            userId = req.session.userId;
            const user = await usersDao.getUserById(userId);
            
            if (user && user.preferences) {
                user_preferences = JSON.parse(user.preferences);
            }
        }

        // Prepara i dati per Python (usa direttamente i messaggi ricevuti dal frontend)
        const inputData = JSON.stringify({ 
            messages: messages,
            user_preferences: user_preferences,
            image: imageData // Aggiungi l'immagine se presente
        });
        
        const pythonProcess = spawn(venvPython, [llmPath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        let errorOutput = '';
        let responseSet = false;

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', async (code) => {
            if (responseSet) return;
            responseSet = true;

            if (code !== 0) {
                console.error('Errore Python:', errorOutput);
                return res.status(500).json({ error: 'Errore nel processo Python' });
            }

            try {
                const result = JSON.parse(output.trim());
                console.log('Risposta AI:', result);

                // Se l'utente è autenticato, salva la conversazione
                if (userId && result.response) {
                    // Prendi solo l'ultimo messaggio utente (quello nuovo)
                    const userMessage = messages[messages.length - 1];
                    const aiResponse = { role: 'assistant', content: result.response };

                    // Salva solo se è davvero un nuovo messaggio dell'utente
                    if (userMessage && userMessage.role === 'user') {
                        await usersDao.saveChatMessage(userId, sessionId, JSON.stringify(userMessage));
                        await usersDao.saveChatMessage(userId, sessionId, JSON.stringify(aiResponse));
                        console.log('Messaggio salvato per utente:', userId, 'sessione:', sessionId);
                    }
                }

                res.json(result);
            } catch (error) {
                console.error('Errore parsing JSON:', error);
                // Fallback: restituisci il testo grezzo come risposta
                res.json({ response: output.trim() });
            }
        });

        pythonProcess.on('error', (error) => {
            if (responseSet) return;
            responseSet = true;
            
            console.error('Errore processo Python:', error);
            res.status(500).json({ error: 'Errore nel processo Python' });
        });

        // Timeout di sicurezza
        const timeoutId = setTimeout(() => {
            if (responseSet) return;
            responseSet = true;
            
            pythonProcess.kill();
            res.status(500).json({ error: 'Timeout esecuzione Python' });
        }, 60000);

        // Cancella il timeout se il processo finisce prima
        pythonProcess.on('close', () => {
            clearTimeout(timeoutId);
        });

        // Invia i dati a Python
        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();

    } catch (error) {
        console.error('Errore nel processamento della richiesta:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per ottenere tutte le sessioni di chat dell'utente
router.get('/chat-sessions', async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ error: 'Utente non autenticato' });
        }

        const sessions = await usersDao.getChatSessions(req.session.userId);
        res.json({ sessions });
    } catch (error) {
        console.error('Errore nel caricamento sessioni chat:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per ottenere i messaggi di una sessione specifica
router.get('/chat-sessions/:sessionId', async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ error: 'Utente non autenticato' });
        }

        const sessionId = req.params.sessionId;
        const messages = await usersDao.getChatSessionMessages(req.session.userId, sessionId);
        
        // Mappiamo i messaggi includendo anche il timestamp
        const formattedMessages = messages.map(msg => {
            const parsedMessage = JSON.parse(msg.message);
            return {
                ...parsedMessage,
                timestamp: msg.timestamp
            };
        });
        
        res.json({ messages: formattedMessages });
    } catch (error) {
        console.error('Errore nel caricamento messaggi sessione:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per cancellare una sessione specifica
router.delete('/chat-sessions/:sessionId', async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ error: 'Utente non autenticato' });
        }

        const sessionId = req.params.sessionId;
        await usersDao.deleteSession(req.session.userId, sessionId);
        
        res.json({ success: true, message: 'Sessione cancellata' });
    } catch (error) {
        console.error('Errore nella cancellazione sessione:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per ottenere la cronologia chat dell'utente (LEGACY - manteniamo per compatibilità)
router.get('/chat-history', async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ error: 'Utente non autenticato' });
        }

        const chatHistory = await usersDao.getChatHistory(req.session.userId);
        
        // Mappiamo i messaggi includendo anche il timestamp
        const messages = chatHistory.map(msg => {
            const parsedMessage = JSON.parse(msg.message);
            return {
                ...parsedMessage,
                timestamp: msg.timestamp
            };
        });
        
        res.json({ messages });
    } catch (error) {
        console.error('Errore nel caricamento cronologia chat:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per cancellare la cronologia chat dell'utente
router.delete('/chat-history', async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ error: 'Utente non autenticato' });
        }

        await usersDao.clearChatHistory(req.session.userId);
        
        res.json({ success: true, message: 'Cronologia chat cancellata' });
    } catch (error) {
        console.error('Errore nella cancellazione cronologia chat:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

module.exports = router;
