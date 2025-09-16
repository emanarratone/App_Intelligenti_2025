export async function createCart() {
    return `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carrello</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="../../../css/cart-style.css">
    <link rel="stylesheet" href="../../../css/button-acquista.css">
</head>
<body>

<div class="container mt-5">
    <h2>Il Tuo Carrello</h2>
    <div class="row" id="cart-list">
        <!-- Le card verranno iniettate qui -->
    </div>
    <!-- Bottone per l'acquisto -->
    <div class="checkout-container">
        <div data-tooltip="Buy" class="button">
    <div class="button-wrapper">
    <div class="text">Acquista ora</div>
        <span class="icon" id="button-acquista">
            <svg viewBox="0 0 16 16" class="bi bi-cart2" fill="currentColor" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"></path>
            </svg>
        </span>
    </div>
    </div>
</div>
    
</div>
<div class="modal fade" id="ordineModal" tabindex="-1" aria-labelledby="shippingModalLabel" aria-hidden="true">
           <div class="modal-dialog">
               <div class="modal-content">
                   <div class="modal-header">
                       <h5 class="modal-title" id="shippingModalLabel">Dettagli ordine</h5>
                       <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                   </div>
                   <div class="modal-body">
                       <!-- Elenco dei prodotti nel carrello -->
                       <div id="cart-items-list">
                          
                       </div>
                       <!-- Bottone per procedere -->
                       <button type="button" class="btn btn-success mt-3" id="button-avanti-ordine">Avanti</button>
                       <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="close-ordineModal">Close</button>
                   </div>
               </div>
           </div>
       </div>

<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.3/dist/umd/popper.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>

</body>

</html>`
}


