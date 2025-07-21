const express = require("express");
const SpedizoineDAO = require("../database/luogoSpedizione-dao.js");
const router = express.Router();

/**
 * rotta per aggiungere la spedizione di un ordine
 */
router.post('/spedizione/scriviLuogoSpedizione', async (req, res) => {
    const { nazione, citta, via, idSpedizione } = req.body;
    const user = req.user;

    // Controlla se l'utente è autenticato
    if (!user) {
        return res.status(401).json({ message: "Ordine dell'utente non trovato" });
    }

    try {
        console.log("sono nella spedizione");
        await SpedizoineDAO.aggiungiSpedizione(nazione, citta, via, idSpedizione, user.email);

        // Invia una risposta di successo al client
        res.status(200).json({ message: "Spedizione aggiunta con successo" });
    } catch (err) {
        console.error("Errore durante l'aggiunta della spedizione:", err);
        res.status(500).json({ message: "Errore del server" });
    }
});

module.exports = router;
