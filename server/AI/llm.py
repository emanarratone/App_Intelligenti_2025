#!/usr/bin/env python3
import subprocess
import json
import sys
import requests
import base64
import re
import os
from pathlib import Path
from urllib.parse import quote

def is_product_search_request(text):
    """Rileva se l'utente sta cercando un prodotto specifico"""
    text_lower = text.lower()
    
    # Parole chiave che indicano ricerca di prodotti
    search_keywords = [
        'cerco', 'dove trovo', 'dove posso comprare', 'dove acquistare', 
        'dove vendono', 'voglio comprare', 'sto cercando', 'mi serve',
        'ho bisogno di', 'vorrei', 'consigli per comprare', 'dove compro',
        'link per', 'sito per comprare', 'shop online', 'acquistare online',
        'dove posso trovare', 'dove trovare', 'trovare', 'dove si trova',
        'dove si compra', 'dove si acquista', 'cerca', 'cercare'
    ]
    
    # Tipi di prodotti di moda
    fashion_items = [
        'vestito', 'vestiti', 'abito', 'abiti', 'gonna', 'gonne', 'pantaloni', 'jeans',
        'camicia', 'camicie', 'maglietta', 'magliette', 't-shirt', 'maglia', 'maglione',
        'giacca', 'giacche', 'giubbotto', 'cappotto', 'felpa', 'felpe', 'hoodie',
        'scarpe', 'scarpa', 'sandali', 'stivali', 'sneakers', 'tacchi', 'ballerine',
        'borsa', 'borse', 'zaino', 'zaini', 'valigia', 'trolley',
        'accessori', 'cintura', 'cinture', 'sciarpa', 'sciarpe', 'cappello', 'cappelli',
        'occhiali', 'orologio', 'orologi', 'gioielli', 'collana', 'braccialetto',
        'anello', 'orecchini', 'bikini', 'costume', 'intimo', 'calze', 'calzini'
    ]
    
    # Verifica se il testo contiene parole di ricerca E prodotti di moda
    has_search_intent = any(keyword in text_lower for keyword in search_keywords)
    has_fashion_item = any(item in text_lower for item in fashion_items)
    
    return has_search_intent and has_fashion_item

def extract_product_details(text):
    """Estrae dettagli del prodotto dal testo dell'utente"""
    text_lower = text.lower()
    
    # Estrai tipo di prodotto
    fashion_items = {
        'vestito': ['vestito', 'vestiti', 'abito', 'abiti'],
        'gonna': ['gonna', 'gonne'],
        'pantaloni': ['pantaloni', 'jeans'],
        'camicia': ['camicia', 'camicie'],
        'maglietta': ['maglietta', 'magliette', 't-shirt', 'maglia'],
        'maglione': ['maglione', 'maglioni'],
        'felpa': ['felpa', 'felpe', 'hoodie'],
        'giacca': ['giacca', 'giacche', 'giubbotto', 'cappotto'],
        'scarpe': ['scarpe', 'scarpa', 'sandali', 'stivali', 'sneakers', 'tacchi', 'ballerine'],
        'borsa': ['borsa', 'borse', 'zaino', 'zaini'],
        'accessori': ['accessori', 'cintura', 'sciarpa', 'cappello', 'occhiali', 'orologio', 'gioielli']
    }
    
    product_type = None
    for category, items in fashion_items.items():
        if any(item in text_lower for item in items):
            product_type = category
            break
    
    # Estrai colori (incluse le varianti al plurale/femminile)
    colors = {
        'nero': ['nero', 'nere', 'neri', 'nera'],
        'bianco': ['bianco', 'bianche', 'bianchi', 'bianca'],
        'rosso': ['rosso', 'rosse', 'rossi', 'rossa'],
        'blu': ['blu', 'azzurro', 'azzurre', 'azzurri', 'azzurra'],
        'verde': ['verde', 'verdi'],
        'giallo': ['giallo', 'gialle', 'gialli', 'gialla'],
        'rosa': ['rosa'],
        'viola': ['viola'],
        'marrone': ['marrone', 'marroni'],
        'grigio': ['grigio', 'grigie', 'grigi', 'grigia'],
        'arancione': ['arancione', 'arancioni']
    }
    
    color = None
    for base_color, variants in colors.items():
        if any(variant in text_lower for variant in variants):
            color = base_color
            break
    
    # Estrai brand/materiali
    brands = ['nike', 'adidas', 'zara', 'h&m', 'uniqlo', 'gucci', 'prada', 'armani', 'versace']
    brand = next((b for b in brands if b in text_lower), None)
    
    return {
        'type': product_type,
        'color': color,
        'brand': brand,
        'query': text
    }

