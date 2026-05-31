import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

const EXPORT_OPTIONS = {
  quality: 1,
  pixelRatio: 2, // retina quality
  cacheBust: true,
} as const;

/**
 * Preload every <img> and CSS background-image inside the node (the DigytaLab
 * watermark is rendered via background-image). In production the logo asset is
 * served behind a CDN and may not be decoded yet when html-to-image serializes
 * the node, so the watermark comes out blank. Awaiting the loads fixes that.
 */
async function preloadImages(node: HTMLElement): Promise<void> {
  const urls = new Set<string>();

  node.querySelectorAll('img').forEach((img) => {
    if (img.src) urls.add(img.src);
  });

  const elements = [node, ...Array.from(node.querySelectorAll<HTMLElement>('*'))];
  elements.forEach((el) => {
    const backgroundImage = window.getComputedStyle(el).backgroundImage;
    const match = backgroundImage?.match(/url\(["']?(.*?)["']?\)/);
    if (match?.[1] && !match[1].startsWith('data:')) {
      urls.add(match[1]);
    }
  });

  await Promise.all(
    Array.from(urls).map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        })
    )
  );
}

async function renderPng(node: HTMLElement): Promise<string> {
  await preloadImages(node);
  // html-to-image frequently misses images on the first pass because it inlines
  // resources lazily; a throwaway warm-up render populates that cache so the
  // second pass reliably includes the watermark.
  await toPng(node, EXPORT_OPTIONS);
  return toPng(node, EXPORT_OPTIONS);
}

export async function exportElementToPng(elementId: string, filename: string): Promise<string | null> {
  const node = document.getElementById(elementId);
  if (!node) return null;

  try {
    const dataUrl = await renderPng(node);
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
    return await renderPng(node);
  } catch (error) {
    console.error('Error getting image data:', error);
    return null;
  }
}
