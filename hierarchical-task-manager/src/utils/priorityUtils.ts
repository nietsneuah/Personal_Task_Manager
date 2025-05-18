/**
 * Calculate the priority score based on impact and urgency
 * @param impact - Impact value (1-5)
 * @param urgency - Urgency value (1-5)
 * @returns Priority score (1-25)
 */
export function calculatePriority(impact: number, urgency: number): number {
  // Validate impact
  if (impact < 1 || impact > 5) {
    throw new Error('Impact must be between 1 and 5');
  }
  
  // Validate urgency
  if (urgency < 1 || urgency > 5) {
    throw new Error('Urgency must be between 1 and 5');
  }
  
  // Calculate priority as impact * urgency
  return impact * urgency;
}

/**
 * Get the priority category based on the priority score
 * @param priorityScore - Priority score (1-25)
 * @returns Priority category (Low, Medium, High, Critical)
 */
export function getPriorityCategory(priorityScore: number): string {
  // Validate priority score
  if (priorityScore < 1 || priorityScore > 25) {
    throw new Error('Priority score must be between 1 and 25');
  }
  
  // Determine category based on score
  if (priorityScore <= 5) {
    return 'Low';
  } else if (priorityScore <= 10) {
    return 'Medium';
  } else if (priorityScore <= 15) {
    return 'High';
  } else {
    return 'Critical';
  }
}

/**
 * Get the CSS color class based on priority category
 * @param category - Priority category (Low, Medium, High, Critical)
 * @returns Tailwind CSS color class
 */
export function getPriorityColorClass(category: string): string {
  switch (category) {
    case 'Low':
      return 'text-green-500';
    case 'Medium':
      return 'text-yellow-500';
    case 'High':
      return 'text-orange-500';
    case 'Critical':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

/**
 * Format a date string as a human-readable date
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "May 18, 2025")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}