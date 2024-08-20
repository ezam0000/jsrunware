const statusElement = document.getElementById('status');
const costElement = document.getElementById('cost');
const resultElement = document.getElementById('result');

function updateStatus(message) {
    statusElement.textContent = message;
}

document.getElementById('imageForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    updateStatus('Processing...');

    let positivePrompt = document.getElementById('positivePrompt').value;
    const useEnhancer = document.getElementById('enhanceToggle').checked;

    if (useEnhancer) {
        try {
            updateStatus('Enhancing prompt...');
            const enhanceResponse = await fetch('/enhance-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: positivePrompt })
            });

            if (!enhanceResponse.ok) {
                throw new Error(`HTTP error! status: ${enhanceResponse.status}`);
            }

            const enhancedData = await enhanceResponse.json();
            positivePrompt = enhancedData.text || positivePrompt;
            updateStatus('Prompt enhanced, generating image...');
        } catch (error) {
            console.error('Error enhancing prompt:', error);
            updateStatus('Error enhancing prompt, proceeding with original prompt.');
        }
    }

    // Retrieve and format the LoRA input
    const loraInput = document.getElementById('lora').value.trim();
    const loraArray = loraInput ? [{ model: loraInput, weight: 1.0 }] : [];

    const formData = {
        positivePrompt,
        negativePrompt: document.getElementById('negativePrompt').value,
        width: parseInt(document.getElementById('width').value),
        height: parseInt(document.getElementById('height').value),
        model: document.getElementById('model').value,
        numberResults: parseInt(document.getElementById('numberResults').value),
        outputFormat: document.getElementById('outputFormat').value,
        scheduler: document.getElementById('scheduler').value,
        steps: parseInt(document.getElementById('steps').value),
        CFGScale: parseFloat(document.getElementById('CFGScale').value),
        seed: parseInt(document.getElementById('seed').value),
        lora: loraArray // Include LoRA as an array of objects
    };

    try {
        const response = await fetch('/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const images = await response.json();

        if (!images || images.length === 0) {
            throw new Error('No images received from the server');
        }

        updateStatus('Loading generated images...');
        let totalCost = 0;
        resultElement.innerHTML = ''; // Clear previous results
        images.forEach((image) => {
            const img = new Image();
            img.onload = () => {
                resultElement.appendChild(img);
            };
            img.onerror = () => {
                console.error('Failed to load image:', image.imageURL);
            };
            img.src = image.imageURL;
            totalCost += image.cost || 0;
        });

        updateStatus(`Successfully generated ${images.length} image(s)!`);
        costElement.textContent = `Total cost: ${totalCost.toFixed(4)}`;
    } catch (error) {
        console.error('Error:', error);
        updateStatus(`An error occurred: ${error.message}`);
    }
});
