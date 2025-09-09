
export async function writeAnswerAgent(input, imageData = null) {
    try {
        const requestBody = { prompt: input };
        
        // Se c'è un'immagine, aggiungila al corpo della richiesta
        if (imageData) {
            requestBody.image = imageData;
        }

        const response = await fetch('/ai/llm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(requestBody) 
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.error("Errore nella risposta:", response.status);
            return { risposta: "Errore di comunicazione con il server." };
        }
    } catch (err) {
        console.error("Errore nella richiesta:", err);
        return { risposta: "Errore di rete. Riprova più tardi." };
    }
}
