import {loadCart, virtualCart} from "../cartController.js";

export function createProductCardCart(product) {
    return `
       
        <div class="col-md-3 mb-4">
            <div class="card h-100" data-id="${product.id}">
                <img src="${product.image}" class="card-img-top product-image" alt="${product.name}">
                <div class="card-footer position-absolute bottom-0 start-0 bg-white w-100">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">€ ${product.price}</p>
                    <p class="card-text">${product.genere}</p>
                    <!-- Bottone Rimuovi -->
                    <button type="button" class="btn btn-danger btn-sm remove-button" id="remove-button-cart">
                        <img src="./images/svg/removeFromCart.svg">
                    </button>
                    <!-- Contatore quantità -->
                    <div class="quantity-control">
                        <button type="button" class="btn btn-outline-secondary btn-sm quantity-decrease" id="button-decrease">-</button>
                        <span class="product-quantity">${product.quantity || 1}</span>
                        <button type="button" class="btn btn-outline-secondary btn-sm quantity-increase" id="button-increase">+</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}
