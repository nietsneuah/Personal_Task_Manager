import React from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNav from '../navigation/SidebarNav';
import TopBar from '../navigation/TopBar';
import MainView from '../views/MainView';

const HierarchicalLayout: React.FC = () => {
  const navigate = useNavigate();
  
  const handleAddTask = () => {
    navigate('/task/new');
  };
  
  const handleAddProject = () => {
    navigate('/project/new');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Bar */}
      <TopBar
        onAddTask={handleAddTask}
        onAddProject={handleAddProject}
        className="sticky top-0 z-10"
      />
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SidebarNav className="w-64 min-w-64 overflow-y-auto" />
        
        {/* Main View */}
        <div className="flex-1 overflow-y-auto p-4">
          <MainView />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">
            Hierarchical Task Manager &copy; {new Date().getFullYear()} - Built with React, Tailwind, Dexie
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HierarchicalLayout;