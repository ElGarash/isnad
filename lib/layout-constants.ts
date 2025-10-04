// Common layout and styling constants
export const LAYOUT = {
  // Virtualized list heights
  HADITH_CARD_HEIGHT: 300,
  VIRTUALIZED_CONTAINER_HEIGHT: 800,

  // Overscan for virtualization
  VIRTUALIZATION_OVERSCAN: 5,

  // Common spacing
  HEADER_SPACING: "140px", // For hadith card text calculations

  // Container classes - responsive padding
  CONTAINER_CLASSES: "container mx-auto py-4 md:py-8",

  // Responsive padding utilities
  PADDING_X_RESPONSIVE: "px-2 md:px-4",
  PADDING_Y_RESPONSIVE: "py-4 md:py-8",

  // Responsive gaps
  GAP_SMALL_RESPONSIVE: "gap-2 md:gap-4",
  GAP_MEDIUM_RESPONSIVE: "gap-4 md:gap-6",
  GAP_LARGE_RESPONSIVE: "gap-6 md:gap-12",
} as const;
