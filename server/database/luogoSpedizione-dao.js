const db = require("./db.js");

/**
 * classe che contiene le funzione dao per accedere al db, riguradante la spedizione
 */
class SpedizoineDAO{
    /**
     * inserisce i dati riguardante un ordine di uno specifico utente
     * @param nazione
     * @param citta
     * @param via
     * @param idSpedizione id di un ordine che corrisponde al campo id nella tabella ordine
     * @param emailSpedizione email del utente destinatario
     * @returns {Promise<void>}
     */
    static async aggiungiSpedizione(nazione, citta, via, idSpedizione, emailSpedizione) {
        try {
            await db.run(
                `INSERT INTO spedizione (Nazione, Citta, Via, id_ordine_spedizione, mail_spediazone)
                        VALUES (?, ?, ?, ?, ?)`,
                [nazione, citta, via, idSpedizione, emailSpedizione]
            );
            console.log("Spedizione aggiunto con successo.");
        } catch (err) {
            console.error("Errore nell'aggiunta del prodotto al carrello:", err);
            throw err;
        }
    }
}

module.exports = SpedizoineDAO