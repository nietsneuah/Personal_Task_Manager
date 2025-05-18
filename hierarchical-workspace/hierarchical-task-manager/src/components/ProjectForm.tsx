import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHierarchy } from '../context/HierarchyContext';
import type { Project } from '../db/TaskDatabase';

const ProjectForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    divisions, 
    tenants, 
    addProject, 
    updateProject,
    projects
  } = useHierarchy();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<'Planned' | 'In Progress' | 'Done'>('Planned');
  const [priority, setPriority] = useState(3);
  const [divisionId, setDivisionId] = useState<number | undefined>(undefined);
  const [tenantId, setTenantId] = useState<number | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form with project data if editing
  useEffect(() => {
    if (id) {
      const projectId = parseInt(id);
      const project = projects.find(p => p.id === projectId);
      
      if (project) {
        setTitle(project.title);
        setDescription(project.description || '');
        setStartDate(project.startDate || new Date().toISOString().split('T')[0]);
        setDueDate(project.dueDate || '');
        setStatus(project.status);
        setPriority(project.priority);
        setDivisionId(project.divisionId);
        setTenantId(project.tenantId);
        setIsEditing(true);
      }
    }
  }, [id, projects]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!divisionId || !tenantId) {
      alert('Please select a division and tenant');
      return;
    }
    
    const projectData: Omit<Project, 'id'> = {
      divisionId,
      tenantId,
      title,
      description,
      startDate,
      dueDate,
      status,
      priority
    };
    
    try {
      if (isEditing && id) {
        await updateProject({ ...projectData, id: parseInt(id) });
      } else {
        await addProject(projectData);
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  // Get division options
  const divisionOptions = divisions.map(division => (
    <option key={division.id} value={division.id}>
      {division.name}
    </option>
  ));

  // Get tenant options
  const tenantOptions = tenants.map(tenant => (
    <option key={tenant.id} value={tenant.id}>
      {tenant.name}
    </option>
  ));

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-6">
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Division Selection */}
            <div>
              <label htmlFor="division" className="block text-sm font-medium text-gray-300 mb-1">
                Division
              </label>
              <select
                id="division"
                value={divisionId}
                onChange={e => setDivisionId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a division</option>
                {divisionOptions}
              </select>
            </div>
            
            {/* Tenant Selection */}
            <div>
              <label htmlFor="tenant" className="block text-sm font-medium text-gray-300 mb-1">
                Tenant
              </label>
              <select
                id="tenant"
                value={tenantId}
                onChange={e => setTenantId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a tenant</option>
                {tenantOptions}
              </select>
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
            
            {/* Start Date and Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            {/* Status and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">
                  Priority (1-5)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(value => (
                    <button
                      key={value}
                      type="button"
                      className={`w-10 h-10 flex items-center justify-center rounded-full ${
                        priority === value
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => setPriority(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
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
                {isEditing ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;