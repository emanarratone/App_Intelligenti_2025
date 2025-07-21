"use strict"

// require
const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session');
const path = require("path");
const UserDAO = require('./server/database/users-dao.js');


// init
const app = express()
const port = 3300
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.static(path.join(__dirname,'client')));


/**
 * controllo della sessione
 */
app.use(session({
    secret: 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 60 * 1000,
        secure: false,
        httpOnly: true,
        sameSite: 'Lax'
    }
}));
// Inizializza Passport e la gestione della sessione
app.use(passport.initialize());
app.use(passport.session());

// Configura il parsing del JSON
app.use(express.json());

/**
 * Inizializzazione di tutte le routes
 * @type {Router | {}}
 */
const apiRoutes = require('./server/routes/api.js');
const userRoutes = require('./server/routes/users-route.js');
const cartRoutes = require('./server/routes/cart-routes.js');
const ordineRoutes = require('./server/routes/ordine-route.js');
const spedizioneRoutes = require('./server/routes/luogoSpedizione-route.js');
const aiRoutes = require('./server/routes/AI-route.js')


module.exports = {app, port, passport, apiRoutes, userRoutes, cartRoutes, ordineRoutes, spedizioneRoutes, aiRoutes};