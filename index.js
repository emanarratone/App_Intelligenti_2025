"use strict";
const app = require('./init.js');
const path = require('path');

// Configurazione porta
const port = process.env.PORT || 3000;

/**
 * Gestione delle pagine - solo homepage con chat AI
 */
app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client/HTML/login.html'));
});

// Route per le pagine HTML
app.get("/login.html", (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client/HTML/login.html'));
});

app.get("/register.html", (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client/HTML/register.html'));
});

app.get("/guest.html", (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client/HTML/guest.html'));
});

app.get("/AI-page.html", (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client/HTML/AI-page.html'));
});

app.get("/profile.html", (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client/HTML/profile.html'));
});

/**
 * Mostra su che porta sta girando il server
 */
app.listen(port, () => {
    console.log(`Server AI Agent in ascolto su http://localhost:${port}`);
});