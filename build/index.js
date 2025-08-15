
import { instantiate } from '@assemblyscript/loader/umd';

let wasmModule = null;

async function initImageProcessor() {
  if (wasmModule) return wasmModule;
  
  const wasmPath = new URL('../build/release.wasm', import.meta.url);
  const response = await fetch(wasmPath);
  const wasmBytes = await response.arrayBuffer();
  
  wasmModule = await instantiate(wasmBytes, {
    // Import object if needed
  });
  
  return wasmModule;
}

class ImageProcessorAS {
  constructor(module) {
    this.module = module;
  }

  static async create() {
    const module = await initImageProcessor();
    return new ImageProcessorAS(module);
  }

  applyGaussianBlur(data, width, height, sigma = 2.0) {
    const inputPtr = this.module.__newArray(this.module.__Uint8Array_ID, data);
    const resultPtr = this.module.exports.applyGaussianBlur(inputPtr, width, height, sigma);
    const result = this.module.__getArray(resultPtr);
    this.module.__release(inputPtr);
    this.module.__release(resultPtr);
    return result;
  }

  applyErosion(data, width, height, kernelSize = 3) {
    const inputPtr = this.module.__newArray(this.module.__Uint8Array_ID, data);
    const resultPtr = this.module.exports.applyErosion(inputPtr, width, height, kernelSize);
    const result = this.module.__getArray(resultPtr);
    this.module.__release(inputPtr);
    this.module.__release(resultPtr);
    return result;
  }

  applyDilation(data, width, height, kernelSize = 3) {
    const inputPtr = this.module.__newArray(this.module.__Uint8Array_ID, data);
    const resultPtr = this.module.exports.applyDilation(inputPtr, width, height, kernelSize);
    const result = this.module.__getArray(resultPtr);
    this.module.__release(inputPtr);
    this.module.__release(resultPtr);
    return result;
  }

  applyMorphologicalOpening(data, width, height, kernelSize = 3) {
    const inputPtr = this.module.__newArray(this.module.__Uint8Array_ID, data);
    const resultPtr = this.module.exports.applyMorphologicalOpening(inputPtr, width, height, kernelSize);
    const result = this.module.__getArray(resultPtr);
    this.module.__release(inputPtr);
    this.module.__release(resultPtr);
    return result;
  }

  applyThreshold(data, width, height, threshold = 127) {
    const inputPtr = this.module.__newArray(this.module.__Uint8Array_ID, data);
    const resultPtr = this.module.exports.applyThreshold(inputPtr, width, height, threshold);
    const result = this.module.__getArray(resultPtr);
    this.module.__release(inputPtr);
    this.module.__release(resultPtr);
    return result;
  }

  postProcessMask(maskData, width, height) {
    const inputPtr = this.module.__newArray(this.module.__Float32Array_ID, maskData);
    const resultPtr = this.module.exports.postProcessMask(inputPtr, width, height);
    const result = this.module.__getArray(resultPtr);
    this.module.__release(inputPtr);
    this.module.__release(resultPtr);
    return result;
  }
}

// High-level PostProcessorOptimized class that matches the interface expected by RembgTS
let processorInstance = null;

async function getProcessor() {
  if (!processorInstance) {
    processorInstance = await ImageProcessorAS.create();
  }
  return processorInstance;
}

export class PostProcessorOptimized {
  /**
   * Apply Gaussian blur to an image using AssemblyScript
   */
  static async applyGaussianBlur(data, width, height, sigma = 2) {
    const processor = await getProcessor();
    return processor.applyGaussianBlur(data, width, height, sigma);
  }

  /**
   * Apply morphological opening operation using AssemblyScript
   */
  static async applyMorphologicalOpening(data, width, height, kernelSize = 3) {
    const processor = await getProcessor();
    return processor.applyMorphologicalOpening(data, width, height, kernelSize);
  }

  /**
   * Apply erosion using AssemblyScript
   */
  static async applyErosion(data, width, height, kernelSize = 3) {
    const processor = await getProcessor();
    return processor.applyErosion(data, width, height, kernelSize);
  }

  /**
   * Apply dilation using AssemblyScript
   */
  static async applyDilation(data, width, height, kernelSize = 3) {
    const processor = await getProcessor();
    return processor.applyDilation(data, width, height, kernelSize);
  }

  /**
   * Apply threshold using AssemblyScript
   */
  static async applyThreshold(data, width, height, threshold = 127) {
    const processor = await getProcessor();
    return processor.applyThreshold(data, width, height, threshold);
  }

  /**
   * Post-process mask using optimized AssemblyScript implementation
   * This is the main function that will replace the slow JavaScript version
   */
  static async postProcessMask(maskData, width, height) {
    const processor = await getProcessor();
    return processor.postProcessMask(maskData, width, height);
  }

  /**
   * Concatenate images vertically (remains in JavaScript using Canvas API)
   */
  static concatenateVertical(images) {
    if (images.length === 0) {
      throw new Error("No images to concatenate");
    }

    if (images.length === 1) {
      return images[0];
    }

    const totalHeight = images.reduce((sum, img) => sum + img.height, 0);
    const maxWidth = Math.max(...images.map((img) => img.width));

    const canvas = document.createElement("canvas");
    canvas.width = maxWidth;
    canvas.height = totalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    let currentY = 0;
    for (const image of images) {
      ctx.drawImage(image, 0, currentY);
      currentY += image.height;
    }

    return canvas;
  }

  /**
   * Apply background color to image with alpha (remains in JavaScript using Canvas API)
   */
  static applyBackgroundColor(canvas, backgroundColor = [255, 255, 255, 255]) {
    const result = document.createElement("canvas");
    result.width = canvas.width;
    result.height = canvas.height;

    const ctx = result.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Fill background
    const [r, g, b, a] = backgroundColor;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    ctx.fillRect(0, 0, result.width, result.height);

    // Draw original image on top
    ctx.drawImage(canvas, 0, 0);

    return result;
  }
}

// Export both for flexibility
export { ImageProcessorAS, initImageProcessor };
export default PostProcessorOptimized;
