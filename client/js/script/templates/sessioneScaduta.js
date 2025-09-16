export function sessioneScaduta() {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'sessione';
    messageContainer.textContent = 'La tua sessione è scaduta. Sarai reindirizzato alla pagina Guest.';

    // Stile dinamico per il messaggio
    messageContainer.style.position = 'fixed';
    messageContainer.style.top = '20px';
    messageContainer.style.left = '50%';
    messageContainer.style.transform = 'translateX(-50%)';
    messageContainer.style.backgroundColor = 'rgba(251,250,250,0.9)';
    messageContainer.style.color = 'black';
    messageContainer.style.padding = '15px 30px';
    messageContainer.style.borderRadius = '5px';
    messageContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    messageContainer.style.zIndex = '9999';

    document.body.appendChild(messageContainer);
    console.log('è entrtato fuori seessione');
    // Rimuovi il messaggio dopo 3 secondi
    setTimeout(() => {
        messageContainer.remove();
    }, 3000);
}

