import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHierarchy } from '../../context/HierarchyContext';

interface TopBarProps {
  className?: string;
}

const TopBar: React.FC<TopBarProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const {
    selectedCategory,
    selectedDivision,
    selectedTenant,
    selectedProject,
    filters
  } = useHierarchy();

  // Generate a summary of the current filters and selection
  const generateFilterSummary = () => {
    const parts = [];

    // Add hierarchy selection
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

    // Add filter information
    const filterParts = [];
    
    if (filters.status && filters.status.length > 0) {
      filterParts.push(`Status: ${filters.status.join(', ')}`);
    }
    
    if (filters.priority && filters.priority.length > 0) {
      filterParts.push(`Priority: ${filters.priority.join(', ')}`);
    }
    
    if (filters.impact && filters.impact.length > 0) {
      filterParts.push(`Impact: ${filters.impact.join(', ')}`);
    }
    
    if (filters.urgency && filters.urgency.length > 0) {
      filterParts.push(`Urgency: ${filters.urgency.join(', ')}`);
    }
    
    if (filters.dueDate) {
      filterParts.push(`Due: ${filters.dueDate}`);
    }

    // Combine all parts
    let summary = parts.join(' > ');
    
    if (filterParts.length > 0) {
      summary += ` | ${filterParts.join(' | ')}`;
    }

    return summary || 'All Tasks';
  };

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-md ${className}`}>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* App Title */}
        <div className="text-2xl font-bold mb-4 md:mb-0">
          Priority Tracker
        </div>
        
        {/* Filter Summary */}
        <div className="flex-grow mx-4 bg-blue-700 bg-opacity-50 rounded-lg px-4 py-2 text-sm md:text-base overflow-hidden overflow-ellipsis whitespace-nowrap">
          <span className="font-medium">Viewing: </span>
          {generateFilterSummary()}
        </div>
        
        {/* Add Task Button */}
        <button
          onClick={() => navigate('/hierarchical/task/new')}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>
    </div>
  );
};

export default TopBar;