"use strict";
import { createRegistrationForm } from "./templates/register.js";
import { createLoginForm } from "./templates/login.js";
import { showSuccessToast } from "./templates/successLogin.js";
import { errorLogin, showErrorNotification } from "./templates/errorLogin.js";
import { register } from "./Registration.js";
import {WishListFirtsLog} from "./buttonWish.js";
import {loadVirtualCart} from "./cartController.js";
import {loadUserOrdiniPage} from "../OrdiniPageController.js";
import {getUsrPfp} from "./ProfilePageManager.js";


/**
 * Carica il modale del login
 */
export function loginModal() {

    const login_form = createLoginForm();
    const modalBody = document.querySelector("#modal-body");
    modalBody.innerHTML = login_form;
    const loginModal = new bootstrap.Modal(document.querySelector("#loginModal"));
    loginModal.show();
    passVisibility()
    // Gestire l'evento di submit del modulo
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Previene l'invio del modulo

        // Ottieni email e password
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Disabilita il pulsante di submit per prevenire invii multipli
        const submitButton = loginForm.querySelector("button[type='submit']");
        submitButton.disabled = true;
        submitButton.textContent = "Login in corso...";

        try {
            const response = await fetch('/users-route/users/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Login avvenuto con successo
                showSuccessToast("Login avvenuto con successo");
                loginModal.hide();
                await WishListFirtsLog();
                localStorage.removeItem('cartProducts');
                await loadVirtualCart();
                await loadUserOrdiniPage();
                const userLabel = document.getElementById("label-nome-utente");
                userLabel.textContent = username;
                await updatePfpMain()
                loginForm.reset();
            } else {
                // Mostra un errore se le credenziali sono sbagliate
                showErrorNotification(result.error || "Errore durante il login");
            }
        } catch (error) {
            console.error('Errore durante la richiesta di login:', error);
            showErrorNotification("Errore del server durante il login");
        } finally {
            // Riattiva il pulsante di submit
            submitButton.disabled = false;
            submitButton.textContent = "Accedi";
        }
    });

    //Se clicca il bottone per la registrazione
    const registerButton = document.getElementById("registerButton");
    if (registerButton) {
        registerButton.addEventListener("click", () => {
            modalBody.innerHTML = createRegistrationForm();
            register(); // Funzione per gestire la registrazione
        });
    }
}

/**
 * Mostra la password durante il login se cliccato
 */
function passVisibility(){
    document.getElementById('toggle-password').addEventListener('click', function () {
        const passwordField = document.getElementById('password');
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        this.src = type === 'password' ? '../../../images/svg/eyeUp.svg' : '../../../images/svg/eyeDown.svg';
    });
}

/**
 * aggiorna la pfp nella pagina main
 * @returns {Promise<void>}
 */
export async function updatePfpMain(){
    const profile_pic = document.querySelector(".profile-icon");
    const profilePicFetch = await getUsrPfp()
    if (profilePicFetch.ok) {
        const pfp = await profilePicFetch.json();
        if (pfp.profilePic) {
            profile_pic.src = `data:image/jpeg;base64,${pfp.profilePic}`;
        } else {
            console.error("Nessuna immagine trovata per l'utente.");
        }
    }else {
        console.error("Errore richiesta immagine profilo.");
    }
}