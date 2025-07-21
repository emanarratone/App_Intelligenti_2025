"use strict";
const { app, port , apiRoutes, userRoutes,
    cartRoutes, ordineRoutes, spedizioneRoutes,
    aiRoutes} = require('./init.js');

const path = require('path');
const passport = require("passport");
const {Strategy: LocalStrategy} = require("passport-local");

/**
 * attivo tute le route
 */
app.use('/api', apiRoutes);
app.use('/users-route', userRoutes);
app.use('/cart-routes', cartRoutes);
app.use('/ordine-route', ordineRoutes);
app.use('/luogoSpedizione-route', spedizioneRoutes);
app.use('/ai', aiRoutes);

/**
 * Middleware di autenticazione per vedere la sessione
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.isGuest = true;
    return next();
};


/**
 * Gestione delle pagine
 */
app.get("/", isLoggedIn, (req, res) => {
    if (req.isGuest) {
        console.log("sono guest")
        res.sendFile(path.resolve(__dirname, 'client/HTML/guest.html'));
    } else {
        res.sendFile(path.resolve(__dirname, 'client/HTML/index-logged.html'));
    }
});


// Rotta protetta per la dashboard
app.get('/dashboard', isLoggedIn, (req, res) => {
    if (req.isGuest) {
        return res.redirect('/');  // Se non autenticato, reindirizza a login
    }
    console.log("sono passto di qui")
    res.sendFile(path.resolve(__dirname, 'client/HTML/index-logged.html'));  // Utente autenticato, mostra la dashboard
});


app.get('/profile', isLoggedIn, (req, res) => {
    if (req.isGuest) {
        return res.redirect('/');  // Se non autenticato, reindirizza alla homepage
    }
    res.sendFile(path.resolve(__dirname, 'client/profile.html'));  // Se autenticato, mostra il profilo
});

app.get('/api/user', isLoggedIn, (req, res) => {
    if (req.user) {
        res.json({
            username: req.user.username,
            email: req.user.email,
            //profilePic: req.user.profilePic || '/path/to/default/profile/pic.png'
            password: req.user.password,
            Nome: req.user.Nome,
            Cognome: req.user.Cognome,
            birthDay: req.user.birthDay,
        });
    } else {
        res.status(401).json({ message: "Non autenticato" });
    }
});



// Rotta di login
app.post('/', passport.authenticate('local', {
    failureRedirect: '/',  // Reindirizza a login in caso di fallimento
    failureFlash: true  // Mostra un messaggio di errore se necessario
}), (req, res) => {
    // Login riuscito, reindirizza a /dashboard
    res.redirect('/dashboard');
});


/**
 * mostra su che porta sta girando il server
 */
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});

module.exports = passport