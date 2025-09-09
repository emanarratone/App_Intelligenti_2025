const express = require('express');
const { exec } = require('child_process');

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

    // Prepara i parametri per lo script Python
    let command;
    if (imageData) {
        // Se c'è un'immagine, passa sia il prompt che l'immagine
        const tempImageData = Buffer.from(imageData.split(',')[1], 'base64').toString('base64');
        command = `"${venvPython}" "${llmPath}" ${JSON.stringify(prompt || "")} --image ${JSON.stringify(tempImageData)}`;
    } else {
        // Solo testo
        command = `"${venvPython}" "${llmPath}" ${JSON.stringify(prompt)}`;
    }
    
    exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Errore esecuzione: ${error.message}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: 'Errore esecuzione Python', details: stderr });
        }

        res.json({ risposta: stdout.trim() });
    });
});

module.exports = router;
