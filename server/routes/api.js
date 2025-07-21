const express = require('express');
const router = express.Router();  // Crea un router per gestire le route


// Importa i tuoi DAO o altri moduli necessari
const productDAO = require('../database/product-dao.js');
const usersDAO = require('../database/users-dao.js');
const WishlistDAO = require("../database/listaDesideri-dao.js");

/**
 * rotta per la home
 */
router.get('/products/Home', (req, res) => {
    productDAO.getAllProducts((err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Errore nel recupero dei prodotti' });
        }
        res.json(products);
    });
});

/**
 *  Rotta per ottenere i prodotti filtrati per genere
 */
router.get('/products/genere/:genere', (req, res) => {
    const genere = req.params.genere;
    productDAO.getProductsByGenere(genere, (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Errore nel recupero dei prodotti per genere' });
        }
        res.json(products);
    });
});

/**
 * Rotta per ottenere i prodotti filtrati per categoria
 */
router.get('/products/categoria/:categoria', (req, res) => {
    const categoria = req.params.categoria;
    //console.log(categoria);
    productDAO.getProductsByCategory(categoria, (err, products) => {
        if (err) {
            return res.status(500).json({ error: 'Errore nel recupero dei prodotti per genere' });
        }
        res.json(products);
    });
});

/**
 * rotta per gli id
 */
router.get('/products/id/:id', (req, res) => {
    const id = req.params.id;
    console.log("Fetching product with ID:", id);  // Log for debugging
    productDAO.getProductsById(id, (err, product) => {
        if (err) {
            return res.status(500).json({ error: 'Errore nel recupero del prodotto.' });
        }
        if (!product) {
            return res.status(404).json({ error: 'Prodotto non trovato.' });
        }
        res.json(product);  // Return the product object directly
    });
});


/**
 * Aggiorna la lista dei desideri dell'utente
 */
router.post('/wishlist', async (req, res) => {
    const { productId, isActive } = req.body;
    const user = req.user;  // L'utente deve essere autenticato per modificare la wishlist

    if (!user) {
        return res.status(401).json({ message: "Utente non autenticato" });
    }

    try {
        if (isActive) {
            // Usa il DAO per aggiungere il prodotto alla lista dei desideri
            await WishlistDAO.addProductToWishlist(productId, user.email);
        } else {
            // Usa il DAO per rimuovere il prodotto dalla lista dei desideri
            await WishlistDAO.removeProductFromWishlist(productId, user.email);
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Errore del server" });
    }
});

/**
 * Recupera la wishlist dell'utente
 */
router.get('/wishlist', async (req, res) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Utente non autenticato" });
    }

    try {
        // Chiama il DAO per ottenere la lista dei desideri dell'utente
        const wishlist = await WishlistDAO.getUserWishlist(user.email);
        console.log("Recupero wishlist per l'utente:", user.email);
        res.json({ wishlist });
    } catch (err) {
        console.error("Errore nel recupero della wishlist:", err);
        res.status(500).json({ message: "Errore del server" });
    }
});


/**
 * rotta per inserire nuovi prodotti
 */
router.post('/products', (req, res) => {
    const newProduct = req.body;
    productDAO.insertProduct(newProduct, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Errore nell\'inserimento del prodotto' });
        }
        res.status(201).json({ message: 'Prodotto aggiunto con successo' });
    });
});


module.exports = router;