def search_products_online(product_details):
    """Cerca prodotti online utilizzando diverse fonti"""
    try:
        product_type = product_details.get('type', '')
        color = product_details.get('color', '')
        brand = product_details.get('brand', '')
        
        # Costruisci query di ricerca
        search_terms = []
        if product_type:
            search_terms.append(product_type)
        if color:
            search_terms.append(color)
        if brand:
            search_terms.append(brand)
        
        search_query = ' '.join(search_terms) if search_terms else 'abbigliamento moda'
        
        # Genera link di ricerca per diversi siti di e-commerce
        results = []
        
        # Amazon
        amazon_query = quote(search_query + ' abbigliamento')
        amazon_link = f"https://www.amazon.it/s?k={amazon_query}&rh=n%3A1571271031"
        results.append({
            'site': 'Amazon',
            'link': amazon_link,
            'description': f'Cerca "{search_query}" su Amazon'
        })
        
        # Zalando
        zalando_query = quote(search_query.replace(' ', '-'))
        zalando_link = f"https://www.zalando.it/search/?q={quote(search_query)}"
        results.append({
            'site': 'Zalando',
            'link': zalando_link,
            'description': f'Trova "{search_query}" su Zalando'
        })
        
        # ASOS
        asos_query = quote(search_query)
        asos_link = f"https://www.asos.com/search/?q={asos_query}"
        results.append({
            'site': 'ASOS',
            'link': asos_link,
            'description': f'Scopri "{search_query}" su ASOS'
        })
        
        # H&M
        hm_query = quote(search_query)
        hm_link = f"https://www2.hm.com/it_it/search-results.html?q={hm_query}"
        results.append({
            'site': 'H&M',
            'link': hm_link,
            'description': f'Sfoglia "{search_query}" su H&M'
        })
        
        return results
        
    except Exception as e:
        print(f"DEBUG: Errore nella ricerca prodotti: {str(e)}", file=sys.stderr)
        return []

def get_api_key():
    """Ottieni il token dal file .env"""
    try:
        # Percorso del file .env (due livelli sopra dalla cartella AI)
        env_path = Path(__file__).parent.parent.parent / '.env'
        print(f"DEBUG: Cercando .env in: {env_path}", file=sys.stderr)
        
        if env_path.exists():
            with open(env_path, 'r') as f:
                for line in f:
                    if line.strip().startswith('GITHUB_TOKEN='):
                        # Rimuovi GITHUB_TOKEN= e eventuali virgolette
                        token = line.strip().split('=', 1)[1]
                        token = token.strip('\'"')
                        return token
        
        # Fallback: prova GitHub CLI se disponibile
        result = subprocess.run(['gh', 'auth', 'token'], capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return None

def create_personalized_system_message(user_preferences=None):
    """Crea un system message personalizzato basato sulle preferenze dell'utente"""
    base_message = """Sei un AI Assistente di Moda e Shopping esperto e amichevole. Puoi rispondere a domande riguardanti:

- Moda e abbigliamento
- Consigli su outfit e stile ("cosa indossare", "come vestirsi", ecc.)
- Shopping e acquisti di vestiti, scarpe, accessori
- Tendenze di moda
- Abbinamenti di colori e stili
- Cura e manutenzione dei vestiti
- Brand di moda e marchi
- Occasioni speciali e dress code

Per domande che NON riguardano moda, abbigliamento o shopping, rispondi educatamente che sei specializzato in moda.

IMPORTANTE: Non utilizzare MAI formato Markdown, asterischi, grassetto, corsivo o altri simboli di formattazione. 
Scrivi solo testo naturale semplice. Sii amichevole e utile."""
    
    if not user_preferences:
        return base_message
    
    # Aggiungi informazioni personalizzate sulla moda
    personalization = "\n\nInformazioni sull'utente per personalizzare i tuoi consigli di moda:"
    
    if user_preferences.get('colori'):
        colori = ', '.join(user_preferences['colori'])
        personalization += f"\n- Colori preferiti: {colori}. Suggerisci sempre questi colori negli outfit quando appropriato."
    
    if user_preferences.get('stile'):
        stile = user_preferences['stile']
        personalization += f"\n- Stile preferito: {stile}. Suggerisci sempre outfit e capi che rispecchiano questo stile."
    
    if user_preferences.get('interessi'):
        interessi = ', '.join(user_preferences['interessi'])
        personalization += f"\n- Interessi: {interessi}. Considera questi interessi quando suggerisci abbigliamento per specifiche attività o eventi."
    
    personalization += "\n\nUsa queste informazioni per dare consigli di moda personalizzati e pertinenti per l'utente. Ricorda: parla SOLO di moda, shopping e abbigliamento!"
    
    return base_message + personalization

def consiglia_con_copilot(messages, user_preferences=None):
    """Usa GitHub token per accedere a servizi AI compatibili"""
    try:
        api_key = get_api_key()
        if not api_key:
            return None
        
        # Proviamo prima l'endpoint OpenAI con il token GitHub
        url = "https://api.openai.com/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Costruisci system message personalizzato
        system_message = create_personalized_system_message(user_preferences)
        
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "system", "content": system_message}] + messages,
            "max_tokens": 1500,
            "temperature": 0.7
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content'].strip()
        elif response.status_code == 401:
            # Token non valido per OpenAI, proviamo endpoint GitHub alternativi
            return try_github_models(messages, api_key, user_preferences)
        else:
            return None
            
    except Exception as e:
        return None

