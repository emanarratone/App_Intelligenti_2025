"use strict";

/**
 * Funzione per aggiornare il carrello nel backend
 * @param productId
 * @param isActive
 * @returns {Promise<void>}
 */
export async function updateCart(productId, isActive) {
    try {
        const response = await fetch('/cart-routes/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, isActive })
        });

        if (!response.ok) {
            throw new Error("Errore nell'aggiornamento della lista desideri");
        }
    } catch (error) {
        console.error(error);
    }
}

/**
 * Funzione per rimuovoere un prodotto dal carrello nel backend
 * @param productId
 * @returns {Promise<void>}
 */
export async function removeCartProd(productId) {
    try {
        const response = await fetch('/cart-routes/cart/removeCartProduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({productId})
        });

        if (!response.ok) {
            throw new Error("Errore nell'aggiornamento della lista desideri");
        }
    } catch (error) {
        console.error(error);
    }
}

/**
 * Funzione per aggiornare la quantita del prodotto nel carello  nel backend
 * @param productId
 * @param isActive
 * @returns {Promise<void>}
 */
export async function updateCartQty(productId, isActive) {
    try {
        const response = await fetch('/cart-routes/cart/updateQty', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, isActive })
        });

        if (!response.ok) {
            throw new Error("Errore nell'aggiornamento della lista desideri");
        }
    } catch (error) {
        console.error(error);
    }
}


/**
 * Funzione per ottenere il carello del utente dal backend
 * @returns {Promise<any>}
 */
export async function getUserCart() {
    const response = await fetch('/cart-routes/cart', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' // Include i cookie di sessione
    });

    if (!response.ok) {
        throw new Error("Errore nel caricamento dei prodotti dal carrello.");
    }

    return await response.json();
}

/**
 * scrivi ordine di un utente nel backend
 * @param UUIDordine
 * @param nomeProdottoOrdine
 * @param priceProductOrdine
 * @param quantityProdOrdine
 * @param tagliaProdOrdine
 * @returns {Promise<void>}
 */
export async function addOrdine(UUIDordine, nomeProdottoOrdine, priceProductOrdine, quantityProdOrdine, tagliaProdOrdine) {
    try {
        console.log(quantityProdOrdine)
        console.log(priceProductOrdine)
        const response = await fetch('/ordine-route/ordini/scriviOrdineCompleto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ UUIDordine, nomeProdottoOrdine, priceProductOrdine, quantityProdOrdine, tagliaProdOrdine })
        });

        if (!response.ok) {
            throw new Error("Errore nell'aggiornamento dell'ordine");
        }

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

/**
 * funzione per aggiunfere la spedizione di un ordine nel backend
 * @param nazione
 * @param citta
 * @param via
 * @param idSpedizione
 * @returns {Promise<boolean>}
 */
export async function addSpedizione(nazione, citta, via, idSpedizione) {
    try {
        const response = await fetch('/luogoSpedizione-route/spedizione/scriviLuogoSpedizione', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nazione, citta, via, idSpedizione })
        });
        if (!response.ok) {
            throw new Error("Errore nell'aggiornamento della spedizione. Status: " + response.status);
        }
        const result = await response.json(); // Aggiungi per ottenere un eventuale messaggio di risposta dal server
        //console.log("Risultato del server:", result);
        return true; // Conferma il successo
    } catch (error) {
        return false; // Ritorna false in caso di errore
    }
}

/**
 * Funzione per svuotare il carrello nel backend
 * @returns {Promise<Event|*|boolean>}
 */
export async function emptyCart() {
    try {
        const response = await fetch('/cart-routes/cart/removeCartUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        // Verifica se la risposta ha avuto successo
        if (!response.ok) {
            throw new Error("Errore nella rimozione del carrello. Status: " + response.status);
        }
        const result = await response.json();
        console.log("Risultato del server:", result);
        return result.success;
    } catch (err) {
        console.error("Errore nella funzione emptyCart:", err);
        return false;
    }
}

/**
 * chiamo il backend per scrivere il pagamento totale di un ordine
 * @param UUIDordine
 * @returns {Promise<Event|*|boolean>}
 */
export async function inserisciPagamentoTotManager(UUIDordine){
    try {
        const response = await fetch('/ordine-route/ordini/pagamento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({UUIDordine}) //mando id ordine nel backend
        });

        // Verifica se la risposta ha avuto successo
        if (!response.ok) {
            throw new Error("Errore nella rimozione del carrello. Status: " + response.status);
        }
        const result = await response.json();
        console.log("Risultato del server:", result);
        return result.success; // Ritorna il risultato dal server per confermare il successo
    } catch (err) {
        console.error("Errore nella funzione emptyCart:", err);
        return false;
    }
}
