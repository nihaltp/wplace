document.addEventListener('DOMContentLoaded', async () => {
    const toolsContainer = document.getElementById('tools-container');

    try {
        // Fetch the list of pages from pages.json
        const pagesResponse = await fetch('pages.json');
        if (!pagesResponse.ok) {
            throw new Error(`HTTP error! status: ${pagesResponse.status}`);
        }
        const pages = await pagesResponse.json();

        // Fetch the metadata for each tool from its respective folder
        const toolDataPromises = pages.map(async (toolName) => {
            const metaResponse = await fetch(`./${toolName}/meta.json`);
            if (!metaResponse.ok) {
                console.warn(`Could not find meta.json for tool: ${toolName}. Skipping.`);
                return null;
            }
            const toolMeta = await metaResponse.json();
            return {
                name: toolName,
                meta: toolMeta
            };
        });

        // Resolve all promises and filter out any failed fetches
        const toolData = (await Promise.all(toolDataPromises)).filter(Boolean);

        // Iterate through the fetched data and create a card for each tool
        toolData.forEach(tool => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.tool = tool.name;

            const imageContainer = document.createElement('div');
            imageContainer.className = 'card-image-container';

            const img = new Image();
            img.src = `./${tool.name}/${tool.meta.image}`;
            img.className = 'card-image';
            img.alt = tool.meta.title;

            // Check if the image loads successfully
            img.onload = () => {
                imageContainer.appendChild(img);
            };

            // If the image fails to load, do nothing, leaving the image container empty
            img.onerror = () => {
                console.warn(`Failed to load image for tool: ${tool.name}`);
            };
            
            card.appendChild(imageContainer);

            // Create the content container for title and description
            const content = document.createElement('div');
            content.className = 'card-content';

            const title = document.createElement('h3');
            title.className = 'card-title';
            title.textContent = tool.meta.title;

            const description = document.createElement('p');
            description.className = 'card-description';
            description.textContent = tool.meta.description;

            // Append elements to the card
            content.appendChild(title);
            content.appendChild(description);
            card.appendChild(content);

            // Add a click listener for navigation
            card.addEventListener('click', () => {
                window.location.href = `./${tool.name}/index.html`;
            });

            // Append the completed card to the container
            toolsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to load tool data:', error);
        toolsContainer.innerHTML = '<p class="text-red-500">Failed to load tools. Please check your data files.</p>';
    }
});
