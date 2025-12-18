// Shared pixel configuration for the pixel canvas
export const CANVAS_SIZE = 500; // logical pixels
export const PIXEL_SIZE = 2;   // screen pixels per logical pixel (adjustable)

export const BASE_DISPLAY_SIZE = CANVAS_SIZE * PIXEL_SIZE;

export default {
  CANVAS_SIZE,
  PIXEL_SIZE,
  BASE_DISPLAY_SIZE
};
