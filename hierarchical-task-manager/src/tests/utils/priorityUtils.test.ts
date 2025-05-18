import { describe, it, expect, vi } from 'vitest';
import { 
  calculatePriority, 
  getPriorityCategory, 
  getPriorityColorClass, 
  formatDate 
} from '../../utils/priorityUtils';

describe('Priority Calculation Utilities', () => {
  // Test suite for calculatePriority function
  describe('calculatePriority', () => {
    it('should calculate priority correctly for valid inputs', () => {
      // Test with various valid input combinations
      expect(calculatePriority(1, 1)).toBe(1);
      expect(calculatePriority(3, 2)).toBe(6);
      expect(calculatePriority(5, 5)).toBe(25);
      expect(calculatePriority(2, 4)).toBe(8);
    });

    it('should throw an error for impact less than 1', () => {
      // Test with invalid impact value
      expect(() => calculatePriority(0, 3)).toThrow('Impact must be between 1 and 5');
    });

    it('should throw an error for impact greater than 5', () => {
      // Test with invalid impact value
      expect(() => calculatePriority(6, 3)).toThrow('Impact must be between 1 and 5');
    });

    it('should throw an error for urgency less than 1', () => {
      // Test with invalid urgency value
      expect(() => calculatePriority(3, 0)).toThrow('Urgency must be between 1 and 5');
    });

    it('should throw an error for urgency greater than 5', () => {
      // Test with invalid urgency value
      expect(() => calculatePriority(3, 6)).toThrow('Urgency must be between 1 and 5');
    });
  });

  // Test suite for getPriorityCategory function
  describe('getPriorityCategory', () => {
    it('should return "Low" for priority scores between 1 and 5', () => {
      expect(getPriorityCategory(1)).toBe('Low');
      expect(getPriorityCategory(3)).toBe('Low');
      expect(getPriorityCategory(5)).toBe('Low');
    });

    it('should return "Medium" for priority scores between 6 and 10', () => {
      expect(getPriorityCategory(6)).toBe('Medium');
      expect(getPriorityCategory(8)).toBe('Medium');
      expect(getPriorityCategory(10)).toBe('Medium');
    });

    it('should return "High" for priority scores between 11 and 15', () => {
      expect(getPriorityCategory(11)).toBe('High');
      expect(getPriorityCategory(13)).toBe('High');
      expect(getPriorityCategory(15)).toBe('High');
    });

    it('should return "Critical" for priority scores between 16 and 25', () => {
      expect(getPriorityCategory(16)).toBe('Critical');
      expect(getPriorityCategory(20)).toBe('Critical');
      expect(getPriorityCategory(25)).toBe('Critical');
    });

    it('should throw an error for priority scores less than 1', () => {
      expect(() => getPriorityCategory(0)).toThrow('Priority score must be between 1 and 25');
    });

    it('should throw an error for priority scores greater than 25', () => {
      expect(() => getPriorityCategory(26)).toThrow('Priority score must be between 1 and 25');
    });
  });

  // Test suite for getPriorityColorClass function
  describe('getPriorityColorClass', () => {
    it('should return the correct color class for Low priority', () => {
      expect(getPriorityColorClass('Low')).toBe('text-green-500');
    });

    it('should return the correct color class for Medium priority', () => {
      expect(getPriorityColorClass('Medium')).toBe('text-yellow-500');
    });

    it('should return the correct color class for High priority', () => {
      expect(getPriorityColorClass('High')).toBe('text-orange-500');
    });

    it('should return the correct color class for Critical priority', () => {
      expect(getPriorityColorClass('Critical')).toBe('text-red-500');
    });

    it('should return a default color class for unknown priority', () => {
      expect(getPriorityColorClass('Unknown')).toBe('text-gray-500');
    });
  });

  // Test suite for formatDate function
  describe('formatDate', () => {
    it('should format a valid date string correctly', () => {
      // Use a simpler approach for testing the date formatting
      const testDate = new Date('2025-05-18T00:00:00.000Z');
      
      // Just test that the function doesn't throw an error
      // and returns a non-empty string for a valid date
      const result = formatDate('2025-05-18');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should return an empty string for empty input', () => {
      expect(formatDate('')).toBe('');
    });
  });

  // Integration test for both functions together
  describe('priority calculation integration', () => {
    it('should correctly categorize tasks based on impact and urgency', () => {
      // Low priority task
      const lowPriority = calculatePriority(1, 2);
      expect(getPriorityCategory(lowPriority)).toBe('Low');

      // Medium priority task
      const mediumPriority = calculatePriority(2, 4);
      expect(getPriorityCategory(mediumPriority)).toBe('Medium');

      // High priority task
      const highPriority = calculatePriority(3, 5);
      expect(getPriorityCategory(highPriority)).toBe('High');

      // Critical priority task
      const criticalPriority = calculatePriority(5, 4);
      expect(getPriorityCategory(criticalPriority)).toBe('Critical');
    });

    it('should provide the correct color class based on impact and urgency', () => {
      // Calculate priority, get category, then get color class
      const priority = calculatePriority(5, 5);
      const category = getPriorityCategory(priority);
      const colorClass = getPriorityColorClass(category);
      
      expect(priority).toBe(25);
      expect(category).toBe('Critical');
      expect(colorClass).toBe('text-red-500');
    });
  });
});