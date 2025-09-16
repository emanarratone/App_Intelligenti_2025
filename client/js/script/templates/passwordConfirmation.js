// Function to generate the login form
export function passwordConfirmation() {
    return `
        <form method="POST" action="" id="confirmation-form" class="needs-validation col-6 mx-auto mt-2">
    <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input type="password" class="form-control" id="password-confirmation" required autocomplete="current-password">
    </div>
    <div class="d-flex justify-content-between">
        <button type="button" class="btn btn-outline-secondary" id="close-button-confirmation">Close</button>
        <button type="submit" class="btn btn-outline-success" id="button-submit-confirmation">Submit</button>
    </div>
</form>
    `;
}