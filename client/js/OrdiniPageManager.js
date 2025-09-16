"use strict";
/**
 * Chiamata al endpoint /ordini/ordineUtente, per ricevere i dati degli ordini di uno specifico utente
 * @returns {Promise<any>}
 */
export async function getUserOrdine() {
    try {
        const response = await fetch('/ordine-route/ordini/ordineUtente', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (response.ok) {
            return await response.json();
        }
    } catch (err) {
        console.log(err);
    }
}