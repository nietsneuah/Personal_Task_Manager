import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db/priorityDB';
import type { PriorityTask } from '../db/priorityDB';

const TaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const taskId = id ? parseInt(id) : undefined;
  
  const initialTask: PriorityTask = {
    title: '',
    category: 'Primary',
    impact: 1,
    urgency: 1,
    tenant: '',
    status: 'Planned',
    weekOf: new Date().toISOString().split('T')[0],
    notes: ''
  };

  const [task, setTask] = useState<PriorityTask>(initialTask);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const loadTask = async () => {
      if (taskId) {
        setIsLoading(true);
        try {
          const existingTask = await db.tasks.get(taskId);
          if (existingTask) {
            setTask(existingTask);
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
        setTask(initialTask);
      }
    };

    loadTask();
  }, [taskId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask(prev => ({
      ...prev,
      [name]: name === 'impact' || name === 'urgency' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    
    try {
      if (!task.title.trim()) {
        throw new Error('Title is required');
      }
      
      if (!task.tenant.trim()) {
        throw new Error('Tenant is required');
      }
      
      if (taskId) {
        await db.tasks.update(taskId, task);
      } else {
        await db.tasks.add(task);
      }
      
      // Navigate back to the main page with refresh state
      navigate('/', { state: { refresh: true } });
    } catch (error) {
      console.error('Error saving task:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to save task. Please try again.');
      setIsLoading(false);
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
              onClick={() => navigate('/')}
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
                value={task.title}
                onChange={handleChange}
                className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                placeholder="Enter task title"
                required
              />
            </div>
            
            {/* Category and Tenant Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-xl font-medium text-gray-700 mb-3">Category</label>
                <select
                  name="category"
                  value={task.category}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                >
                  <option value="Primary">Primary</option>
                  <option value="Strategic">Strategic</option>
                  <option value="Ongoing">Ongoing</option>
                </select>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-xl font-medium text-gray-700 mb-3">Tenant</label>
                <input
                  type="text"
                  name="tenant"
                  value={task.tenant}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="Enter tenant name"
                  required
                />
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
                    {'⭐'.repeat(task.impact)}
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
                    {'🔥'.repeat(task.urgency)}
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
                  value={task.status}
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
                  value={task.weekOf}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  required
                />
              </div>
            </div>
            
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
                onClick={() => navigate('/')}
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

export default TaskForm;