import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHierarchy } from '../context/HierarchyContext';
import type { Task, Project } from '../db/TaskDatabase';

const TaskForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    tasks, 
    projects, 
    addTask, 
    updateTask, 
    selectedProject 
  } = useHierarchy();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState(3);
  const [urgency, setUrgency] = useState(3);
  const [weekOf, setWeekOf] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Planned' | 'In Progress' | 'Done'>('Planned');
  const [notes, setNotes] = useState('');
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [dependencies, setDependencies] = useState<number[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form with task data if editing
  useEffect(() => {
    if (id) {
      const taskId = parseInt(id);
      const task = tasks.find(t => t.id === taskId);
      
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setImpact(task.impact);
        setUrgency(task.urgency);
        setWeekOf(task.weekOf);
        setStatus(task.status);
        setNotes(task.notes || '');
        setProjectId(task.projectId);
        setDependencies(task.dependencies || []);
        setIsEditing(true);
      }
    } else if (selectedProject) {
      // If creating a new task and a project is selected, use that project
      setProjectId(selectedProject.id);
    }
  }, [id, tasks, selectedProject]);

  // Update available tasks for dependencies when projectId changes
  useEffect(() => {
    if (projectId) {
      // Get all tasks from the same project except the current task
      const projectTasks = tasks.filter(t => 
        t.projectId === projectId && 
        (!id || t.id !== parseInt(id))
      );
      setAvailableTasks(projectTasks);
    } else {
      setAvailableTasks([]);
    }
  }, [projectId, tasks, id]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId) {
      alert('Please select a project');
      return;
    }
    
    const taskData: Omit<Task, 'id'> = {
      projectId,
      title,
      description,
      impact,
      urgency,
      weekOf,
      status,
      notes,
      dependencies
    };
    
    try {
      if (isEditing && id) {
        await updateTask({ ...taskData, id: parseInt(id) });
      } else {
        await addTask(taskData);
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  // Handle dependency toggle
  const toggleDependency = (taskId: number) => {
    setDependencies(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  // Get project options
  const projectOptions = projects.map(project => (
    <option key={project.id} value={project.id}>
      {project.title}
    </option>
  ));

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-6">
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Selection */}
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-300 mb-1">
                Project
              </label>
              <div className="flex space-x-2">
                <select
                  id="project"
                  value={projectId}
                  onChange={e => setProjectId(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a project</option>
                  {projectOptions}
                </select>
                <button
                  type="button"
                  onClick={() => navigate('/project/new')}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  New Project
                </button>
              </div>
              {projects.length === 0 && (
                <p className="mt-2 text-yellow-500 text-sm">
                  No projects available. Please create a new project first.
                </p>
              )}
            </div>
            
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Impact and Urgency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="impact" className="block text-sm font-medium text-gray-300 mb-1">
                  Impact (1-5)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(value => (
                    <button
                      key={value}
                      type="button"
                      className={`w-10 h-10 flex items-center justify-center rounded-full ${
                        impact === value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => setImpact(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-300 mb-1">
                  Urgency (1-5)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(value => (
                    <button
                      key={value}
                      type="button"
                      className={`w-10 h-10 flex items-center justify-center rounded-full ${
                        urgency === value
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => setUrgency(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Week Of and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="weekOf" className="block text-sm font-medium text-gray-300 mb-1">
                  Week Of
                </label>
                <input
                  type="date"
                  id="weekOf"
                  value={weekOf}
                  onChange={e => setWeekOf(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={e => setStatus(e.target.value as 'Planned' | 'In Progress' | 'Done')}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>
            
            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Dependencies */}
            {availableTasks.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Dependencies
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-gray-700 rounded-md">
                  {availableTasks.map(task => (
                    <div key={task.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`dependency-${task.id}`}
                        checked={dependencies.includes(task.id as number)}
                        onChange={() => toggleDependency(task.id as number)}
                        className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`dependency-${task.id}`}
                        className="ml-2 text-sm text-gray-300"
                      >
                        {task.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {isEditing ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;