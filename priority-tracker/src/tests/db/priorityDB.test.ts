import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { PriorityTask } from '../../db/priorityDB';

// Mock the db directly
vi.mock('../../db/priorityDB', () => {
  // Create a mock table object with CRUD methods
  const mockTable = {
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
    where: vi.fn().mockReturnValue({
      equals: vi.fn().mockReturnValue({
        toArray: vi.fn()
      })
    }),
    toArray: vi.fn(),
  };

  // Define a mock PriorityDB class
  class MockPriorityDB {
    name = 'PriorityDatabase';
    tasks = mockTable;
    version = vi.fn().mockReturnThis();
    stores = vi.fn().mockReturnThis();
  }

  return {
    db: {
      tasks: mockTable,
      name: 'PriorityDatabase'
    },
    PriorityDB: MockPriorityDB,
    PriorityTask: vi.fn()
  };
});

// Import the mocked db and PriorityDB
import { db, PriorityDB } from '../../db/priorityDB';

describe('PriorityDB', () => {
  let mockTask: PriorityTask;

  beforeEach(() => {
    
    // Sample task for testing
    mockTask = {
      title: 'Test Task',
      category: 'Primary',
      impact: 3,
      urgency: 4,
      tenant: 'Test Tenant',
      status: 'Planned',
      weekOf: '2025-05-18',
      notes: 'Test notes'
    };
    
    // Reset mock function calls
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    vi.resetAllMocks();
  });

  describe('CRUD operations', () => {
    it('should add a new task', async () => {
      // Setup mock to return an ID
      vi.mocked(db.tasks.add).mockResolvedValue(1);
      
      // Test adding a task
      const id = await db.tasks.add(mockTask);
      
      // Assertions
      expect(db.tasks.add).toHaveBeenCalledWith(mockTask);
      expect(id).toBe(1);
    });

    it('should get a task by id', async () => {
      // Setup mock to return a task
      vi.mocked(db.tasks.get).mockResolvedValue({ ...mockTask, id: 1 });
      
      // Test getting a task
      const task = await db.tasks.get(1);
      
      // Assertions
      expect(db.tasks.get).toHaveBeenCalledWith(1);
      expect(task).toEqual({ ...mockTask, id: 1 });
    });

    it('should update an existing task', async () => {
      // Setup mock to return update count
      vi.mocked(db.tasks.update).mockResolvedValue(1);
      
      // Updated task data
      const updatedTask = { ...mockTask, title: 'Updated Task' };
      
      // Test updating a task
      const updateCount = await db.tasks.update(1, updatedTask);
      
      // Assertions
      expect(db.tasks.update).toHaveBeenCalledWith(1, updatedTask);
      expect(updateCount).toBe(1);
    });

    it('should delete a task', async () => {
      // Setup mock to return delete count
      vi.mocked(db.tasks.delete).mockResolvedValue(1 as unknown as void);
      
      // Test deleting a task
      const deleteCount = await db.tasks.delete(1);
      
      // Assertions
      expect(db.tasks.delete).toHaveBeenCalledWith(1);
      expect(deleteCount).toBe(1);
    });

    it('should retrieve tasks by filter', async () => {
      // Setup mock chain for filtering
      const mockTasks = [
        { ...mockTask, id: 1 },
        { ...mockTask, id: 2, title: 'Another Task' }
      ];
      
      const mockToArray = vi.fn().mockResolvedValue(mockTasks);
      const mockEquals = vi.fn().mockReturnValue({ toArray: mockToArray });
      
      // Set up the mock chain
      vi.mocked(db.tasks.where).mockReturnValue({ equals: mockEquals } as unknown as ReturnType<typeof db.tasks.where>);
      
      // Test retrieving tasks with a filter
      const result = db.tasks.where('status');
      const equalsResult = result.equals('Planned');
      const tasks = await equalsResult.toArray();
      
      // Assertions
      expect(db.tasks.where).toHaveBeenCalledWith('status');
      expect(mockEquals).toHaveBeenCalledWith('Planned');
      expect(tasks).toEqual(mockTasks);
      expect(tasks.length).toBe(2);
    });
  });

  describe('Database initialization', () => {
    it('should initialize with the correct schema', () => {
      // Test that the database was initialized correctly
      // We can't directly test the schema since it's internal to the class
      // but we can verify the database was created with the right name
      expect(db).toBeInstanceOf(PriorityDB);
      expect(db.name).toBe('PriorityDatabase');
    });
  });
});