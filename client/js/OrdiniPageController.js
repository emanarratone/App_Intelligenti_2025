"use strict";
import { getUserOrdine } from "./OrdiniPageManager.js";
import { createOrderRow } from "./script/templates/creaRigaOrdine.js";
import {loadProducts} from "./script/fetchProducts.js";



// Recupera `virtualOrdini` da localStorage o crea un array vuoto
export let virtualOrdini = JSON.parse(localStorage.getItem("virtualOrdini")) || [];

/**
 * Funzione per caricare gli ordini dell'utente e aggiornare `virtualOrdini`
 * @returns {Promise<void>}
 */
export async function loadUserOrdiniPage() {
    try {
        // Attende il risultato della chiamata asincrona
        const result = await getUserOrdine();

        // Controlla che i dati siano disponibili e in formato corretto
        const data = result?.ordine;
        virtualOrdini.length = 0
        if (data && Array.isArray(data)) {
            // Aggiunge i nuovi ordini all'array `virtualOrdini`
            virtualOrdini.push(...data);
            console.log(virtualOrdini)
            // Aggiorna `localStorage`
            localStorage.setItem("virtualOrdini", JSON.stringify(virtualOrdini));
        } else {
            // Gestione sessione scaduta
            setTimeout(() => {
                window.location.href = '../HTML/guest.html';
            }, 3000);
        }
    } catch (error) {
        console.error('Errore nel caricamento del profilo utente:', error);
    }
}

/**
 * funzione che carica i dati nella tabella html degli ordini
 */
function loadOrdersFromLocalStorage() {
    const orderTableBody = document.getElementById('order-table-body');

    if (orderTableBody) {
        // Popola la tabella con le righe dei prodotti da virtualOrdini
        orderTableBody.innerHTML = virtualOrdini.map(createOrderRow).join('');
    }

    const homeLink = document.getElementById('home-link-ordini');
    if (homeLink) {  // Verifica che l'elemento esista
        homeLink.addEventListener('click', async (e) => {
            try {
                const response = await fetch('/api/products/Home', {
                    method: 'GET'
                });
                if (response.ok) {
                    await loadProducts(1, true);
                } else {
                    console.error('Errore durante il logout');
                }
            } catch (error) {
                console.error('Errore nel logout:', error);
            }
        });
    } else {
        console.warn("Elemento 'home-link-ordini' non trovato.");
    }
}

/**
 * Chiama la funzione di caricamento ordini dall’utente all’avvio
 */
document.addEventListener('DOMContentLoaded', () => {
    loadOrdersFromLocalStorage();
    //loadUserOrdiniPage(); // Chiama anche il caricamento asincrono se necessario
});
