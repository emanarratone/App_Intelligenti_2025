"use strict";
const db = require("./db");
const fs = require('fs');
const {compare} = require("bcrypt");

const UserDAO = {
    getUser: (username, password, callback) => {
        const query = 'SELECT username, password FROM utente WHERE username = ? AND password = ?';
        db.get(query, [username, password], (err, row) => {
            if (err) {
                console.error("Errore nella query del database:", err);  // Log dell'errore SQL
                return callback(err, null);
            }
            callback(null, row);  // `row` sarà null se non c'è corrispondenza
        });
    },

    insertNewUser: (nome, cognome, email, birthDay, password, username, callback) => {
        const query = 'INSERT INTO utente (nome, cognome, username, email, password, birthDay) VALUES (?, ?, ?, ?, ?, ?)';
        db.run(query, [nome, cognome, username, email, password, birthDay], function (err) {
            if (err) {
                console.error("Errore durante l'inserimento dell'utente:", err);  // Log dell'errore SQL
                return callback(err);
            }
            callback(null, {id: this.lastID});  // Restituisce l'ID dell'utente appena creato
        });
    },

    /**
     * funzione dao per inserire la pfp
     * @param email
     * @param profilepicBuffer
     * @param callback
     */
    insertOrUpdatePfp: (email, profilepicBuffer, callback) => {
        const query = `
        INSERT INTO profilepic (email, image)
        VALUES (?, ?)
        ON CONFLICT(email) DO UPDATE SET image = ?`;
        db.run(query, [email, profilepicBuffer, profilepicBuffer], function (err) {
            if (err) {
                console.error("Errore durante l'inserimento o l'aggiornamento dell'immagine profilo:", err);
                return callback(err);
            }
            callback(null, { id: this.lastID });
        });
    },

    /**
     * funzione dao per ottenere pfp
     * @param email
     * @returns {Promise<unknown>}
     */
    getPfp: (email) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT image FROM profilepic WHERE email = ?`;
            db.get(query, [email], (err, row) => {
                if (err) {
                    return reject(err);
                }
                if (row && row.image) {
                    const base64Image = Buffer.from(row.image).toString('base64');
                    resolve({ email, image: base64Image });
                } else {
                    resolve(null); // Nessuna immagine trovata
                }
            });
        });
    },


    updateUserData: (nome, cognome, username, email, birthDay, callback) => {
        const query = `
        UPDATE utente
        SET nome = ?, cognome = ?, username = ?, birthDay = ?
        WHERE email = ?`;
        db.run(query, [nome, cognome, username, birthDay, email], function (err) {
            if (err) {
                console.error("Errore durante l'aggiornamento dell'utente:", err);  // Log dell'errore SQL
                return callback(err);
            }
            callback(null, { message: 'User data updated successfully' });  // Optional success message
        });
    },

    getUserByUsername: (username) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM utente WHERE username = ?`
            db.get(query, [username], (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(row);
            });
        });
    },

    // Aggiungi questa nuova funzione al tuo users-dao.js
    updateUserPassword: async (userId, hashedPassword) => {
        try {
            await db.run(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, userId]
            );
            return { success: true };
        } catch (err) {
            console.error('Errore nell\'aggiornamento della password:', err);
            throw new Error('Errore nell\'aggiornamento della password nel database');
        }
    },

    getUserPassword: (username, password, callback) => {
        const query = 'SELECT password FROM utente WHERE username = ?';
        db.get(query, [username], (err, row) => {
            if (err) {
                console.error("Database query error:", err);  // Log the SQL error
                return callback(err, null);
            }

            if (!row) {
                return callback(null, false);  // No user found
            }

            // Compare the provided password with the hashed password in the database
            compare(password, row.password, (err, isMatch) => {
                if (err) {
                    console.error("Error comparing passwords:", err);
                    return callback(err, null);
                }
                callback(null, isMatch);  // Return true if passwords match, otherwise false
            });
        });
    }
};

module.exports = UserDAO;
