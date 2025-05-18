import Dexie from 'dexie';
import type { Table } from 'dexie';

// Define interfaces for our data models
export interface Category {
  id?: number;
  name: string;
  description?: string;
}

export interface Division {
  id?: number;
  categoryId: number;
  name: string;
  description?: string;
}

export interface Tenant {
  id?: number;
  name: string;
  description?: string;
  contactInfo?: string;
}

export interface Project {
  id?: number;
  divisionId: number;
  tenantId: number;
  title: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  status: 'Planned' | 'In Progress' | 'Done';
  priority: number;
}

export interface Task {
  id?: number;
  projectId: number;
  title: string;
  description?: string;
  impact: number; // 1-5
  urgency: number; // 1-5
  weekOf: string;
  status: 'Planned' | 'In Progress' | 'Done';
  notes?: string;
  dependencies?: number[]; // IDs of predecessor tasks
}

// Define the enhanced database class
export class EnhancedPriorityDB extends Dexie {
  categories!: Table<Category>;
  divisions!: Table<Division>;
  tenants!: Table<Tenant>;
  projects!: Table<Project>;
  tasks!: Table<Task>;

  constructor() {
    super('EnhancedPriorityDatabase');
    this.version(1).stores({
      categories: '++id, name',
      divisions: '++id, categoryId, name',
      tenants: '++id, name',
      projects: '++id, divisionId, tenantId, status, dueDate',
      tasks: '++id, projectId, status, weekOf, impact, urgency'
    });

    // Initialize with default data when the database is created
    this.on('populate', () => this.populateDefaultData());
  }

  // Initialize the database with default data
  async populateDefaultData() {
    // Add default categories
    const personalCategoryId = await this.categories.add({
      name: 'Personal',
      description: 'Personal tasks and projects'
    });

    const businessCategoryId = await this.categories.add({
      name: 'Business',
      description: 'Business-related tasks and projects'
    });

    // Add default division for Personal category
    await this.divisions.add({
      categoryId: personalCategoryId,
      name: 'General',
      description: 'General personal tasks and projects'
    });

    // Add default divisions for Business category
    await this.divisions.bulkAdd([
      {
        categoryId: businessCategoryId,
        name: 'Coding',
        description: 'Software development and coding projects'
      },
      {
        categoryId: businessCategoryId,
        name: 'Marketing',
        description: 'Marketing and promotional activities'
      },
      {
        categoryId: businessCategoryId,
        name: 'Operations',
        description: 'Business operations and management'
      }
    ]);

    // Add default tenants
    await this.tenants.bulkAdd([
      {
        name: 'FM Rug',
        description: 'FM Rug client'
      },
      {
        name: 'Widmers',
        description: 'Widmers client'
      },
      {
        name: 'Arslanian',
        description: 'Arslanian client'
      }
    ]);
  }

  // Helper method to get all projects with their related entities
  async getProjectsWithRelations() {
    const projects = await this.projects.toArray();
    const divisions = await this.divisions.toArray();
    const tenants = await this.tenants.toArray();
    const categories = await this.categories.toArray();

    return projects.map(project => {
      const division = divisions.find(d => d.id === project.divisionId);
      const tenant = tenants.find(t => t.id === project.tenantId);
      const category = division 
        ? categories.find(c => c.id === division.categoryId)
        : undefined;

      return {
        ...project,
        division,
        tenant,
        category
      };
    });
  }

  // Helper method to get all tasks for a specific project
  async getTasksForProject(projectId: number) {
    return this.tasks
      .where('projectId')
      .equals(projectId)
      .toArray();
  }

  // Helper method to get all tasks with their dependencies
  async getTasksWithDependencies() {
    const tasks = await this.tasks.toArray();
    
    return tasks.map(task => {
      const dependencies = task.dependencies 
        ? tasks.filter(t => task.dependencies?.includes(t.id as number))
        : [];
      
      return {
        ...task,
        dependencyTasks: dependencies
      };
    });
  }
}

// Create and export a single instance of the database
export const enhancedDb = new EnhancedPriorityDB();