import {zoomImage} from "./fetchProducts.js";
import {createProductCard} from "./templates/createProductCard.js";
import {buttonWish} from "./buttonWish.js";
import {clickBuyButton} from "./cartController.js";

/**
 * gestisce i prdotti filtrsti o per categoria o per genere
 * @returns {Promise<void>}
 */
export async function filterProducts() {

    // Trova tutti gli elementi dei dropdown con gli attributi data-filter e data-value
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', async function () {
            const productContainer = document.getElementById('product-list');
            const filterType = this.getAttribute('data-filter'); // Ottiene il tipo di filtro (es. genere o categoria)
            const filterValue = this.getAttribute('data-value'); // Ottiene il valore (es. Uomo, Felpe, ecc.)

            // Imposta la URL a seconda del tipo di filtro
            let apiEndpoint = '';
            if (filterType === 'genere') {
                apiEndpoint = `/api/products/genere/${filterValue}`;
            } else if (filterType === 'categoria') {
                apiEndpoint = `/api/products/categoria/${filterValue}`;
            }

            try {
                const response = await fetch(apiEndpoint);
                const products = await response.json();

                const paginationContainer = document.getElementById('pagination-container');
                if (paginationContainer) {
                    paginationContainer.style.display = 'none'; // Nascondi il contatore delle pagine
                }


                if (products && products.length > 0) {
                    productContainer.innerHTML = products.map(createProductCard).join('');
                    zoomImage(); // Riattiva lo zoom sulle immagini
                    await buttonWish(); // Riattiva la funzionalità del pulsante wishlist
                    await clickBuyButton()
                } else {
                    productContainer.innerHTML = '<p>Nessun prodotto trovato per il filtro selezionato.</p>';
                }
            } catch (error) {
                console.error("Errore nel filtraggio dei prodotti:", error);
                productContainer.innerHTML = '<p>Errore nel caricamento dei prodotti.</p>';
            }
        });
    });
}
