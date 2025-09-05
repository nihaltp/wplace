window.onload = function() {
    const freeHexColors = ["#000000", "#3c3c3c", "#787878", "#d2d2d2", "#ffffff", "#600018", "#ed1c24", "#ff7f27", "#f6aa09", "#f9dd3b", "#fffabc", "#0eb968", "#13e67b", "#87ff5e", "#0c816e", "#10aea6", "#13e1be", "#60f7f2", "#28509e", "#4093e4", "#6b50f6", "#99b1fb", "#780c99", "#aa38b9", "#e09ff9", "#cb007a", "#ec1f80", "#f38da9", "#684634", "#95682a", "#f8b277"];
    const premiumHexColors = ["#aaaaaa", "#a50e1e", "#fa8072", "#e45c1a", "#9c8431", "#c5ad31", "#e8d45f", "#4a6b3a", "#5a944a", "#84c573", "#0f799f", "#bbfaf2", "#7dc7ff", "#4d31b8", "#4a4284", "#7a71c4", "#b5aef1", "#9b5249", "#d18078", "#fab6a4", "#dba463", "#7b6352", "#9c846b", "#cdc59e", "#333941", "#6d758d", "#b3b9d1"];

    const imageUpload = document.getElementById('imageUpload');
    const freeColorsContainer = document.getElementById('freeColors');
    const premiumColorsContainer = document.getElementById('premiumColors');
    const customColorsContainer = document.getElementById('customColors');
    const customColorInput = document.getElementById('customColorInput');
    const addCustomColorBtn = document.getElementById('addCustomColorBtn');
    const removeColorsBtn = document.getElementById('removeColorsBtn');
    const resetBtn = document.getElementById('resetBtn');
    const imageCanvas = document.getElementById('imageCanvas');
    const downloadLink = document.getElementById('downloadLink');
    const ctx = imageCanvas.getContext('2d');

    let originalImageData = null;
    let activeRgbKeys = new Set();
    let customHexColors = [];
    
    /**
     * Converts a color string (hex, rgb, or rgba) to a standardized color object.
     * @param {string} colorString - The color input from the user.
     * @returns {{rgb: number[], hex: string, key: string} | null} An object with color info or null.
     */
    function parseColorInput(colorString) {
        let rgb = [];
        let hex = '';
        let alpha = 255;

        // Check for RGB/RGBA format (e.g., "0,0,0" or "0,0,0,255")
        if (colorString.includes(',')) {
            const parts = colorString.split(',').map(p => parseInt(p.trim(), 10));
            if (parts.length >= 3 && parts.slice(0, 3).every(p => !isNaN(p) && p >= 0 && p <= 255)) {
                rgb = [parts[0], parts[1], parts[2]];
                if (parts.length === 4) {
                    alpha = parts[3];
                }
                hex = `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`;
            } else {
                return null;
            }
        } else {
            // Assume hex format
            const hexValue = colorString.startsWith('#') ? colorString.slice(1) : colorString;
            let finalHex = '';

            if (hexValue.length === 1) {
                finalHex = hexValue.repeat(6);
            } else if (hexValue.length === 2) {
                finalHex = hexValue.repeat(3);
            } else if (hexValue.length === 3) {
                finalHex = hexValue.charAt(0).repeat(2) + hexValue.charAt(1).repeat(2) + hexValue.charAt(2).repeat(2);
            } else if (hexValue.length === 6) {
                finalHex = hexValue;
            } else if (hexValue.length === 8) {
                finalHex = hexValue.substring(0, 6);
                alpha = parseInt(hexValue.substring(6, 8), 16);
            } else {
                return null;
            }
            
            rgb = [
                parseInt(finalHex.substring(0, 2), 16),
                parseInt(finalHex.substring(2, 4), 16),
                parseInt(finalHex.substring(4, 6), 16)
            ];
            hex = `#${finalHex}`;
        }
        return { rgb, hex, key: rgb.join(',') + ',' + alpha, alpha };
    }

    /**
     * Creates and appends a color swatch element to a container.
     * @param {string} hexColor - The hex color for the swatch.
     * @param {HTMLElement} container - The element to append the swatch to.
     * @param {boolean} isCustom - True if the swatch is for a custom color.
     */
    function createColorSwatch(hexColor, container, isCustom = false) {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = hexColor;

        const colorInfo = parseColorInput(hexColor);
        if (colorInfo) {
            const rgbKey = colorInfo.rgb.join(',');
            swatch.dataset.rgb = rgbKey;
            swatch.dataset.hex = colorInfo.hex;
            swatch.title = `Hex: ${colorInfo.hex.toUpperCase()}\nRGB: (${colorInfo.rgb.join(', ')})`;
        } else {
            console.error('Invalid color for swatch creation:', hexColor);
            return;
        }

        const toggleSwatch = () => {
            const rgbKey = swatch.dataset.rgb;
            if (activeRgbKeys.has(rgbKey)) {
                activeRgbKeys.delete(rgbKey);
                swatch.classList.remove('active');
            } else {
                activeRgbKeys.add(rgbKey);
                swatch.classList.add('active');
            }
            saveSelectedColors();
        };

        swatch.addEventListener('click', (event) => {
            if (!event.shiftKey) {
                toggleSwatch();
            }
        });

        swatch.addEventListener('mouseover', (event) => {
            if (event.shiftKey) {
                toggleSwatch();
            }
        });

        if (isCustom) {
            const removeBtn = document.createElement('span');
            removeBtn.className = 'remove-swatch';
            removeBtn.textContent = 'x';
            removeBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent the parent click event from firing
                const rgbKey = swatch.dataset.rgb;
                activeRgbKeys.delete(rgbKey);
                
                const index = customHexColors.indexOf(hexColor);
                if (index > -1) {
                    customHexColors.splice(index, 1);
                }
                
                swatch.remove();
                saveCustomColors();
                saveSelectedColors();
                processImage();
            });
            swatch.appendChild(removeBtn);
        }

        container.appendChild(swatch);
    }
    
    // --- Local Storage Management ---
    function saveSelectedColors() {
        localStorage.setItem('selectedColors', JSON.stringify(Array.from(activeRgbKeys)));
    }

    function loadSelectedColors() {
        const storedColors = localStorage.getItem('selectedColors');
        if (storedColors) {
            activeRgbKeys = new Set(JSON.parse(storedColors));
        }
    }

    function saveCustomColors() {
        localStorage.setItem('customColors', JSON.stringify(customHexColors));
    }

    function loadCustomColors() {
        const storedCustomColors = localStorage.getItem('customColors');
        if (storedCustomColors) {
            customHexColors = JSON.parse(storedCustomColors);
        }
    }

    // --- Core Logic ---
    function renderInitialPalettes() {
        freeHexColors.forEach(hex => createColorSwatch(hex, freeColorsContainer));
        premiumHexColors.forEach(hex => createColorSwatch(hex, premiumColorsContainer));
        customHexColors.forEach(hex => createColorSwatch(hex, customColorsContainer, true));

        // Apply saved active state after all swatches are created
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            if (activeRgbKeys.has(swatch.dataset.rgb)) {
                swatch.classList.add('active');
            }
        });
    }

    /**
     * Resets the canvas to the original uploaded image.
     */
    function resetImage() {
        if (!originalImageData) return;
        ctx.putImageData(originalImageData, 0, 0);
        downloadLink.href = imageCanvas.toDataURL('image/png');
    }

    /**
     * Handles the image upload process.
     * @param {Event} event - The file input change event.
     */
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Set canvas size to the image's dimensions
                imageCanvas.width = img.width;
                imageCanvas.height = img.height;
                
                // Draw the original image onto the canvas
                ctx.drawImage(img, 0, 0);

                // Store a copy of the original image data
                originalImageData = ctx.getImageData(0, 0, img.width, img.height);
                downloadLink.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Processes the image, making unselected colors transparent.
     */
    function processImage() {
        if (!originalImageData) return;

        const processedImageData = ctx.createImageData(originalImageData.width, originalImageData.height);
        const originalPixels = originalImageData.data;
        const newPixels = processedImageData.data;

        for (let i = 0; i < originalPixels.length; i += 4) {
            const r = originalPixels[i];
            const g = originalPixels[i + 1];
            const b = originalPixels[i + 2];
            const a = originalPixels[i + 3];

            const pixelKey = [r, g, b].join(',');

            if (a > 0 && activeRgbKeys.has(pixelKey)) {
                newPixels[i] = r;
                newPixels[i + 1] = g;
                newPixels[i + 2] = b;
                newPixels[i + 3] = a;
            } else {
                newPixels[i + 3] = 0;
            }
        }

        ctx.putImageData(processedImageData, 0, 0);
        downloadLink.href = imageCanvas.toDataURL('image/png');
    }
    
    // --- Add custom color logic function ---
    function handleAddCustomColor() {
        const colorInput = customColorInput.value;
        const colorInfo = parseColorInput(colorInput);

        if (colorInfo) {
            const rgbKey = colorInfo.rgb.join(',');
            if (!activeRgbKeys.has(rgbKey)) {
                activeRgbKeys.add(rgbKey);
            }
            
            if (!customHexColors.includes(colorInfo.hex)) {
                customHexColors.push(colorInfo.hex);
                createColorSwatch(colorInfo.hex, customColorsContainer, true);
                customColorsContainer.lastChild.classList.add('active');
                saveCustomColors();
            } else {
                // If color already exists, just activate it
                const existingSwatch = customColorsContainer.querySelector(`[data-rgb="${rgbKey}"]`);
                if (existingSwatch) {
                    existingSwatch.classList.add('active');
                }
            }

            saveSelectedColors();
            customColorInput.value = '';
        } else {
            console.error("Please enter a valid color code (e.g., #RRGGBB, #RGB, or 0,0,0).");
        }
    }

    // --- Event Listeners ---
    imageUpload.addEventListener('change', handleImageUpload);
    removeColorsBtn.addEventListener('click', processImage);
    resetBtn.addEventListener('click', resetImage);
    addCustomColorBtn.addEventListener('click', handleAddCustomColor);

    customColorInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddCustomColor();
        }
    });

    // --- Initialization ---
    loadCustomColors();
    loadSelectedColors();
    renderInitialPalettes();
};
