
export async function writeAnswerAgent(input) {
    try {
        const response = await fetch('/ai/llm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ prompt: input }) // <--- correggi qui
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.error("Errore nella risposta:", response.status);
        }
    } catch (err) {
        console.error("Errore nella richiesta:", err);
    }
}
