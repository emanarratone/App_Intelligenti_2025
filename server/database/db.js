"use strict";

const sqlite3 = require("sqlite3").verbose();
const DBFILE = './server/database/zalando.db';

/**
 * creo oggetto db per stabilire la connessione con il file del database
 * @type {Database}
 */
const db = new sqlite3.Database(DBFILE, (err) => {
    if (err) {
        console.error("Errore durante la connessione al database:", err);
        throw err;
    } else {
        console.log("Connessione al database stabilita con successo.");

        /**
         * Abilito i vincoli di chiavi esterna
         */
        db.run("PRAGMA foreign_keys = ON", (err) => {
            if (err) {
                console.error("Errore nell'abilitazione dei vincoli di chiave esterna:", err);
            } else {
                console.log("Vincoli di chiave esterna abilitati.");
            }
        });

        /**
         * Imposta il timeout per evitare errori SQLITE_BUSY
         */
        db.run("PRAGMA busy_timeout = 3000", (err) => {
            if (err) {
                console.error("Errore nell'impostazione del timeout per il database:", err);
            } else {
                console.log("Timeout per database impostato a 3000ms.");
            }
        });
    }
});

module.exports = db;
