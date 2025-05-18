import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { enhancedDb } from '../../db/enhancedPriorityDB';
import type { Task, Project, Tenant, Division } from '../../db/enhancedPriorityDB';
import { useHierarchy } from '../../context/HierarchyContext';

const HierarchicalTaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const taskId = id ? parseInt(id) : undefined;
  
  const {
    categories,
    refreshData,
    selectedCategory,
    selectedDivision,
    selectedTenant,
    selectedProject
  } = useHierarchy();

  // State for form data
  const [task, setTask] = useState<Partial<Task>>({
    title: '',
    impact: 1,
    urgency: 1,
    status: 'Planned',
    weekOf: new Date().toISOString().split('T')[0],
    notes: '',
    dependencies: []
  });
  
  // State for hierarchical selections
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(
    selectedCategory?.id
  );
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | undefined>(
    selectedDivision?.id
  );
  const [selectedTenantId, setSelectedTenantId] = useState<number | undefined>(
    selectedTenant?.id
  );
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(
    selectedProject?.id
  );
  
  // State for available options
  const [availableDivisions, setAvailableDivisions] = useState<Division[]>([]);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [selectedDependencies, setSelectedDependencies] = useState<number[]>([]);

  // Load task data if editing
  useEffect(() => {
    const loadTask = async () => {
      if (taskId) {
        setIsLoading(true);
        try {
          const existingTask = await enhancedDb.tasks.get(taskId);
          if (existingTask) {
            setTask(existingTask);
            
            // Load project, tenant, division, category
            const project = await enhancedDb.projects.get(existingTask.projectId);
            if (project) {
              setSelectedProjectId(project.id);
              
              const tenant = await enhancedDb.tenants.get(project.tenantId);
              if (tenant) {
                setSelectedTenantId(tenant.id);
              }
              
              const division = await enhancedDb.divisions.get(project.divisionId);
              if (division) {
                setSelectedDivisionId(division.id);
                
                const category = await enhancedDb.categories.get(division.categoryId);
                if (category) {
                  setSelectedCategoryId(category.id);
                }
              }
            }
            
            // Load dependencies
            if (existingTask.dependencies) {
              setSelectedDependencies(existingTask.dependencies);
            }
          } else {
            setFormError('Task not found');
          }
        } catch (error) {
          console.error('Error loading task:', error);
          setFormError('Failed to load task data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Initialize with context selections if available
        if (selectedProject) {
          setSelectedProjectId(selectedProject.id);
        }
        if (selectedTenant) {
          setSelectedTenantId(selectedTenant.id);
        }
        if (selectedDivision) {
          setSelectedDivisionId(selectedDivision.id);
        }
        if (selectedCategory) {
          setSelectedCategoryId(selectedCategory.id);
        }
      }
    };

    loadTask();
  }, [taskId, selectedCategory, selectedDivision, selectedTenant, selectedProject]);

  // Load divisions when category changes
  useEffect(() => {
    const loadDivisions = async () => {
      if (selectedCategoryId) {
        const divisions = await enhancedDb.divisions
          .where('categoryId')
          .equals(selectedCategoryId)
          .toArray();
        setAvailableDivisions(divisions);
        
        // If current division is not in this category, reset it
        if (selectedDivisionId && !divisions.some(d => d.id === selectedDivisionId)) {
          setSelectedDivisionId(undefined);
        }
      } else {
        setAvailableDivisions([]);
        setSelectedDivisionId(undefined);
      }
    };
    
    loadDivisions();
  }, [selectedCategoryId, selectedDivisionId]);

  // Load tenants
  useEffect(() => {
    const loadTenants = async () => {
      const tenants = await enhancedDb.tenants.toArray();
      setAvailableTenants(tenants);
      
      // If current tenant is not available, reset it
      if (selectedTenantId && !tenants.some(t => t.id === selectedTenantId)) {
        setSelectedTenantId(undefined);
      }
    };
    
    loadTenants();
  }, [selectedTenantId]);

  // Load projects when division and tenant change
  useEffect(() => {
    const loadProjects = async () => {
      if (selectedDivisionId && selectedTenantId) {
        const projects = await enhancedDb.projects
          .where('divisionId')
          .equals(selectedDivisionId)
          .and(project => project.tenantId === selectedTenantId)
          .toArray();
        setAvailableProjects(projects);
        
        // If current project is not in this division/tenant, reset it
        if (selectedProjectId && !projects.some(p => p.id === selectedProjectId)) {
          setSelectedProjectId(undefined);
        }
      } else {
        setAvailableProjects([]);
        setSelectedProjectId(undefined);
      }
    };
    
    loadProjects();
  }, [selectedDivisionId, selectedTenantId, selectedProjectId]);

  // Load available tasks for dependencies
  useEffect(() => {
    const loadAvailableTasks = async () => {
      if (selectedProjectId) {
        // Get all tasks for this project except the current task
        const tasks = await enhancedDb.tasks
          .where('projectId')
          .equals(selectedProjectId)
          .toArray();
        
        // Filter out the current task if editing
        const filteredTasks = taskId 
          ? tasks.filter(t => t.id !== taskId)
          : tasks;
          
        setAvailableTasks(filteredTasks);
      } else {
        setAvailableTasks([]);
      }
    };
    
    loadAvailableTasks();
  }, [selectedProjectId, taskId]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask(prev => ({
      ...prev,
      [name]: name === 'impact' || name === 'urgency' ? Number(value) : value
    }));
  };

  // Handle hierarchy selection changes
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value ? Number(e.target.value) : undefined;
    setSelectedCategoryId(categoryId);
  };

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const divisionId = e.target.value ? Number(e.target.value) : undefined;
    setSelectedDivisionId(divisionId);
  };

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tenantId = e.target.value ? Number(e.target.value) : undefined;
    setSelectedTenantId(tenantId);
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value ? Number(e.target.value) : undefined;
    setSelectedProjectId(projectId);
  };

  // Handle dependency selection
  const handleDependencyChange = (taskId: number) => {
    setSelectedDependencies(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    
    try {
      if (!task.title?.trim()) {
        throw new Error('Title is required');
      }
      
      if (!selectedProjectId) {
        throw new Error('Project selection is required');
      }
      
      // Prepare task data
      const taskData: Task = {
        ...task as Task,
        projectId: selectedProjectId,
        dependencies: selectedDependencies
      };
      
      // Save task
      if (taskId) {
        await enhancedDb.tasks.update(taskId, taskData);
      } else {
        await enhancedDb.tasks.add(taskData);
      }
      
      // Refresh data in context
      await refreshData();
      
      // Navigate back
      navigate('/hierarchical', { state: { refresh: true } });
    } catch (error) {
      console.error('Error saving task:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to save task. Please try again.');
      setIsLoading(false);
    }
  };

  // Create new project
  const handleCreateProject = async () => {
    if (!selectedDivisionId || !selectedTenantId) {
      setFormError('Division and Tenant are required to create a project');
      return;
    }
    
    const projectName = prompt('Enter project name:');
    if (!projectName?.trim()) return;
    
    try {
      const projectId = await enhancedDb.projects.add({
        divisionId: selectedDivisionId,
        tenantId: selectedTenantId,
        title: projectName,
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Planned',
        priority: 3
      });
      
      setSelectedProjectId(projectId);
      
      // Refresh projects
      const projects = await enhancedDb.projects
        .where('divisionId')
        .equals(selectedDivisionId)
        .and(project => project.tenantId === selectedTenantId)
        .toArray();
      setAvailableProjects(projects);
    } catch (error) {
      console.error('Error creating project:', error);
      setFormError('Failed to create project. Please try again.');
    }
  };

  // Create new tenant
  const handleCreateTenant = async () => {
    const tenantName = prompt('Enter tenant name:');
    if (!tenantName?.trim()) return;
    
    try {
      const tenantId = await enhancedDb.tenants.add({
        name: tenantName,
        description: ''
      });
      
      setSelectedTenantId(tenantId);
      
      // Refresh tenants
      const tenants = await enhancedDb.tenants.toArray();
      setAvailableTenants(tenants);
    } catch (error) {
      console.error('Error creating tenant:', error);
      setFormError('Failed to create tenant. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-xl py-6 px-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">{taskId ? 'Edit Task' : 'Add New Task'}</h2>
            <button 
              onClick={() => navigate('/hierarchical')}
              className="text-white hover:text-gray-200 focus:outline-none p-2 rounded-full hover:bg-blue-700 transition-colors"
              aria-label="Back to Tasks"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Form Content */}
        <div className="p-6 sm:p-8 md:p-10 lg:p-12">
          {/* Error Message */}
          {formError && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-5 rounded-md shadow-sm">
              <p className="flex items-center text-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {formError}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Task Title Section */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
              <label className="block text-xl font-medium text-gray-700 mb-3">Task Title</label>
              <input
                type="text"
                name="title"
                value={task.title || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="Enter task title"
                required
              />
            </div>
            
            {/* Hierarchy Selection Section */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
              <h3 className="text-xl font-bold text-blue-800 mb-6 border-b border-blue-200 pb-2">Task Hierarchy</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Category Selection */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <label className="block text-lg font-medium text-gray-700 mb-3">Category</label>
                  <select
                    value={selectedCategoryId || ''}
                    onChange={handleCategoryChange}
                    className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Division Selection */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <label className="block text-lg font-medium text-gray-700 mb-3">Division</label>
                  <select
                    value={selectedDivisionId || ''}
                    onChange={handleDivisionChange}
                    className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    required
                    disabled={!selectedCategoryId}
                  >
                    <option value="">Select Division</option>
                    {availableDivisions.map(division => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Tenant Selection */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <label className="block text-lg font-medium text-gray-700 mb-3">Tenant</label>
                  <div className="flex space-x-2">
                    <select
                      value={selectedTenantId || ''}
                      onChange={handleTenantChange}
                      className="flex-grow px-5 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                      required
                    >
                      <option value="">Select Tenant</option>
                      {availableTenants.map(tenant => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleCreateTenant}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Project Selection */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <label className="block text-lg font-medium text-gray-700 mb-3">Project</label>
                  <div className="flex space-x-2">
                    <select
                      value={selectedProjectId || ''}
                      onChange={handleProjectChange}
                      className="flex-grow px-5 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                      required
                      disabled={!selectedDivisionId || !selectedTenantId}
                    >
                      <option value="">Select Project</option>
                      {availableProjects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleCreateProject}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                      disabled={!selectedDivisionId || !selectedTenantId}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Priority Section */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
              <h3 className="text-xl font-bold text-blue-800 mb-6 border-b border-blue-200 pb-2">Priority Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <label className="block text-xl font-medium text-gray-700 mb-4">
                    Impact (1-5): <span className="text-blue-600 font-bold text-2xl ml-2">{task.impact}</span>
                  </label>
                  <div className="flex items-center mb-4">
                    <span className="text-base mr-4">Low</span>
                    <input
                      type="range"
                      name="impact"
                      min="1"
                      max="5"
                      value={task.impact}
                      onChange={handleChange}
                      className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="text-base ml-4">High</span>
                  </div>
                  <div className="mt-3 text-center text-2xl">
                    {'⭐'.repeat(task.impact || 0)}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <label className="block text-xl font-medium text-gray-700 mb-4">
                    Urgency (1-5): <span className="text-red-600 font-bold text-2xl ml-2">{task.urgency}</span>
                  </label>
                  <div className="flex items-center mb-4">
                    <span className="text-base mr-4">Low</span>
                    <input
                      type="range"
                      name="urgency"
                      min="1"
                      max="5"
                      value={task.urgency}
                      onChange={handleChange}
                      className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <span className="text-base ml-4">High</span>
                  </div>
                  <div className="mt-3 text-center text-2xl">
                    {'🔥'.repeat(task.urgency || 0)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status and Date Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-xl font-medium text-gray-700 mb-3">Status</label>
                <select
                  name="status"
                  value={task.status || 'Planned'}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                >
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-xl font-medium text-gray-700 mb-3">Week Of</label>
                <input
                  type="date"
                  name="weekOf"
                  value={task.weekOf || ''}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  required
                />
              </div>
            </div>
            
            {/* Dependencies Section */}
            {selectedProjectId && availableTasks.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-xl font-medium text-gray-700 mb-3">Dependencies</label>
                <p className="text-gray-600 mb-4">Select tasks that must be completed before this task can start:</p>
                
                <div className="space-y-2 max-h-60 overflow-y-auto p-2">
                  {availableTasks.map(availableTask => (
                    <div key={availableTask.id} className="flex items-center p-2 hover:bg-gray-100 rounded">
                      <input
                        type="checkbox"
                        id={`dependency-${availableTask.id}`}
                        checked={selectedDependencies.includes(availableTask.id as number)}
                        onChange={() => handleDependencyChange(availableTask.id as number)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`dependency-${availableTask.id}`} className="ml-3 text-gray-700">
                        {availableTask.title}
                        <span className="ml-2 text-sm text-gray-500">
                          (Impact: {availableTask.impact}, Urgency: {availableTask.urgency})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Notes Section */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
              <label className="block text-xl font-medium text-gray-700 mb-3">Notes</label>
              <textarea
                name="notes"
                value={task.notes || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                rows={6}
                placeholder="Add any additional notes or details here"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/hierarchical')}
                className="px-8 py-4 text-lg border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200 w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-4 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HierarchicalTaskForm;