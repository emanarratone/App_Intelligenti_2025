"use strict";
import {
    addOrdine,
    addSpedizione,
    emptyCart,
    getUserCart, inserisciPagamentoTotManager,
    removeCartProd,
    updateCart,
    updateCartQty
} from "./cartMenager.js";

import {fetchProducts, zoomImage} from "./fetchProducts.js";
import {createProductCardCart} from "./templates/createProductCardCart.js";
import {showSuccessToast} from "./templates/successLogin.js";
import {spedizioneForm} from "./templates/spedizioneForm.js";
import {ordineFormTemplate} from "./templates/ordineForm.js";
import {loadUserOrdiniPage} from "../OrdiniPageController.js";


//struttura dati per caricare i dati del carello di un utente
export let virtualCart = JSON.parse(localStorage.getItem('cartProducts')) || [];

/**
 * Funzione per gestire l'aggiunta al carrello
 * @param product object con tutte le propieta
 * @returns {Promise<void>}
 */
export async function addProductToCart(product) {
    await updateCart(product.id, true)
    virtualCart.push(product);
    console.log("Carrello attuale:", virtualCart);

}

/**
 * carica il localStorage
 * @returns {Promise<void>}
 */
export async function loadVirtualCart() {
    try {
        //prende il carello di un utente
        const result = await getUserCart();
        //prende i prodotti del sito
        const allProducts = await fetchProducts();
        const cartList = result.cart;
        if (cartList && cartList.length > 0 && virtualCart.length === 0) {
            cartList.forEach(cartItem => {
                // mette i prodotti che sono nel carello con quelli totali
                const product = allProducts.find(p => p.id === cartItem.Id_prodotto_carrello);
                if (product) {
                    // crea la card
                    const productCard = {
                        name: product.name,
                        price: typeof product.price === 'string'
                            ? parseFloat(product.price.replace('€', '').trim())
                            : product.price,
                        image: product.image,
                        genere: product.genere,
                        id: product.id,
                        quantity: cartItem.quantita
                    };
                    //carica la card
                    virtualCart.push(productCard);
                }
            });
        } else {
            console.warn("Nessun prodotto trovato nel carrello.");
        }
        //console.log(virtualCart);// Attiva i pulsanti di acquisto
    } catch (error) {
        console.error("Errore durante la configurazione dei pulsanti di acquisto:", error);
    }
}

/**
 * mostra le card con i prodotti del carrello utente
 * @param flag gestire il clic degli eventi
 * @returns {Promise<void>}
 */
export async function loadCart(flag) {
    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) {
        paginationContainer.style.display = 'none'; // Nascondi il contatore delle pagine
    }
    const cartContainer = document.getElementById('cart-list');
    cartContainer.innerHTML = '<p>Caricamento dei prodotti nel carrello...</p>';

    if (cartContainer && virtualCart.length > 0 && flag === 0) {
        cartContainer.innerHTML = virtualCart.map(createProductCardCart).join('');
        zoomImage();
        eventListenersQtyButtons()
        eventListeners()
    }else if (flag === 1){
        cartContainer.innerHTML = virtualCart.map(createProductCardCart).join('');
        zoomImage();
        eventListenersQtyButtons()
    }else {
        console.error('Nessun prodotto disponibile o errore nella struttura dei dati.');
        cartContainer.innerHTML = '<p>Nessun prodotto salvato nel carrello.</p>';
        showSuccessToast("Non perderti i nostri proddotti")
    }
}

/**
 * attiva bottone di aggiunta carrello per ogni prodotto
 * @returns {Promise<void>}
 */
export async function clickBuyButton() {
    document.querySelectorAll('.buy-button').forEach(button => {
        button.addEventListener('click', async () => {
            const productElement = button.closest('.card');
            const productId = parseInt(productElement.getAttribute('data-id')); // Ottieni l'ID del prodotto

            // Cerca il prodotto in virtualCart
            const existingProduct = virtualCart.find(item => item.id === productId);

            if (existingProduct) {
                console.log("prodotto esistente", existingProduct)
                // Se il prodotto esiste, aumenta la quantità di 1
                existingProduct.quantity += 1;
                await updateCartQty(productId, true);
                console.log(`Quantità aggiornata per il prodotto con ID ${productId}:`, existingProduct.quantity);
            } else {
                // Se il prodotto non esiste, creane uno nuovo con quantità iniziale 1
                const product = {
                    name: productElement.querySelector('.card-title').textContent,
                    price: parseFloat(productElement.querySelector('.card-text').textContent.replace('€', '').trim()),
                    image: productElement.querySelector('.product-image').src,
                    genere: productElement.querySelector('.card-text:nth-child(3)').textContent,
                    id: productId,
                    quantity: 1
                };
                await addProductToCart(product)
                console.log("Prodotto aggiunto al carrello:", product);
            }
            showSuccessToast("Prodotto aggiunto al carrello");
        });
    });
}

/**
 * aggiorna la quantita del prodotto nel carello
 * @param productId id del prodotto
 * @param flag per vedere se incrementare o decrementare
 * @returns {Promise<void>}
 */
export async function updateQuantity(productId, flag) {
    const product = virtualCart.find(product => product.id === productId);
    const productElement = document.querySelector(`.card[data-id="${productId}"]`);
    if (!productElement) {
        console.error("Elemento prodotto non trovato nel DOM.");
        return;
    }
    if (flag === false) {
        if (product && product.quantity > 1) {
            product.quantity -= 1;
            localStorage.setItem('cartProducts', JSON.stringify(virtualCart));
            await updateCartQty(productId,false);
            await loadCart(1);
        } else if (product && product.quantity === 1) {
            // Rimuovi il prodotto se la quantità è zero
            productElement.remove();
            virtualCart = virtualCart.filter(p => p.id !== productId);
            localStorage.setItem('cartProducts', JSON.stringify(virtualCart));
            await updateCartQty(productId,false);
            console.log(`Prodotto con ID ${productId} rimosso dal carrello.`);
            await removeCartProd(productId)
        }
    } else if (flag === true) {
        if (product && product.quantity >= 1) {
            product.quantity += 1;
            localStorage.setItem('cartProducts', JSON.stringify(virtualCart));
            await updateCartQty(productId, true);
            await loadCart(1);
        }
    }
}

/**
 * Funzione per iniettare il form di spedizione nel DOM
 */
function injectForms() {
    // Inietta il form nel body all'inizio, se non è già presente
    if (!document.getElementById('shipping-form-container')) {
        document.body.insertAdjacentHTML('beforeend', spedizioneForm());
    }

}

/**
 * funzione dedicata per l'ascolto degli eventi del carrello
 * @type {boolean}
 */
let flag = false;
function eventListeners(){
    if (flag === false){
        injectForms();
        flag = true;
    }

    const ordineModal = new bootstrap.Modal(document.getElementById('ordineModal'));
    const shippingModal = new bootstrap.Modal(document.getElementById('shippingModal'));
    /**
     * evento quando clicco il button acquista nel carrello
     */
    document.getElementById('button-acquista').addEventListener('click', async () => {
        // Mostra il primo modal (ordineModal)
        ordineModal.show();
        const productsCart = await getUserCart();
        const matchingProducts = virtualCart.filter(item =>
            productsCart.cart.some(cartItem => cartItem.Id_prodotto_carrello === item.id)
        );
        //console.log("carrellooo" ,matchingProducts);
        ordineFormTemplate(matchingProducts);

        /**
         * evento per andare avanti nella compilazione del form del acquisto
         */
        document.getElementById('button-avanti-ordine').addEventListener('click', (event) => {
            event.preventDefault(); // Previene il submit del form per il primo modal
            ordineModal.hide();

            // Crea un array per raccogliere i dettagli degli ordini
            const cartDetails = [];

            // Seleziona tutti gli elementi di prodotto nel carrello
            virtualCart.forEach((product, index) => {
                const size = document.getElementById(`size${index}`).value; // Recupera la taglia selezionata
                const quantity = document.getElementById(`quantity${index}`).textContent; // Recupera la quantità
                console.log(quantity)
                // Aggiungi un oggetto con i dettagli del prodotto all'array
                cartDetails.push({
                    name: product.name,
                    price: product.price,
                    size: size,
                    quantity: parseInt(quantity, 10)
                });
            });
            //cnsole.log(cartDetails);

            // Crea l'istanza del modale di spedizione solo una volta
            shippingModal.show();

            /**
             * Registrazione dell'evento di submit per il modulo di spedizione
             * @param event
             * @returns {Promise<void>}
             */
            document.getElementById('button-submit-spedizione').onclick = async (event) => {
                event.preventDefault(); // Evita il comportamento di default

                // Raccoglie i valori dagli input
                let UUID = generateUUID();
                const nazione = document.getElementById('country').value;
                const citta = document.getElementById('city').value;
                const indirizzo = document.getElementById('address').value;

                try {
                    //scrive gli ordini per ogni prodotto nel carrello ecco perchè Promise.all
                    const orderResults = await Promise.all(cartDetails.map(item =>
                        effetuaOrdine(UUID, item.name, item.price, item.quantity, item.size)
                    ));

                    const allOrdersSuccess = orderResults.every(result => result);
                    //console.log(allOrdersSuccess);
                    const success = await effetuaSpedizione(nazione, citta, indirizzo, UUID);
                    //console.log(success);
                    if (success) {
                        await inserisciPagamentoTot(UUID)
                        await svuotaCarrello()
                        await loadUserOrdiniPage()
                        shippingModal.hide();

                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1000);
                    } else {
                        console.log("Errore nella spedizione, nessun reindirizzamento.");
                    }
                } catch (error) {
                    console.error("Errore durante l'invio della spedizione:", error);
                }
            };
        });

    });
}

/**
 * Ascolta eventi dei bottoni incremento/decremento e rimuovi prodotto da carrello
 */
function eventListenersQtyButtons(){
    document.querySelectorAll('.quantity-decrease').forEach(button => {
        button.addEventListener('click', async event => {
            const productId = parseInt(button.closest('.card').getAttribute('data-id'));
            await updateQuantity(productId, false);
        });
    });

    document.querySelectorAll('.quantity-increase').forEach(button => {
        button.addEventListener('click', async event => {
            const productId = parseInt(button.closest('.card').getAttribute('data-id'));
            await updateQuantity(productId, true);
        });
    });

    document.querySelectorAll('.remove-button').forEach(button => {
        button.addEventListener('click', async event => {
            const productId = parseInt(button.closest('.card').getAttribute('data-id'));
            const productElement = document.querySelector(`.card[data-id="${productId}"]`);
            productElement.remove();
            virtualCart = virtualCart.filter(p => p.id !== productId);
            localStorage.setItem('cartProducts', JSON.stringify(virtualCart));
            await removeCartProd(productId);
        });
    });
}

/**
 * genera un UUID per identificare ogni singolo ordine
 * @returns {*}
 */
function generateUUID() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

/**
 * chiamata al manager
 * @param UUIDordine identificativo del prdotto
 * @param nomeProdottoOrdine nome del prodotto
 * @param priceProductOrdine prezzo del prodotto
 * @param quantityProdOrdine qty del porddoto
 * @param tagliaProdOrdine taglia del proddotto
 * @returns {Promise<boolean>}
 */
export async function effetuaOrdine(UUIDordine ,nomeProdottoOrdine, priceProductOrdine,
                                    quantityProdOrdine, tagliaProdOrdine){
    try {
        const success = await addOrdine(UUIDordine ,nomeProdottoOrdine, priceProductOrdine,
                                            quantityProdOrdine, tagliaProdOrdine);
        if (success) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
}

/**
 * chiamata al manager per la spedizione
 * @param nazione
 * @param citta
 * @param indirizzo
 * @param UUID
 * @returns {Promise<boolean>}
 */
export async function effetuaSpedizione(nazione, citta, indirizzo, UUID) {
    try {
        const success = await addSpedizione(nazione, citta, indirizzo, UUID);
        if (success) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
}

/**
 * chiamata al manager per svuotare il carello dopo un acquisto
 * @returns {Promise<boolean>}
 */
export async function svuotaCarrello(){
    try {
        const success = await emptyCart();
        if (success) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
}

/**
 * chiamata al manager per inserire il pagamento totale di un ordine
 * @param UUIDordine
 * @returns {Promise<boolean>}
 */
export async function inserisciPagamentoTot(UUIDordine){
    try {
        const success = await inserisciPagamentoTotManager(UUIDordine);
        if (success) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
}