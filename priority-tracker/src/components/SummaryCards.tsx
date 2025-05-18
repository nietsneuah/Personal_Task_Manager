import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { db } from '../db/priorityDB';
import type { PriorityTask } from '../db/priorityDB';
import type { ApexOptions } from 'apexcharts';

const SummaryCards = () => {
  const [tasks, setTasks] = useState<PriorityTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const allTasks = await db.tasks.toArray();
        setTasks(allTasks);
      } catch (error) {
        console.error('Error loading tasks for summary:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Done').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
  const plannedTasks = tasks.filter(task => task.status === 'Planned').length;

  // Group by category
  const primaryTasks = tasks.filter(task => task.category === 'Primary').length;
  const strategicTasks = tasks.filter(task => task.category === 'Strategic').length;
  const ongoingTasks = tasks.filter(task => task.category === 'Ongoing').length;

  // Calculate completion percentage
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  // Chart options for status distribution
  const statusChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'transparent',
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    labels: ['Planned', 'In Progress', 'Done'],
    colors: ['#94a3b8', '#fbbf24', '#22c55e'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '55%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '16px',
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: number) {
        return val.toFixed(1) + '%';
      },
      style: {
        fontSize: '14px',
      },
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 280,
          height: 300,
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const statusChartSeries = [plannedTasks, inProgressTasks, completedTasks];

  // Chart options for category distribution
  const categoryChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'transparent',
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    labels: ['Primary', 'Strategic', 'Ongoing'],
    colors: ['#3b82f6', '#8b5cf6', '#10b981'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '55%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '16px',
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: number) {
        return val.toFixed(1) + '%';
      },
      style: {
        fontSize: '14px',
      },
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 280,
          height: 300,
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const categoryChartSeries = [primaryTasks, strategicTasks, ongoingTasks];

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Project Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 transform transition-transform hover:scale-105">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Tasks</h3>
          <p className="text-3xl font-bold text-blue-600">{totalTasks}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 transform transition-transform hover:scale-105">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Completion</h3>
          <div className="flex items-center">
            <p className="text-3xl font-bold text-green-600">{completionPercentage}%</p>
            <div className="ml-4 w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 transform transition-transform hover:scale-105">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-yellow-500">{inProgressTasks}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 transform transition-transform hover:scale-105">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Planned</h3>
          <p className="text-3xl font-bold text-gray-500">{plannedTasks}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Status Distribution</h3>
          {totalTasks > 0 ? (
            <Chart 
              options={statusChartOptions} 
              series={statusChartSeries} 
              type="donut" 
              height={350} 
            />
          ) : (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
              <p className="text-center text-gray-500">No tasks available</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Category Distribution</h3>
          {totalTasks > 0 ? (
            <Chart 
              options={categoryChartOptions} 
              series={categoryChartSeries} 
              type="donut" 
              height={350} 
            />
          ) : (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
              <p className="text-center text-gray-500">No tasks available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;