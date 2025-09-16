"use strict"
import {buttonWish, products} from "./buttonWish.js";
import { zoomImage } from "./fetchProducts.js";
import { createProductCard } from "./templates/createProductCard.js";

/**
 * funzione che si occupa di mostrare i proddotti della lista desideri
 * @param filteredProducts proddotti che vengono mostrati
 * @param flag per capire se attivare il bottone wish o meno
 * @returns {Promise<void>}
 */
export async function loadWishlistProducts(filteredProducts, flag) {
    const productContainer = document.getElementById('product-list');
    const paginationContainer = document.getElementById('pagination-container');

    try {
        if (paginationContainer) {
            paginationContainer.style.display = 'none';
        }

        const productContainer = document.getElementById('product-list');

        if (filteredProducts.length > 0 && flag === false) {
            console.log("Rendering wishlist products...");
            productContainer.innerHTML = products.map(createProductCard).join('');
            zoomImage();
            await buttonWish(true);
        }

        else if (filteredProducts && flag === true) {
            productContainer.innerHTML = filteredProducts.map(createProductCard).join('');
            zoomImage();
            await buttonWish(false)
        }

        else {
            productContainer.innerHTML = '<p>Nessun prodotto nella lista dei desideri.</p>';
        }
    } catch (error) {
        console.error("Errore durante il caricamento della wishlist:", error);
        productContainer.innerHTML = '<p>Errore nel caricamento dei prodotti.</p>';
    }
}
