import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

export async function exportElementToPng(elementId: string, filename: string): Promise<string | null> {
  const node = document.getElementById(elementId);
  if (!node) return null;

  try {
    const dataUrl = await toPng(node, { 
      quality: 1, 
      pixelRatio: 2, // retina quality
    });
    saveAs(dataUrl, `${filename}.png`);
    return dataUrl;
  } catch (error) {
    console.error('Error exporting image:', error);
    return null;
  }
}

export async function getElementPngDataUrl(elementId: string): Promise<string | null> {
  const node = document.getElementById(elementId);
  if (!node) return null;

  try {
    return await toPng(node, { quality: 1, pixelRatio: 2 });
  } catch (error) {
    console.error('Error getting image data:', error);
    return null;
  }
}
