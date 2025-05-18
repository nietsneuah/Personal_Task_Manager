import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { enhancedDb } from '../db/enhancedPriorityDB';
import type { Category, Division, Tenant, Project, Task } from '../db/enhancedPriorityDB';

// Define the types for our context state
interface HierarchyState {
  categories: Category[];
  divisions: Division[];
  tenants: Tenant[];
  projects: Project[];
  tasks: Task[];
  selectedCategory?: Category;
  selectedDivision?: Division;
  selectedTenant?: Tenant;
  selectedProject?: Project;
  selectedTask?: Task;
  filters: {
    status?: string[];
    priority?: number[];
    dueDate?: string;
    impact?: number[];
    urgency?: number[];
  };
  loading: boolean;
  error?: string;
}

// Define the context actions/methods
interface HierarchyContextType extends HierarchyState {
  selectCategory: (categoryId?: number) => void;
  selectDivision: (divisionId?: number) => void;
  selectTenant: (tenantId?: number) => void;
  selectProject: (projectId?: number) => void;
  selectTask: (taskId?: number) => void;
  setFilters: (filters: HierarchyState['filters']) => void;
  refreshData: () => Promise<void>;
  getDivisionsForCategory: (categoryId: number) => Division[];
  getProjectsForDivisionAndTenant: (divisionId?: number, tenantId?: number) => Project[];
  getTasksForProject: (projectId: number) => Task[];
}

// Create the context with a default empty state
const HierarchyContext = createContext<HierarchyContextType | undefined>(undefined);

// Provider component
export const HierarchyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<HierarchyState>({
    categories: [],
    divisions: [],
    tenants: [],
    projects: [],
    tasks: [],
    filters: {},
    loading: true
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Function to load all data from the database
  const loadData = async () => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      const categories = await enhancedDb.categories.toArray();
      const divisions = await enhancedDb.divisions.toArray();
      const tenants = await enhancedDb.tenants.toArray();
      const projects = await enhancedDb.projects.toArray();
      const tasks = await enhancedDb.tasks.toArray();
      
      setState(prev => ({
        ...prev,
        categories,
        divisions,
        tenants,
        projects,
        tasks,
        loading: false
      }));
    } catch (error) {
      console.error('Error loading hierarchy data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load data. Please try again.'
      }));
    }
  };

  // Select a category
  const selectCategory = (categoryId?: number) => {
    const selectedCategory = categoryId 
      ? state.categories.find(c => c.id === categoryId)
      : undefined;
    
    setState(prev => ({
      ...prev,
      selectedCategory,
      selectedDivision: undefined,
      selectedTenant: undefined,
      selectedProject: undefined,
      selectedTask: undefined
    }));
  };

  // Select a division
  const selectDivision = (divisionId?: number) => {
    const selectedDivision = divisionId
      ? state.divisions.find(d => d.id === divisionId)
      : undefined;
    
    setState(prev => ({
      ...prev,
      selectedDivision,
      selectedProject: undefined,
      selectedTask: undefined
    }));
  };

  // Select a tenant
  const selectTenant = (tenantId?: number) => {
    const selectedTenant = tenantId
      ? state.tenants.find(t => t.id === tenantId)
      : undefined;
    
    setState(prev => ({
      ...prev,
      selectedTenant,
      selectedProject: undefined,
      selectedTask: undefined
    }));
  };

  // Select a project
  const selectProject = (projectId?: number) => {
    const selectedProject = projectId
      ? state.projects.find(p => p.id === projectId)
      : undefined;
    
    setState(prev => ({
      ...prev,
      selectedProject,
      selectedTask: undefined
    }));
  };

  // Select a task
  const selectTask = (taskId?: number) => {
    const selectedTask = taskId
      ? state.tasks.find(t => t.id === taskId)
      : undefined;
    
    setState(prev => ({
      ...prev,
      selectedTask
    }));
  };

  // Set filters
  const setFilters = (filters: HierarchyState['filters']) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...filters
      }
    }));
  };

  // Refresh all data
  const refreshData = async () => {
    await loadData();
  };

  // Get divisions for a specific category
  const getDivisionsForCategory = (categoryId: number) => {
    return state.divisions.filter(d => d.categoryId === categoryId);
  };

  // Get projects for a specific division and tenant
  const getProjectsForDivisionAndTenant = (divisionId?: number, tenantId?: number) => {
    return state.projects.filter(p => 
      (!divisionId || p.divisionId === divisionId) && 
      (!tenantId || p.tenantId === tenantId)
    );
  };

  // Get tasks for a specific project
  const getTasksForProject = (projectId: number) => {
    return state.tasks.filter(t => t.projectId === projectId);
  };

  // Create the context value object
  const contextValue: HierarchyContextType = {
    ...state,
    selectCategory,
    selectDivision,
    selectTenant,
    selectProject,
    selectTask,
    setFilters,
    refreshData,
    getDivisionsForCategory,
    getProjectsForDivisionAndTenant,
    getTasksForProject
  };

  return (
    <HierarchyContext.Provider value={contextValue}>
      {children}
    </HierarchyContext.Provider>
  );
};

// Custom hook to use the hierarchy context
export const useHierarchy = () => {
  const context = useContext(HierarchyContext);
  if (context === undefined) {
    throw new Error('useHierarchy must be used within a HierarchyProvider');
  }
  return context;
};