def try_github_models(messages, api_key, user_preferences=None):
    """Prova endpoint GitHub Models (beta)"""
    try:
        # GitHub Models API (beta)
        url = "https://models.inference.ai.azure.com/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Aggiungi il system message personalizzato
        system_message = create_personalized_system_message(user_preferences)
        
        data = {
            "messages": [{"role": "system", "content": system_message}] + messages,
            "model": "gpt-4o-mini",
            "temperature": 0.7,
            "max_tokens": 800
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content'].strip()
        
    except Exception:
        pass
    
    return None

def consiglia_fallback(prompt):
    """Genera una risposta di fallback per moda e shopping quando le API esterne non sono disponibili"""
    
    # Converti il prompt in minuscolo per l'analisi
    prompt_lower = prompt.lower()
    
    # Parole chiave per moda e shopping
    fashion_keywords = ['outfit', 'vestiti', 'abbigliamento', 'moda', 'scarpe', 'accessori', 'stile', 'shopping', 
                       'cappello', 'camicia', 'pantaloni', 'giacca', 'gonna', 'vestito', 'jeans', 'maglietta',
                       'borsa', 'cintura', 'occhiali', 'collana', 'orecchini', 'anello', 'braccialetto',
                       'casual', 'elegante', 'formale', 'trendy', 'vintage', 'moderno', 'classic',
                       'colore', 'nero', 'bianco', 'rosso', 'blu', 'verde', 'giallo', 'grigio', 'marrone',
                       'brand', 'marca', 'negozio', 'comprare', 'acquistare', 'indossare', 'abbinare']
    
    # Controlla se la domanda riguarda la moda
    is_fashion_related = any(keyword in prompt_lower for keyword in fashion_keywords)
    
    if not is_fashion_related:
        return "Mi dispiace, sono un assistente specializzato in moda e shopping. Posso aiutarti solo con consigli su outfit, abbigliamento, accessori e tutto ciò che riguarda il mondo della moda. Hai qualche domanda su questi argomenti?"
    
    # Risposte contestuali basate sul contenuto del messaggio di moda
    if re.search(r'\b(ciao|salve|buongiorno|buonasera|hey)\b', prompt_lower):
        return "Ciao! Sono il tuo assistente personale per moda e shopping. Posso aiutarti con consigli su outfit, abbinamenti, tendenze di moda e tutto ciò che riguarda l'abbigliamento. Come posso aiutarti oggi?"
    
    elif re.search(r'\b(outfit|cosa indossare|abbinamento)\b', prompt_lower):
        return "Per outfit e abbinamenti, posso suggerirti come combinare capi diversi per creare look perfetti. Ad esempio, per un look casual: jeans scuri + maglietta bianca + giacca di jeans + sneakers bianche. Per uno elegante: pantaloni neri + camicia bianca + blazer + scarpe classiche. Che tipo di outfit stai cercando?"
    
    elif re.search(r'\b(colore|colori|abbinare colori)\b', prompt_lower):
        return "Per gli abbinamenti di colori, ecco alcuni consigli base: i neutri (nero, bianco, grigio, beige) si abbinano con tutto. Il blu navy sta bene con rosa, bianco e grigio. Il rosso si abbina bene con nero, bianco e denim. Quale colore ti piacerebbe abbinare?"
    
    elif re.search(r'\b(scarpe|footwear|calzature)\b', prompt_lower):
        return "Per le scarpe, dipende dall'occasione: sneakers per il casual, décolleté o scarpe classiche per l'elegante, stivali per l'autunno/inverno, sandali per l'estate. Le scarpe devono sempre essere comode e abbinarsi al resto dell'outfit. Che tipo di scarpe stai cercando?"
    
    elif re.search(r'\b(accessori|borsa|borsse|gioielli)\b', prompt_lower):
        return "Gli accessori completano l'outfit! Una borsa dovrebbe essere proporzionata alla tua figura e adatta all'occasione. I gioielli aggiungono personalità: per un look minimal, scegli pezzi delicati; per uno bold, osa con statement pieces. Che accessori ti interessano?"
    
    elif re.search(r'\b(shopping|comprare|acquistare|negozio)\b', prompt_lower):
        return "Per lo shopping intelligente, ti consiglio di: investire in basic di qualità, scegliere pezzi versatili che si abbinano con più outfit, controllare sempre vestibilità e materiali, e comprare solo ciò che ami davvero. Stai cercando qualcosa di specifico?"
    
    elif re.search(r'\b(stile|style|tendenza|trend)\b', prompt_lower):
        return "Gli stili principali includono: casual (comodo per tutti i giorni), elegante (per occasioni formali), boho (libero e artistico), minimal (pulito e essenziale), vintage (ispirato al passato). Ogni stile ha le sue caratteristiche. Quale ti rappresenta di più?"
    
    elif re.search(r'\b(stagione|estate|inverno|autunno|primavera)\b', prompt_lower):
        return "Per vestirsi secondo la stagione: estate - tessuti leggeri, colori chiari, sandali; inverno - strati, cappotti caldi, stivali; primavera/autunno - giacche leggere, colori della natura. Come posso aiutarti per la stagione attuale?"
    
    elif re.search(r'\b(evento|cerimonia|matrimonio|festa)\b', prompt_lower):
        return "Per eventi speciali: matrimoni (evita bianco e nero, scegli colori allegri), feste (osa con texture e brillantini), cerimonie (eleganza sobria), aperitivi (smart casual). Dimmi che evento hai e ti aiuto a scegliere l'outfit perfetto!"
    
    elif '?' in prompt:
        return "Mi dispiace, sono specializzato solo in moda e shopping. Posso aiutarti con consigli su outfit, abbinamenti, tendenze, scarpe, accessori e tutto ciò che riguarda l'abbigliamento. Hai qualche domanda su questi argomenti?"
    
    else:
        return "Mi dispiace, sono un assistente specializzato in moda e shopping. Posso aiutarti solo con consigli su outfit, abbigliamento, accessori e tutto ciò che riguarda il mondo della moda. Hai qualche domanda su questi argomenti?"

def consiglia_con_immagine(prompt, image_base64, api_key):
    """Analizza un'immagine usando GitHub Models con GPT-4 Vision"""
    try:
        print(f"DEBUG: Inizio analisi immagine con GitHub Models GPT-4 Vision", file=sys.stderr)
        url = "https://models.inference.ai.azure.com/chat/completions"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        # Sistema prompt specifico per moda
        system_prompt = """Sei un consulente di moda esperto. Analizza le immagini dal punto di vista dello stile, abbigliamento e tendenze. Fornisci consigli specifici su:
        - Abbinamenti di colori e tessuti
        - Stile e outfit
        - Accessori appropriati
        - Suggerimenti per migliorare il look
        - Tendenze di moda
        Non utilizzare mai formato Markdown, asterischi, grassetto o corsivo. Scrivi solo testo naturale."""
        
        payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 800,
            "temperature": 0.7
        }
        
        print(f"DEBUG: Invio richiesta a {url}", file=sys.stderr)
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        print(f"DEBUG: Status code: {response.status_code}", file=sys.stderr)
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            print(f"DEBUG: Risposta ricevuta con successo: {len(content)} caratteri", file=sys.stderr)
            return content
        else:
            error_text = response.text
            print(f"DEBUG: Errore API - Status: {response.status_code}, Response: {error_text}", file=sys.stderr)
            return None
            
    except Exception as e:
        print(f"DEBUG: Eccezione in consiglia_con_immagine: {str(e)}", file=sys.stderr)
        return None

