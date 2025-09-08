# Configurazione AI (GitHub Copilot & OpenAI)

## 🚀 Configurazione

Il sistema è integrato con **GitHub Copilot** e **OpenAI** per fornire risposte intelligenti! Ecco come configurarlo:

### 1. Ottieni un Token/API Key

#### Opzione A: GitHub Copilot (Consigliata)
1. Vai su [GitHub Personal Access Tokens](https://github.com/settings/tokens)
2. Clicca "Generate new token (classic)"
3. Seleziona i seguenti scopes:
   - `copilot` (se disponibile)
   - `repo` 
   - `user`
4. Copia il token generato

#### Opzione B: OpenAI API
1. Vai su [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Accedi con il tuo account OpenAI
3. Crea una nuova API key
4. Copia la chiave API

### 2. Configura il Token/API Key

Hai diverse opzioni:

#### Opzione A: File .env (Consigliata)
```bash
cp .env.example .env
```
Poi modifica il file `.env` e sostituisci:
- `ghp_la_tua_chiave_github_qui` con il tuo GitHub token, OPPURE
- `sk_la_tua_chiave_openai_qui` con la tua OpenAI API key

#### Opzione B: Variabile d'ambiente
```bash
# Per GitHub Copilot
export GITHUB_TOKEN="ghp_il_tuo_token_github"

# OPPURE per OpenAI
export OPENAI_API_KEY="sk_la_tua_api_key_openai"
```

### 3. Testa il Sistema

1. Avvia l'applicazione: `npm start`
2. Vai su: http://localhost:3300/client/HTML/AI-page.html
3. Scrivi una domanda e clicca "Invia"

## 🔄 Modalità Fallback Intelligente

Il sistema ha un sistema di fallback a cascata:

1. **Primo tentativo**: GitHub Copilot API
2. **Secondo tentativo**: OpenAI API diretta
3. **Fallback**: Risposte simulate intelligenti basate su parole chiave

Questo garantisce che l'AI funzioni sempre, anche senza configurazione!

## ⚡ Vantaggi GitHub Copilot

- **Ottimizzato per sviluppatori**: Comprende meglio il contesto tecnico
- **Integrato con GitHub**: Facilità di autenticazione
- **Modelli aggiornati**: Accesso ai modelli più recenti
- **Rate limiting generoso**: Per applicazioni in sviluppo

## 🛠️ Struttura

- **Frontend**: `client/HTML/AI-page.html` + `client/js/AI-controller.js`
- **API Route**: `server/routes/AI-route.js`
- **AI Logic**: `server/AI/llm.py` (usando GitHub Copilot/OpenAI)
- **Dependencies**: `requirements.txt` (solo requests e python-dotenv)
- **Virtual Env**: `venv/` (ambiente Python isolato)

## 📝 Personalizzazione

Puoi modificare il prompt di sistema in `server/AI/llm.py` per cambiare il comportamento dell'AI secondo le tue esigenze.
