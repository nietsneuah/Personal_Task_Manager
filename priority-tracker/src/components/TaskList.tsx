import { useEffect, useRef, useState } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator.min.css';
// Import the dark theme CSS
import 'tabulator-tables/dist/css/tabulator_midnight.min.css';
import { db } from '../db/priorityDB';
import type { PriorityTask } from '../db/priorityDB';

interface TaskListProps {
  onEditTask?: (id: number) => void;
}

const TaskList = ({ onEditTask }: TaskListProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<PriorityTask[]>([]);
  
  useEffect(() => {
    const loadTasks = async () => {
      const allTasks = await db.tasks.toArray();
      setTasks(allTasks);
    };
    
    loadTasks();
  }, []);
  
  useEffect(() => {
    if (tableRef.current && tasks) {
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
        
        /* Ensure proper contrast for category badges */
        .category-primary {
          background-color: #2563eb !important;
          color: white !important;
        }
        
        .category-strategic {
          background-color: #9333ea !important;
          color: white !important;
        }
        
        .category-ongoing {
          background-color: #16a34a !important;
          color: white !important;
        }
        
        /* Status badges with better contrast */
        .status-planned {
          background-color: #4b5563 !important;
          color: white !important;
        }
        
        .status-in-progress {
          background-color: #d97706 !important;
          color: white !important;
        }
        
        .status-done {
          background-color: #16a34a !important;
          color: white !important;
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
      const table = new Tabulator(tableRef.current, {
        data: tasks,
        layout: 'fitDataStretch',
        responsiveLayout: 'collapse',
        pagination: 'local',
        paginationSize: 10,
        height: '70vh',
        // Set the theme to midnight (dark theme)
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
            title: 'Category', 
            field: 'category', 
            sorter: 'string',
            width: 120,
            responsive: 0,
            formatter: (cell) => {
              const value = cell.getValue() as string;
              let className = '';
              
              switch(value) {
                case 'Primary':
                  className = 'category-primary';
                  break;
                case 'Strategic':
                  className = 'category-strategic';
                  break;
                case 'Ongoing':
                  className = 'category-ongoing';
                  break;
              }
              
              return `<span class="px-2 py-1 rounded-full text-xs font-medium ${className}">${value}</span>`;
            }
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
            title: 'Tenant', 
            field: 'tenant', 
            sorter: 'string',
            width: 120
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
              
              return `<span class="px-2 py-1 rounded-full text-xs font-medium ${className}">${value}</span>`;
            }
          },
          { 
            title: 'Week Of', 
            field: 'weekOf', 
            sorter: 'date',
            width: 120
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
              const data = row.getData() as Record<string, unknown>;
              const id = data.id as number;
              
              if (target.classList.contains('edit-btn')) {
                console.log('Edit task', id);
                if (onEditTask) {
                  onEditTask(id);
                }
              } else if (target.classList.contains('delete-btn')) {
                console.log('Delete task', id);
                // Implement delete functionality
                if (confirm('Are you sure you want to delete this task?')) {
                  db.tasks.delete(id).then(() => {
                    row.delete();
                  });
                }
              }
            }
          }
        ]
      });
      
      // Add window resize event listener to adjust table
      const handleResize = () => {
        table.redraw(true);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        table.destroy();
        document.head.removeChild(style); // Clean up the style element
      };
    }
  }, [tasks, onEditTask]);
  
  return (
    <div className="w-full overflow-x-auto bg-gray-900 rounded-lg shadow p-4">
      <h2 className="text-2xl font-bold mb-4 text-white">Task List</h2>
      <div ref={tableRef} className="w-full"></div>
    </div>
  );
};

export default TaskList;