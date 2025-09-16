const express = require("express");
const OrdineDAO = require("../database/ordine-dao.js");
const router = express.Router();


router.get('/ordini', (req, res) => {
    res.render("ordine");
})

/**
 * scrive l'ordine di un utente nel db
 */
router.post('/ordini/scriviOrdineCompleto', async (req, res) => {
    const { UUIDordine, nomeProdottoOrdine, priceProductOrdine, quantityProdOrdine, tagliaProdOrdine } = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Ordine dell'utente non trovato" });
    }

    try {
        console.log("Request body:", req.body);
        await OrdineDAO.aggiungiOrdine(UUIDordine, nomeProdottoOrdine, priceProductOrdine, quantityProdOrdine, tagliaProdOrdine, user.email);
        res.status(200).json({ message: "Ordine aggiunta con successo" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Errore del server" });
    }
});


router.post('/scriviOrdineIndice', async (req, res) => {
    const {UUIDordine} = req.body;
    const user = req.user;
    if (!user) {
        return res.status(401).json({message: "Ordine dell'utente non trovato"});
    }
    try{
        await OrdineDAO.aggiungiOrdineIndice(UUIDordine ,user.email);
    }catch (err){
        res.status(500).json({message: "Errore del server"});
    }
})

/**
 * rotta per scrivere il pagamento totale di un ordine nel db
 */
router.post('/ordini/pagamento', async (req, res) => {
    const {UUIDordine} = req.body;
    const user = req.user;
    if (!user) {
        return res.status(401).json({message: "Ordine dell'utente non trovato"});
    }
    try{
        await OrdineDAO.calcolaPagamentoTotaleOrdine(UUIDordine, user.email);
        res.json({ success: true });
    }catch (err){
        res.status(500).json({message: "Errore del server"});
    }
})

/**
 * rotta per recuperare l'ordine di un utente
 */
router.get('/ordini/ordineUtente', async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Utente non autenticato" });
    }

    try {
        // Chiama il DAO per ottenere il carrello dell'utente
        const ordine = await OrdineDAO.getUserOrdine(user.email);
        console.log("Recupero ordini per l'utente:", user.email);
        res.json({ ordine });
    } catch (err) {
        console.error("Errore nel recupero del carrello:", err);
        res.status(500).json({ message: "Errore del server" });
    }
});

module.exports = router