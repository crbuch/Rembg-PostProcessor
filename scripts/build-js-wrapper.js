const fs = require('fs');
const path = require('path');

// Generate JavaScript wrapper for the WASM module
const jsWrapper = `
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
    ctx.fillStyle = \`rgba(\${r}, \${g}, \${b}, \${a / 255})\`;
    ctx.fillRect(0, 0, result.width, result.height);

    // Draw original image on top
    ctx.drawImage(canvas, 0, 0);

    return result;
  }
}

// Export both for flexibility
export { ImageProcessorAS, initImageProcessor };
export default PostProcessorOptimized;
`;

// Write the JavaScript wrapper
const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

fs.writeFileSync(path.join(buildDir, 'index.js'), jsWrapper);

// Generate TypeScript definitions
const tsDefinitions = `
export declare function initImageProcessor(): Promise<any>;

export declare class ImageProcessorAS {
  constructor(module: any);
  static create(): Promise<ImageProcessorAS>;
  
  applyGaussianBlur(data: Uint8Array, width: number, height: number, sigma?: number): Uint8Array;
  applyErosion(data: Uint8Array, width: number, height: number, kernelSize?: number): Uint8Array;
  applyDilation(data: Uint8Array, width: number, height: number, kernelSize?: number): Uint8Array;
  applyMorphologicalOpening(data: Uint8Array, width: number, height: number, kernelSize?: number): Uint8Array;
  applyThreshold(data: Uint8Array, width: number, height: number, threshold?: number): Uint8Array;
  postProcessMask(maskData: Float32Array, width: number, height: number): Float32Array;
}

export declare class PostProcessorOptimized {
  static applyGaussianBlur(data: Uint8Array, width: number, height: number, sigma?: number): Promise<Uint8Array>;
  static applyErosion(data: Uint8Array, width: number, height: number, kernelSize?: number): Promise<Uint8Array>;
  static applyDilation(data: Uint8Array, width: number, height: number, kernelSize?: number): Promise<Uint8Array>;
  static applyMorphologicalOpening(data: Uint8Array, width: number, height: number, kernelSize?: number): Promise<Uint8Array>;
  static applyThreshold(data: Uint8Array, width: number, height: number, threshold?: number): Promise<Uint8Array>;
  static postProcessMask(maskData: Float32Array, width: number, height: number): Promise<Float32Array>;
  static concatenateVertical(images: HTMLCanvasElement[]): HTMLCanvasElement;
  static applyBackgroundColor(canvas: HTMLCanvasElement, backgroundColor?: [number, number, number, number]): HTMLCanvasElement;
}

export default PostProcessorOptimized;
`;

fs.writeFileSync(path.join(buildDir, 'index.d.ts'), tsDefinitions);

console.log('JavaScript wrapper and TypeScript definitions generated successfully!');
