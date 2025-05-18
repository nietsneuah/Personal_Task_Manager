import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { db } from './db/priorityDB';
import { enhancedDb } from './db/enhancedPriorityDB';
import { HierarchyProvider } from './context/HierarchyContext';
import TaskForm from './components/TaskForm';
import HierarchicalTaskForm from './components/hierarchical/HierarchicalTaskForm';
import HierarchicalTaskManager from './components/HierarchicalTaskManager';
import TestComponent from './components/TestComponent';
import SummaryCards from './components/SummaryCards';
import SidebarNav from './components/hierarchical/SidebarNav';
import TopBar from './components/hierarchical/TopBar';
import MainView from './components/hierarchical/MainView';
import './App.css';

// Legacy layout component (for backward compatibility)
const LegacyLayout = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'summary'>('tasks');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Refresh the data when returning from the task form
  useEffect(() => {
    // Check if we're returning from the task form page
    if (location.state && location.state.refresh) {
      setRefreshTrigger(prev => prev + 1);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Priority Tracker</h1>
            <p className="text-blue-100 text-sm">Organize. Prioritize. Accomplish.</p>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Navigation Bar */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900 rounded-lg p-4 flex items-center space-x-4">
            {/* Tasks Button */}
            <button
              onClick={() => setActiveTab('tasks')}
              className={`p-3 rounded-lg ${
                activeTab === 'tasks' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              Tasks
            </button>
            
            {/* Summary Button */}
            <button
              onClick={() => setActiveTab('summary')}
              className={`p-3 rounded-lg ${
                activeTab === 'summary' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              Summary
            </button>
            
            {/* Add Button */}
            <button
              onClick={() => navigate('/task/new')}
              className="p-3 rounded-lg text-gray-300 hover:bg-gray-800"
            >
              Add
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="transition-opacity duration-300">
          {activeTab === 'tasks' ? (
            <div className="text-center py-8">
              <p className="text-xl">Legacy Task View</p>
              <p className="mt-2">Please use the new hierarchical view</p>
              <button
                onClick={() => navigate('/hierarchical')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Go to Hierarchical View
              </button>
            </div>
          ) : (
            <SummaryCards key={refreshTrigger} />
          )}
        </div>
      </main>
      
      <footer className="bg-white shadow-inner mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Priority Tracker &copy; {new Date().getFullYear()} - Built with React, Tailwind, Dexie
          </p>
        </div>
      </footer>
    </div>
  );
};

// Hierarchical layout component
const HierarchicalLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Bar */}
      <TopBar className="sticky top-0 z-10" />
      
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
            Priority Tracker &copy; {new Date().getFullYear()} - Built with React, Tailwind, Dexie
          </p>
        </div>
      </footer>
    </div>
  );
};

// Initialize the databases with sample data if empty
const initializeDatabases = async () => {
  // Initialize legacy database
  const legacyCount = await db.tasks.count();
  
  if (legacyCount === 0) {
    // Add sample tasks if the database is empty
    const sampleTasks = [
      {
        title: 'Implement user authentication',
        category: 'Primary' as const,
        impact: 5,
        urgency: 4,
        tenant: 'Core',
        status: 'In Progress' as const,
        weekOf: new Date().toISOString().split('T')[0],
        notes: 'Need to integrate with OAuth provider'
      },
      {
        title: 'Design system architecture',
        category: 'Strategic' as const,
        impact: 5,
        urgency: 3,
        tenant: 'Platform',
        status: 'Planned' as const,
        weekOf: new Date().toISOString().split('T')[0],
        notes: 'Focus on scalability and performance'
      },
      {
        title: 'Weekly team meeting',
        category: 'Ongoing' as const,
        impact: 2,
        urgency: 2,
        tenant: 'Team',
        status: 'Done' as const,
        weekOf: new Date().toISOString().split('T')[0],
        notes: 'Discuss project progress and blockers'
      }
    ];
    
    await db.tasks.bulkAdd(sampleTasks);
  }
  
  // Initialize enhanced database with sample projects
  const projectCount = await enhancedDb.projects.count();
  
  if (projectCount === 0) {
    // Get the divisions and tenants
    const divisions = await enhancedDb.divisions.toArray();
    const tenants = await enhancedDb.tenants.toArray();
    
    if (divisions.length > 0 && tenants.length > 0) {
      // Get division IDs (ensuring they're not undefined)
      const codingDivisionId = divisions.find(d => d.name === 'Coding')?.id ?? divisions[0].id as number;
      const marketingDivisionId = divisions.find(d => d.name === 'Marketing')?.id ?? divisions[0].id as number;
      const generalDivisionId = divisions.find(d => d.name === 'General')?.id ?? divisions[0].id as number;
      
      // Get tenant IDs (ensuring they're not undefined)
      const fmRugTenantId = tenants.find(t => t.name === 'FM Rug')?.id ?? tenants[0].id as number;
      const widmersTenantId = tenants.find(t => t.name === 'Widmers')?.id ?? tenants[0].id as number;
      const arslanianTenantId = tenants.find(t => t.name === 'Arslanian')?.id ?? tenants[0].id as number;
      
      // Sample projects with proper typing
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
      const projectIds = await enhancedDb.projects.bulkAdd(sampleProjects, { allKeys: true });
      
      // Sample tasks for each project with proper typing
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
      const taskIds = await enhancedDb.tasks.bulkAdd(sampleTasks, { allKeys: true });
      
      // Update dependencies
      await enhancedDb.tasks.update(taskIds[1] as number, {
        dependencies: [taskIds[0] as number]
      });
    }
  }
};

// Main App component with routing
function App() {
  useEffect(() => {
    initializeDatabases();
  }, []);

  return (
    <Router>
      <HierarchyProvider>
        <Routes>
          <Route path="/" element={<HierarchicalTaskManager />} />
          <Route path="/test" element={<TestComponent />} />
          <Route path="/task/new" element={<TaskForm />} />
          <Route path="/task/:id" element={<TaskForm />} />
          <Route path="/hierarchical/task/new" element={<HierarchicalTaskForm />} />
          <Route path="/hierarchical/task/:id" element={<HierarchicalTaskForm />} />
        </Routes>
      </HierarchyProvider>
    </Router>
  );
}

export default App;
