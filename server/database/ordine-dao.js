const db = require("./db.js");

/**
 * classe che contiene le funzione dao per accedere al db, rigurdante gli ordini
 */
class OrdineDao {
    /**
     * scrive nel db uno specifico ordine fatto da un utente
     * @param UUIDordine identificativo ordine
     * @param nomeProdottoOrdine nome del prodotto
     * @param priceProductOrdine prezzo del prodotto
     * @param quantityProdOrdine quantita del prodotto
     * @param tagliaProdOrdine taglia del prodotto
     * @param emailUtenteOrdine identificativo utente
     * @returns {Promise<void>}
     */
    static async aggiungiOrdine(UUIDordine, nomeProdottoOrdine, priceProductOrdine,
                                quantityProdOrdine, tagliaProdOrdine, emailUtenteOrdine) {
        try {
            // Ottieni la data corrente
            const today = new Date();
            const dataOrdine = today.toISOString().split('T')[0]; // Rende la data in formato "YYYY-MM-DD"
            const prezzoTotale = priceProductOrdine * quantityProdOrdine;
            console.log(prezzoTotale);
            await db.run(
                `INSERT INTO ordine (id_ordine, nome_prodotto_ordine, prezzo_prodotto, 
                                  quantita_ordine, taglia, mail_ordine, data_ordine)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [UUIDordine, nomeProdottoOrdine, prezzoTotale,
                    quantityProdOrdine, tagliaProdOrdine, emailUtenteOrdine, dataOrdine]
            );
            console.log("Ordine aggiunto con successo.");
        } catch (err) {
            console.error("Errore nell'aggiunta del prodotto al carrello:", err);
            throw err;
        }
    }


    static async aggiungiOrdineIndice(UUIDordine, emailUtenteOrdine) {
        try {
            await db.run(
                `INSERT INTO ordini (id_ordine, email_ordine)
                        VALUES (?, ?)`,
                [UUIDordine, emailUtenteOrdine]
            );
            console.log("Ordine aggiunto con successo.");
        } catch (err) {
            console.error("Errore nell'aggiunta del prodotto al carrello:", err);
            throw err;
        }
    }

    /**
     * funzione che si occupa di calcolare il pagamento totale di un ordine, riferito a uno specifico utene
     * @param UUIDordine identificativo ordine
     * @param emailUtenteOrdine identififcativo utente
     * @returns {Promise<boolean>}
     */
    static async calcolaPagamentoTotaleOrdine(UUIDordine, emailUtenteOrdine) {
        try {
            console.log("UUIDordine:", UUIDordine);
            const query = `
                SELECT SUM(prezzo_prodotto) AS totale 
                FROM ordine
                WHERE id_ordine = ?
            `;
            const result = await new Promise((resolve, reject) => {
                db.get(query, [UUIDordine], (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });
            if (!result || result.totale === null) {
                throw new Error(`No total found for order UUID: ${UUIDordine}`);
            }

            const totalAmount = result.totale;
            console.log("Total Amount:", totalAmount);

            await db.run(
                `INSERT INTO pagamento (id_ordine_pagamento, pagamento_totale, mail_pagamento_totale)
                        VALUES (?, ?, ?)`,
                [UUIDordine, totalAmount || 0, emailUtenteOrdine]
            );

            console.log("Order total inserted successfully into `pagamento`.");
            return true; // Conferma che l'inserimento è stato eseguito correttamente
        } catch (error) {
            console.error("Error calculating and inserting the order total:", error);
            throw error;
        }
    }

    /**
     * ottiene l'ordine di uno specifico utente
     * @param emailUtenteOrdine identificativo utente
     * @returns {Promise<unknown>}
     */
    static async getUserOrdine(emailUtenteOrdine){
        try {
            const query = `SELECT * FROM ordine
                        WHERE mail_ordine = ?`
            return new Promise((resolve, reject) => {
                db.all(query, [emailUtenteOrdine], (err, rows) => {
                    if (err) {
                        reject(err);
                        console.log(err)
                    }else {
                        console.log(rows)
                        resolve(rows)
                    }
                })
            })
        }catch (err){
            console.error("Errore nella rimozione del prodotto:", err);
            throw err;
        }

    }

}

module.exports = OrdineDao