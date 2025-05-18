import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TabulatorFull } from 'tabulator-tables';
import type { CellComponent, RowComponent } from 'tabulator-tables';
import { enhancedDb } from '../db/enhancedPriorityDB';
import { useHierarchy } from '../context/HierarchyContext';
import SidebarNav from './hierarchical/SidebarNav';
import 'tabulator-tables/dist/css/tabulator.min.css';

interface FilterState {
  status?: string[];
  impact?: number[];
  urgency?: number[];
}

const HierarchicalTaskManager = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tableRef = useRef<HTMLDivElement>(null);
  const [table, setTable] = useState<TabulatorFull | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    tasks,
    projects,
    divisions,
    selectedCategory,
    selectedDivision,
    selectedTenant,
    selectedProject,
    refreshData
  } = useHierarchy();

  // Refresh the data when returning from the task form
  useEffect(() => {
    if (location.state && location.state.refresh) {
      refreshData();
    }
  }, [location, refreshData]);

  // Function to get filtered tasks
  const getFilteredTasks = () => {
    let filteredTasks = [...tasks];
    
    // Filter by category, division, tenant, project
    if (selectedProject) {
      filteredTasks = filteredTasks.filter(task => task.projectId === selectedProject.id);
    } else if (selectedDivision && selectedTenant) {
      filteredTasks = filteredTasks.filter(task => {
        const project = projects.find(p => p.id === task.projectId);
        return project && project.divisionId === selectedDivision.id && project.tenantId === selectedTenant.id;
      });
    } else if (selectedDivision) {
      filteredTasks = filteredTasks.filter(task => {
        const project = projects.find(p => p.id === task.projectId);
        return project && project.divisionId === selectedDivision.id;
      });
    } else if (selectedTenant) {
      filteredTasks = filteredTasks.filter(task => {
        const project = projects.find(p => p.id === task.projectId);
        return project && project.tenantId === selectedTenant.id;
      });
    } else if (selectedCategory) {
      filteredTasks = filteredTasks.filter(task => {
        const project = projects.find(p => p.id === task.projectId);
        const division = project ? divisions.find(d => d.id === project.divisionId) : null;
        return division && division.categoryId === selectedCategory.id;
      });
    }
    
    // Apply filters
    if (filters.status && filters.status.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.status!.includes(task.status));
    }
    
    if (filters.impact && filters.impact.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.impact!.includes(task.impact));
    }
    
    if (filters.urgency && filters.urgency.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.urgency!.includes(task.urgency));
    }
    
    return filteredTasks;
  };

  // Initialize the table when the tableRef is set or when relevant data changes
  useEffect(() => {
    if (tableRef && tableRef.current && tasks.length > 0) {
      const filteredData = getFilteredTasks();
      
      if (table) {
        // Update data in existing table
        table.replaceData(filteredData);
      } else {
        const newTable = new TabulatorFull(tableRef.current, {
          data: filteredData,
          layout: "fitColumns",
          columns: [
            { title: "ID", field: "id", sorter: "number", width: 60 },
            { title: "Title", field: "title", sorter: "string", width: 200 },
            { 
              title: "Description", 
              field: "description", 
              sorter: "string", 
              formatter: function(cell: CellComponent) {
                const value = cell.getValue() as string | undefined;
                return value || '';
              },
              width: 300 
            },
            { title: "Status", field: "status", sorter: "string", width: 120 },
            { 
              title: "Priority", 
              field: "priority", 
              sorter: "number", 
              formatter: function(cell: CellComponent) {
                const value = cell.getValue() as number | undefined;
                return value !== undefined ? value.toFixed(1) : '';
              },
              width: 100 
            },
            { title: "Due Date", field: "dueDate", sorter: "date", width: 120 },
            { title: "Impact", field: "impact", sorter: "number", width: 100 },
            { title: "Urgency", field: "urgency", sorter: "number", width: 100 },
            {
              title: "Actions",
              formatter: function() {
                return `<div class="action-buttons">
                  <button class="edit-button">Edit</button>
                  <button class="delete-button">Delete</button>
                </div>`;
              },
              width: 150,
              hozAlign: "center",
              cellClick: function(e: MouseEvent, cell: CellComponent) {
                const target = e.target as HTMLElement;
                const taskId = cell.getRow().getData().id;
                
                if (target.classList.contains('edit-button')) {
                  navigate(`/edit/${taskId}`);
                } else if (target.classList.contains('delete-button')) {
                  if (confirm('Are you sure you want to delete this task?')) {
                    enhancedDb.tasks.delete(taskId).then(() => {
                      refreshData();
                    });
                  }
                }
              }
            }
          ],
          rowClick: function(e: MouseEvent, row: RowComponent) {
            // Prevent row click when clicking on action buttons
            if (!(e.target as HTMLElement).closest('.action-buttons')) {
              const taskId = row.getData().id;
              navigate(`/view/${taskId}`);
            }
          }
        });
        
        setTable(newTable);
      }
    }
  }, [tasks, selectedCategory, selectedDivision, selectedTenant, selectedProject, filters, navigate, refreshData]);

  return (
    <div className="hierarchical-manager">
      <h1 className="text-4xl font-bold text-center my-6">Hierarchical Task Manager</h1>
      
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center"
          onClick={() => setShowFilters(!showFilters)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          Filters
        </button>
        
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
          onClick={() => navigate('/add')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Task
        </button>
      </div>
      
      <div className="flex">
        <SidebarNav className="w-64" />
        
        <div className="flex-1 ml-4">
          <div ref={tableRef} className="task-table"></div>
        </div>
      </div>
    </div>
  );
};

export default HierarchicalTaskManager;