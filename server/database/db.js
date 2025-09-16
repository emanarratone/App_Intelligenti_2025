const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'app.db');

class Database {
    constructor() {
        this.db = null;
    }

    init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('Errore apertura database:', err);
                    reject(err);
                } else {
                    console.log('Database SQLite connesso');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    createTables() {
        return new Promise((resolve, reject) => {
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    email TEXT,
                    preferences TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            const createChatHistoryTable = `
                CREATE TABLE IF NOT EXISTS chat_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    session_id TEXT NOT NULL,
                    message TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            `;

            this.db.run(createUsersTable, (err) => {
                if (err) {
                    console.error('Errore creazione tabella users:', err);
                    reject(err);
                } else {
                    console.log('Tabella users creata/verificata');
                    
                    this.db.run(createChatHistoryTable, (err) => {
                        if (err) {
                            console.error('Errore creazione tabella chat_history:', err);
                            reject(err);
                        } else {
                            console.log('Tabella chat_history creata/verificata');
                            resolve();
                        }
                    });
                }
            });
        });
    }

    getDb() {
        return this.db;
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Errore chiusura database:', err);
                } else {
                    console.log('Database chiuso');
                }
            });
        }
    }
}

module.exports = new Database();
