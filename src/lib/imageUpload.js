/**
 * imageUpload.js
 * 
 * Utility functions for the image upload flow:
 *   1. getCroppedBlob    – Extracts a cropped region from an <img> element using Canvas
 *   2. compressToWebP    – Resizes + compresses a Blob to WebP via browser-image-compression
 *   3. uploadToR2        – PUT's a Blob directly to a Cloudflare R2 pre-signed URL
 */

import imageCompression from 'browser-image-compression';

// ─── 1. Crop ─────────────────────────────────────────────────────────────────

/**
 * Reads the pixel region defined by `cropPx` from an <img> element and returns
 * a Blob containing the cropped image (as PNG).
 *
 * @param {HTMLImageElement} image       – The source <img> element (must be loaded)
 * @param {{ x, y, width, height }} cropPx – Crop area in DISPLAY pixels
 * @returns {Promise<Blob>}
 */
export async function getCroppedBlob(image, cropPx) {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width  = Math.round(cropPx.width  * scaleX);
  canvas.height = Math.round(cropPx.height * scaleY);

  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    image,
    Math.round(cropPx.x * scaleX),
    Math.round(cropPx.y * scaleY),
    canvas.width,
    canvas.height,
    0, 0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob() returned null'));
      },
      'image/png',
    );
  });
}

// ─── 2. Compress → WebP ──────────────────────────────────────────────────────

/**
 * Compresses and resizes a Blob to WebP using browser-image-compression.
 *
 * @param {Blob}   blob
 * @param {number} maxWidthOrHeight  – Target max dimension in pixels (e.g. 512 for logo, 1080 for banner)
 * @param {number} maxSizeMB         – Maximum output file size in MB (default 0.5)
 * @returns {Promise<File>}          – Compressed WebP File object
 */
export async function compressToWebP(blob, maxWidthOrHeight, maxSizeMB = 0.5) {
  // browser-image-compression needs a File; give it one
  const file = new File([blob], 'image.png', { type: blob.type || 'image/png' });

  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.85,
  };

  return imageCompression(file, options);
}

// ─── 3. Upload to R2 ─────────────────────────────────────────────────────────

/**
 * Uploads a Blob directly to Cloudflare R2 using a pre-signed PUT URL.
 * No server proxy — the binary goes directly from browser to R2.
 *
 * @param {string}  presignedUrl  – URL returned by /uploads/presign/*
 * @param {Blob}    blob          – File/Blob to upload
 * @param {string}  contentType   – MIME type (e.g. 'image/webp', 'image/svg+xml')
 * @throws {Error} if the PUT request fails
 */
export async function uploadToR2(presignedUrl, blob, contentType) {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': contentType },
  });

  if (!response.ok) {
    throw new Error(`R2 upload failed: ${response.status} ${response.statusText}`);
  }
}
