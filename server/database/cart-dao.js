"use strict";

const db = require("./db.js");

/**
 * classe che contiene le funzione dao per accedere al db, riguradante il carrello
 */
class CartDAO {
    /**
     * restituisce il carrello di un utente
     * @param emailUtente identificativo per il singolo utente
     * @returns {Promise<unknown>} ritorna una promessa con i dati
     */
    static async getUserCart(emailUtente) {
        try {
            const query = `SELECT * FROM carrello WHERE email_utente_carrello = ?`;
            return new Promise((resolve, reject) => {
                db.all(query, [emailUtente], (err, rows) => {
                    if (err) {
                        console.error("Errore durante l'esecuzione della query:", err);
                        reject(err);
                    } else {
                        console.log("Risultati della query:", rows);
                        resolve(rows);
                    }
                });
            });
        } catch (err) {
            console.error("Errore nel recupero del carrello:", err);
            throw err;
        }
    }

    /**
     * la quantita di ogni singolo proddotto che c'è nel carello di un singolo utente
     * @param emailUtente identificativo di un utente
     * @returns {Promise<unknown>} promessa dal server con i dati
     */
    static async getUserCartQuantity(emailUtente) {
        try {
            const query = `SELECT quantita FROM carrello WHERE email_utente_carrello = ?`;
            return new Promise((resolve, reject) => {
                db.all(query, [emailUtente], (err, rows) => {
                    if (err) {
                        console.error("Errore durante l'esecuzione della query:", err);
                        reject(err);
                    } else {
                        console.log("Risultati della query:", rows);
                        resolve(rows);
                    }
                });
            });
        } catch (err) {
            console.error("Errore nel recupero della quantità del carrello:", err);
            throw err;
        }
    }

    /**
     * scrive nel db id del proddotto aggiunto al carrello e l'utente a cui è riferito
     * @param productIdCart idenfitifcativo prodotto
     * @param emailUtenteCart identificativo utente
     * @returns {Promise<void>} conferma scrittura db
     */
    static async addProductToCart(productIdCart, emailUtenteCart) {
        try {
            await db.run(
                `INSERT INTO carrello (Id_prodotto_carrello, email_utente_carrello, quantita) 
                VALUES (?, ?, 1)
                ON CONFLICT(Id_prodotto_carrello, email_utente_carrello) 
                DO UPDATE SET quantita = quantita + 1`,
                [productIdCart, emailUtenteCart]
            );
        } catch (err) {
            console.error("Errore nell'aggiunta del prodotto al carrello:", err);
            throw err;
        }
    }

    /**
     * decrementa la quantia del prodotto nel carrello dello specifico utente
     * @param productIdCart identificativo prodotto
     * @param emailUtenteCart identificativo utente
     * @returns {Promise<void>}
     */
    static async decreaseQuantity(productIdCart, emailUtenteCart) {
        try {
            await db.run(
                `UPDATE carrello 
                 SET quantita = quantita - 1 
                 WHERE Id_prodotto_carrello = ? AND email_utente_carrello = ? AND quantita > 1`,
                [productIdCart, emailUtenteCart]
            );
        } catch (err) {
            console.error("Errore nella riduzione della quantità del prodotto nel carrello:", err);
            throw err;
        }
    }

    /**
     * incrementa la quantia del prodotto nel carrello dello specifico utente
     * @param productIdCart identificativo prodotto
     * @param emailUtenteCart identificativo utente
     * @returns {Promise<void>}
     */
    static async increaseQuantity(productIdCart, emailUtenteCart) {
        try {
            await db.run(
                `UPDATE carrello 
                 SET quantita = quantita + 1 
                 WHERE Id_prodotto_carrello = ? AND email_utente_carrello = ?`,
                [productIdCart, emailUtenteCart]
            );
        } catch (err) {
            console.error("Errore nell'incremento della quantità del prodotto nel carrello:", err);
            throw err;
        }
    }

    /**
     * rimuove il prodotto dal carrello dello specifico utente
     * @param productIdCart identificativo prodotto
     * @param emailUtenteCart identificativo utente
     * @returns {Promise<void>}
     */
    static async removeProductFromCart(productIdCart, emailUtenteCart) {
        try {
            await db.run(
                `DELETE FROM carrello 
                 WHERE Id_prodotto_carrello = ? AND email_utente_carrello = ?`,
                [productIdCart, emailUtenteCart]
            );
        } catch (err) {
            console.error("Errore nella rimozione del prodotto dal carrello:", err);
            throw err;
        }
    }

    static async emptyCartAfterBuy(emailUtenteCart) {
        try {
            await db.run(
                `DELETE FROM carrello WHERE email_utente_carrello = ?`,
                [emailUtenteCart]
            );
            console.log("Carrello svuotato per l'utente:", emailUtenteCart);
        } catch (err) {
            console.error("Errore nella rimozione del carrello nel DAO:", err);
            throw err;
        }
    }

}

module.exports = CartDAO;
