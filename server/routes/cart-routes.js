const express = require("express");
const router = express.Router();
const CartDAO = require('../database/cart-dao.js');


/**
 * Recupera il carello dell'utente
 */
router.get('/cart', async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Utente non autenticato" });
    }

    try {
        // Chiama il DAO per ottenere il carrello dell'utente
        const cart = await CartDAO.getUserCart(user.email);
        console.log("Recupero carello per l'utente:", user.email);
        res.json({ cart });
    } catch (err) {
        console.error("Errore nel recupero del carrello:", err);
        res.status(500).json({ message: "Errore del server" });
    }
});

/**
 * Recupera le quantita dei prodotti  il carello dell'utente
 */
router.get('/cart/quantity', async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Utente non autenticato" });
    }

    try {
        // Chiama il DAO per ottenere il carrello dell'utente
        const cart = await CartDAO.getUserCartQuantity(user.email);
        console.log("Recupero carello per l'utente:", user.email);
        res.json({ cart });
    } catch (err) {
        console.error("Errore nel recupero del carrello:", err);
        res.status(500).json({ message: "Errore del server" });
    }
});


/**
 * Aggiorna il carrello dell'utente
 */
router.post('/cart', async (req, res) => {
    const { productId, isActive } = req.body;
    const user = req.user;  // L'utente deve essere autenticato per modificare la wishlist

    if (!user) {
        return res.status(401).json({ message: "Utente non autenticato" });
    }

    try {
        if (isActive) {
            console.log("sono nel carrello");
            // Usa il DAO per aggiungere il prodotto al carrello
            await CartDAO.addProductToCart(productId, user.email);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Errore del server" });
    }
});

/**
 * aggiorna la quantita dei prodotti nel carrello
 */
router.post('/cart/updateQty', async (req, res) => {
    const { productId, isActive } = req.body;
    const user = req.user;  // L'utente deve essere autenticato per modificare la wishlist

    if (!user) {
        return res.status(401).json({ message: "Utente non autenticato" });
    }

    try {
        if (isActive) {
            console.log("sono nel carrello");
            // Usa il DAO per incremeteare la quantita del prodotto nel carrello
            await CartDAO.increaseQuantity(productId, user.email);
        } else {
            // Usa il DAO per decrementare la quantita del prodotto nel carrello
            await CartDAO.decreaseQuantity(productId, user.email);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Errore del server" });
    }
});

/**
 * rotta per rimuovere proddot dal carrello
 */
router.post('/cart/removeCartProduct', async (req, res) => {
    const { productId } = req.body;
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Utente non autenticato" });
    }
    try {
        console.log("sono nel carrello");
        // Usa il DAO per rimuovere il prod dal db
        await CartDAO.removeProductFromCart(productId, user.email);
    res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Errore del server" });
    }
});

/**
 *  Gestore della route '/cart/removeCartUser' per svuotare il carrello dell'utente
 */
router.post('/cart/removeCartUser', async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Utente non autenticato" });
    }
    try {
        console.log("Rimozione del carrello per l'utente:", user.email);
        // Rimuovi il carrello tramite il DAO, dopo aver fatto acquisto
        await CartDAO.emptyCartAfterBuy(user.email);
        res.json({ success: true }); // Risposta di successo

    } catch (err) {
        console.error("Errore nella rimozione del carrello:", err);
        res.status(500).json({ message: "Errore del server" });
    }
});


module.exports = router