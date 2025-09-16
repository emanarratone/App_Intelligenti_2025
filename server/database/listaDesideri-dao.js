
const db = require('./db.js');

/**
 * classe che contiene le funzione dao per accedere al db, riguradante la wishlist
 */
class WishlistDAO {
    /**
     * Aggiungi o aggiorna il prodotto nella wishlist del utente
     * @param productId identificativo prodotto
     * @param emailUtente identificativo utente
     * @returns {Promise<void>}
     */
    static async addProductToWishlist(productId, emailUtente) {
        try {
            await db.run(
                `INSERT OR REPLACE INTO lista_desideri (id_prodotto_desiderato, stato_prodotto, email_utente) 
                 VALUES (?, 1, ?)`,
                [productId, emailUtente]
            );
        } catch (err) {
            console.error("Errore nell'aggiunta del prodotto alla lista dei desideri:", err);
            throw err;
        }
    }

    /**
     * Rimuovi il prodotto dalla wishlist del utente
     * @param productId identificativo prodotto
     * @param emailUtente identificativo utente
     * @returns {Promise<void>}
     */
    static async removeProductFromWishlist(productId, emailUtente) {
        try {
            await db.run(
                `DELETE FROM lista_desideri WHERE id_prodotto_desiderato = ? AND email_utente = ?`,
                [productId, emailUtente]
            );
        } catch (err) {
            console.error("Errore nella rimozione del prodotto dalla lista dei desideri:", err);
            throw err;
        }
    }

    /**
     * Ottieni la wishlist del utente
     * @param emailUtente identificativo utente
     * @returns {Promise<void>}
     */
    static async getUserWishlist(emailUtente) {
        try {
            const query = `
            SELECT id_prodotto_desiderato 
            FROM lista_desideri 
            WHERE email_utente = ? AND stato_prodotto = 1`;
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
            console.error("Errore nel recupero della lista dei desideri:", err);
            throw err;
        }
    }


}

module.exports = WishlistDAO;
