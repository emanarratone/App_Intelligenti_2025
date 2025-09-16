
export function createProductCard(product) {
    return `
        <div class="col-md-3 mb-4">
            <div class="card h-100" data-id="${product.id}">
              <img src="${product.image}" class="card-img-top product-image" alt="${product.name}" id="image-Tag">
                <div class="card-footer position-absolute bottom-0 start-0 bg-white w-100">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">€ ${product.price}</p>
                    <p class="card-text">${product.genere}</p>
                    <button type="button" class="btn btn-primary btn-sm buy-button"  id="buy-button">
                        <img src="./images/svg/buy.svg" alt="">
                    </button>
                    <button type="button" class="btn btn-outline-warning btn-sm wish-button pulse" style="border-color: white">
                        <img src="./images/svg/wish.svg" alt="">
                    </button>
                </div>
            </div>
        </div>
    `;
}

