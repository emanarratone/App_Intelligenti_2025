"use strict";

import {createMenuTemplate} from "./js/script/templates/menu.js";
import {loginModal} from "./js/script/loginModal.js";
import {filterProducts} from "./js/script/filterProducts.js";
import {loadWishlistProducts} from "./js/script/LoadAnyProduct.js";
import {fetchProducts, initializePaginationListeners, loadProducts} from "./js/script/fetchProducts.js";
import {NoProductSearched} from "./js/script/templates/nessunProdottoCercato.js";
import {products} from "./js/script/buttonWish.js";
import {createCart} from "./js/script/templates/createCart.js";
import {sessioneScaduta} from "./js/script/templates/sessioneScaduta.js";
import {loadCart, virtualCart} from "./js/script/cartController.js";
import {loadWishList} from "./js/script/wishListController.js";
import {virtualOrdini} from "./js/OrdiniPageController.js";

/**
 * controller principale dell'applicazione
 */
document.addEventListener("DOMContentLoaded", () => {
    // Seleziona il contenitore dei prodotti
    const productList = document.getElementById("product-list");
    const menuContainer = document.getElementById("menu-container");
    const profile_pic = document.querySelector(".profile-icon");
    //crea la barra del menu
    menuContainer.innerHTML = createMenuTemplate();
    if (menuContainer) {
        const wishListLink = menuContainer.querySelector('.nav-link[href="#lista-desideri"]');
        if (wishListLink) {
            wishListLink.addEventListener('click', async (event) => {
                event.preventDefault();
                await loadWishList();
            });
        } else {
            console.error("Element with ID 'menu-container' not found.");
        }
    }

    /**
     * controlla se un utente è guest o si deve autenticare
     */
    profile_pic.addEventListener("click", async () => {
        const label = document.getElementById("label-nome-utente").textContent;
        if (label.includes("Guest")) {
            loginModal();
        } else {
            try {
                const response = await fetch('/api/user', { credentials: 'include' });
                if (response.ok) {
                    window.location.href = './HTML/profile.html';
                } else {
                    handleLogout();
                }
            } catch (error) {
                console.error('Errore di autenticazione:', error);
                handleLogout();
            }
        }
    });

    /**
     * vuota le strutture dati durante logout
      */
    function handleLogout() {
        sessioneScaduta();
        virtualOrdini.length = 0;
        virtualCart.length = 0;
        localStorage.clear();  // Rimuove tutti gli elementi dal localStorage
        setTimeout(() => window.location.href = '/', 3000);  // Reindirizza dopo 3 secondi
    }

    /**
     * reidirizza al carello
     * @type {HTMLElement}
     */
    const shopPic = document.getElementById("shop-icon");
    if (shopPic) {
        shopPic.addEventListener('click', async (event) => {
            productList.innerHTML = await createCart();
            await loadCart(0);
        })
    }

    //funzioni per caricare i prodotti al caricaemnto del sito
    loadProducts(1, true)
    filterProducts();


    /**
     * reindirizza alla homePage
     */
    document.querySelector('.nav-link[href="/Home"]').addEventListener('click', function(event) {
        event.preventDefault();  // Previeni il comportamento predefinito del link (scorrimento automatico)
        //console.log("sono qui")
        loadProducts(1, true)   // Carica i prodotti desiderati
    });

    /**
     * reindirizza alla pagina degli ordini
     */
    document.getElementById('link-ordini').addEventListener('click', function (event) {
        // Ricarica gli ordini dopo l'aggiornamento di `virtualOrdini`
        window.location.href = './HTML/ordini.html';
    });

    /**
     * reindirizza alla pagina del assistente AI 
     */

    document.getElementById('ai-icon-clickable').addEventListener('click', function () {
        window.location.href = './HTML/AI-page.html';
    });

    // Seleziona gli elementi del campo di ricerca e del pulsante
    const searchButton = document.getElementById("search-button");
    const searchField = document.getElementById("search-field");

    /**
     * event listener per gestire il click del pulsante di ricerca
     */
    searchButton.addEventListener('click', async (event) => {
        const paginationContainer = document.getElementById('pagination-container');
        if (paginationContainer) {
            paginationContainer.style.display = 'none';
        }
        event.preventDefault();
        const products = await fetchProducts();
        // Ottieni il valore del campo di ricerca e rimuovi eventuali spazi vuoti
        const query = searchField.value.trim().toLowerCase();

        if (query) {
            // Filtra i prodotti in base al nome
            const filteredProducts = products.filter(product =>
                product.name.toLowerCase().includes(query)
            );
            if (filteredProducts.length > 0) {
                await loadWishlistProducts(filteredProducts, true);
            } else {
                const productContainer = document.getElementById("product-list");
                productContainer.innerHTML = '<p>Nessun prodotto trovato torna alla Home.</p>';
            }
        } else {
            NoProductSearched()
            loadProducts(1, true);
        }
    });
});


