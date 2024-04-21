export async function Downloader(
    downloadUrl: string,
    fileName: string
) {
    try {
        const response = await fetch(`/api/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: downloadUrl,
                fileName: fileName
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const blob = await response.blob();

        // Create a temporary URL for the blob
        const blobUrl = URL.createObjectURL(blob);

        // Create a link element and set its attributes
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;

        // Append the link to the document body and trigger a click event
        document.body.appendChild(link);
        link.click();

        // Clean up by removing the link and revoking the blob URL
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);

        console.log(`Download successful`);
    } catch (error) {
        console.error('Error downloading file:', error);
    }
}
