import React, { useState } from 'react';
import { useHierarchy } from '../../context/HierarchyContext';

interface SidebarNavProps {
  className?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ className = '' }) => {
  const {
    categories,
    tenants,
    selectedCategory,
    selectedDivision,
    selectedTenant,
    selectedProject,
    selectCategory,
    selectDivision,
    selectTenant,
    selectProject,
    getDivisionsForCategory,
    getProjectsForDivisionAndTenant,
    addProject
  } = useHierarchy();

  // State to track expanded items
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [expandedDivisions, setExpandedDivisions] = useState<Record<number, boolean>>({});
  const [expandedTenants, setExpandedTenants] = useState<Record<number, boolean>>({});

  // Toggle expanded state for a category
  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
    
    // If expanding, select the category
    if (!expandedCategories[categoryId]) {
      selectCategory(categoryId);
    }
  };

  // Toggle expanded state for a division
  const toggleDivision = (divisionId: number) => {
    setExpandedDivisions(prev => ({
      ...prev,
      [divisionId]: !prev[divisionId]
    }));
    
    // If expanding, select the division
    if (!expandedDivisions[divisionId]) {
      selectDivision(divisionId);
    }
  };

  // Toggle expanded state for a tenant
  const toggleTenant = (tenantId: number) => {
    setExpandedTenants(prev => ({
      ...prev,
      [tenantId]: !prev[tenantId]
    }));
    
    // If expanding, select the tenant
    if (!expandedTenants[tenantId]) {
      selectTenant(tenantId);
    }
  };

  // Handle adding a new project
  const handleAddProject = (divisionId: number, tenantId: number) => {
    const newProject = {
      divisionId,
      tenantId,
      title: 'New Project',
      description: 'Project description',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Planned' as const,
      priority: 3
    };
    
    addProject(newProject);
  };

  return (
    <div className={`bg-gray-800 text-white p-4 h-full overflow-y-auto ${className}`}>
      <h2 className="text-xl font-bold mb-4 text-blue-300">Navigation</h2>
      
      <ul className="space-y-2">
        {categories.map(category => {
          const isExpanded = expandedCategories[category.id as number];
          const isSelected = selectedCategory?.id === category.id;
          const categoryDivisions = getDivisionsForCategory(category.id as number);
          
          return (
            <li key={category.id} className="mb-2">
              {/* Category Item */}
              <div 
                className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-700 ${
                  isSelected ? 'bg-gray-700 font-semibold' : ''
                }`}
                onClick={() => toggleCategory(category.id as number)}
              >
                <span className="mr-2">
                  {isExpanded ? (
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
              {isExpanded && (
                <ul className="ml-6 mt-1 space-y-1">
                  {categoryDivisions.map(division => {
                    const isDivisionExpanded = expandedDivisions[division.id as number];
                    const isDivisionSelected = selectedDivision?.id === division.id;
                    
                    return (
                      <li key={division.id}>
                        {/* Division Item */}
                        <div 
                          className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-700 ${
                            isDivisionSelected ? 'bg-gray-700 font-semibold' : ''
                          }`}
                          onClick={() => toggleDivision(division.id as number)}
                        >
                          <span className="mr-2">
                            {isDivisionExpanded ? (
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
                        {isDivisionExpanded && (
                          <ul className="ml-6 mt-1 space-y-1">
                            {tenants.map(tenant => {
                              const isTenantExpanded = expandedTenants[tenant.id as number];
                              const isTenantSelected = selectedTenant?.id === tenant.id;
                              const tenantProjects = getProjectsForDivisionAndTenant(
                                division.id as number, 
                                tenant.id as number
                              );
                              
                              return (
                                <li key={tenant.id}>
                                  {/* Tenant Item */}
                                  <div 
                                    className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-700 ${
                                      isTenantSelected ? 'bg-gray-700 font-semibold' : ''
                                    }`}
                                    onClick={() => toggleTenant(tenant.id as number)}
                                  >
                                    <span className="mr-2">
                                      {isTenantExpanded ? (
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
                                  {isTenantExpanded && (
                                    <ul className="ml-6 mt-1 space-y-1">
                                      {tenantProjects.map(project => {
                                        const isProjectSelected = selectedProject?.id === project.id;
                                        
                                        return (
                                          <li key={project.id}>
                                            <div 
                                              className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-700 ${
                                                isProjectSelected ? 'bg-gray-700 font-semibold' : ''
                                              }`}
                                              onClick={() => selectProject(project.id as number)}
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
                                      
                                      {/* Add Project Button */}
                                      <li>
                                        <div 
                                          className="flex items-center p-2 rounded cursor-pointer text-blue-300 hover:bg-gray-700"
                                          onClick={() => handleAddProject(division.id as number, tenant.id as number)}
                                        >
                                          <span className="mr-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                          </span>
                                          <span>Add Project</span>
                                        </div>
                                      </li>
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
  );
};

export default SidebarNav;