
export const hexToRgba = (hex: string, alpha: number): string => {
  let r = 0, g = 0, b = 0;

  if (hex.length === 4) { // #RGB format
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) { // #RRGGBB format
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  } else {
    // Fallback for invalid hex - can be improved
    console.warn("Invalid hex color format:", hex);
    return `rgba(0, 0, 0, ${alpha})`; 
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
    