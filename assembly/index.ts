/**
 * AssemblyScript implementation of image processing functions
 * Optimized for performance-critical operations
 */

/**
 * Apply Gaussian blur to image data
 * @param data - Input image data (RGBA format)
 * @param width - Image width
 * @param height - Image height
 * @param sigma - Gaussian kernel standard deviation
 * @returns Blurred image data
 */
export function applyGaussianBlur(
  data: Uint8Array,
  width: i32,
  height: i32,
  sigma: f32 = 2.0
): Uint8Array {
  const result = new Uint8Array(data.length);
  const kernel = createGaussianKernel(sigma);
  const kernelSize = kernel.length;
  const halfKernel = kernelSize >> 1; // Bit shift for division by 2

  for (let y: i32 = 0; y < height; y++) {
    for (let x: i32 = 0; x < width; x++) {
      const idx = ((y * width) + x) << 2; // Bit shift for * 4

      let r: f32 = 0.0, g: f32 = 0.0, b: f32 = 0.0, a: f32 = 0.0;
      let weightSum: f32 = 0.0;

      for (let ky: i32 = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx: i32 = -halfKernel; kx <= halfKernel; kx++) {
          const py = Math.max(0, Math.min(height - 1, y + ky)) as i32;
          const px = Math.max(0, Math.min(width - 1, x + kx)) as i32;
          const pidx = ((py * width) + px) << 2;

          const weight = kernel[ky + halfKernel] * kernel[kx + halfKernel];
          weightSum += weight;

          r += (data[pidx] as f32) * weight;
          g += (data[pidx + 1] as f32) * weight;
          b += (data[pidx + 2] as f32) * weight;
          a += (data[pidx + 3] as f32) * weight;
        }
      }

      result[idx] = Math.round(r / weightSum) as u8;
      result[idx + 1] = Math.round(g / weightSum) as u8;
      result[idx + 2] = Math.round(b / weightSum) as u8;
      result[idx + 3] = Math.round(a / weightSum) as u8;
    }
  }

  return result;
}

/**
 * Apply erosion morphological operation
 * @param data - Input image data (RGBA format)
 * @param width - Image width
 * @param height - Image height
 * @param kernelSize - Erosion kernel size
 * @returns Eroded image data
 */
export function applyErosion(
  data: Uint8Array,
  width: i32,
  height: i32,
  kernelSize: i32 = 3
): Uint8Array {
  const result = new Uint8Array(data.length);
  const halfKernel = kernelSize >> 1;

  for (let y: i32 = 0; y < height; y++) {
    for (let x: i32 = 0; x < width; x++) {
      const idx = ((y * width) + x) << 2;

      let minR: u8 = 255, minG: u8 = 255, minB: u8 = 255, minA: u8 = 255;

      for (let ky: i32 = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx: i32 = -halfKernel; kx <= halfKernel; kx++) {
          const py = y + ky;
          const px = x + kx;

          if (py >= 0 && py < height && px >= 0 && px < width) {
            const pidx = ((py * width) + px) << 2;
            minR = Math.min(minR, data[pidx]) as u8;
            minG = Math.min(minG, data[pidx + 1]) as u8;
            minB = Math.min(minB, data[pidx + 2]) as u8;
            minA = Math.min(minA, data[pidx + 3]) as u8;
          }
        }
      }

      result[idx] = minR;
      result[idx + 1] = minG;
      result[idx + 2] = minB;
      result[idx + 3] = minA;
    }
  }

  return result;
}

/**
 * Apply dilation morphological operation
 * @param data - Input image data (RGBA format)
 * @param width - Image width
 * @param height - Image height
 * @param kernelSize - Dilation kernel size
 * @returns Dilated image data
 */
export function applyDilation(
  data: Uint8Array,
  width: i32,
  height: i32,
  kernelSize: i32 = 3
): Uint8Array {
  const result = new Uint8Array(data.length);
  const halfKernel = kernelSize >> 1;

  for (let y: i32 = 0; y < height; y++) {
    for (let x: i32 = 0; x < width; x++) {
      const idx = ((y * width) + x) << 2;

      let maxR: u8 = 0, maxG: u8 = 0, maxB: u8 = 0, maxA: u8 = 0;

      for (let ky: i32 = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx: i32 = -halfKernel; kx <= halfKernel; kx++) {
          const py = y + ky;
          const px = x + kx;

          if (py >= 0 && py < height && px >= 0 && px < width) {
            const pidx = ((py * width) + px) << 2;
            maxR = Math.max(maxR, data[pidx]) as u8;
            maxG = Math.max(maxG, data[pidx + 1]) as u8;
            maxB = Math.max(maxB, data[pidx + 2]) as u8;
            maxA = Math.max(maxA, data[pidx + 3]) as u8;
          }
        }
      }

      result[idx] = maxR;
      result[idx + 1] = maxG;
      result[idx + 2] = maxB;
      result[idx + 3] = maxA;
    }
  }

  return result;
}

/**
 * Apply morphological opening (erosion followed by dilation)
 * @param data - Input image data (RGBA format)
 * @param width - Image width
 * @param height - Image height
 * @param kernelSize - Kernel size for both operations
 * @returns Opened image data
 */
export function applyMorphologicalOpening(
  data: Uint8Array,
  width: i32,
  height: i32,
  kernelSize: i32 = 3
): Uint8Array {
  const eroded = applyErosion(data, width, height, kernelSize);
  return applyDilation(eroded, width, height, kernelSize);
}

/**
 * Apply threshold to create binary mask
 * @param data - Input image data (RGBA format)
 * @param width - Image width (unused but kept for API compatibility)
 * @param height - Image height (unused but kept for API compatibility)
 * @param threshold - Threshold value (0-255)
 * @returns Thresholded image data
 */
export function applyThreshold(
  data: Uint8Array,
  width: i32,
  height: i32,
  threshold: u8 = 127
): Uint8Array {
  const result = new Uint8Array(data.length);

  for (let i: i32 = 0; i < data.length; i += 4) {
    // Convert to grayscale using standard luminance weights
    const gray = Math.round(
      0.299 * (data[i] as f32) + 
      0.587 * (data[i + 1] as f32) + 
      0.114 * (data[i + 2] as f32)
    ) as u8;
    
    const value = gray < threshold ? 0 : 255;

    result[i] = value;     // R
    result[i + 1] = value; // G
    result[i + 2] = value; // B
    result[i + 3] = 255;   // A
  }

  return result;
}

/**
 * Complete post-processing pipeline for masks
 * Combines morphological opening, Gaussian blur, and thresholding
 * @param maskData - Input mask data as Float32Array
 * @param width - Image width
 * @param height - Image height
 * @returns Post-processed mask data as Float32Array
 */
export function postProcessMask(
  maskData: Float32Array,
  width: i32,
  height: i32
): Float32Array {
  // Convert float mask to RGBA for processing
  const rgbaData = new Uint8Array(width * height * 4);
  for (let i: i32 = 0; i < maskData.length; i++) {
    const value = Math.max(0, Math.min(255, Math.round(maskData[i] * 255.0))) as u8;
    const idx = i << 2; // i * 4
    rgbaData[idx] = value;     // R
    rgbaData[idx + 1] = value; // G
    rgbaData[idx + 2] = value; // B
    rgbaData[idx + 3] = 255;   // A
  }

  // Apply morphological opening (erosion followed by dilation)
  const opened = applyMorphologicalOpening(rgbaData, width, height, 3);

  // Apply Gaussian blur
  const blurred = applyGaussianBlur(opened, width, height, 2.0);

  // Apply threshold
  const thresholded = applyThreshold(blurred, width, height, 127);

  // Convert back to float mask
  const result = new Float32Array(width * height);
  for (let i: i32 = 0; i < result.length; i++) {
    result[i] = (thresholded[i << 2] as f32) / 255.0; // Use red channel
  }

  return result;
}

/**
 * Create Gaussian kernel for blur operation
 * @param sigma - Standard deviation
 * @returns Normalized Gaussian kernel
 */
function createGaussianKernel(sigma: f32): Float32Array {
  const size = (Math.ceil(sigma * 3.0) * 2 + 1) as i32;
  const kernel = new Float32Array(size);
  const center = size >> 1; // size / 2
  let sum: f32 = 0.0;

  for (let i: i32 = 0; i < size; i++) {
    const x = (i - center) as f32;
    const value = Math.exp(-(x * x) / (2.0 * sigma * sigma)) as f32;
    kernel[i] = value;
    sum += value;
  }

  // Normalize kernel
  for (let i: i32 = 0; i < size; i++) {
    kernel[i] /= sum;
  }

  return kernel;
}

/**
 * Memory management functions for external access
 */

export function allocateUint8Array(length: i32): usize {
  return heap.alloc(length);
}

export function allocateFloat32Array(length: i32): usize {
  return heap.alloc(length << 2); // length * 4 bytes
}

export function deallocate(ptr: usize): void {
  heap.free(ptr);
}
