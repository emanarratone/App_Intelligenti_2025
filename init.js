const express = require('express');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const database = require('./server/database/db');

// Importa le route
const aiRoutes = require('./server/routes/AI-route');
const authRoutes = require('./server/routes/auth-route');

// Crea l'applicazione Express
const app = express();

// Inizializza il database
database.init().then(() => {
    console.log('Database inizializzato correttamente');
}).catch(err => {
    console.error('Errore inizializzazione database:', err);
});

// Configurazione delle sessioni
app.use(session({
    secret: 'ai-agent-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configurazione multer per upload file
const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo file immagine sono ammessi'), false);
        }
    }
});

app.use(upload.any());

// Servire file statici
app.use(express.static(path.join(__dirname, 'client')));
app.use('/css', express.static(path.join(__dirname, 'client/css')));
app.use('/js', express.static(path.join(__dirname, 'client/js')));
app.use('/images', express.static(path.join(__dirname, 'client/images')));

// Route principali
app.use('/ai', aiRoutes);
app.use('/auth', authRoutes);

module.exports = app;