def consiglia(messages, user_preferences=None):
    """Funzione principale che prova diverse API in ordine di priorità"""
    
    # Ottieni l'ultimo messaggio dell'utente
    last_message = messages[-1]['content'] if messages and len(messages) > 0 else "ciao"
    
    # Verifica se l'utente sta cercando un prodotto
    if is_product_search_request(last_message):
        print(f"DEBUG: Rilevata richiesta di ricerca prodotto: {last_message}", file=sys.stderr)
        
        # Estrai dettagli del prodotto
        product_details = extract_product_details(last_message)
        print(f"DEBUG: Dettagli prodotto estratti: {product_details}", file=sys.stderr)
        
        # Cerca prodotti online
        search_results = search_products_online(product_details)
        
        if search_results:
            # Crea una risposta con i link di ricerca
            response = f"Ho trovato alcuni posti dove puoi cercare "
            if product_details.get('type'):
                response += f"{product_details['type']}"
                if product_details.get('color'):
                    response += f" {product_details['color']}"
                if product_details.get('brand'):
                    response += f" {product_details['brand']}"
            else:
                response += "quello che stai cercando"
            
            response += ":\n\n"
            
            for result in search_results:
                response += f"🛍️ {result['site']}: {result['description']}\n"
                response += f"👉 {result['link']}\n\n"
            
            response += "💡 Ti consiglio di confrontare prezzi e leggere le recensioni prima dell'acquisto. Hai bisogno di altri consigli su come scegliere il prodotto perfetto?"
            
            return response
    
    # 1. Prova GitHub token con servizi compatibili
    try:
        result = consiglia_con_copilot(messages, user_preferences)
        if result:
            return result
    except Exception:
        pass
    
    # 2. Fallback alla simulazione intelligente usando l'ultimo messaggio
    return consiglia_fallback(last_message)

