import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHierarchy } from '../../context/HierarchyContext';
import FilterBar from '../filters/FilterBar';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
import 'tabulator-tables/dist/css/tabulator_midnight.min.css';
import type { Task } from '../../db/TaskDatabase';

interface MainViewProps {
  className?: string;
}

const MainView: React.FC<MainViewProps> = ({ className = '' }) => {
  const {
    selectedCategory,
    selectedDivision,
    selectedTenant,
    selectedProject,
    tasks,
    filters,
    getTasksForProject,
    deleteTask
  } = useHierarchy();

  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [tableRef, setTableRef] = useState<HTMLDivElement | null>(null);
  const [table, setTable] = useState<Tabulator | null>(null);
  const tableInstance = useRef<Tabulator | null>(null);

  // Apply filters to tasks
  useEffect(() => {
    let result = [...tasks];

    // Filter by project if selected
    if (selectedProject) {
      result = getTasksForProject(selectedProject.id as number);
    }

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      result = result.filter(task => filters.status?.includes(task.status));
    }

    // Apply impact filter
    if (filters.impact && filters.impact.length > 0) {
      result = result.filter(task => filters.impact?.includes(task.impact));
    }

    // Apply urgency filter
    if (filters.urgency && filters.urgency.length > 0) {
      result = result.filter(task => filters.urgency?.includes(task.urgency));
    }

    // Apply due date filter
    if (filters.dueDate) {
      const filterDate = new Date(filters.dueDate);
      result = result.filter(task => {
        const taskDate = new Date(task.weekOf);
        return taskDate <= filterDate;
      });
    }

    setFilteredTasks(result);
  }, [selectedProject, tasks, filters, getTasksForProject]);

  // Initialize and update the table when filtered tasks change
  useEffect(() => {
    if (tableRef && filteredTasks.length > 0) {
      // Add CSS for text wrapping and dark theme customizations
      const style = document.createElement('style');
      style.textContent = `
        .cell-wrap {
          white-space: normal !important;
          word-break: break-word !important;
        }
        
        /* Custom dark theme adjustments */
        .tabulator-row {
          border-bottom: 1px solid #444 !important;
        }
        
        .tabulator-row.tabulator-selectable:hover {
          background-color: #3a3a3a !important;
        }
        
        /* Status badges with better contrast */
        .status-planned {
          background-color: #4b5563 !important;
          color: white !important;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-in-progress {
          background-color: #d97706 !important;
          color: white !important;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-done {
          background-color: #16a34a !important;
          color: white !important;
          padding: 2px 8px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        /* Action buttons with better visibility */
        .edit-btn, .delete-btn {
          background-color: #374151;
          border-radius: 4px;
          padding: 4px 8px;
          margin: 0 2px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .edit-btn:hover, .delete-btn:hover {
          background-color: #4b5563;
        }
      `;
      document.head.appendChild(style);

      // Define table
      const newTable = new Tabulator(tableRef, {
        data: filteredTasks,
        layout: 'fitDataStretch',
        responsiveLayout: 'collapse',
        pagination: 'local',
        paginationSize: 10,
        height: '70vh',
        theme: 'midnight',
        columns: [
          { 
            title: 'Title', 
            field: 'title', 
            sorter: 'string', 
            width: 200,
            responsive: 0,
            formatter: (cell) => {
              const value = cell.getValue() as string;
              return `<div class="cell-wrap">${value}</div>`;
            },
            variableHeight: true,
            headerWordWrap: true
          },
          { 
            title: 'Impact', 
            field: 'impact', 
            sorter: 'number',
            width: 100,
            hozAlign: 'center',
            formatter: (cell) => {
              const value = cell.getValue() as number;
              return '⭐'.repeat(value || 0);
            }
          },
          { 
            title: 'Urgency', 
            field: 'urgency', 
            sorter: 'number',
            width: 100,
            hozAlign: 'center',
            formatter: (cell) => {
              const value = cell.getValue() as number;
              return '🔥'.repeat(value || 0);
            }
          },
          { 
            title: 'Status', 
            field: 'status', 
            sorter: 'string',
            width: 120,
            formatter: (cell) => {
              const value = cell.getValue() as string;
              let className = '';
              
              switch(value) {
                case 'Planned':
                  className = 'status-planned';
                  break;
                case 'In Progress':
                  className = 'status-in-progress';
                  break;
                case 'Done':
                  className = 'status-done';
                  break;
              }
              
              return `<span class="${className}">${value}</span>`;
            }
          },
          { 
            title: 'Week Of', 
            field: 'weekOf', 
            sorter: 'date',
            width: 120
          },
          { 
            title: 'Dependencies', 
            field: 'dependencies',
            width: 150,
            formatter: (cell) => {
              const dependencies = cell.getValue() as number[] | undefined;
              if (!dependencies || dependencies.length === 0) {
                return '<span class="text-gray-500">None</span>';
              }
              return `<span class="text-blue-400">${dependencies.length} task(s)</span>`;
            }
          },
          { 
            title: 'Actions', 
            width: 100,
            hozAlign: 'center',
            formatter: function() {
              return '<div class="flex justify-center space-x-2"><button class="edit-btn">✏️</button><button class="delete-btn">🗑️</button></div>';
            },
            cellClick: function(e: MouseEvent, cell) {
              const target = e.target as HTMLElement;
              const row = cell.getRow();
              const data = row.getData() as Task;
              const id = data.id as number;
              
              if (target.classList.contains('edit-btn')) {
                navigate(`/task/${id}`);
              } else if (target.classList.contains('delete-btn')) {
                if (confirm('Are you sure you want to delete this task?')) {
                  deleteTask(id);
                }
              }
            }
          }
        ]
      });

      setTable(newTable);
      tableInstance.current = newTable;

      // Add window resize event listener to adjust table
      const handleResize = () => {
        newTable.redraw(true);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        newTable.destroy();
        document.head.removeChild(style);
        setTable(null);
        tableInstance.current = null;
      };
    }
  }, [tableRef, filteredTasks, navigate, deleteTask]);

  // Listen for filter-reset event
  useEffect(() => {
    const handleFilterReset = () => {
      try {
        if (tableInstance.current && tableRef && tableRef.current && document.body.contains(tableRef.current)) {
          // Check if the table element is still in the DOM
          const tableElement = tableInstance.current.getElement();
          if (tableElement && document.body.contains(tableElement)) {
            // Clear any table filters
            tableInstance.current.clearFilter(true);
            
            // Reset to first page
            tableInstance.current.setPage(1);
            
            // Update data instead of redrawing
            tableInstance.current.setData(filteredTasks);
            
            console.log('Table filters reset successfully');
          } else {
            console.log('Table element not found in DOM, skipping reset');
          }
        }
      } catch (error) {
        console.error('Error resetting table filters:', error);
      }
    };
    
    // Add event listener
    window.addEventListener('filter-reset', handleFilterReset);
    
    // Cleanup
    return () => {
      window.removeEventListener('filter-reset', handleFilterReset);
    };
  }, [filteredTasks]);

  return (
    <div className={`bg-gray-900 p-4 rounded-lg shadow-lg ${className}`}>
      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-md ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            List View
          </button>
          
          <button
            onClick={() => setViewMode('gantt')}
            className={`px-3 py-1 rounded-md ${
              viewMode === 'gantt'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } ${!selectedProject ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!selectedProject}
          >
            Gantt View
          </button>
        </div>
      </div>
      
      {/* Filter Bar */}
      <FilterBar className="mb-4" />
      
      {/* Task List or Gantt View */}
      {viewMode === 'list' ? (
        <div className="bg-gray-800 rounded-lg p-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-xl">No tasks found</p>
              <p className="mt-2">Try adjusting your filters or create a new task</p>
            </div>
          ) : (
            <div 
              ref={setTableRef}
              className="w-full"
            />
          )}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4 h-[70vh]">
          <div className="text-center py-8 text-gray-400">
            <p className="text-xl">Gantt View</p>
            <p className="mt-2">Coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainView;