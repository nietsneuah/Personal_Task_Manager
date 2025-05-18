import React from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleUnifiedLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">Unified Layout</h1>
        <p className="text-gray-700 mb-6">
          This is a simplified version of the unified layout component.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go to Test Component
          </button>
          
          <button
            onClick={() => navigate('/hierarchical')}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go to Hierarchical Layout
          </button>
          
          <button
            onClick={() => navigate('/legacy')}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go to Legacy Layout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleUnifiedLayout;