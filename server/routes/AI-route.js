const express = require('express');
const { exec, spawn } = require('child_process');

const router = express.Router();
const path = require('path');
const llmPath = path.resolve(__dirname, '../AI/llm.py');
const venvPython = path.resolve(__dirname, '../../venv/bin/python');

router.post('/llm', (req, res) => {
    const prompt = req.body.prompt;
    const imageData = req.body.image;

    if (!prompt && !imageData) {
        return res.status(400).json({ error: 'Prompt o immagine mancanti' });
    }

    if (imageData) {
        // Se c'è un'immagine, usa stdin per evitare E2BIG
        const tempImageData = Buffer.from(imageData.split(',')[1], 'base64').toString('base64');
        const inputData = JSON.stringify({
            prompt: prompt || "",
            image: tempImageData
        });
        
        const pythonProcess = spawn(venvPython, [llmPath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        let errorOutput = '';
        let responseSet = false; // Flag per evitare risposte multiple
        
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            if (responseSet) return; // Evita risposte multiple
            responseSet = true;
            
            if (code !== 0) {
                console.error(`Errore esecuzione Python: ${errorOutput}`);
                return res.status(500).json({ error: 'Errore esecuzione Python', details: errorOutput });
            }
            res.json({ risposta: output.trim() });
        });
        
        pythonProcess.on('error', (error) => {
            if (responseSet) return; // Evita risposte multiple
            responseSet = true;
            
            console.error(`Errore spawn: ${error.message}`);
            return res.status(500).json({ error: 'Errore spawn Python', details: error.message });
        });
        
        // Invia i dati via stdin
        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();
        
        // Timeout
        const timeoutId = setTimeout(() => {
            if (responseSet) return; // Evita risposte multiple
            responseSet = true;
            
            pythonProcess.kill();
            res.status(500).json({ error: 'Timeout esecuzione Python' });
        }, 60000);
        
        // Cancella il timeout se il processo finisce prima
        pythonProcess.on('close', () => {
            clearTimeout(timeoutId);
        });
        
    } else {
        // Solo testo, usa spawn per consistenza
        console.log(`Eseguendo script Python con prompt: ${prompt}`);
        
        const pythonProcess = spawn(venvPython, [llmPath, prompt], {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        let errorOutput = '';
        let responseSet = false;
        
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            if (responseSet) return;
            responseSet = true;
            
            if (code !== 0) {
                console.error(`Errore esecuzione Python: ${errorOutput}`);
                return res.status(500).json({ error: 'Errore esecuzione Python', details: errorOutput });
            }
            
            console.log(`Output Python: ${output.trim()}`);
            res.json({ risposta: output.trim() });
        });
        
        pythonProcess.on('error', (error) => {
            if (responseSet) return;
            responseSet = true;
            
            console.error(`Errore spawn: ${error.message}`);
            return res.status(500).json({ error: 'Errore spawn Python', details: error.message });
        });
        
        // Timeout
        const timeoutId = setTimeout(() => {
            if (responseSet) return;
            responseSet = true;
            
            pythonProcess.kill();
            res.status(500).json({ error: 'Timeout esecuzione Python' });
        }, 60000);
        
        // Cancella il timeout se il processo finisce prima
        pythonProcess.on('close', () => {
            clearTimeout(timeoutId);
        });
    }
});

module.exports = router;
