const express = require('express');
const { exec } = require('child_process');

const router = express.Router();
const path = require('path');
const llmPath = path.resolve(__dirname, '../AI/llm.py'); // Adatta il path se serve

router.post('/llm', (req, res) => {
    const prompt = req.body.prompt;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt mancante' });
    }

    exec(`python3 "${llmPath}" ${JSON.stringify(prompt)}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Errore esecuzione: ${error.message}`);
            return res.status(500).json({ error: 'Errore esecuzione Python' });
        }

        res.json({ risposta: stdout.trim() });
    });
});

module.exports = router;
