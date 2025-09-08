import sys
import requests
import json
import os
from pathlib import Path

def get_api_key():
    """Ottieni l'API key da variabile d'ambiente o file .env"""
    # Prova a leggere da variabile d'ambiente
    api_key = os.getenv('GITHUB_TOKEN')
    
    if not api_key:
        # Prova a leggere da file .env nella root del progetto
        env_file = Path(__file__).parent.parent.parent / '.env'
        if env_file.exists():
            with open(env_file, 'r') as f:
                for line in f:
                    if line.startswith('GITHUB_TOKEN='):
                        api_key = line.strip().split('=', 1)[1]
                        break
    
    return api_key

def consiglia_con_copilot(prompt):
    """Usa GitHub token per accedere a servizi AI compatibili"""
    try:
        api_key = get_api_key()
        if not api_key:
            return None
        
        # Proviamo prima l'endpoint OpenAI con il token GitHub
        # Alcuni token GitHub hanno accesso a servizi OpenAI
        url = "https://api.openai.com/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        system_message = """Sei Miku AI, un assistente virtuale esperto di moda e shopping per un negozio di abbigliamento chiamato "Miku's Shop". 
        Il tuo compito è aiutare i clienti a trovare i prodotti giusti, fornire consigli di stile personalizzati e suggerimenti di outfit.
        Rispondi sempre in italiano in modo amichevole e professionale. Mantieni le risposte concise ma utili."""
        
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": system_message
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            "max_tokens": 150,
            "temperature": 0.7
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content'].strip()
        elif response.status_code == 401:
            # Token non valido per OpenAI, proviamo endpoint GitHub alternativi
            return try_github_models(prompt, api_key)
        else:
            return None
            
    except Exception as e:
        return None

def try_github_models(prompt, api_key):
    """Prova endpoint GitHub Models (beta)"""
    try:
        # GitHub Models API (beta) - potrebbe essere disponibile
        url = "https://models.inference.ai.azure.com/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "messages": [
                {
                    "role": "system",
                    "content": "Sei Miku AI, assistente shopping per abbigliamento. Rispondi in italiano."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "model": "gpt-4o-mini",
            "temperature": 0.7,
            "max_tokens": 150
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content'].strip()
        
    except Exception:
        pass
    
    return None

def consiglia_con_openai_compatible(prompt):
    """Alternativa usando OpenAI API direttamente (se disponibile)"""
    try:
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return None
        
        url = "https://api.openai.com/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "Sei Miku AI, assistente shopping per abbigliamento. Rispondi in italiano."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 150,
            "temperature": 0.7
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content'].strip()
        
    except Exception:
        return None

def consiglia_fallback(prompt):
    """Fallback alla simulazione se nessuna API è disponibile"""
    # Risposte specifiche per parole chiave
    specific_responses = {
        "ciao": "Ciao! Benvenuto da Miku's Shop! Come posso aiutarti oggi con il tuo look?",
        "jeans": "Per i jeans, ti consiglio un modello slim fit in denim scuro, perfetto con una camicia bianca!",
        "giacca": "Una giacca blazer beige sarebbe perfetta per un look casual-elegante!",
        "scarpe": "Per le scarpe, dipende dal look! Sneakers bianche per casual, o mocassini per elegante?",
        "vestito": "Un vestito midi in tessuto fluido è sempre una scelta vincente, versatile per ogni occasione!",
        "cappello": "Ti consiglio un berretto in lana per l'inverno o un cappello panama per l'estate. Dipende dalla stagione!",
        "maglietta": "Una maglietta basic bianca o nera è sempre perfetta, versatile per ogni outfit!",
        "camicia": "Una camicia bianca classica è un must-have, perfetta sia per look casual che eleganti!",
        "pantaloni": "Pantaloni chino beige o neri sono versatili per ogni occasione, comodi e di stile!",
        "gonna": "Una gonna midi plissettata è perfetta per un look femminile ed elegante!",
        "felpa": "Una felpa oversize in colori neutri è perfetta per un look casual e confortevole!",
        "boots": "Stivali Chelsea neri sono perfetti per l'autunno, eleganti e versatili!",
        "sneakers": "Sneakers bianche minimali vanno bene con tutto, un classico intramontabile!",
        "borsa": "Una borsa a tracolla in pelle marrone è perfetta per un look everyday chic!",
        "zaino": "Uno zaino in canvas o pelle è pratico per tutti i giorni mantenendo stile!",
        "accessori": "Prova con una cintura in pelle e un orologio minimal per completare il look!",
        "elegante": "Per un look elegante: camicia bianca, pantaloni scuri e scarpe in pelle. Classico!",
        "casual": "Per un look casual: jeans, maglietta e sneakers. Aggiungi una giacca di jeans!",
        "ufficio": "Per l'ufficio: blazer, camicia, pantaloni eleganti e scarpe classiche. Professionale!",
        "serata": "Per una serata: vestito nero, tacchi e accessori dorati. Eleganza garantita!",
        "inverno": "Per l'inverno: cappotto lungo, maglione, sciarpa e stivali. Caldo e di stile!",
        "estate": "Per l'estate: vestito leggero, sandali e cappello. Fresco e alla moda!",
        "colore": "I colori neutri come bianco, nero, beige e grigio sono sempre una scelta sicura!",
        "taglia": "Per la taglia, controlla sempre la nostra guida taglie. In caso di dubbi, scegli una taglia in più!",
        "prezzo": "Abbiamo opzioni per tutti i budget! Dai un'occhiata alle nostre offerte speciali!",
        "tendenza": "Le tendenze attuali includono: colori terra, tessuti naturali e stili oversize!"
    }
    
    # Categorie per una risposta più intelligente
    clothing_items = {
        "top": ["maglietta", "camicia", "felpa", "maglione", "polo", "canotta"],
        "bottom": ["jeans", "pantaloni", "gonna", "shorts", "leggings"],
        "outerwear": ["giacca", "cappotto", "giubbotto", "blazer", "cardigan"],
        "shoes": ["scarpe", "sneakers", "boots", "sandali", "tacchi", "mocassini"],
        "accessories": ["cappello", "borsa", "zaino", "cintura", "sciarpa", "guanti", "occhiali"]
    }
    
    clothing_advice = {
        "top": "Per la parte superiore, ti consiglio pezzi versatili come una camicia bianca o una maglietta di qualità in colori neutri!",
        "bottom": "Per la parte inferiore, jeans scuri o pantaloni chino sono sempre una scelta vincente!",
        "outerwear": "Per il capospalla, una giacca versatile che puoi indossare in diverse occasioni è l'ideale!",
        "shoes": "Per le scarpe, punta su qualità e comfort. Sneakers bianche o scarpe in pelle sono sempre perfette!",
        "accessories": "Gli accessori fanno la differenza! Scegli pezzi che riflettano la tua personalità!"
    }
    
    prompt_lower = prompt.lower()
    
    # 1. Cerca risposte specifiche
    for key, response in specific_responses.items():
        if key in prompt_lower:
            return response
    
    # 2. Cerca per categoria di abbigliamento
    for category, items in clothing_items.items():
        for item in items:
            if item in prompt_lower:
                return clothing_advice[category]
    
    # 3. Risposte contestuali per parole chiave generiche
    if any(word in prompt_lower for word in ["aiuto", "help", "consigli", "suggerimenti"]):
        return "Sono qui per aiutarti! Dimmi che tipo di capo stai cercando o per quale occasione, così posso darti consigli più specifici!"
    
    if any(word in prompt_lower for word in ["cosa", "come", "quale"]):
        return "Dimmi di più su quello che stai cercando! Hai in mente un'occasione particolare o un tipo di look?"
    
    if any(word in prompt_lower for word in ["budget", "costo", "spendere"]):
        return "Abbiamo opzioni per ogni budget! Vuoi qualcosa di economico o stai cercando pezzi di qualità superiore?"
    
    # 4. Risposta di default migliorata
    return f"Interessante! Per '{prompt}' ti consiglio di pensare al tuo stile personale. Preferisci look casual, eleganti o qualcosa nel mezzo? Così posso aiutarti meglio!"

def consiglia(prompt):
    """Funzione principale che prova diverse API in ordine di priorità"""
    # 1. Prova GitHub token con servizi compatibili
    try:
        result = consiglia_con_copilot(prompt)
        if result:
            return result
    except Exception:
        pass
    
    # 2. Prova OpenAI diretto
    try:
        result = consiglia_con_openai_compatible(prompt)
        if result:
            return result
    except Exception:
        pass
    
    # 3. Fallback alla simulazione intelligente
    return consiglia_fallback(prompt)

if __name__ == "__main__":
    prompt = sys.argv[1]
    risposta = consiglia(prompt)
    print(risposta)
