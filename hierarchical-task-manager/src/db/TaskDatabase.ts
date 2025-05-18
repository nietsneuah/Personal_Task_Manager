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

// Define the database class
class TaskDatabase extends Dexie {
  categories!: Table<Category>;
  divisions!: Table<Division>;
  tenants!: Table<Tenant>;
  projects!: Table<Project>;
  tasks!: Table<Task>;

  constructor() {
    super('HierarchicalTaskDatabase');
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

  // Method to initialize the database with sample data for testing
  async initializeWithSampleData() {
    await this.populateDefaultData();

    // Get the divisions and tenants
    const divisions = await this.divisions.toArray();
    const tenants = await this.tenants.toArray();
    
    if (divisions.length > 0 && tenants.length > 0) {
      // Get division IDs
      const codingDivisionId = divisions.find(d => d.name === 'Coding')?.id ?? divisions[0].id as number;
      const marketingDivisionId = divisions.find(d => d.name === 'Marketing')?.id ?? divisions[0].id as number;
      const generalDivisionId = divisions.find(d => d.name === 'General')?.id ?? divisions[0].id as number;
      
      // Get tenant IDs
      const fmRugTenantId = tenants.find(t => t.name === 'FM Rug')?.id ?? tenants[0].id as number;
      const widmersTenantId = tenants.find(t => t.name === 'Widmers')?.id ?? tenants[0].id as number;
      const arslanianTenantId = tenants.find(t => t.name === 'Arslanian')?.id ?? tenants[0].id as number;
      
      // Sample projects
      const sampleProjects = [
        {
          divisionId: codingDivisionId,
          tenantId: fmRugTenantId,
          title: 'Website Redesign',
          description: 'Redesign the company website with modern UI/UX',
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'In Progress' as const,
          priority: 4
        },
        {
          divisionId: marketingDivisionId,
          tenantId: widmersTenantId,
          title: 'Social Media Campaign',
          description: 'Launch a social media campaign for the new product',
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Planned' as const,
          priority: 3
        },
        {
          divisionId: generalDivisionId,
          tenantId: arslanianTenantId,
          title: 'Personal Development',
          description: 'Learn new skills and technologies',
          startDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'In Progress' as const,
          priority: 2
        }
      ];
      
      // Add sample projects
      const projectIds = await this.projects.bulkAdd(sampleProjects, { allKeys: true });
      
      // Sample tasks for each project
      const sampleTasks = [
        {
          projectId: projectIds[0] as number,
          title: 'Design mockups',
          description: 'Create design mockups for the website',
          impact: 4,
          urgency: 5,
          weekOf: new Date().toISOString().split('T')[0],
          status: 'In Progress' as const,
          notes: 'Focus on mobile-first design'
        },
        {
          projectId: projectIds[0] as number,
          title: 'Frontend implementation',
          description: 'Implement the frontend using React',
          impact: 5,
          urgency: 3,
          weekOf: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'Planned' as const,
          notes: 'Use Tailwind CSS for styling',
          dependencies: []
        },
        {
          projectId: projectIds[1] as number,
          title: 'Content creation',
          description: 'Create content for social media posts',
          impact: 4,
          urgency: 4,
          weekOf: new Date().toISOString().split('T')[0],
          status: 'In Progress' as const,
          notes: 'Focus on engaging content'
        },
        {
          projectId: projectIds[2] as number,
          title: 'Learn React',
          description: 'Complete React course',
          impact: 3,
          urgency: 2,
          weekOf: new Date().toISOString().split('T')[0],
          status: 'In Progress' as const,
          notes: 'Focus on hooks and context API'
        }
      ];
      
      // Add sample tasks
      const taskIds = await this.tasks.bulkAdd(sampleTasks, { allKeys: true });
      
      // Update dependencies
      await this.tasks.update(taskIds[1] as number, {
        dependencies: [taskIds[0] as number]
      });
    }
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
export const db = new TaskDatabase();