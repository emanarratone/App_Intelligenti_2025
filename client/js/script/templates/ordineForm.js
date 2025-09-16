export function ordineFormTemplate(products) {
    //console.log("BBBBBBB");
    // Costruisci l'HTML per ciascun prodotto nel carrello
    // Inserisci `cartItemsHTML` nel contenitore dell'ordine nel DOM
    document.getElementById("cart-items-list").innerHTML = products.map((product, index) => {
        return `
            <div class="cart-item mb-3">
                <p><strong>Nome prodotto:</strong> ${product.name}</p>
                <p><strong>Prezzo:</strong> €${(product.price * product.quantity).toFixed(2)}</p>
                <div class="form-group mb-2">
                    <label for="size${index}" class="form-label">Taglia:</label>
                    <select id="size${index}" class="form-select">
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                    </select>
                </div>
                <div class="quantity-control d-flex align-items-center mb-2">
                    <label for="quantity${index}" class="me-2">Quantità:</label>
                    <p id="quantity${index}" style="margin-top: 8px">${product.quantity}</p>   
                  </div>
            </div>
        `;
    }).join('');
}
