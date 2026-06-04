export type ImageValidationInput = {
  uri: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
};

export type ImageValidationResult =
  | { valid: true }
  | { valid: false; reason: 'format' | 'size' | 'corrupt'; message: string };
