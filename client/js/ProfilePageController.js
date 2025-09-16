"use strict";
import {passwordConfirmation} from "./script/templates/passwordConfirmation.js";
import {virtualCart} from "./script/cartController.js";
import {buttonSave} from "./script/templates/buttonSave.js";
import {loadProducts} from "./script/fetchProducts.js";
import {virtualOrdini} from "./OrdiniPageController.js";
import {sessioneScaduta} from "./script/templates/sessioneScaduta.js";
import {addNewImgManager, getUsrPfp} from "./script/ProfilePageManager.js";
import {showSuccessToast} from "./script/templates/successLogin.js";

/**
 * riempe i campi del form con i dati utente ricevuti dalla chiamata backend
 * @returns {Promise<void>}
 */
async function loadUserProfile() {
    try {
    const response = await fetch('/api/user')
    if (response.ok) {
        const userData = await response.json();
        document.getElementById('username').value = userData.username;
        document.getElementById('email').value = userData.email;
        document.getElementById('name-label').value = userData.Nome;
        document.getElementById('surname-label').value = userData.Cognome;
        document.getElementById('BirthDay-label').value = userData.birthDay;
        const profilePicFetch = await getUsrPfp()
        if (profilePicFetch.ok) {
            const pfp = await profilePicFetch.json();
            if (pfp.profilePic) {
                document.getElementById('profilePic').src = `data:image/jpeg;base64,${pfp.profilePic}`;
            } else {
                console.error("Nessuna immagine trovata per l'utente.");
            }
        }else {
            console.error("Errore richiesta immagine profilo.");
        }
    } else {
        sessioneScaduta();
        setTimeout(() => {
            window.location.href = '/';  // Reindirizza dopo 3 secondi
        }, 3000); // Ritardo di 3 secondi prima del reindirizzamento
    }
    } catch (error) {
        console.error('Errore nel caricamento del profilo utente:', error);
    }
}

// Carica i dati utente al caricamento della pagina
async function initializePage() {
    await loadUserProfile();
    addProfilePic();
}

document.addEventListener('DOMContentLoaded', initializePage);

/**
 * riporta alla homepage dalla profile page, chiama loadProducts() per caricare la schermata con i prodotti
 */
document.getElementById('home-link-profile').addEventListener('click', async (e) => {
    try {
        const response = await fetch('/api/products/Home', {
            method: 'GET'
        });
        if (response.ok) {
            await loadProducts(1, true)
        } else {
            console.error('Errore durante il logout');
        }
    } catch (error) {
        console.error('Errore nel logout:', error);
    }
})

/**
 * esegue il logout e svuota le strutture dati di supporto durante una sessione
 */
document.getElementById('logout-link').addEventListener('click', async () => {
    try {
        const response = await fetch('/users-route/users/logout', {
            method: 'GET'
        });
        if (response.ok) {
            // Svuota il carrello virtuale e i dati memorizzati
            virtualOrdini.length = 0;
            virtualCart.length = 0;  // Svuota l'array in memoria
            await localStorage.removeItem('wishlist');
            await localStorage.removeItem('cartProducts');
            await localStorage.removeItem('homeList');
            await localStorage.removeItem('virtualOrdini');
            // Reindirizza alla pagina di guest
            window.location.href = '/';
        } else {
            console.error('Errore durante il logout');
        }
    } catch (error) {
        console.error('Errore nel logout:', error);
    }
});

/**
 * Nella Profile Page eventLIstener per abilitare il click su Modifica Prfilo
 * @type {boolean} flag per gestire quante volte chiedo la conferma password
 */
