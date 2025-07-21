const express = require('express');
const router = express.Router();

router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',  // Rotta a cui reindirizzare dopo il login
    failureRedirect: '/login',      // Rotta da reindirizzare in caso di fallimento
    failureFlash: true              // Se stai usando connect-flash per messaggi d'errore
}));

router.get('/users/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});


module.exports = router;
