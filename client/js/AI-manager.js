
export class AIManager {
    
    static async sendMessage(messages, sessionId, imageData = null) {
        try {
            console.log('Invio messaggi al server AI:', messages, 'Sessione:', sessionId);
            if (imageData) {
                console.log('Includendo immagine nella richiesta');
            }
            
            // Prepara i dati da inviare
            const requestData = {
                messages: messages,
                sessionId: sessionId
            };
            
            // Aggiungi l'immagine se presente
            if (imageData) {
                requestData.image = imageData;
            }
            
            // Invia la richiesta POST al server
            const response = await fetch('/ai/llm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error(`Errore HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Risposta ricevuta dal server:', data);
            
            return data;
            
        } catch (error) {
            console.error('Errore nell\'AIManager:', error);
            throw error;
        }
    }
}
