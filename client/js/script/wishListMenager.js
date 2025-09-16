"use strict";

/**
 * prendo dal backend tutti i prodotti wished
 * @param id
 * @returns {Promise<any>}
 */
export async function getWishedProducts(id) {
    try {
        if (!id) {
            throw new Error("Product ID is undefined");
        }
        const response = await fetch( `/api/products/id/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            console.error(`Errore nel caricamento del prodotto con ID ${id}. Status: ${response.status}`);
            throw new Error(`Errore nel caricamento del prodotto con ID ${id}`);
        }
        const data = await response.json()
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error during fetch:", error);
        throw error;
    }
}

/**
 * id dei prodotti wished
 * @returns {Promise<*[]>}
 */
export async function getProductsId() {
    const response = await fetch('/api/wishlist', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    });

    let idProdottiDesiderati = [];
    if (response.ok) {
        const result = await response.json();
        const wishlist = result.wishlist;
        idProdottiDesiderati = wishlist.map(product => product.id_prodotto_desiderato);
        console.log("ID dei prodotti desiderati:", idProdottiDesiderati);
    }
    return idProdottiDesiderati
}

export async function wishFirstLog(){
    return await fetch('/api/wishlist', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
}

/**
 * aggiorna la wishlist con i nuovi prodotti wished
 * @param productId
 * @param isActive
 * @returns {Promise<void>}
 */
export async function updateWishlist(productId, isActive) {
    try {
        const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({productId, isActive})
        });

        if (!response.ok) {
            throw new Error("Errore nell'aggiornamento della lista desideri");
        }
    } catch (error) {
        console.error(error);
    }
}