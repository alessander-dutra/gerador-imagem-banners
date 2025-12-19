export enum ImageSize {
  SIZE_1K = "1K",
  SIZE_2K = "2K",
  SIZE_4K = "4K"
}

export enum AspectRatio {
  RATIO_1_1 = "1:1",
  RATIO_3_4 = "3:4",
  RATIO_4_3 = "4:3",
  RATIO_9_16 = "9:16",
  RATIO_16_9 = "16:9"
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: AspectRatio;
  size: ImageSize;
  timestamp: number;
  referenceImage?: string;
}

export interface GenerationConfig {
  productName: string;
  description: string;
  url: string;
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
}

// Augment window for the AI Studio helper
declare global {
  // We augment the AIStudio interface because window.aistudio is already declared with this type.
  // Re-declaring window.aistudio on Window would cause a conflict.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}