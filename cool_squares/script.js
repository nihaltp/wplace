window.onload = function() {
    const sizeInput = document.getElementById('sizeInput');
    const coloredR = document.getElementById('coloredR');
    const coloredG = document.getElementById('coloredG');
    const coloredB = document.getElementById('coloredB');
    const coloredA = document.getElementById('coloredA');
    const transparentR = document.getElementById('transparentR');
    const transparentG = document.getElementById('transparentG');
    const transparentB = document.getElementById('transparentB');
    const transparentA = document.getElementById('transparentA');

    const canvas = document.getElementById('ringsCanvas');
    const ctx = canvas.getContext('2d');
    const downloadLink = document.getElementById('downloadLink');
    const pxCount = document.getElementsByClassName('pxCount');

    function drawRings() {
        // Read values from inputs and parse them as integers.
        // Use a default value if the input is empty or invalid (NaN).
        const size = parseInt(sizeInput.value) || 400;
        const coloredRGBA = [
            parseInt(coloredR.value) || 0,
            parseInt(coloredG.value) || 0,
            parseInt(coloredB.value) || 0,
            parseInt(coloredA.value) || 255
        ];
        const transparentRGBA = [
            parseInt(transparentR.value) || 0,
            parseInt(transparentG.value) || 0,
            parseInt(transparentB.value) || 0,
            parseInt(transparentA.value) || 0
        ];

        // Update canvas size based on user input
        canvas.width = size;
        canvas.height = size;

        // Create a new ImageData object. This is a 1D array of pixel data (RGBA)
        const imageData = ctx.createImageData(size, size);
        const pixels = imageData.data;

        // Loop through each pixel (x, y)
        let i = 0;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // Calculate the distance from the nearest edge
                const dist = Math.min(x, y, size - 1 - x, size - 1 - y);

                // Calculate the starting index for the current pixel in the 1D pixel array
                const index = (y * size + x) * 4;

                const color = (dist % 2 === 0) ? coloredRGBA : transparentRGBA;
                i += (dist % 2 === 0) ? 1 : 0;

                // Set pixel color using the chosen RGBA array
                pixels[index] = color[0];       // R: Red
                pixels[index + 1] = color[1];   // G: Green
                pixels[index + 2] = color[2];   // B: Blue
                pixels[index + 3] = color[3];   // A: Alpha
            }
        }
        pxCount[0].innerHTML = i + ' pixels';

        // Put the modified pixel data back onto the canvas to render the image
        ctx.putImageData(imageData, 0, 0);

        // Update the download link with the new canvas content
        downloadLink.href = canvas.toDataURL('image/png');
    }

    // Add input event listeners to all control elements to trigger a redraw
    sizeInput.addEventListener('input', drawRings);
    coloredR.addEventListener('input', drawRings);
    coloredG.addEventListener('input', drawRings);
    coloredB.addEventListener('input', drawRings);
    coloredA.addEventListener('input', drawRings);
    transparentR.addEventListener('input', drawRings);
    transparentG.addEventListener('input', drawRings);
    transparentB.addEventListener('input', drawRings);
    transparentA.addEventListener('input', drawRings);

    // Initial call to draw the first image when the page loads
    drawRings();
};
