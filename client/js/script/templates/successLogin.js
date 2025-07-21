import {loginModal} from "../loginModal.js";

export function successLogin(message) {
    return `
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div id="loginSuccessToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">Successo</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    </div>`;
}

// Aggiungi il toast nel DOM e mostra il messaggio di successo
export function showSuccessToast(message) {
    // Inserisci il toast nel body con il messaggio personalizzato
    document.body.insertAdjacentHTML('beforeend', successLogin(message));

    // Recupera l'elemento DOM appena creato
    const toastEl = document.getElementById('loginSuccessToast');

    // Crea l'oggetto toast con Bootstrap
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });

    // Mostra il toast
    toast.show();

    // Rimuove il toast dal DOM dopo che è stato nascosto
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.parentNode.removeChild(toastEl);
    });
}


