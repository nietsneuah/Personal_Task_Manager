import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { db as dbInstance } from '../../db/TaskDatabase';
import type { Category, Division, Tenant, Project, Task } from '../../db/TaskDatabase';

// Get the constructor of the db instance for testing
const TaskDatabase = Object.getPrototypeOf(dbInstance).constructor;

// Mock Dexie
vi.mock('dexie', () => {
  // Create a mock table object with CRUD methods
  const mockTable = {
    add: vi.fn(),
    bulkAdd: vi.fn().mockReturnValue([1, 2, 3]),
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

  // Define interface for mock Dexie instance
  interface MockDexieInstance {
    name: string;
    version: ReturnType<typeof vi.fn>;
    stores: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    table: ReturnType<typeof vi.fn>;
    categories: typeof mockTable;
    divisions: typeof mockTable;
    tenants: typeof mockTable;
    projects: typeof mockTable;
    tasks: typeof mockTable;
  }

  // Create a mock implementation of Dexie
  const mockDexie = vi.fn().mockImplementation(function(this: MockDexieInstance, name: string) {
    // Set the database name
    this.name = name;
    
    // Mock the version method
    this.version = vi.fn().mockReturnThis();
    
    // Mock the stores method
    this.stores = vi.fn().mockReturnThis();
    
    // Mock the on method
    this.on = vi.fn();
    
    // Add the tables to the instance
    this.categories = mockTable;
    this.divisions = mockTable;
    this.tenants = mockTable;
    this.projects = mockTable;
    this.tasks = mockTable;
    
    // Mock the table method
    this.table = vi.fn().mockReturnValue(mockTable);
  });

  // Add the Table type to maintain TypeScript compatibility
  const Table = class {};
  
  return {
    __esModule: true,
    default: mockDexie,
    Table
  };
});

describe('TaskDatabase', () => {
  let testDb: InstanceType<typeof TaskDatabase>;

  beforeEach(() => {
    // Create a new instance of the database before each test
    testDb = new TaskDatabase();
    
    // Reset mock function calls
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    vi.resetAllMocks();
  });

  describe('Database initialization', () => {
    it('should initialize with the correct name', () => {
      expect(testDb).toBeInstanceOf(TaskDatabase);
      expect((testDb as any).name).toBe('HierarchicalTaskDatabase');
    });

    it('should set up the correct schema', () => {
      // Access the mocked methods through the prototype
      expect((testDb as any).version).toHaveBeenCalled();
      expect((testDb as any).stores).toHaveBeenCalledWith({
        categories: '++id, name',
        divisions: '++id, categoryId, name',
        tenants: '++id, name',
        projects: '++id, divisionId, tenantId, status, dueDate',
        tasks: '++id, projectId, status, weekOf, impact, urgency'
      });
    });

    it('should register a populate event handler', () => {
      expect((testDb as any).on).toHaveBeenCalledWith('populate', expect.any(Function));
    });
  });

  describe('populateDefaultData', () => {
    it('should add default categories', async () => {
      // Setup mock to return IDs
      vi.mocked(testDb.categories.add).mockResolvedValueOnce(1).mockResolvedValueOnce(2);
      
      await testDb.populateDefaultData();
      
      expect(testDb.categories.add).toHaveBeenCalledTimes(2);
      expect(testDb.categories.add).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Personal',
        description: 'Personal tasks and projects'
      }));
      expect(testDb.categories.add).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Business',
        description: 'Business-related tasks and projects'
      }));
    });

    it('should add default divisions', async () => {
      // Setup mock to return IDs
      vi.mocked(testDb.categories.add).mockResolvedValueOnce(1).mockResolvedValueOnce(2);
      
      await testDb.populateDefaultData();
      
      expect(testDb.divisions.add).toHaveBeenCalledWith(expect.objectContaining({
        categoryId: 1,
        name: 'General',
        description: 'General personal tasks and projects'
      }));
      
      expect(testDb.divisions.bulkAdd).toHaveBeenCalledWith([
        expect.objectContaining({
          categoryId: 2,
          name: 'Coding',
          description: 'Software development and coding projects'
        }),
        expect.objectContaining({
          categoryId: 2,
          name: 'Marketing',
          description: 'Marketing and promotional activities'
        }),
        expect.objectContaining({
          categoryId: 2,
          name: 'Operations',
          description: 'Business operations and management'
        })
      ]);
    });

    it('should add default tenants', async () => {
      await testDb.populateDefaultData();
      
      expect(testDb.tenants.bulkAdd).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'FM Rug',
          description: 'FM Rug client'
        }),
        expect.objectContaining({
          name: 'Widmers',
          description: 'Widmers client'
        }),
        expect.objectContaining({
          name: 'Arslanian',
          description: 'Arslanian client'
        })
      ]);
    });
  });

  describe('Helper methods', () => {
    it('should get projects with relations', async () => {
      // Setup mock data
      const mockProjects = [
        { id: 1, divisionId: 1, tenantId: 1, title: 'Project 1', status: 'In Progress', priority: 3 }
      ];
      const mockDivisions = [
        { id: 1, categoryId: 1, name: 'Division 1' }
      ];
      const mockTenants = [
        { id: 1, name: 'Tenant 1' }
      ];
      const mockCategories = [
        { id: 1, name: 'Category 1' }
      ];
      
      // Setup mock returns
      vi.mocked(testDb.projects.toArray).mockResolvedValue(mockProjects);
      vi.mocked(testDb.divisions.toArray).mockResolvedValue(mockDivisions);
      vi.mocked(testDb.tenants.toArray).mockResolvedValue(mockTenants);
      vi.mocked(testDb.categories.toArray).mockResolvedValue(mockCategories);
      
      const result = await testDb.getProjectsWithRelations();
      
      expect(result).toEqual([
        {
          ...mockProjects[0],
          division: mockDivisions[0],
          tenant: mockTenants[0],
          category: mockCategories[0]
        }
      ]);
    });

    it('should get tasks for a project', async () => {
      // Setup mock data
      const mockTasks = [
        { id: 1, projectId: 1, title: 'Task 1', status: 'In Progress' }
      ];
      
      // Setup mock returns
      const mockToArray = vi.fn().mockResolvedValue(mockTasks);
      const mockEquals = vi.fn().mockReturnValue({ toArray: mockToArray });
      
      vi.mocked(testDb.tasks.where).mockReturnValue({ equals: mockEquals } as unknown as ReturnType<typeof testDb.tasks.where>);
      
      const result = await testDb.getTasksForProject(1);
      
      expect(testDb.tasks.where).toHaveBeenCalledWith('projectId');
      expect(mockEquals).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTasks);
    });

    it('should get tasks with dependencies', async () => {
      // Setup mock data
      const mockTasks = [
        { id: 1, title: 'Task 1', dependencies: [2] },
        { id: 2, title: 'Task 2', dependencies: [] }
      ];
      
      // Setup mock returns
      vi.mocked(testDb.tasks.toArray).mockResolvedValue(mockTasks);
      
      const result = await testDb.getTasksWithDependencies();
      
      expect(result).toEqual([
        {
          ...mockTasks[0],
          dependencyTasks: [mockTasks[1]]
        },
        {
          ...mockTasks[1],
          dependencyTasks: []
        }
      ]);
    });
  });
});