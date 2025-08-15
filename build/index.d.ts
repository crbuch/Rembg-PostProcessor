
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
