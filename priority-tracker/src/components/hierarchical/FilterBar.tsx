import React, { useState, useEffect } from 'react';
import { useHierarchy } from '../../context/HierarchyContext';

// Define types for filter presets
interface FilterPreset {
  name: string;
  filters: {
    status?: string[];
    priority?: number[];
    impact?: number[];
    urgency?: number[];
    dueDate?: string;
  };
}

interface FilterBarProps {
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ className = '' }) => {
  const { filters, setFilters } = useHierarchy();
  
  // Local state for filter values
  const [statusFilter, setStatusFilter] = useState<string[]>(filters.status || []);
  const [priorityFilter, setPriorityFilter] = useState<number[]>(filters.priority || []);
  const [impactFilter, setImpactFilter] = useState<number[]>(filters.impact || []);
  const [urgencyFilter, setUrgencyFilter] = useState<number[]>(filters.urgency || []);
  const [dueDateFilter, setDueDateFilter] = useState<string>(filters.dueDate || '');
  
  // State for saved filter presets
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  // Update local state when filters change
  useEffect(() => {
    setStatusFilter(filters.status || []);
    setPriorityFilter(filters.priority || []);
    setImpactFilter(filters.impact || []);
    setUrgencyFilter(filters.urgency || []);
    setDueDateFilter(filters.dueDate || '');
  }, [filters]);

  // Load saved presets from localStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem('filterPresets');
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets));
      } catch (error) {
        console.error('Error loading filter presets:', error);
      }
    }
  }, []);

  // Apply filters
  const applyFilters = () => {
    setFilters({
      status: statusFilter,
      priority: priorityFilter,
      impact: impactFilter,
      urgency: urgencyFilter,
      dueDate: dueDateFilter
    });
  };

  // Reset filters
  const resetFilters = () => {
    setStatusFilter([]);
    setPriorityFilter([]);
    setImpactFilter([]);
    setUrgencyFilter([]);
    setDueDateFilter('');
    setFilters({});
  };

  // Save current filters as a preset
  const savePreset = () => {
    if (!presetName.trim()) return;
    
    const newPreset = {
      name: presetName,
      filters: {
        status: statusFilter,
        priority: priorityFilter,
        impact: impactFilter,
        urgency: urgencyFilter,
        dueDate: dueDateFilter
      }
    };
    
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('filterPresets', JSON.stringify(updatedPresets));
    
    setPresetName('');
    setShowSavePreset(false);
  };

  // Load a saved preset
  const loadPreset = (preset: FilterPreset) => {
    setStatusFilter(preset.filters.status || []);
    setPriorityFilter(preset.filters.priority || []);
    setImpactFilter(preset.filters.impact || []);
    setUrgencyFilter(preset.filters.urgency || []);
    setDueDateFilter(preset.filters.dueDate || '');
    
    setFilters(preset.filters);
  };

  // Delete a preset
  const deletePreset = (index: number) => {
    const updatedPresets = [...presets];
    updatedPresets.splice(index, 1);
    setPresets(updatedPresets);
    localStorage.setItem('filterPresets', JSON.stringify(updatedPresets));
  };

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setStatusFilter(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  // Handle numeric filter change
  const handleNumericFilterChange = (
    value: number,
    currentValues: number[],
    setValues: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    setValues(prev => {
      if (prev.includes(value)) {
        return prev.filter(v => v !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  return (
    <div className={`bg-gray-100 p-4 rounded-lg shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
          <div className="flex space-x-2">
            {['Planned', 'In Progress', 'Done'].map(status => (
              <button
                key={status}
                className={`px-3 py-1 text-sm rounded-full ${
                  statusFilter.includes(status)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleStatusChange(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Priority</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(priority => (
              <button
                key={priority}
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  priorityFilter.includes(priority)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleNumericFilterChange(
                  priority,
                  priorityFilter,
                  setPriorityFilter
                )}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        {/* Impact Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Impact</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(impact => (
              <button
                key={impact}
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  impactFilter.includes(impact)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleNumericFilterChange(
                  impact,
                  impactFilter,
                  setImpactFilter
                )}
              >
                {impact}
              </button>
            ))}
          </div>
        </div>

        {/* Urgency Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Urgency</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(urgency => (
              <button
                key={urgency}
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  urgencyFilter.includes(urgency)
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => handleNumericFilterChange(
                  urgency,
                  urgencyFilter,
                  setUrgencyFilter
                )}
              >
                {urgency}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={dueDateFilter}
            onChange={e => setDueDateFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Actions */}
        <div className="flex space-x-2 items-end">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setShowSavePreset(!showSavePreset)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Save Preset
          </button>
        </div>
      </div>

      {/* Save Preset Form */}
      {showSavePreset && (
        <div className="mt-4 p-4 bg-gray-200 rounded-md">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              placeholder="Preset name"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={savePreset}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setShowSavePreset(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Saved Presets */}
      {presets.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Saved Presets</h3>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, index) => (
              <div key={index} className="flex items-center bg-gray-200 rounded-md overflow-hidden">
                <button
                  onClick={() => loadPreset(preset)}
                  className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-300"
                >
                  {preset.name}
                </button>
                <button
                  onClick={() => deletePreset(index)}
                  className="px-2 py-1 bg-red-500 text-white hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;