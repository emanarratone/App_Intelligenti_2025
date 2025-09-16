const bcrypt = require('bcrypt');
const database = require('./db');

class UsersDAO {
    
    static async createUser(username, password, email, preferences = {}) {
        const db = database.getDb();
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    return reject(err);
                }
                
                const query = `INSERT INTO users (username, password, email, preferences, created_at) VALUES (?, ?, ?, ?, datetime('now'))`;
                const preferencesJson = JSON.stringify(preferences);
                
                db.run(query, [username, hashedPassword, email, preferencesJson], function(err) {
                    if (err) {
                        return reject(err);
                    }
                    
                    resolve({
                        id: this.lastID,
                        username,
                        email,
                        preferences
                    });
                });
            });
        });
    }
    
    static async authenticateUser(usernameOrEmail, password) {
        const db = database.getDb();
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
            
            db.get(query, [usernameOrEmail, usernameOrEmail], (err, user) => {
                if (err) {
                    return reject(err);
                }
                
                if (!user) {
                    return resolve(null);
                }
                
                bcrypt.compare(password, user.password, (err, isValid) => {
                    if (err) {
                        return reject(err);
                    }
                    
                    if (isValid) {
                        const { password, ...userWithoutPassword } = user;
                        resolve(userWithoutPassword);
                    } else {
                        resolve(null);
                    }
                });
            });
        });
    }
    
    static async getUserById(userId) {
        const db = database.getDb();
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM users WHERE id = ?';
            
            db.get(query, [userId], (err, user) => {
                if (err) {
                    return reject(err);
                }
                
                if (user) {
                    const { password, ...userWithoutPassword } = user;
                    resolve(userWithoutPassword);
                } else {
                    resolve(null);
                }
            });
        });
    }
    
    static async saveChatMessage(userId, sessionId, message) {
        const db = database.getDb();
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO chat_history (user_id, session_id, message, timestamp) VALUES (?, ?, ?, datetime('now'))`;
            
            db.run(query, [userId, sessionId, message], function(err) {
                if (err) {
                    return reject(err);
                }
                
                resolve({
                    id: this.lastID,
                    user_id: userId,
                    session_id: sessionId,
                    message,
                    timestamp: new Date().toISOString()
                });
            });
        });
    }
    
    static async getChatHistory(userId, limit = 50) {
        const db = database.getDb();
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC LIMIT ?`;
            
            db.all(query, [userId, limit], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                
                resolve(rows || []);
            });
        });
    }
    
    static async clearChatHistory(userId) {
        const db = database.getDb();
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM chat_history WHERE user_id = ?';
            
            db.run(query, [userId], function(err) {
                if (err) {
                    return reject(err);
                }
                
                resolve(true);
            });
        });
    }
    
    // Metodi per gestire le sessioni di chat
    static async getChatSessions(userId) {
        const db = database.getDb();
        return new Promise((resolve, reject) => {
            const query = `
                SELECT DISTINCT session_id, 
                       MIN(timestamp) as start_time,
                       MAX(timestamp) as last_message_time,
                       COUNT(*) as message_count
                FROM chat_history 
                WHERE user_id = ? 
                GROUP BY session_id 
                ORDER BY last_message_time DESC
            `;
            
            db.all(query, [userId], (err, sessions) => {
                if (err) {
                    return reject(err);
                }
                resolve(sessions || []);
            });
        });
    }
    
    static async getChatSessionMessages(userId, sessionId) {
        const db = database.getDb();
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM chat_history 
                WHERE user_id = ? AND session_id = ? 
                ORDER BY timestamp ASC
            `;
            
            db.all(query, [userId, sessionId], (err, messages) => {
                if (err) {
                    return reject(err);
                }
                resolve(messages || []);
            });
        });
    }
    
    static async deleteSession(userId, sessionId) {
        const db = database.getDb();
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM chat_history WHERE user_id = ? AND session_id = ?';
            
            db.run(query, [userId, sessionId], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve({ deletedCount: this.changes });
            });
        });
    }

    static async getUserByUsername(usernameOrEmail) {
        const db = database.getDb();
        return new Promise((resolve, reject) => {
            // Cerca per username o email
            const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
            
            db.get(query, [usernameOrEmail, usernameOrEmail], (err, user) => {
                if (err) {
                    return reject(err);
                }
                
                resolve(user || null);
            });
        });
    }
    
    static async usernameExists(username) {
        const db = database.getDb();
        return new Promise((resolve, reject) => {
            const query = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
            
            db.get(query, [username], (err, row) => {
                if (err) {
                    return reject(err);
                }
                
                resolve(row.count > 0);
            });
        });
    }
    
    static async emailExists(email) {
        const db = database.getDb();
        return new Promise((resolve, reject) => {
            const query = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
            
            db.get(query, [email], (err, row) => {
                if (err) {
                    return reject(err);
                }
                
                resolve(row.count > 0);
            });
        });
    }
}

module.exports = UsersDAO;