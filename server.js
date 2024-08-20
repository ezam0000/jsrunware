require('dotenv').config();
const express = require('express');
const path = require('path');
const { RunwareServer } = require('@runware/sdk-js');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const runware = new RunwareServer({ apiKey: process.env.RUNWARE_API_KEY });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generate-image', async (req, res) => {
  try {
    const {
      positivePrompt,
      negativePrompt,
      width,
      height,
      model,
      numberResults,
      outputFormat,
      scheduler,
      steps,
      CFGScale,
      seed
    } = req.body;

    const images = await runware.requestImages({
      positivePrompt,
      negativePrompt,
      width: parseInt(width),
      height: parseInt(height),
      model,
      numberResults: parseInt(numberResults) || 1,
      outputType: "URL", // Assuming you want URLs, change if needed
      outputFormat,
      scheduler,
      steps: parseInt(steps),
      CFGScale: parseFloat(CFGScale),
      seed: parseInt(seed),
      checkNSFW: true,
      includeCost: true
    });

    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while generating the image' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
