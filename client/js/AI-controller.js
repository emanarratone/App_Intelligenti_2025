import { writeAnswerAgent } from "./AI-manager.js";

let selectedImage = null;

export async function listenToPrompt() {
    // Gestione invio messaggio
    document.getElementById("sendButton").addEventListener("click", async () => {
        const input = document.getElementById("userInput").value.trim();
        const responseBox = document.getElementById("response-box");

        if (!input && !selectedImage) {
            responseBox.innerHTML = "<em>Per favore, scrivi qualcosa o carica un'immagine.</em>";
            return;
        }

        // Mostra messaggio di caricamento
        responseBox.innerHTML = "<em>Miku AI sta pensando...</em>";

        const res = await writeAnswerAgent(input, selectedImage);
        if (res && res.risposta) {
            responseBox.innerHTML = `<strong>Miku AI:</strong> ${res.risposta}`;
        } else {
            responseBox.innerHTML = `<strong>Miku AI:</strong> <em>Errore durante la risposta.</em>`;
        }
        
        // Pulisce l'input dopo l'invio
        document.getElementById("userInput").value = "";
    });

    // Gestione caricamento immagine
    document.getElementById("imgButton").addEventListener("click", () => {
        document.getElementById("imageInput").click();
    });

    // Gestione selezione file
    document.getElementById("imageInput").addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            // Comprimi l'immagine prima di caricarla
            compressImage(file, (compressedDataUrl) => {
                selectedImage = compressedDataUrl;
                showImagePreview(compressedDataUrl);
            });
        } else {
            alert("Per favore seleziona un file immagine valido.");
        }
    });

    // Gestione rimozione immagine
    document.getElementById("removeImage").addEventListener("click", () => {
        selectedImage = null;
        hideImagePreview();
        document.getElementById("imageInput").value = "";
    });

    // Invio con Enter
    document.getElementById("userInput").addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            document.getElementById("sendButton").click();
        }
    });
}

function showImagePreview(imageSrc) {
    const preview = document.getElementById("imagePreview");
    const img = document.getElementById("previewImg");
    
    img.src = imageSrc;
    preview.style.display = "block";
}

function hideImagePreview() {
    const preview = document.getElementById("imagePreview");
    preview.style.display = "none";
}

function compressImage(file, callback, maxWidth = 800, quality = 0.7) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function() {
        // Calcola le nuove dimensioni mantenendo le proporzioni
        let { width, height } = img;
        const originalSize = file.size;
        
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Disegna l'immagine ridimensionata
        ctx.drawImage(img, 0, 0, width, height);

        // Converti in data URL con compressione
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Calcola la nuova dimensione approssimativa
        const newSize = Math.round(compressedDataUrl.length * 0.75); // Approssimazione
        
        console.log(`Immagine compressa: ${Math.round(originalSize/1024)}KB → ${Math.round(newSize/1024)}KB`);
        
        callback(compressedDataUrl);
    };

    img.src = URL.createObjectURL(file);
}

// Chiama la funzione all'avvio
listenToPrompt();
