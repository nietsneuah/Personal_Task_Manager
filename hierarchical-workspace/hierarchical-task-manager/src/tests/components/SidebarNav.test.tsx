import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarNav from '../../components/navigation/SidebarNav';
import * as HierarchyContext from '../../context/HierarchyContext';
import type { Category, Division, Tenant, Project } from '../../db/TaskDatabase';

// Mock the HierarchyContext
vi.mock('../../context/HierarchyContext', async () => {
  const actual = await vi.importActual('../../context/HierarchyContext');
  
  return {
    ...actual,
    useHierarchy: vi.fn()
  };
});

describe('SidebarNav Component', () => {
  // Sample data for testing
  const mockCategories: Category[] = [
    { id: 1, name: 'Business', description: 'Business-related tasks' },
    { id: 2, name: 'Personal', description: 'Personal tasks' }
  ];
  
  const mockDivisions: Division[] = [
    { id: 1, categoryId: 1, name: 'Coding', description: 'Software development' },
    { id: 2, categoryId: 1, name: 'Marketing', description: 'Marketing activities' },
    { id: 3, categoryId: 2, name: 'General', description: 'General personal tasks' }
  ];
  
  const mockTenants: Tenant[] = [
    { id: 1, name: 'FM Rug', description: 'FM Rug client' },
    { id: 2, name: 'Widmers', description: 'Widmers client' }
  ];
  
  const mockProjects: Project[] = [
    { 
      id: 1, 
      divisionId: 1, 
      tenantId: 1, 
      title: 'Website Redesign', 
      status: 'In Progress', 
      priority: 4 
    },
    { 
      id: 2, 
      divisionId: 2, 
      tenantId: 2, 
      title: 'Marketing Campaign', 
      status: 'Planned', 
      priority: 3 
    }
  ];
  
  // Mock hierarchy context functions
  const mockSelectCategory = vi.fn();
  const mockSelectDivision = vi.fn();
  const mockSelectTenant = vi.fn();
  const mockSelectProject = vi.fn();
  const mockGetDivisionsForCategory = vi.fn().mockImplementation((categoryId) => 
    mockDivisions.filter(d => d.categoryId === categoryId)
  );
  const mockGetProjectsForDivisionAndTenant = vi.fn().mockImplementation((divisionId, tenantId) => 
    mockProjects.filter(p => p.divisionId === divisionId && p.tenantId === tenantId)
  );
  const mockAddProject = vi.fn().mockResolvedValue(3);
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup the mock return value for useHierarchy
    vi.mocked(HierarchyContext.useHierarchy).mockReturnValue({
      categories: mockCategories,
      divisions: mockDivisions,
      tenants: mockTenants,
      projects: mockProjects,
      tasks: [],
      selectedCategory: undefined,
      selectedDivision: undefined,
      selectedTenant: undefined,
      selectedProject: undefined,
      selectedTask: undefined,
      filters: {},
      loading: false,
      selectCategory: mockSelectCategory,
      selectDivision: mockSelectDivision,
      selectTenant: mockSelectTenant,
      selectProject: mockSelectProject,
      selectTask: vi.fn(),
      setFilters: vi.fn(),
      refreshData: vi.fn(),
      getDivisionsForCategory: mockGetDivisionsForCategory,
      getProjectsForDivisionAndTenant: mockGetProjectsForDivisionAndTenant,
      getTasksForProject: vi.fn(),
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      addProject: mockAddProject,
      updateProject: vi.fn(),
      deleteProject: vi.fn()
    });
  });
  
  it('should render the navigation title', () => {
    render(<SidebarNav />);
    expect(screen.getByText('Navigation')).toBeDefined();
  });
  
  it('should render all categories', () => {
    render(<SidebarNav />);
    
    mockCategories.forEach(category => {
      expect(screen.getByText(category.name)).toBeDefined();
    });
  });
  
  it('should expand a category when clicked', () => {
    render(<SidebarNav />);
    
    // Find and click the first category
    const categoryElement = screen.getByText(mockCategories[0].name);
    fireEvent.click(categoryElement);
    
    // Check that selectCategory was called with the correct ID
    expect(mockSelectCategory).toHaveBeenCalledWith(mockCategories[0].id);
    
    // Check that divisions for this category are now visible
    const divisionsForCategory = mockDivisions.filter(d => d.categoryId === mockCategories[0].id);
    divisionsForCategory.forEach(division => {
      expect(screen.getByText(division.name)).toBeDefined();
    });
  });
  
  it('should expand a division when clicked', async () => {
    render(<SidebarNav />);
    
    // First expand a category
    const categoryElement = screen.getByText(mockCategories[0].name);
    fireEvent.click(categoryElement);
    
    // Then find and click a division
    const divisionElement = screen.getByText(mockDivisions[0].name);
    fireEvent.click(divisionElement);
    
    // Check that selectDivision was called with the correct ID
    expect(mockSelectDivision).toHaveBeenCalledWith(mockDivisions[0].id);
    
    // Check that tenants are now visible
    mockTenants.forEach(tenant => {
      expect(screen.getByText(tenant.name)).toBeDefined();
    });
  });
  
  it('should expand a tenant when clicked', async () => {
    render(<SidebarNav />);
    
    // First expand a category
    const categoryElement = screen.getByText(mockCategories[0].name);
    fireEvent.click(categoryElement);
    
    // Then expand a division
    const divisionElement = screen.getByText(mockDivisions[0].name);
    fireEvent.click(divisionElement);
    
    // Then find and click a tenant
    const tenantElement = screen.getByText(mockTenants[0].name);
    fireEvent.click(tenantElement);
    
    // Check that selectTenant was called with the correct ID
    expect(mockSelectTenant).toHaveBeenCalledWith(mockTenants[0].id);
    
    // Check that projects for this division and tenant are now visible
    const projectsForDivisionAndTenant = mockProjects.filter(
      p => p.divisionId === mockDivisions[0].id && p.tenantId === mockTenants[0].id
    );
    
    projectsForDivisionAndTenant.forEach(project => {
      expect(screen.getByText(project.title)).toBeDefined();
    });
    
    // Check that "Add Project" button is visible
    expect(screen.getByText('Add Project')).toBeDefined();
  });
  
  it('should select a project when clicked', async () => {
    render(<SidebarNav />);
    
    // First expand a category
    const categoryElement = screen.getByText(mockCategories[0].name);
    fireEvent.click(categoryElement);
    
    // Then expand a division
    const divisionElement = screen.getByText(mockDivisions[0].name);
    fireEvent.click(divisionElement);
    
    // Then expand a tenant
    const tenantElement = screen.getByText(mockTenants[0].name);
    fireEvent.click(tenantElement);
    
    // Then find and click a project
    const projectElement = screen.getByText(mockProjects[0].title);
    fireEvent.click(projectElement);
    
    // Check that selectProject was called with the correct ID
    expect(mockSelectProject).toHaveBeenCalledWith(mockProjects[0].id);
  });
  
  it('should add a new project when "Add Project" is clicked', async () => {
    render(<SidebarNav />);
    
    // First expand a category
    const categoryElement = screen.getByText(mockCategories[0].name);
    fireEvent.click(categoryElement);
    
    // Then expand a division
    const divisionElement = screen.getByText(mockDivisions[0].name);
    fireEvent.click(divisionElement);
    
    // Then expand a tenant
    const tenantElement = screen.getByText(mockTenants[0].name);
    fireEvent.click(tenantElement);
    
    // Then find and click the "Add Project" button
    const addProjectButton = screen.getByText('Add Project');
    fireEvent.click(addProjectButton);
    
    // Check that addProject was called with the correct parameters
    expect(mockAddProject).toHaveBeenCalledWith(expect.objectContaining({
      divisionId: mockDivisions[0].id,
      tenantId: mockTenants[0].id,
      title: 'New Project',
      status: 'Planned'
    }));
  });
});