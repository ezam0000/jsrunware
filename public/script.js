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

    const formData = {
        positivePrompt,
        negativePrompt: document.getElementById('negativePrompt').value,
        width: document.getElementById('width').value,
        height: document.getElementById('height').value,
        model: document.getElementById('model').value,
        numberResults: document.getElementById('numberResults').value
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
