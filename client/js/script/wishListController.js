"use strict";
import {getWishedProducts, getProductsId} from "./wishListMenager.js";
import {createProductCard} from "./templates/createProductCard.js";
import {zoomImage} from "./fetchProducts.js";
import {buttonWish} from "./buttonWish.js";
import {clickBuyButton} from "./cartController.js";

/**
 * carica la wishlit
 * @returns {Promise<void>}
 */
export async function loadWishList() {
    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) {
        paginationContainer.style.display = 'none';
    }


    let idProdottiDesiderati = await getProductsId();
    const productContainer = document.getElementById('product-list');

    if (productContainer) {
        const products = [];
        for (const element of idProdottiDesiderati) {
            if (element) {  // Ensure element (id) is defined
                try {
                    const product = await getWishedProducts(element);
                    products.push(product);
                } catch (error) {
                    console.error(`Errore durante il caricamento del prodotto con ID ${element}:`, error);
                }
            } else {
                console.warn("Skip id non specificato ");
            }
        }

        if (products.length > 0) {
            productContainer.innerHTML = products.map(createProductCard).join('');
            zoomImage();
            await buttonWish(true);
            await clickBuyButton()
        } else {
            productContainer.innerHTML = '<p>Nessun prodotto nella lista dei desideri.</p>';
        }
    }
}
