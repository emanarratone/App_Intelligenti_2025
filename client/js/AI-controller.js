import { writeAnswerAgent } from "./AI-manager.js";

export async function listenToPrompt() {
    document.getElementById("sendButton").addEventListener("click", async () => {
    const input = document.getElementById("userInput").value.trim();
    const responseBox = document.getElementById("response-box");

    if (!input) {
        responseBox.innerHTML = "<em>Per favore, scrivi qualcosa.</em>";
        return;
    }

    const res = await writeAnswerAgent(input);
    if (res && res.risposta) {
        responseBox.innerHTML = `<strong>Miku AI:</strong> ${res.risposta}`;
    } else {
        responseBox.innerHTML = `<strong>Miku AI:</strong> <em>Errore durante la risposta.</em>`;
    }
    });
}

// Chiama la funzione all'avvio
listenToPrompt();
