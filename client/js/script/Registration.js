import { errorLogin, showErrorNotification } from "./templates/errorLogin.js";
import { createRegistrationForm } from "./templates/register.js";
import {showSuccessToast} from "./templates/successLogin.js";
import {showErrorNotificationRegister} from "./templates/errorRegister.js";
import {updateWishlist} from "./wishListMenager.js";

/**
 * funzione che si occupa della registrazione di un nuovo utente
 */
export function register() {
    const registerForm = document.getElementById("register-form");
    const registerButton = document.getElementById("submitRegister");

    registerButton.addEventListener("click", async (e) => {
        e.preventDefault();
        const nome = document.getElementById("firstName").value;
        const cognome = document.getElementById("lastName").value;
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const birthDay = document.getElementById("dob").value;

        if (!validateEmail(email)) {
            showErrorNotificationRegister("Inserisci un'email valida.");
            return;
        }

        if (!validateBirthDay(birthDay)) {
            showErrorNotificationRegister("La data di nascita deve essere minore o uguale alla data attuale.");
            return;
        }

        try {
            const response = await fetch('/users-route/users/registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome, cognome, email, birthDay, password, username })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log("Utente registrato con successo, ID utente:", result.userId);
                await loginAfterRegistration(username, password);
                const registrationModal = bootstrap.Modal.getInstance(document.querySelector("#loginModal"));
                registrationModal.hide(); // Nascondi il modal
            } else {
                showErrorNotificationRegister(result.error || "Errore durante la registrazione");
            }
        } catch (error) {
            console.error('Errore durante la registrazione:', error);
            showErrorNotificationRegister("Errore del server durante la registrazione");
        }
    });
}

/**
 * validazione dati campo mail
 * @param email
 * @returns {boolean}
 */
function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

/**
 * validazione campo birthday
 * @param birthDay
 * @returns {boolean}
 */
function validateBirthDay(birthDay) {
    const today = new Date();
    const birthDate = new Date(birthDay);
    return birthDate <= today;
}

/**
 * login appena si registra un nuovo utente
 * @param username
 * @param password
 * @returns {Promise<void>}
 */
async function loginAfterRegistration(username, password) {
    const response = await fetch('/users-route/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    if (response.ok && result.success) {
        showSuccessToast("Registrazione avvenuto con successo");
        const userLabel = document.getElementById("label-nome-utente");
        userLabel.textContent = username;
        await writeActiveWishButtonsToDatabase();

    } else {
        errorLogin();
        showErrorNotification(result.error || "Errore durante il login");
    }
}

/**
 * se c'erano prodotti attivi come wished vengono scritti nel db
 * @returns {Promise<void>}
 */
async function writeActiveWishButtonsToDatabase() {
    const activeWishButtons = document.querySelectorAll('.wish-button.active');

    for (const button of activeWishButtons) {
        const productElement = button.closest('.card');
        const productId = productElement.getAttribute('data-id');

        await updateWishlist(productId, true);
    }
}