let flag = false;
document.getElementById('editProfileLink').addEventListener('click', async function (event) {
    event.preventDefault(); // Previene azioni di default
    if (!flag) {
        // Mostra il modale per mettere la conferma della password
        const loginForm = passwordConfirmation();
        const modalBody = document.querySelector("#modal-body");
        modalBody.innerHTML = loginForm;


        const loginModal = document.querySelector("#loginModalConfirmation");
        loginModal.style.display = "flex"; // Use flex to center content

        // Bottone per chiudere il modale
        document.getElementById('close-button-confirmation').addEventListener('click', e => {
            e.preventDefault();
            loginModal.style.display = "none";
        });

        /**
         * Invio della conferma password, chiamata alla /users/getUserPassword per verificare la password
         */
        document.getElementById('button-submit-confirmation').addEventListener('click', async e => {
            e.preventDefault();
            const password = document.getElementById("password-confirmation").value; // Ensure this ID is correct
            const username = document.getElementById("username").value;
            const response = await fetch('/users-route/users/getUserPassword', {
                method: 'POST',
                credentials: 'include', // Include cookies for authentication
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }), // Send username and password
            });
            const result = await response.json();
            if (response.ok && result.success) {
                // Rende i campi editabili
                const inputs = document.querySelectorAll('#profileForm input');
                inputs.forEach(input => {
                    if (input.id !== 'email') {
                        input.removeAttribute('readonly');
                        input.classList.add('editable');
                    }
                });
                // Mostra button Save
                document.getElementById('profileForm').insertAdjacentHTML('beforeend', buttonSave());

                flag = true; // Flag per non richiedere sempre la conferma password
                loginModal.style.display = "none";
            } else {
                alert("Password verifica fallita riprova. ");
            }
            //Si occupa di scrivere i dati nuovi nel db
            modifyData()
        });
    } else {
        const inputs = document.querySelectorAll('#profileForm input');
        inputs.forEach(input => {
            if (input.id !== 'email') {
                input.removeAttribute('readonly');
                input.classList.add('editable');
            }
        });
    }
});

/**
 * Raccoglie i dati dai campi e scrive i nuovi dati nel db, chiamata /users/modifyData
 */
function modifyData() {
        const saveButton = document.getElementById('SaveBtn');
        if (saveButton) {
            saveButton.addEventListener('click', async e => {
                e.preventDefault();
                const Newusername = document.getElementById('username').value;
                const email = document.getElementById('email').value;
                const Newname = document.getElementById('name-label').value;
                const Newsurname = document.getElementById('surname-label').value;
                const Newdob = document.getElementById('BirthDay-label').value;
                if (!Newusername || !email || !Newname || !Newsurname || !Newdob) {
                    alert("Tutti i campi devono essere compilati.");
                    return;
                }

                try {
                        const response = await fetch('/users-route/users/modifyData', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                nome: Newname,
                                cognome: Newsurname,
                                username: Newusername,
                                email: email, // Email è un campo unique che serve come identificativo
                                birthDay: Newdob,
                            })
                        });
                    const result = await response.json();
                    if (response.ok && result.success) {
                        createSuccessHeader("Dati modificati con successo")
                        console.log("Dati modificati con successo");
                    } else {
                        console.error("Errore durante l'aggiornamento:", result.error);
                    }
                } catch (error) {
                    console.error('Errore durante la richiesta:', error);
                }
            });
        } else {
            console.error("SaveBtn not found in the DOM");
        }
}

/**
 * Se la modifica è andata a buon fine mostra un Header di conferma
 * @param message
 */
function createSuccessHeader(message) {
    let header = document.getElementById('successHeader');

    if (!header) {
        // Crea header
        header = document.createElement('h3');
        header.id = 'successHeader';
        header.className = 'text-success';
        const profileForm = document.getElementById('profileForm');
        profileForm.insertAdjacentElement('beforebegin', header);
    }

    // Mostra il messaggio
    header.textContent = message;
}


/**
 * aggiorna immagine profilo
 */
export function addProfilePic(){
    const profilePic = document.getElementById('profilePic');
    const fileInput = document.getElementById('fileInput');

    // Apre il selettore di file al clic sull'immagine del profilo
    profilePic.addEventListener('click', () => {
        fileInput.click();
    });
    // Gestisce la selezione del file
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];

        if (file) {
            // Verifica che sia un'immagine
            if (!file.type.startsWith('image/')) {
                alert('Per favore seleziona un file immagine.');
                return;
            }

            // Anteprima immagine (opzionale)
            const reader = new FileReader();
            reader.onload = function (e) {
                profilePic.src = e.target.result; // Mostra l'immagine selezionata
            };
            reader.readAsDataURL(file);

            // Caricamento immagine sul server
            const formData = new FormData();
            formData.append('profilePic', file);
            try {
                const response = await addNewImgManager(formData);
                const result = await response.json();
                if (response.ok && result.success) {
                    createSuccessHeader("Immagine aggiornata con successo.")
                } else {
                    alert('Errore durante il caricamento: ' + (result.error || 'Errore sconosciuto'));
                }
            } catch (error) {
                console.error('Errore durante la richiesta:', error);
                alert('Errore durante il caricamento. Riprova.');
            }
        }
    });
}


