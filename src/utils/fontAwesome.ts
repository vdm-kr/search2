/**
 * Font Awesome Icon Helper
 * 
 * Use this utility to render Font Awesome icons consistently throughout the app.
 * 
 * Example usage:
 * <FontAwesome icon="fas fa-check" />
 * <FontAwesome icon="far fa-circle" />
 * <FontAwesome icon="fal fa-arrow-left" />
 */

interface FontAwesomeProps {
  icon: string; // e.g., "fas fa-check", "far fa-circle", "fal fa-arrow-left"
  className?: string;
}

export const FontAwesome = ({ icon, className = '' }: FontAwesomeProps) => {
  return <i className={`${icon} ${className}`}></i>;
};

/**
 * Common Font Awesome icons used in the app
 * These match the icons used in the Figma design
 */
export const FontAwesomeIcons = {
  // Check icons
  check: 'fas fa-check',
  checkSquare: 'fas fa-square-check',
  
  // Arrow icons
  chevronRight: 'fas fa-chevron-right',
  chevronLeft: 'fas fa-chevron-left',
  arrowLeft: 'fas fa-arrow-left',
  
  // UI icons
  close: 'fas fa-times',
  search: 'fas fa-search',
  globe: 'fas fa-globe',
  chevronDown: 'fas fa-chevron-down',
  
  // Star icon for popular badge
  star: 'fas fa-star',
} as const;

