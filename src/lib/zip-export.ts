import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getElementPngDataUrl } from './image-export';

export async function exportElementsToZip(elementIds: string[], baseFilename: string): Promise<boolean> {
  const zip = new JSZip();
  let successCount = 0;

  for (let i = 0; i < elementIds.length; i++) {
    const dataUrl = await getElementPngDataUrl(elementIds[i]);
    if (dataUrl) {
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      zip.file(`${baseFilename}_slide_${i + 1}.png`, base64Data, { base64: true });
      successCount++;
    }
  }

  if (successCount > 0) {
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${baseFilename}.zip`);
    return true;
  }
  
  return false;
}
