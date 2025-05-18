import { Link } from 'react-router-dom';

interface NavigationBarProps {
  activeTab: 'tasks' | 'summary';
  onTabChange: (tab: 'tasks' | 'summary') => void;
}

const NavigationBar = ({ activeTab, onTabChange }: NavigationBarProps) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex items-center bg-gray-900 rounded-lg p-2">
        {/* Tasks Button */}
        <button
          onClick={() => onTabChange('tasks')}
          className={`flex flex-col items-center justify-center p-3 mx-2 rounded-lg transition-colors duration-200 ${
            activeTab === 'tasks' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">Tasks</span>
        </button>
        
        {/* Summary Button */}
        <button
          onClick={() => onTabChange('summary')}
          className={`flex flex-col items-center justify-center p-3 mx-2 rounded-lg transition-colors duration-200 ${
            activeTab === 'summary' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
          <span className="text-sm">Summary</span>
        </button>
        
        {/* Add Button - Always visible */}
        <Link
          to="/task/new"
          className="flex flex-col items-center justify-center p-3 mx-2 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">Add</span>
        </Link>
      </div>
    </div>
  );
};

export default NavigationBar;