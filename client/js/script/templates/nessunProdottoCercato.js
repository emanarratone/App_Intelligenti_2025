export function NoProductSearched() {
    // Aggiunge il markup del toast nel DOM
    const toastContainer = document.createElement('div');
    toastContainer.innerHTML = `
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div id="product-toast" class="toast align-items-center text-white bg-warning border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <p  id="nessun-prodotto">Nessun prodotto cercato.</p>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </div>`;
    // Inserisce il toast nel body
    document.body.appendChild(toastContainer);

    // Mostra il toast
    const toastElement = document.getElementById('product-toast');
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
}