export function errorLogin() {
    return `
  <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="errorModalLabel">Errore di autenticazione</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Username o password non validi.
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>`
}

export function showErrorNotification() {
    let modalElement = document.getElementById('errorModal');

    if (!modalElement) {
        // Se non esiste ancora, aggiungilo al body
        document.body.insertAdjacentHTML('beforeend', errorLogin());
        modalElement = document.getElementById('errorModal'); // Riassegna l'elemento dopo averlo aggiunto
    }

    // Inizializza e mostra il modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Nascondi la notifica dopo 5 secondi
    setTimeout(() => {
        modal.hide()
    }, 5000);
}