if __name__ == "__main__":
    try:
        # Leggi i dati da stdin (formato JSON)
        input_data = json.loads(sys.stdin.read())
        messages = input_data.get('messages', [])
        user_preferences = input_data.get('user_preferences', None)
        image_data = input_data.get('image', None)
        
        if not messages:
            # Fallback per compatibilità con vecchia API
            prompt = input_data.get('prompt', 'ciao')
            messages = [{"role": "user", "content": prompt}]
        
        # Se c'è un'immagine, usa la funzione di analisi immagine
        if image_data:
            print("DEBUG: Immagine ricevuta, tentativo di analisi...", file=sys.stderr)
            api_key = get_api_key()
            print(f"DEBUG: API key presente: {api_key is not None}", file=sys.stderr)
            
            if api_key:
                # Prendi l'ultimo messaggio dell'utente come prompt per l'immagine
                prompt = messages[-1]['content'] if messages and len(messages) > 0 else "Cosa vedi in questa immagine? Dammi consigli di moda basati su quello che vedi."
                # Aggiungi contesto di moda al prompt
                fashion_prompt = f"Analizza questa immagine dal punto di vista della moda e dello stile. {prompt} Fornisci consigli specifici su abbigliamento, accessori, colori e stile."
                print(f"DEBUG: Chiamata API per analisi immagine con prompt: {fashion_prompt[:100]}...", file=sys.stderr)
                
                risposta = consiglia_con_immagine(fashion_prompt, image_data, api_key)
                print(f"DEBUG: Risposta dall'API: {risposta is not None}", file=sys.stderr)
                
                if risposta:
                    result = {"response": risposta}
                    print(json.dumps(result))
                    exit()
                else:
                    print("DEBUG: API call fallita, usando fallback", file=sys.stderr)
            else:
                print("DEBUG: Nessuna API key trovata, usando fallback", file=sys.stderr)
            
            # Se non c'è API key o l'analisi fallisce, restituisci un messaggio specifico per le immagini
            fallback_image_response = "Ho ricevuto la tua immagine! Purtroppo al momento non posso analizzare le immagini in tempo reale, ma posso comunque aiutarti con consigli di moda. Puoi descrivermi quello che indossi o quello che vedi nell'immagine? Ad esempio: colori, tipo di abbigliamento, occasione d'uso, e ti darò suggerimenti specifici per creare outfit perfetti!"
            result = {"response": fallback_image_response}
            print(json.dumps(result))
            exit()
        
        # Altrimenti usa la normale funzione di chat
        risposta = consiglia(messages, user_preferences)
        
        # Restituisci la risposta in formato JSON
        result = {"response": risposta}
        print(json.dumps(result))
        
    except json.JSONDecodeError:
        # Fallback per input di testo semplice
        prompt = sys.stdin.read().strip() or "ciao"
        messages = [{"role": "user", "content": prompt}]
        risposta = consiglia(messages)
        result = {"response": risposta}
        print(json.dumps(result))
        
    except Exception as e:
        # Errore generico
        error_result = {"response": "Mi dispiace, si è verificato un errore. Riprova più tardi."}
        print(json.dumps(error_result))