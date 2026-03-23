import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker - this is essential for pdfjs-dist to work in a web environment
// We're using a CDN that matches the version in our package.json for simplicity in this dev environment
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * Generates a thumbnail image from the first page of a PDF file.
 * @param file The PDF File object
 * @returns A Promise resolving to a Data URL of the first page image
 */
export const generatePdfThumbnail = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Get the first page
    const page = await pdf.getPage(1);
    
    // Set up a scale for a decent quality thumbnail
    const viewport = page.getViewport({ scale: 1.5 });
    
    // Prepare canvas for rendering
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Render PDF page into canvas context
    const renderContext: any = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };
    
    await page.render(renderContext).promise;
    
    // Convert canvas to Data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    // Cleanup
    canvas.remove();
    
    return dataUrl;
  } catch (error) {
    console.error('[pdf-utils] Error generating PDF thumbnail:', error);
    throw error;
  }
};
