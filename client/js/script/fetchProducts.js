"use strict";
import {buttonWish} from "./buttonWish.js";
import {loadWishlistProducts} from "./LoadAnyProduct.js";
import {createProductCard} from "./templates/createProductCard.js";
import {counterPage} from "./templates/counterPage.js";
import {clickBuyButton, loadVirtualCart} from "./cartController.js";
import {updatePfpMain} from "./loginModal.js";


/**
 * chiamata backend per ricevere tutti i prodotti
 * @returns {Promise<any|*[]>}
 */
export async function fetchProducts() {
    const cachedProducts = localStorage.getItem('homelist');
    if (cachedProducts) {
        return JSON.parse(cachedProducts);  // Ritorna i prodotti salvati
    }

    // Se non ci sono prodotti nel localStorage, effettua la richiesta fetch
    try {
        const response = await fetch('/api/products/Home');
        if (!response.ok) {
            throw new Error('Errore nel caricamento dei prodotti');
        }
        const data = await response.json();
        localStorage.setItem('homelist', JSON.stringify(data));  // Salva i prodotti nel localStorage
        console.log("prodotti: ", data)
        return data;
    } catch (error) {
        console.error('Errore:', error);
        return [];
    }
}

let currentPage = 1; // Variabile per tenere traccia della pagina corrente
const productsPerPage = 12; // Numero di prodotti per pagina

export async function loadProducts(page = 1, home) {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = counterPage(); // Aggiunge i controlli di paginazione al DOM
    if (home === true){
        currentPage = 1;
    }
    if (paginationContainer) {
        paginationContainer.style.display = 'block'; // Mostra il contatore delle pagine
    }
    const productContainer = document.getElementById('product-list');
    productContainer.innerHTML = '<p>Caricamento dei prodotti...</p>';
    const products = await fetchProducts();
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage); // Calcola il numero totale di pagine
    // Limiti per mostrare solo i prodotti della pagina corrente
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);
    if (paginatedProducts.length > 0) {
        productContainer.innerHTML = paginatedProducts.map(createProductCard).join('');
        //console.log("carico")
        zoomImage();
        await buttonWish(); //deve essere loggato
        // Chiama `initializePaginationListeners` una sola volta quando carichi la pagina iniziale
        initializePaginationListeners(totalPages)
        // Ora che i controlli di paginazione sono nel DOM, aggiorna le informazioni di paginazione
        await clickBuyButton()
        await loadVirtualCart() //deve essere loggato
        await updatePfpMain()
    } else {
        console.error('Nessun prodotto disponibile o errore nella struttura dei dati.');
        productContainer.innerHTML = '<p>Nessun prodotto disponibile al momento.</p>';
    }
    updatePaginationControls(page, totalPages);
}

export function initializePaginationListeners(totalPages) {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    // Calcola il numero totale di pagine

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadProducts(currentPage);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadProducts(currentPage);
        }
    });
}

/**
 * Modifica la funzione per aggiornare solo lo stato dei pulsanti
 * @param currentPage
 * @param totalPages
 */
function updatePaginationControls(currentPage, totalPages) {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    pageInfo.textContent = `Pagina ${currentPage} di ${totalPages}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

/**
 * Chiama la funzione per caricare i prodotti quando la pagina è pronta
 * //mostra l'immagine grande se click sopra
 */
export function zoomImage(){
    document.querySelectorAll('.product-image').forEach(image => {
        image.addEventListener('click', function() {
            const modalImage = document.getElementById("modalImage");
            if (modalImage) {
                modalImage.src = this.src;
                const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
                imageModal.show();
            }
        });
    });
}
