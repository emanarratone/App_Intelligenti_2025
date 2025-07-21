export function createLoginForm() {
    return `
   <link rel="stylesheet" href="../../../css/pass-visibility.css">
<form method="POST" action="" id="login-form" class="needs-validation col-6 mx-auto mt-2">
    <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input type="text" class="form-control" id="username" required autocomplete="username">
    </div>
    <div class="mb-3 position-relative">
        <label for="password" class="form-label">Password</label>
        <input type="password" class="form-control" id="password" required autocomplete="current-password">
        <img src="../../../images/svg/eyeUp.svg" alt="Toggle Password Visibility" class="eye-icon" id="toggle-password">
    </div>
    <button type="submit" class="btn btn-outline-success" id="button-submit-login">Login</button>
</form>
`;
}
