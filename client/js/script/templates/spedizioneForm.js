export function spedizioneForm() {
    return `
<div class="modal fade" id="shippingModal" tabindex="-1" aria-labelledby="shippingModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="shippingModalLabel">Dettagli di Spedizione</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <!-- Contenitore dei campi input, senza form -->
                <div class="form-group">
                    <label for="nationality">Nazione</label>
                    <select id="country" name="country" required>
                        <option value="">-- Seleziona una --</option>
                        <option value="Albania">Albania</option>
                        <option value="Italy">Italy</option>
                        <option value="United States">United States</option>
                        <!-- Aggiungi altre opzioni qui -->
                    </select>
                </div>
                <div class="form-group">
                    <label for="city">Città</label>
                    <input type="text" class="form-control" id="city" required>
                </div>
                <div class="form-group">
                    <label for="address">Via</label>
                    <input type="text" class="form-control" id="address" required>
                </div>
                <button id="button-submit-spedizione" class="btn btn-primary">Ordine</button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="close-spedizione">Close</button>
            </div>
        </div>
    </div>
</div>
    `;
}
