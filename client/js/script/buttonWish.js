"use strict";
import {getProductsId, wishFirstLog, updateWishlist} from "./wishListMenager.js";

//local storage per salvare i dati dei prodotti wished del singolo utente
export let products = JSON.parse(localStorage.getItem('wishlist')) || [];


/**
 * attiva i bottoni della wishlist basandosi sugli idProdottiDesiderati di un singolo utente
 * @param isWishListView se sono nella pagina della wishlist e clicco sul bottone, che è attivo, tolgo il prodotto
 * @returns {Promise<void>}
 */
export async function buttonWish(isWishListView = false) {
    let idProdottiDesiderati = await getProductsId();
    const buttons = document.querySelectorAll('.wish-button');

    buttons.forEach(button => {
        const productElement = button.closest('.card');
        const product = {
            name: productElement.querySelector('.card-title').textContent,
            price: productElement.querySelector('.card-text').textContent.replace('€', '').trim(),
            image: productElement.querySelector('.product-image').src,
            genere: productElement.querySelector('.card-text:nth-child(3)').textContent,
            id: parseInt(productElement.getAttribute('data-id'))
        };

        // Attiva il bottone se era nella wishlist del db
        if (idProdottiDesiderati.includes(product.id)) {
            button.classList.add('active');
        }

        button.addEventListener('click', async function () {
            this.classList.toggle('active');

            if (this.classList.contains('active')) {
                product.wished = true;
                products.push(product);
                await updateWishlist(product.id, true);
            } else {
                products = products.filter(p => p.name !== product.name);
                await updateWishlist(product.id, false);
                if (isWishListView) {
                    products = products.filter(p => p.name !== product.name);
                    productElement.remove();
                }
            }
            // Aggiorna il localstorage
            localStorage.setItem('wishlist', JSON.stringify(products));
        });
    });
    //console.log("Products loaded in wishlist:", products);
}

/**
 * attiva i bottoni della wishlist dopo il primo login di un utente
 * @returns {Promise<void>}
 */
export async function WishListFirtsLog() {
    try {
        const response = await wishFirstLog()
        if (response.ok) {
            const result = await response.json();
            const wishlist = result.wishlist;
            wishlist.forEach(product => {
                // Trova i prodotti attraverso data-id nel DOM
                const productElement = document.querySelector(`.card[data-id="${product.id_prodotto_desiderato}"]`);
                if (productElement) {
                    const productCard = {
                        name: productElement.querySelector('.card-title').textContent,
                        price: productElement.querySelector('.card-text').textContent.replace('€', '').trim(),
                        image: productElement.querySelector('.product-image').src,
                        genere: productElement.querySelector('.card-text:nth-child(3)').textContent,
                        id: productElement.getAttribute('data-id') // assuming each product card has a data-id attribute
                    };
                    // Riempo il localsotrage
                    products.push(productCard);
                    const wishButton = productElement.querySelector('.wish-button');
                    if (wishButton) {
                        wishButton.classList.add('active');
                    }
                }
            });
            //console.log("Wishlist products after user login:", products);
        } else {
            console.error('Error mentre carico la wishlit: ', response.status);
        }
    } catch (error) {
        console.error('Error surante la richiesta della wishlist: ', error);
    }
}



