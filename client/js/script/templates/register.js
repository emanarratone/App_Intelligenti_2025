export function createRegistrationForm() {
    return `
        <div class="container">
        <form class="needs-validation" novalidate id="register-form">
            <div class="mb-3">
                <label for="firstName" class="form-label">Nome</label>
                <input type="text" class="form-control" id="firstName" required>
                <div class="invalid-feedback">
                    Inserisci un nome valido.
                </div>
            </div>
            <div class="mb-3">
                <label for="lastName" class="form-label">Cognome</label>
                <input type="text" class="form-control" id="lastName" required>
                <div class="invalid-feedback">
                    Inserisci un cognome valido.
                </div>
            </div>
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input type="text" class="form-control" id="username" required minlength="4">
                <div class="invalid-feedback">
                    L'username deve essere almeno di 4 caratteri.
                </div>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" required>
                <div class="invalid-feedback">
                    Inserisci un'email valida.
                </div>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" required minlength="8">
                <div class="invalid-feedback">
                    La password deve essere almeno di 8 caratteri.
                </div>
            </div>
            <div class="mb-3">
                <label for="dob" class="form-label">Data di Nascita</label>
                <input type="date" class="form-control" id="dob" required>
                <div class="invalid-feedback">
                    Inserisci una data di nascita valida.
                </div>
            </div>
            <button class="btn btn-primary" type="submit" style="background-color: orange; border-color: orange;" id="submitRegister">Submit</button>
        </form>
    </div>

    <script>
        const submitButton = document.getElementById('submitRegister')
        submitButton.addEventListener('click', function () {
            'use strict';

            // Ottieni tutti i form che necessitano di validazione
            const forms = document.querySelectorAll('.needs-validation');

            // Loop su tutti i form per impedire l'invio in caso di dati non validi
            Array.prototype.slice.call(forms)
                .forEach(function (form) {
                    form.addEventListener('submit', function (event) {
                        if (!form.checkValidity()) {
                            event.preventDefault();
                            event.stopPropagation();
                        }

                        form.classList.add('was-validated');
                    }, false);
                });
        });
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
`;
}
