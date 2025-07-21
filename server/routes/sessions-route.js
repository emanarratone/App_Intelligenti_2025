var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator'); // validation middleware
const { passport } = require('../../index.js');


router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            // display wrong login messages
            return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, function(err) {
            if (err) { return next(err); }
            // req.user contains the authenticated user
            return res.json(req.user);
        });
    })(req, res, next);
});


router.delete('/logout', function(req, res){
    req.logout(function(err) {
        if (err) { throw err; }
        res.end('');
    });
});


module.exports = router;