# Aggiornamento: Ricerca Web Dinamica con IA

## Che cosa è cambiato?

Il sistema di ricerca prodotti ora utilizza l'intelligenza artificiale per effettuare ricerche web dinamiche invece di generare semplicemente link statici. Questo significa che l'IA può:

- Cercare prodotti reali in tempo reale
- Ottenere prezzi, descrizioni e recensioni attuali
- Fornire risultati più pertinenti e aggiornati
- Adattare la ricerca alle specifiche richieste dell'utente

## Funzionalità

### 🔍 Ricerca Dinamica
- **SerpAPI**: API di ricerca preferita per risultati precisi e ricchi
- **Google Custom Search**: Alternativa gratuita con limiti
- **Fallback Intelligente**: Se le API non sono configurate, usa il sistema migliorato con link statici

### 📱 Informazioni Ricche
I risultati ora includono:
- Titolo del prodotto
- Prezzo (quando disponibile)
- Valutazioni e recensioni
- Descrizioni prodotto
- Link diretti
- Suggerimenti per l'acquisto

### 🤖 IA Conversazionale
L'assistente ora:
- Riconosce meglio le richieste di ricerca prodotti
- Gestisce domande di abbinamento e stile
- Fornisce consigli personalizzati per l'acquisto

## Configurazione

### 1. Copia il file di esempio
```bash
cp .env.example .env
```

### 2. Configura le API Key (opzionale ma raccomandato)

#### SerpAPI (Raccomandato)
1. Registrati su [serpapi.com](https://serpapi.com)
2. Ottieni la tua API key gratuita
3. Aggiungi nel file `.env`:
```
SERPAPI_KEY=your_serpapi_key_here
```

#### Google Custom Search (Alternativa)
1. Vai su [Google Cloud Console](https://console.cloud.google.com)
2. Abilita la Custom Search API
3. Crea una Custom Search Engine su [cse.google.com](https://cse.google.com)
4. Aggiungi nel file `.env`:
```
GOOGLE_SEARCH_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_CX=your_search_engine_id_here
```

### 3. GitHub Token (per IA conversazionale)
Aggiungi il tuo token GitHub nel file `.env`:
```
GITHUB_TOKEN=your_github_token_here
```

## Esempi di Utilizzo

### Ricerca Prodotti
- "cerco una camicia bianca"
- "dove trovo scarpe nike rosse"
- "voglio comprare una giacca nera zara"

### Consigli di Stile
- "come abbino una camicia bianca?"
- "cosa indossare per un matrimonio?"
- "consigli outfit casual"

## Come Funziona

1. **Rilevamento Intelligente**: L'IA riconosce se stai cercando un prodotto specifico
2. **Estrazione Dettagli**: Identifica tipo di prodotto, colore, brand dalla tua richiesta
3. **Ricerca Dinamica**: 
   - Prima prova SerpAPI per risultati shopping ricchi
   - Se non disponibile, usa Google Custom Search
   - Come fallback, genera link di ricerca ottimizzati
4. **Presentazione Migliorata**: Mostra risultati con prezzi, recensioni e suggerimenti

## Vantaggi

- ✅ **Risultati Aggiornati**: Prodotti e prezzi in tempo reale
- ✅ **Maggiore Precisione**: Ricerche mirate ai tuoi bisogni specifici
- ✅ **Informazioni Complete**: Prezzi, recensioni, descrizioni
- ✅ **Funziona Sempre**: Sistema di fallback garantisce sempre una risposta
- ✅ **Facile da Configurare**: Funziona anche senza API key esterne

## Note Tecniche

- Il sistema è retrocompatibile con il codice esistente
- Nessuna modifica richiesta nell'interfaccia client
- Le API key sono opzionali (il sistema funziona senza)
- Gestione automatica degli errori e timeout
- Debug logging per troubleshooting