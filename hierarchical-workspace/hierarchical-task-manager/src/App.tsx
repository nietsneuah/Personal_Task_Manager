import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HierarchyProvider } from './context/HierarchyContext';
import HierarchicalLayout from './components/layout/HierarchicalLayout';
import TaskForm from './components/TaskForm';
import ProjectForm from './components/ProjectForm';
import { db } from './db/TaskDatabase';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the database with sample data if empty
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Check if the database is empty
        const categoryCount = await db.categories.count();
        
        if (categoryCount === 0) {
          console.log('Initializing database with sample data...');
          await db.initializeWithSampleData();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing database:', error);
        setIsInitialized(true); // Set to true anyway to show the app
      }
    };

    initializeDatabase();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <HierarchyProvider>
      <Routes>
        <Route path="/" element={<HierarchicalLayout />} />
        <Route path="/task/new" element={<TaskForm />} />
        <Route path="/task/:id" element={<TaskForm />} />
        <Route path="/project/new" element={<ProjectForm />} />
        <Route path="/project/:id" element={<ProjectForm />} />
      </Routes>
    </HierarchyProvider>
  );
}

export default App;