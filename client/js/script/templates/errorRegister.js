

export function errorRegister(){
    return`<!-- Modal di errore -->
    <style>
        .modal-dialog-centered {
            max-width: 500px; /* Dimensioni del modal */
        }
        #modalErrorRegister {
            position: relative;
            left: -6px;
            margin-right: auto;
    }</style>
<div class="modal fade" id="errorModalReg" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" id="modalErrorRegister">
            <div class="modal-header">
                <h5 class="modal-title" id="errorModalLabel">Errore durante la registrazione</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p id="error-message">Username o Email già in uso.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
`
}

export function showErrorNotificationRegister(message) {
    let modalElement = document.getElementById('errorModalReg');

    if (!modalElement) {
        // Se non esiste ancora, aggiungilo al body
        document.body.insertAdjacentHTML('beforeend', errorRegister());
        modalElement = document.getElementById('errorModalReg'); // Riassegna l'elemento dopo averlo aggiunto
    }

    // Aggiorna il contenuto del paragrafo con l'id "error-message"
    const errorMessageElement = modalElement.querySelector('#error-message');
    errorMessageElement.textContent = message;

    // Inizializza e mostra il modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}
