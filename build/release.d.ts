/** Exported memory */
export declare const memory: WebAssembly.Memory;
/**
 * assembly/index/applyGaussianBlur
 * @param data `~lib/typedarray/Uint8Array`
 * @param width `i32`
 * @param height `i32`
 * @param sigma `f32`
 * @returns `~lib/typedarray/Uint8Array`
 */
export declare function applyGaussianBlur(data: Uint8Array, width: number, height: number, sigma?: number): Uint8Array;
/**
 * assembly/index/applyErosion
 * @param data `~lib/typedarray/Uint8Array`
 * @param width `i32`
 * @param height `i32`
 * @param kernelSize `i32`
 * @returns `~lib/typedarray/Uint8Array`
 */
export declare function applyErosion(data: Uint8Array, width: number, height: number, kernelSize?: number): Uint8Array;
/**
 * assembly/index/applyDilation
 * @param data `~lib/typedarray/Uint8Array`
 * @param width `i32`
 * @param height `i32`
 * @param kernelSize `i32`
 * @returns `~lib/typedarray/Uint8Array`
 */
export declare function applyDilation(data: Uint8Array, width: number, height: number, kernelSize?: number): Uint8Array;
/**
 * assembly/index/applyMorphologicalOpening
 * @param data `~lib/typedarray/Uint8Array`
 * @param width `i32`
 * @param height `i32`
 * @param kernelSize `i32`
 * @returns `~lib/typedarray/Uint8Array`
 */
export declare function applyMorphologicalOpening(data: Uint8Array, width: number, height: number, kernelSize?: number): Uint8Array;
/**
 * assembly/index/applyThreshold
 * @param data `~lib/typedarray/Uint8Array`
 * @param width `i32`
 * @param height `i32`
 * @param threshold `u8`
 * @returns `~lib/typedarray/Uint8Array`
 */
export declare function applyThreshold(data: Uint8Array, width: number, height: number, threshold?: number): Uint8Array;
/**
 * assembly/index/postProcessMask
 * @param maskData `~lib/typedarray/Float32Array`
 * @param width `i32`
 * @param height `i32`
 * @returns `~lib/typedarray/Float32Array`
 */
export declare function postProcessMask(maskData: Float32Array, width: number, height: number): Float32Array;
/**
 * assembly/index/allocateUint8Array
 * @param length `i32`
 * @returns `usize`
 */
export declare function allocateUint8Array(length: number): number;
/**
 * assembly/index/allocateFloat32Array
 * @param length `i32`
 * @returns `usize`
 */
export declare function allocateFloat32Array(length: number): number;
/**
 * assembly/index/deallocate
 * @param ptr `usize`
 */
export declare function deallocate(ptr: number): void;
