import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { enhancedDb } from '../../db/enhancedPriorityDB';
import { useHierarchy } from '../../context/HierarchyContext';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import 'tabulator-tables/dist/css/tabulator_midnight.min.css';
import type { Task } from '../../db/enhancedPriorityDB';

const UnifiedLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    categories,
    divisions,
    tenants,
    projects,
    tasks,
    selectedCategory,
    selectedDivision,
    selectedTenant,
    selectedProject,
    selectCategory,
    selectDivision,
    selectTenant,
    selectProject,
    filters,
    setFilters,
    refreshData
  } = useHierarchy();

  // State for UI
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [tableRef, setTableRef] = useState<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [table, setTable] = useState<Tabulator | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Refresh data when returning from task form
  useEffect(() => {
    if (location.state && location.state.refresh) {
      refreshData();
      setRefreshTrigger(prev => prev + 1);
    }
  }, [location, refreshData]);

  // Apply filters to tasks
  useEffect(() => {
    let result = [...tasks];

    // Filter by hierarchy
    if (selectedProject) {
      result = result.filter(task => task.projectId === selectedProject.id);
    } else if (selectedTenant && selectedDivision) {
      const projectIds = projects
        .filter(p => p.tenantId === selectedTenant.id && p.divisionId === selectedDivision.id)
        .map(p => p.id);
      result = result.filter(task => task.projectId && projectIds.includes(task.projectId));
    } else if (selectedDivision) {
      const projectIds = projects
        .filter(p => p.divisionId === selectedDivision.id)
        .map(p => p.id);
      result = result.filter(task => task.projectId && projectIds.includes(task.projectId));
    } else if (selectedCategory) {
      const divisionIds = divisions
        .filter(d => d.categoryId === selectedCategory.id)
        .map(d => d.id);
      const projectIds = projects
        .filter(p => p.divisionId && divisionIds.includes(p.divisionId))
        .map(p => p.id);
      result = result.filter(task => task.projectId && projectIds.includes(task.projectId));
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      result = result.filter(task => filters.status?.includes(task.status));
    }

    // Apply impact filter
    if (filters.impact && filters.impact.length > 0) {
      result = result.filter(task => filters.impact?.includes(task.impact));
    }

    // Apply urgency filter
    if (filters.urgency && filters.urgency.length > 0) {
      result = result.filter(task => filters.urgency?.includes(task.urgency));
    }

    // Apply due date filter
    if (filters.dueDate) {
      const filterDate = new Date(filters.dueDate);
      result = result.filter(task => {
        const taskDate = new Date(task.weekOf);
        return taskDate <= filterDate;
      });
    }

    setFilteredTasks(result);
  }, [selectedCategory, selectedDivision, selectedTenant, selectedProject, tasks, filters, projects, divisions]);

  // Generate breadcrumb navigation
  const generateBreadcrumb = () => {
    const parts = [];
    
    if (selectedCategory) {
      parts.push(selectedCategory.name);
    }
    
    if (selectedDivision) {
      parts.push(selectedDivision.name);
    }
    
    if (selectedTenant) {
      parts.push(selectedTenant.name);
    }
    
    if (selectedProject) {
      parts.push(selectedProject.title);
    }
    
    if (parts.length === 0) {
      return <span className="text-gray-400">All Tasks</span>;
    }
    
    return (
      <div className="flex items-center space-x-2">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-gray-400">/</span>}
            <span className="text-white">{part}</span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Toggle filter status
  const toggleFilter = (type: 'status' | 'impact' | 'urgency', value: string | number) => {
    // Cast to appropriate type based on the filter type
    if (type === 'status') {
      const currentValues = filters.status || [];
      const newValues = currentValues.includes(value as string)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value as string];
      
      setFilters({
        ...filters,
        status: newValues
      });
    } else if (type === 'impact' || type === 'urgency') {
      const currentValues = filters[type] || [];
      const newValues = currentValues.includes(value as number)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value as number];
      
      setFilters({
        ...filters,
        [type]: newValues
      });
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({});
  };

  // Handle category click
  const handleCategoryClick = (categoryId: number) => {
    if (selectedCategory?.id === categoryId) {
      selectCategory(undefined);
    } else {
      selectCategory(categoryId);
    }
  };

  // Handle division click
  const handleDivisionClick = (divisionId: number) => {
    if (selectedDivision?.id === divisionId) {
      selectDivision(undefined);
    } else {
      selectDivision(divisionId);
    }
  };

  // Handle tenant click
  const handleTenantClick = (tenantId: number) => {
    if (selectedTenant?.id === tenantId) {
      selectTenant(undefined);
    } else {
      selectTenant(tenantId);
    }
  };

  // Handle project click
  const handleProjectClick = (projectId: number) => {
    if (selectedProject?.id === projectId) {
      selectProject(undefined);
    } else {
      selectProject(projectId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          {/* App Title */}
          <div className="text-2xl font-bold mb-4 md:mb-0 flex items-center">
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="mr-3 p-1 rounded hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            Priority Tracker
          </div>
          
          {/* Breadcrumb Navigation */}
          <div className="flex-grow mx-4 bg-blue-700 bg-opacity-50 rounded-lg px-4 py-2 text-sm md:text-base overflow-hidden overflow-ellipsis whitespace-nowrap">
            <span className="font-medium">Viewing: </span>
            {generateBreadcrumb()}
          </div>
          
          {/* Filter Toggle & Add Task Button */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterExpanded(!filterExpanded)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
            <button
              onClick={() => navigate('/task/new')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarExpanded && (
          <div className="w-64 min-w-64 bg-gray-800 text-white p-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-blue-300">Navigation</h2>
            
            <ul className="space-y-2">
              {categories.map(category => {
                const isCategorySelected = selectedCategory?.id === category.id;
                const categoryDivisions = divisions.filter(d => d.categoryId === category.id);
                
                return (
                  <li key={category.id} className="mb-2">
                    {/* Category Item */}
                    <div
                      className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-700 ${
                        isCategorySelected ? 'bg-gray-700 font-semibold' : ''
                      }`}
                      onClick={() => handleCategoryClick(category.id as number)}
                    >
                      <span className="mr-2">
                        {isCategorySelected ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </span>
                      <span>{category.name}</span>
                    </div>
                    
                    {/* Divisions under this category */}
                    {isCategorySelected && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {categoryDivisions.map(division => {
                          const isDivisionSelected = selectedDivision?.id === division.id;
                          
                          return (
                            <li key={division.id}>
                              {/* Division Item */}
                              <div
                                className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-700 ${
                                  isDivisionSelected ? 'bg-gray-700 font-semibold' : ''
                                }`}
                                onClick={() => handleDivisionClick(division.id as number)}
                              >
                                <span className="mr-2">
                                  {isDivisionSelected ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  )}
                                </span>
                                <span>{division.name}</span>
                              </div>
                              
                              {/* Tenants for this division */}
                              {isDivisionSelected && (
                                <ul className="ml-6 mt-1 space-y-1">
                                  {tenants.map(tenant => {
                                    const isTenantSelected = selectedTenant?.id === tenant.id;
                                    const tenantProjects = projects.filter(
                                      p => p.divisionId === division.id && p.tenantId === tenant.id
                                    );
                                    
                                    // Only show tenants that have projects in this division
                                    if (tenantProjects.length === 0) return null;
                                    
                                    return (
                                      <li key={tenant.id}>
                                        {/* Tenant Item */}
                                        <div
                                          className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-700 ${
                                            isTenantSelected ? 'bg-gray-700 font-semibold' : ''
                                          }`}
                                          onClick={() => handleTenantClick(tenant.id as number)}
                                        >
                                          <span className="mr-2">
                                            {isTenantSelected ? (
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                              </svg>
                                            ) : (
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                              </svg>
                                            )}
                                          </span>
                                          <span>{tenant.name}</span>
                                        </div>
                                        
                                        {/* Projects for this tenant and division */}
                                        {isTenantSelected && (
                                          <ul className="ml-6 mt-1 space-y-1">
                                            {tenantProjects.map(project => {
                                              const isProjectSelected = selectedProject?.id === project.id;
                                              
                                              return (
                                                <li key={project.id}>
                                                  <div
                                                    className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-700 ${
                                                      isProjectSelected ? 'bg-gray-700 font-semibold' : ''
                                                    }`}
                                                    onClick={() => handleProjectClick(project.id as number)}
                                                  >
                                                    <span className="mr-2">
                                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                      </svg>
                                                    </span>
                                                    <span>{project.title}</span>
                                                  </div>
                                                </li>
                                              );
                                            })}
                                          </ul>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {/* Main View */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Filter Panel */}
          {filterExpanded && (
            <div className="bg-gray-800 p-4 rounded-lg shadow-sm mb-4">
              <div className="flex flex-wrap gap-4">
                {/* Status Filter */}
                <div>
                  <h3 className="text-white text-sm font-medium mb-2">Status</h3>
                  <div className="flex space-x-2">
                    {['Planned', 'In Progress', 'Done'].map(status => (
                      <button
                        key={status}
                        className={`px-3 py-1 text-sm rounded-full ${
                          filters.status?.includes(status)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => toggleFilter('status', status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Impact Filter */}
                <div>
                  <h3 className="text-white text-sm font-medium mb-2">Impact</h3>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(impact => (
                      <button
                        key={impact}
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          filters.impact?.includes(impact)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => toggleFilter('impact', impact)}
                      >
                        {impact}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Urgency Filter */}
                <div>
                  <h3 className="text-white text-sm font-medium mb-2">Urgency</h3>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(urgency => (
                      <button
                        key={urgency}
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          filters.urgency?.includes(urgency)
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => toggleFilter('urgency', urgency)}
                      >
                        {urgency}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Due Date Filter */}
                <div>
                  <h3 className="text-white text-sm font-medium mb-2">Due Date</h3>
                  <input
                    type="date"
                    value={filters.dueDate || ''}
                    onChange={e => setFilters({ ...filters, dueDate: e.target.value })}
                    className="bg-gray-700 text-white px-3 py-1 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Reset Button */}
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* View Toggle */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">
              {selectedProject ? selectedProject.title : 'Tasks'}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                List View
              </button>
              
              <button
                onClick={() => setViewMode('gantt')}
                className={`px-3 py-1 rounded-md ${
                  viewMode === 'gantt'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } ${!selectedProject ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!selectedProject}
              >
                Gantt View
              </button>
            </div>
          </div>
          
          {/* Task List or Gantt View */}
          {viewMode === 'list' ? (
            <div className="bg-gray-800 rounded-lg p-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-xl">No tasks found</p>
                  <p className="mt-2">Try adjusting your filters or create a new task</p>
                  <button
                    onClick={() => navigate('/task/new')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add New Task
                  </button>
                </div>
              ) : (
                <div
                  ref={setTableRef}
                  className="w-full"
                />
              )}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-4 h-full">
              <div className="text-center py-8 text-gray-400">
                <p className="text-xl">Gantt View Coming Soon</p>
                <p className="mt-2">This feature is under development</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedLayout;