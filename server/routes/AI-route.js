const express = require('express');
const { exec } = require('child_process');

const router = express.Router();
const path = require('path');
const llmPath = path.resolve(__dirname, '../AI/llm.py');
const venvPython = path.resolve(__dirname, '../../venv/bin/python');

router.post('/llm', (req, res) => {
    const prompt = req.body.prompt;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt mancante' });
    }

    // Usa l'ambiente virtuale Python per eseguire lo script
    const command = `"${venvPython}" "${llmPath}" ${JSON.stringify(prompt)}`;
    
    exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Errore esecuzione: ${error.message}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: 'Errore esecuzione Python', details: stderr });
        }

        res.json({ risposta: stdout.trim() });
    });
});

module.exports = router;
