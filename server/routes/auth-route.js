const express = require('express');
const usersDAO = require('../database/users-dao');

const router = express.Router();

// Middleware per verificare se l'utente è autenticato
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Accesso non autorizzato' });
    }
};

// Route per la registrazione
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, preferences } = req.body;
        
        // Validazioni di base
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email e password sono obbligatori' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'La password deve essere di almeno 6 caratteri' });
        }
        
        // Registra l'utente
        const result = await usersDAO.createUser(username, password, email, preferences);
        
        // Crea automaticamente la sessione dopo la registrazione
        req.session.userId = result.id;
        req.session.username = username;
        
        res.json({
            success: true,
            message: 'Registrazione completata con successo',
            user: {
                id: result.id,
                username: username,
                email: email
            }
        });
        
    } catch (error) {
        console.error('Errore registrazione:', error);
        res.status(500).json({ error: 'Errore durante la registrazione' });
    }
});// Route per il login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username e password sono obbligatori' });
        }
        
        // Autentica l'utente
        const user = await usersDAO.authenticateUser(username, password);
        
        if (user) {
            // Crea la sessione
            req.session.userId = user.id;
            req.session.username = user.username;
            
            // Parse delle preferenze se esistono
            let preferences = {};
            if (user.preferences) {
                try {
                    preferences = JSON.parse(user.preferences);
                } catch (e) {
                    console.error('Errore parsing preferenze:', e);
                }
            }
            
            req.session.preferences = preferences;
            
            res.json({
                success: true,
                message: 'Login completato con successo',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    preferences: preferences
                }
            });
        } else {
            res.status(401).json({ error: 'Credenziali non valide' });
        }
        
    } catch (error) {
        console.error('Errore login:', error);
        res.status(500).json(error);
    }
});

// Route per il logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Errore logout:', err);
            res.status(500).json({ error: 'Errore durante il logout' });
        } else {
            res.json({ success: true, message: 'Logout completato' });
        }
    });
});

// Route per verificare lo stato di autenticazione
router.get('/status', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            authenticated: true,
            user: {
                id: req.session.userId,
                username: req.session.username,
                preferences: req.session.preferences
            }
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Route per aggiornare le preferenze utente
router.put('/preferences', requireAuth, async (req, res) => {
    try {
        const { preferences } = req.body;
        const userId = req.session.userId;
        
        const result = await usersDAO.updateUserPreferences(userId, preferences);
        
        if (result.success) {
            // Aggiorna anche la sessione
            req.session.preferences = preferences;
            res.json(result);
        } else {
            res.status(500).json(result);
        }
        
    } catch (error) {
        console.error('Errore aggiornamento preferenze:', error);
        res.status(500).json({ error: 'Errore durante l\'aggiornamento' });
    }
});

// Route per ottenere i dati dell'utente corrente
router.get('/profile', async (req, res) => {
    try {
        // Verifica se l'utente è autenticato
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ error: 'Utente non autenticato' });
        }

        const userId = req.session.userId;
        const user = await usersDAO.getUserById(userId);
        
        if (user) {
            // Parse delle preferenze se esistono
            let preferences = {};
            if (user.preferences) {
                try {
                    preferences = JSON.parse(user.preferences);
                } catch (e) {
                    console.error('Errore parsing preferenze:', e);
                }
            }

            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                preferences: preferences
            });
        } else {
            res.status(404).json({ error: 'Utente non trovato' });
        }
        
    } catch (error) {
        console.error('Errore recupero profilo:', error);
        res.status(500).json({ error: 'Errore nel recupero del profilo' });
    }
});

module.exports = router;