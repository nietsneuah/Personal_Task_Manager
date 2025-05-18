import React from 'react';
import { useHierarchy } from '../../context/HierarchyContext';

interface TopBarProps {
  className?: string;
  onAddTask?: () => void;
  onAddProject?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ className = '', onAddTask, onAddProject }) => {
  const { 
    selectedCategory, 
    selectedDivision, 
    selectedTenant, 
    selectedProject 
  } = useHierarchy();

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

  return (
    <div className={`bg-gray-800 border-b border-gray-700 px-6 py-4 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">Hierarchical Task Manager</h1>
          <div className="hidden md:block text-lg ml-6">
            {generateBreadcrumb()}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Add Task Button */}
          <button
            onClick={onAddTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Task
          </button>
          
          {/* Add Project Button */}
          <button
            onClick={onAddProject}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Project
          </button>
          
          {/* User Menu (placeholder) */}
          <div className="relative">
            <button className="flex items-center text-gray-300 hover:text-white">
              <span className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Breadcrumb */}
      <div className="md:hidden mt-2">
        {generateBreadcrumb()}
      </div>
    </div>
  );
};

export default TopBar;