const express = require('express');
const router = express.Router();
const usersDAO = require('../database/users-dao.js');
const passport = require('passport');
const { hash, compare} = require("bcrypt");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Middleware di autenticazione
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Non autenticato" });
};

/**
 * Login dell'utente
 */
router.post('/users/login', passport.authenticate('local'), (req, res) => {
    res.json({ success: true, user: req.user });
});

/**
 * rotta per ottenere la password
 */
router.post('/users/getUserPassword', (req, res) => {
    const { username, password } = req.body;

    usersDAO.getUserPassword(username, password, (err, isMatch) => {
        if (err) {
            return res.status(500).json({ error: "Internal server error" });
        }
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Password incorrect" });
        }
        res.json({ success: true, message: "Password verified" });
    });
});

/**
 * rotta per accedera al dao per inserire la pfp
 */
router.post('/uploadProfilePic', upload.single('profilePic'), (req, res) => {
    const user = req.user;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ success: false, error: "Nessun file caricato" });
    }

    // Converte il file in un formato BLOB per il database
    const imgData = file.buffer;

    usersDAO.insertOrUpdatePfp(user.email, imgData, (err) => {
        if (err) {
            return res.status(500).json({ error: "Internal server error" });
        }
        res.status(201).json({ success: true, message: "Profile picture uploaded" });
    });
});

/**
 * rotta per leggere la pfp nel dao
 */
router.get('/getProfilePic', async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(400).json({ success: false, error: "Nessun utente al momento" });
    }
    try {
        const profilePicData = await usersDAO.getPfp(user.email);
        if (!profilePicData) {
            return res.status(404).json({ success: false, error: "Nessuna immagine trovata" });
        }
        res.status(200).json({ success: true, profilePic: profilePicData.image });
    } catch (err) {
        console.error("Errore durante il recupero dell'immagine profilo:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * rotta Logout dell'utente
 */
router.get('/users/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.redirect('/guest.html');
        });
    });
});

/**
 * Route per la registrazione di un nuovo utente
 */
router.post('/users/registration', (req, res) => {
    const { nome, cognome, email, birthDay, password, username } = req.body;
    const saltRounds = 10;
    hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Errore nel generare l\'hash della password' });
        }
        usersDAO.insertNewUser(nome, cognome, email, birthDay, hashedPassword, username, (err, result) => {
            if (err) {
                console.error("Errore durante la registrazione:", err);
                return res.status(500).json({ error: 'Errore durante la registrazione dell\'utente' });
            }

            res.json({ success: true, userId: result.id });
        });
    });
});

/**
 * Route per la modifica dei dati dell'utente
 */
router.post('/users/modifyData', (req, res) => {
    const { nome, cognome, username, email, birthDay } = req.body;
        if (req.err) {
            return res.status(500).json({ error: 'Errore nel generare l\'hash della password' });
        }
        usersDAO.updateUserData(nome, cognome, username, email, birthDay, (err, result) => {
            if (err) {
                console.error("Errore durante l'aggiornamento:", err);
                return res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'utente' });
            }

            res.json({ success: true, message: 'User data updated successfully' });
        });

});


/**
 * route cambio password di un utente
 */
router.post('/users/change-password', isLoggedIn, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Verifica la password corrente
        const isMatch = await compare(currentPassword, req.user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password attuale non corretta' });
        }

        // Hash della nuova password
        const hashedPassword = await hash(newPassword, 10);

        // Usa la funzione DAO per aggiornare la password
        await usersDAO.updateUserPassword(req.user.id, hashedPassword);

        res.json({ message: 'Password aggiornata con successo' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel cambio password' });
    }
});


/**
 * Serializzazione e deserializzazione utente
 */
passport.serializeUser((user, done) => {
    done(null, user.username); // Serializza solo l'username o l'ID utente
});

passport.deserializeUser((username, done) => {
    usersDAO.getUserByUsername(username)
        .then(user => done(null, user))
        .catch(err => done(err, null));
});

/**
 * Configurazione della strategia di autenticazione
 * @type {(function(Object, Function): void)|{}}
 */
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await usersDAO.getUserByUsername(username);
        if (!user) {
            return done(null, false, { message: 'Utente non trovato' });
        }

        // Usa bcrypt per confrontare la password
        const isMatch = await compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Password errata' });
        }
        console.log("passport funziona")
        return done(null, user); // Credenziali corrette
    } catch (err) {
        return done(err);
    }
}));

module.exports = router