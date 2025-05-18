/**
 * Priority calculation utilities for the Priority Tracker application
 */

/**
 * Calculate a priority score based on impact and urgency values
 * 
 * @param impact - Impact value (1-5)
 * @param urgency - Urgency value (1-5)
 * @returns Priority score (1-25)
 */
export function calculatePriority(impact: number, urgency: number): number {
  // Validate input ranges
  if (impact < 1 || impact > 5) {
    throw new Error('Impact must be between 1 and 5');
  }
  
  if (urgency < 1 || urgency > 5) {
    throw new Error('Urgency must be between 1 and 5');
  }
  
  // Calculate priority as impact * urgency
  return impact * urgency;
}

/**
 * Get a priority category based on the calculated priority score
 * 
 * @param priorityScore - The calculated priority score (1-25)
 * @returns Priority category ('Low', 'Medium', 'High', 'Critical')
 */
export function getPriorityCategory(priorityScore: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (priorityScore < 1 || priorityScore > 25) {
    throw new Error('Priority score must be between 1 and 25');
  }
  
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